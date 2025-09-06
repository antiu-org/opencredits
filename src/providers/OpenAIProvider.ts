import * as vscode from "vscode";
import { BaseProvider } from "./base/BaseProvider";
import { CreditInfo } from "./interfaces/ICreditProvider";

export class OpenAIProvider extends BaseProvider {
  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    super(context, outputChannel);
  }

  getName(): string {
    return "OpenAI";
  }

  getShortName(): string {
    return "OA";
  }

  getIcon(): string {
    return "$(brain)";
  }

  getId(): string {
    return "openai";
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        this.logError("No API key found");
        return false;
      }

      // Basic validation - check if it looks like an OpenAI API key
      if (!apiKey.startsWith("sk-")) {
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

      // TODO: Implement OpenAI credits API call
      // For now, return a placeholder
      this.logInfo("OpenAI provider not fully implemented yet");

      return {
        balance: "Coming Soon",
        currency: "$",
        lastUpdated: new Date(),
        error: "Provider not implemented",
      };
    } catch (error) {
      this.logError("Failed to fetch credits", error);
      return this.handleApiError(error);
    }
  }
}
