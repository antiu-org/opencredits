import * as vscode from "vscode";
import { BaseProvider } from "./base/BaseProvider";
import { CreditInfo } from "./interfaces/ICreditProvider";

export class OpenRouterProvider extends BaseProvider {
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

            return {
              balance,
              balanceNumeric,
              currency,
              lastUpdated: new Date(),
            };
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

        return {
          balance,
          balanceNumeric,
          currency,
          lastUpdated: new Date(),
        };
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
}
