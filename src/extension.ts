import * as vscode from "vscode";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { StatusBarManager } from "./statusBar/StatusBarManager";
import { OpenRouterProvider } from "./providers/OpenRouterProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { AnthropicProvider } from "./providers/AnthropicProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import {
  ICreditProvider,
  CreditInfo,
} from "./providers/interfaces/ICreditProvider";

export class OpenCreditsExtension {
  private configManager: ConfigurationManager;
  private statusBarManager: StatusBarManager;
  private outputChannel: vscode.OutputChannel;
  private providers: ICreditProvider[] = [];
  private updateTimer?: NodeJS.Timeout;
  private isUpdating = false;
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel("OpenCredits");
    this.configManager = ConfigurationManager.getInstance(context);
    this.statusBarManager = new StatusBarManager(
      this.configManager,
      this.outputChannel
    );

    this.initializeProviders();
    this.registerCommands();
    this.setupConfigurationWatcher();
    this.startPeriodicUpdates();

    this.outputChannel.appendLine("OpenCredits extension activated");
  }

  private initializeProviders(): void {
    this.providers = [
      new OpenRouterProvider(this.context, this.outputChannel),
      new OpenAIProvider(this.context, this.outputChannel),
      new AnthropicProvider(this.context, this.outputChannel),
      new GeminiProvider(this.context, this.outputChannel),
    ];

    this.statusBarManager.setProviders(this.providers);
    this.outputChannel.appendLine(
      `Initialized ${this.providers.length} providers`
    );
  }

  private registerCommands(): void {
    // Register refresh command
    const refreshCommand = vscode.commands.registerCommand(
      "opencredits.refresh",
      async () => {
        await this.refreshCredits();
      }
    );

    // Register configure command
    const configureCommand = vscode.commands.registerCommand(
      "opencredits.configure",
      async () => {
        await this.configManager.showConfigurationQuickPick();
      }
    );

    this.disposables.push(refreshCommand, configureCommand);
    this.outputChannel.appendLine("Commands registered");
  }

  private setupConfigurationWatcher(): void {
    const configWatcher = this.configManager.onConfigurationChanged(
      async (e) => {
        this.outputChannel.appendLine("Configuration changed");

        if (e.affectsConfiguration("opencredits.updateInterval")) {
          this.restartPeriodicUpdates();
        }

        if (e.affectsConfiguration("opencredits.showInStatusBar")) {
          if (this.configManager.isStatusBarEnabled()) {
            await this.refreshCredits();
          } else {
            this.statusBarManager.hide();
          }
        }

        // If any provider settings changed, refresh
        if (e.affectsConfiguration("opencredits.providers")) {
          await this.refreshCredits();
        }
      }
    );

    this.disposables.push(configWatcher);
  }

  private startPeriodicUpdates(): void {
    this.stopPeriodicUpdates();

    const interval = this.configManager.getUpdateInterval();
    const intervalMs = interval.minutes * 60 * 1000;

    this.outputChannel.appendLine(
      `Starting periodic updates every ${interval.label}`
    );

    // Initial update
    this.refreshCredits();

    // Set up periodic updates
    this.updateTimer = setInterval(() => {
      this.refreshCredits();
    }, intervalMs);
  }

  private restartPeriodicUpdates(): void {
    this.outputChannel.appendLine(
      "Restarting periodic updates due to configuration change"
    );
    this.startPeriodicUpdates();
  }

  private stopPeriodicUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  private async refreshCredits(): Promise<void> {
    if (this.isUpdating) {
      this.outputChannel.appendLine("Update already in progress, skipping");
      return;
    }

    this.isUpdating = true;
    this.statusBarManager.showLoading();
    this.outputChannel.appendLine("Starting credit refresh");

    try {
      const creditData = new Map<string, CreditInfo>();
      const enabledProviders = this.providers.filter((p) => p.isEnabled());

      if (enabledProviders.length === 0) {
        this.outputChannel.appendLine("No providers enabled");
        this.statusBarManager.hide();
        return;
      }

      // Fetch credits from all enabled providers in parallel
      const promises = enabledProviders.map(async (provider) => {
        try {
          this.outputChannel.appendLine(
            `Fetching credits from ${provider.getName()}`
          );
          const credits = await provider.getCredits();
          creditData.set(provider.getId(), credits);
          this.outputChannel.appendLine(
            `${provider.getName()}: ${
              credits.error ? `Error - ${credits.error}` : credits.balance
            }`
          );
        } catch (error) {
          this.outputChannel.appendLine(
            `Error fetching credits from ${provider.getName()}: ${error}`
          );
          creditData.set(provider.getId(), {
            balance: "Error",
            currency: "",
            lastUpdated: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      await Promise.all(promises);

      // Update status bar
      await this.statusBarManager.updateDisplay(creditData);
      this.outputChannel.appendLine("Credit refresh completed");
    } catch (error) {
      this.outputChannel.appendLine(`Critical error during refresh: ${error}`);
      this.statusBarManager.showError("Failed to refresh credits");
    } finally {
      this.isUpdating = false;
    }
  }

  public dispose(): void {
    this.outputChannel.appendLine("Disposing OpenCredits extension");

    this.stopPeriodicUpdates();
    this.statusBarManager.dispose();
    this.outputChannel.dispose();

    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}

let extension: OpenCreditsExtension | undefined;

export function activate(context: vscode.ExtensionContext) {
  try {
    extension = new OpenCreditsExtension(context);
    context.subscriptions.push({
      dispose: () => extension?.dispose(),
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to activate OpenCredits: ${error}`);
    throw error;
  }
}

export function deactivate() {
  extension?.dispose();
  extension = undefined;
}
