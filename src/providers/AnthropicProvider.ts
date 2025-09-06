import * as vscode from "vscode";
import { BaseProvider } from "./base/BaseProvider";
import { CreditInfo } from "./interfaces/ICreditProvider";

export class AnthropicProvider extends BaseProvider {
  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    super(context, outputChannel);
  }

  getName(): string {
    return "Anthropic";
  }

  getShortName(): string {
    return "AN";
  }

  getIcon(): string {
    return "$(robot)";
  }

  getId(): string {
    return "anthropic";
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        this.logError("No API key found");
        return false;
      }

      // Basic validation - check if it looks like an Anthropic API key
      if (!apiKey.startsWith("sk-ant-")) {
        this.logError("Invalid API key format");
        return false;
      }

      // TODO: Implement actual API validation
      this.logInfo("API key format validation successful");
      return true;
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

      // TODO: Implement Anthropic credits API call
      // For now, return a placeholder
      this.logInfo("Anthropic provider not fully implemented yet");

      return {
        balance: "Coming Soon",
        currency: "tokens",
        lastUpdated: new Date(),
        error: "Provider not implemented",
      };
    } catch (error) {
      this.logError("Failed to fetch credits", error);
      return this.handleApiError(error);
    }
  }
}
