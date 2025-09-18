import * as vscode from "vscode";
import { BaseProvider } from "./base/BaseProvider";
import { CreditInfo } from "./interfaces/ICreditProvider";

export class OpenRouterProvider extends BaseProvider {
  // Store historical data for consumption rate calculation
  private historicalData: Array<{ timestamp: Date; balance: number }> = [];

  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    super(context, outputChannel);
  }

  getName(): string {
    return "OpenRouter";
  }

  getShortName(): string {
    return "OR";
  }

  getIcon(): string {
    return "$(globe)";
  }

  getId(): string {
    return "openrouter";
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        this.logError("No API key found");
        return false;
      }

      const response = await this.makeApiRequest(
        "https://openrouter.ai/api/v1/auth/key",
        {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        if (data) {
          this.logInfo("API key validation successful");
          return true;
        }
      }

      const errorData = await response.json().catch(() => null);
      this.logError("API key validation failed", errorData);
      return false;
    } catch (error) {
      this.logError("API key validation error", error);
      return false;
    }
  }

  async getCredits(): Promise<CreditInfo> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        return {
          balance: "No API Key",
          currency: "",
          lastUpdated: new Date(),
          error: "API key not configured",
        };
      }

      this.logInfo("Fetching credits from OpenRouter");

      // 1) Try the official credits endpoint first: remaining = total_credits - total_usage
      try {
        const creditsResp = await this.makeApiRequest(
          "https://openrouter.ai/api/v1/credits",
          {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/antiu-org/opencredits",
            "X-Title": "OpenCredits VS Code Extension",
          }
        );

        if (creditsResp.status === 200) {
          const body = await creditsResp.json();
          const data = body?.data || body;
          const totalCredits = Number(data?.total_credits);
          const totalUsage = Number(data?.total_usage);

          if (Number.isFinite(totalCredits) && Number.isFinite(totalUsage)) {
            const remaining = Math.max(0, totalCredits - totalUsage);
            const balanceNumeric = remaining;
            const currency = "$";
            const balance = this.formatCurrency(balanceNumeric, currency);

            this.logInfo(
              `Credits fetched successfully from /credits: ${balance}`
            );

            // Add to historical data and calculate consumption rate
            return this.processCreditData(balance, balanceNumeric, currency);
          }
        } else {
          this.logInfo(
            `OpenRouter /credits returned status ${creditsResp.status}, falling back to /auth/key`
          );
        }
      } catch (e) {
        this.logInfo(
          "OpenRouter /credits call failed, falling back to /auth/key"
        );
      }

      // 2) Fallback to /auth/key (handles prepaid or PAYG display)
      const response = await this.makeApiRequest(
        "https://openrouter.ai/api/v1/auth/key",
        {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/antiu-org/opencredits",
          "X-Title": "OpenCredits VS Code Extension",
        }
      );

      if (response.status === 200) {
        const responseData = await response.json();
        const data = responseData.data || responseData;

        // Prefer prepaid if present; otherwise show PAYG
        let balance = "Unknown";
        let balanceNumeric = 0;
        const currency = "$";

        const creditLeft = data?.credit_left;
        const balanceField = data?.balance;
        const limitRaw = data?.limit;
        const usageRaw = data?.usage;

        const isFiniteNumber = (v: any) =>
          typeof v === "number" && Number.isFinite(v);

        if (creditLeft !== undefined && creditLeft !== null) {
          const n = Number(creditLeft);
          if (Number.isFinite(n)) {
            balanceNumeric = n;
            balance = this.formatCurrency(balanceNumeric, currency);
          }
        } else if (balanceField !== undefined && balanceField !== null) {
          const n = Number(balanceField);
          if (Number.isFinite(n)) {
            balanceNumeric = n;
            balance = this.formatCurrency(balanceNumeric, currency);
          }
        } else if (isFiniteNumber(limitRaw) && isFiniteNumber(usageRaw)) {
          const remaining = Math.max(0, Number(limitRaw) - Number(usageRaw));
          balanceNumeric = remaining;
          balance = this.formatCurrency(balanceNumeric, currency);
        } else {
          balance = "PAYG";
        }

        this.logInfo(`Credits fetched successfully: ${balance}`);

        // Add to historical data and calculate consumption rate
        return this.processCreditData(balance, balanceNumeric, currency);
      } else {
        const errorData = await response.json().catch(() => null);
        this.logError("Invalid response from OpenRouter API", errorData);
        return this.handleApiError(new Error("Invalid API response"));
      }
    } catch (error) {
      this.logError("Failed to fetch credits", error);
      return this.handleApiError(error);
    }
  }

  private processCreditData(
    balance: string,
    balanceNumeric: number,
    currency: string
  ): CreditInfo {
    const now = new Date();

    // Add current data to historical data
    this.historicalData.push({
      timestamp: now,
      balance: balanceNumeric,
    });

    // Clean up old data (keep only last 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.historicalData = this.historicalData.filter(
      (data) => data.timestamp >= twentyFourHoursAgo
    );

    // Calculate consumption rate
    const consumptionRate = this.calculateConsumptionRate();

    return {
      balance,
      balanceNumeric,
      currency,
      lastUpdated: now,
      historicalData: this.historicalData,
      consumptionRate,
    };
  }

  private calculateConsumptionRate(): number | undefined {
    // Get the consumption rate period from configuration
    const config = vscode.workspace.getConfiguration("opencredits");
    const periodMinutes = config.get<number>("consumptionRatePeriod", 60);

    if (this.historicalData.length < 2) {
      return undefined; // Not enough data to calculate rate
    }

    const now = new Date();
    const periodAgo = new Date(now.getTime() - periodMinutes * 60 * 1000);

    // Find the most recent data point
    const latestData = this.historicalData[this.historicalData.length - 1];

    // Find the data point closest to our period ago time
    let baselineData = this.historicalData[0];
    let minTimeDiff = Math.abs(
      baselineData.timestamp.getTime() - periodAgo.getTime()
    );

    for (const data of this.historicalData) {
      const timeDiff = Math.abs(data.timestamp.getTime() - periodAgo.getTime());
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        baselineData = data;
      }
    }

    // If we don't have data from the required period, use the oldest available data
    if (baselineData.timestamp > periodAgo && this.historicalData.length > 1) {
      baselineData = this.historicalData[0];
    }

    // Calculate consumption rate (credits consumed per hour)
    const timeDiffHours =
      (latestData.timestamp.getTime() - baselineData.timestamp.getTime()) /
      (1000 * 60 * 60);
    if (timeDiffHours <= 0) {
      return undefined;
    }

    const creditDiff = baselineData.balance - latestData.balance; // Positive means consumption
    const ratePerHour = creditDiff / timeDiffHours;

    return ratePerHour;
  }
}
