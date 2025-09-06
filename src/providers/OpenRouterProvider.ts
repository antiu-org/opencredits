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

      if (response.status === 200 && response.data) {
        this.logInfo("API key validation successful");
        return true;
      } else {
        this.logError("API key validation failed", response.data);
        return false;
      }
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

      const response = await this.makeApiRequest(
        "https://openrouter.ai/api/v1/auth/key",
        {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/antiuconsulting/opencredits",
          "X-Title": "OpenCredits VS Code Extension",
        }
      );

      if (response.status === 200 && response.data) {
        const data = response.data.data || response.data;

        // OpenRouter API returns credit information in the data object
        let balance = "Unknown";
        let balanceNumeric = 0;
        const currency = "$";

        if (data.usage) {
          // If usage information is available
          const usage = data.usage;
          if (typeof usage === "number") {
            balanceNumeric = Math.max(0, (data.limit || 0) - usage);
            balance = this.formatCurrency(balanceNumeric, currency);
          }
        } else if (data.credit_left !== undefined) {
          // If credit_left is available
          balanceNumeric = parseFloat(data.credit_left) || 0;
          balance = this.formatCurrency(balanceNumeric, currency);
        } else if (data.balance !== undefined) {
          // If balance is directly available
          balanceNumeric = parseFloat(data.balance) || 0;
          balance = this.formatCurrency(balanceNumeric, currency);
        } else if (data.limit !== undefined && data.usage !== undefined) {
          // Calculate remaining from limit and usage
          const limit = parseFloat(data.limit) || 0;
          const used = parseFloat(data.usage) || 0;
          balanceNumeric = Math.max(0, limit - used);
          balance = this.formatCurrency(balanceNumeric, currency);
        } else {
          // Fallback: show that we have a valid key but can't determine balance
          balance = "Connected";
        }

        this.logInfo(`Credits fetched successfully: ${balance}`);

        return {
          balance,
          balanceNumeric,
          currency,
          lastUpdated: new Date(),
        };
      } else {
        this.logError("Invalid response from OpenRouter API", response.data);
        return this.handleApiError(new Error("Invalid API response"));
      }
    } catch (error) {
      this.logError("Failed to fetch credits", error);
      return this.handleApiError(error);
    }
  }
}
