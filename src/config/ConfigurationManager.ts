import * as vscode from "vscode";

export interface UpdateInterval {
  label: string;
  minutes: number;
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public static getInstance(
    context: vscode.ExtensionContext
  ): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager(context);
    }
    return ConfigurationManager.instance;
  }

  public getUpdateInterval(): UpdateInterval {
    const config = vscode.workspace.getConfiguration("opencredits");
    const intervalString = config.get<string>("updateInterval", "5 minutes");

    const intervals: Record<string, number> = {
      "1 minute": 1,
      "5 minutes": 5,
      "15 minutes": 15,
      "30 minutes": 30,
      "1 hour": 60,
      "6 hours": 360,
      "24 hours": 1440,
    };

    return {
      label: intervalString,
      minutes: intervals[intervalString] || 5,
    };
  }

  public isProviderEnabled(providerId: string): boolean {
    const config = vscode.workspace.getConfiguration("opencredits");
    return config.get<boolean>(`providers.${providerId}.enabled`, false);
  }

  public async setProviderEnabled(
    providerId: string,
    enabled: boolean
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration("opencredits");
    await config.update(
      `providers.${providerId}.enabled`,
      enabled,
      vscode.ConfigurationTarget.Global
    );
  }

  public isStatusBarEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("opencredits");
    return config.get<boolean>("showInStatusBar", true);
  }

  public async setStatusBarEnabled(enabled: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration("opencredits");
    await config.update(
      "showInStatusBar",
      enabled,
      vscode.ConfigurationTarget.Global
    );
  }

  public async setUpdateInterval(interval: string): Promise<void> {
    const config = vscode.workspace.getConfiguration("opencredits");
    await config.update(
      "updateInterval",
      interval,
      vscode.ConfigurationTarget.Global
    );
  }

  public async getApiKey(providerId: string): Promise<string | undefined> {
    const key = `opencredits.${providerId}.apiKey`;
    return await this.context.secrets.get(key);
  }

  public async setApiKey(providerId: string, apiKey: string): Promise<void> {
    const key = `opencredits.${providerId}.apiKey`;
    await this.context.secrets.store(key, apiKey);
  }

  public async removeApiKey(providerId: string): Promise<void> {
    const key = `opencredits.${providerId}.apiKey`;
    await this.context.secrets.delete(key);
  }

  public async hasApiKey(providerId: string): Promise<boolean> {
    const apiKey = await this.getApiKey(providerId);
    return !!apiKey && apiKey.length > 0;
  }

  public onConfigurationChanged(
    callback: (e: vscode.ConfigurationChangeEvent) => void
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("opencredits")) {
        callback(e);
      }
    });
  }

  public async promptForApiKey(
    providerName: string,
    providerId: string
  ): Promise<string | undefined> {
    const apiKey = await vscode.window.showInputBox({
      prompt: `Enter your ${providerName} API key`,
      password: true,
      placeHolder: "API key...",
      validateInput: (value: string) => {
        if (!value || value.trim().length === 0) {
          return "API key cannot be empty";
        }
        return null;
      },
    });

    if (apiKey) {
      await this.setApiKey(providerId, apiKey.trim());
      await this.setProviderEnabled(providerId, true);
      return apiKey.trim();
    }

    return undefined;
  }

  public async showConfigurationQuickPick(): Promise<void> {
    const items: vscode.QuickPickItem[] = [
      {
        label: "$(key) Configure API Keys",
        description: "Set up API keys for credit providers",
      },
      {
        label: "$(settings-gear) Update Interval",
        description: "Change how often credits are updated",
      },
      {
        label: "$(eye) Toggle Status Bar",
        description: "Show or hide credits in status bar",
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select configuration option",
    });

    if (selected) {
      switch (selected.label) {
        case "$(key) Configure API Keys":
          await this.showApiKeyConfiguration();
          break;
        case "$(settings-gear) Update Interval":
          await this.showUpdateIntervalConfiguration();
          break;
        case "$(eye) Toggle Status Bar":
          await this.toggleStatusBar();
          break;
      }
    }
  }

  private async showApiKeyConfiguration(): Promise<void> {
    const providers = [
      { name: "OpenRouter", id: "openrouter" },
      { name: "OpenAI", id: "openai" },
      { name: "Anthropic", id: "anthropic" },
      { name: "Gemini", id: "gemini" },
    ];

    const items: vscode.QuickPickItem[] = [];
    for (const provider of providers) {
      const hasKey = await this.hasApiKey(provider.id);
      const isEnabled = this.isProviderEnabled(provider.id);

      items.push({
        label: `$(${hasKey ? "key" : "circle-outline"}) ${provider.name}`,
        description: hasKey
          ? isEnabled
            ? "Configured & Enabled"
            : "Configured"
          : "Not configured",
        detail: provider.id,
      });
    }

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select provider to configure",
    });

    if (selected && selected.detail) {
      const provider = providers.find((p) => p.id === selected.detail);
      if (provider) {
        await this.promptForApiKey(provider.name, provider.id);
      }
    }
  }

  private async showUpdateIntervalConfiguration(): Promise<void> {
    const intervals = [
      "1 minute",
      "5 minutes",
      "15 minutes",
      "30 minutes",
      "1 hour",
      "6 hours",
      "24 hours",
    ];

    const current = this.getUpdateInterval().label;
    const items: vscode.QuickPickItem[] = intervals.map((interval) => ({
      label: interval,
      description: interval === current ? "Current" : "",
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select update interval",
    });

    if (selected) {
      await this.setUpdateInterval(selected.label);
      vscode.window.showInformationMessage(
        `Update interval set to ${selected.label}`
      );
    }
  }

  private async toggleStatusBar(): Promise<void> {
    const current = this.isStatusBarEnabled();
    await this.setStatusBarEnabled(!current);
    vscode.window.showInformationMessage(
      `Status bar display ${!current ? "enabled" : "disabled"}`
    );
  }
}
