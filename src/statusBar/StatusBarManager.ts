import * as vscode from "vscode";
import {
  CreditInfo,
  ICreditProvider,
} from "../providers/interfaces/ICreditProvider";
import { ConfigurationManager } from "../config/ConfigurationManager";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private configManager: ConfigurationManager;
  private outputChannel: vscode.OutputChannel;
  private providers: ICreditProvider[] = [];

  constructor(
    configManager: ConfigurationManager,
    outputChannel: vscode.OutputChannel
  ) {
    this.configManager = configManager;
    this.outputChannel = outputChannel;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      1000
    );
    this.statusBarItem.command = "opencredits.refresh";
    this.statusBarItem.tooltip = "Click to refresh credits";
  }

  public setProviders(providers: ICreditProvider[]): void {
    this.providers = providers;
  }

  public async updateDisplay(
    creditData: Map<string, CreditInfo>
  ): Promise<void> {
    if (!this.configManager.isStatusBarEnabled()) {
      this.statusBarItem.hide();
      return;
    }

    const enabledProviders = this.providers.filter((p) => p.isEnabled());
    if (enabledProviders.length === 0) {
      this.statusBarItem.hide();
      return;
    }

    const displayText = this.formatDisplayText(enabledProviders, creditData);
    const tooltip = this.formatTooltip(enabledProviders, creditData);

    this.statusBarItem.text = displayText;
    this.statusBarItem.tooltip = tooltip;
    this.statusBarItem.show();

    this.outputChannel.appendLine(`Status bar updated: ${displayText}`);
  }

  public showError(message: string): void {
    if (!this.configManager.isStatusBarEnabled()) {
      return;
    }

    this.statusBarItem.text = "$(error) Credits Error";
    this.statusBarItem.tooltip = `OpenCredits Error: ${message}`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground"
    );
    this.statusBarItem.show();
  }

  public showLoading(): void {
    if (!this.configManager.isStatusBarEnabled()) {
      return;
    }

    this.statusBarItem.text = "$(sync~spin) Loading Credits...";
    this.statusBarItem.tooltip = "Fetching credit information...";
    this.statusBarItem.backgroundColor = undefined;
    this.statusBarItem.show();
  }

  private formatDisplayText(
    providers: ICreditProvider[],
    creditData: Map<string, CreditInfo>
  ): string {
    const validCredits: Array<{
      provider: ICreditProvider;
      credit: CreditInfo;
    }> = [];

    for (const provider of providers) {
      const credit = creditData.get(provider.getId());
      if (credit && !credit.error) {
        validCredits.push({ provider, credit });
      }
    }

    if (validCredits.length === 0) {
      // Show errors if all providers failed
      const errorCount = providers.length;
      return errorCount === 1
        ? "$(error) Credit Error"
        : `$(error) ${errorCount} Credit Errors`;
    }

    if (validCredits.length === 1) {
      // Single provider: "OpenRouter: $5.20" or "OpenRouter: $5.20 (-$0.50/hr)"
      const { provider, credit } = validCredits[0];
      const consumptionRateText = this.formatConsumptionRate(credit);
      return consumptionRateText
        ? `${provider.getName()}: ${credit.balance} (${consumptionRateText})`
        : `${provider.getName()}: ${credit.balance}`;
    } else if (validCredits.length === 2) {
      // Two providers: "OR: $5.20 | OA: $10.50"
      return validCredits
        .map(
          ({ provider, credit }) =>
            `${provider.getShortName()}: ${credit.balance}`
        )
        .join(" | ");
    } else {
      // Three or more providers: "OR: $5.20 | OA: $10.50 | AN: 1.2M"
      return validCredits
        .slice(0, 3) // Limit to first 3 to avoid cluttering
        .map(
          ({ provider, credit }) =>
            `${provider.getShortName()}: ${credit.balance}`
        )
        .join(" | ");
    }
  }

  private formatConsumptionRate(credit: CreditInfo): string | null {
    if (credit.consumptionRate === undefined || credit.consumptionRate <= 0) {
      return null;
    }

    // Format the consumption rate as a currency value per hour
    const rate = credit.consumptionRate;
    if (rate < 0.01) {
      return `-${credit.currency}${rate.toFixed(4)}/hr`;
    } else {
      return `-${credit.currency}${rate.toFixed(2)}/hr`;
    }
  }

  private formatTooltip(
    providers: ICreditProvider[],
    creditData: Map<string, CreditInfo>
  ): string {
    const lines: string[] = ["OpenCredits - API Credit Monitor", ""];

    let hasValidCredits = false;
    let hasErrors = false;

    for (const provider of providers) {
      const credit = creditData.get(provider.getId());
      if (credit) {
        if (credit.error) {
          lines.push(
            `${provider.getIcon()} ${provider.getName()}: Error - ${
              credit.error
            }`
          );
          hasErrors = true;
        } else {
          const lastUpdated = credit.lastUpdated.toLocaleTimeString();
          let creditLine = `${provider.getIcon()} ${provider.getName()}: ${
            credit.balance
          } (${lastUpdated})`;

          // Add consumption rate to tooltip
          if (
            credit.consumptionRate !== undefined &&
            credit.consumptionRate > 0
          ) {
            const rateText = this.formatConsumptionRate(credit);
            if (rateText) {
              creditLine += ` ${rateText}`;
            }
          }

          lines.push(creditLine);
          hasValidCredits = true;
        }
      } else {
        lines.push(`${provider.getIcon()} ${provider.getName()}: No data`);
        hasErrors = true;
      }
    }

    if (hasValidCredits || hasErrors) {
      lines.push("");
      lines.push("Click to refresh credits");
      lines.push("Ctrl+Shift+P → 'OpenCredits: Configure' for settings");
    }

    return lines.join("\n");
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }

  public hide(): void {
    this.statusBarItem.hide();
  }

  public show(): void {
    if (this.configManager.isStatusBarEnabled()) {
      this.statusBarItem.show();
    }
  }
}
