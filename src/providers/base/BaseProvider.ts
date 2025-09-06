import * as vscode from "vscode";
import axios, { AxiosResponse } from "axios";
import { ICreditProvider, CreditInfo } from "../interfaces/ICreditProvider";

export abstract class BaseProvider implements ICreditProvider {
  protected context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.context = context;
    this.outputChannel = outputChannel;
  }

  abstract getCredits(): Promise<CreditInfo>;
  abstract validateApiKey(): Promise<boolean>;
  abstract getName(): string;
  abstract getShortName(): string;
  abstract getIcon(): string;
  abstract getId(): string;

  protected async getApiKey(): Promise<string | undefined> {
    const key = `opencredits.${this.getId()}.apiKey`;
    return await this.context.secrets.get(key);
  }

  protected async setApiKey(apiKey: string): Promise<void> {
    const key = `opencredits.${this.getId()}.apiKey`;
    await this.context.secrets.store(key, apiKey);
  }

  protected async makeApiRequest(
    url: string,
    headers: Record<string, string>,
    timeout: number = 10000
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.get(url, {
        headers,
        timeout,
      });
      return response;
    } catch (error) {
      this.logError(`API request failed for ${this.getName()}`, error);
      throw error;
    }
  }

  protected logInfo(message: string): void {
    this.outputChannel.appendLine(`[${this.getName()}] INFO: ${message}`);
  }

  protected logError(message: string, error?: any): void {
    this.outputChannel.appendLine(`[${this.getName()}] ERROR: ${message}`);
    if (error) {
      this.outputChannel.appendLine(
        `[${this.getName()}] ERROR Details: ${JSON.stringify(error, null, 2)}`
      );
    }
  }

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("opencredits");
    return config.get<boolean>(`providers.${this.getId()}.enabled`, false);
  }

  protected formatCurrency(amount: number, currency: string): string {
    if (currency === "USD" || currency === "$") {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  }

  protected handleApiError(error: any): CreditInfo {
    let errorMessage = "Unknown error";

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage = "Invalid API key";
      } else if (error.response?.status === 429) {
        errorMessage = "Rate limit exceeded";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout";
      } else {
        errorMessage = error.message || "Network error";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    this.logError("API error", error);

    return {
      balance: "Error",
      currency: "",
      lastUpdated: new Date(),
      error: errorMessage,
    };
  }
}
