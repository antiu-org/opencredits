# OpenCredits

[![Version](https://img.shields.io/visual-studio-marketplace/v/antiu.opencredits.svg)](https://marketplace.visualstudio.com/items?itemName=antiu.opencredits)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/antiu.opencredits.svg)](https://marketplace.visualstudio.com/items?itemName=antiu.opencredits)
[![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-blue.svg)](LICENSE)

**OpenCredits** is a VS Code extension that monitors your **OpenRouter API credits, usage, and balance** directly in the editor's status bar. Track your OpenRouter spending in real-time and never run out of credits unexpectedly again.

## Why Use OpenCredits?

- **Avoid Service Interruptions**: Real-time OpenRouter balance tracker prevents unexpected API cutoffs
- **Stay Informed**: Monitor OpenRouter credit usage without leaving your development environment  
- **Save Time**: No need to manually check OpenRouter dashboard - see your balance at a glance
- **Smart Notifications**: Intelligent display for both prepaid credits and pay-as-you-go accounts
- **Developer-Focused**: Built specifically for developers using OpenRouter APIs in their projects

## Features

- **Real-time Credit Monitoring**: Track your OpenRouter API credits and usage in real-time
- **Status Bar Integration**: See your OpenRouter balance at a glance in VS Code's status bar
- **Secure API Key Storage**: API keys are stored securely using VS Code's built-in SecretStorage
- **Configurable Updates**: Choose how often to update credit information (1 minute to 24 hours)
- **Smart Display**: Shows remaining balance with intelligent formatting for different account types
- **Pay-As-You-Go Support**: Displays "PAYG" for pay-as-you-go accounts without prepaid credits

## OpenRouter Credit Monitor in Action

![OpenCredits - OpenRouter balance tracker for VS Code](screenshot.png "OpenCredits showing OpenRouter credits in VS Code status bar")

## Supported Providers

- ✅ **OpenRouter** - Full implementation with comprehensive credit and usage monitoring

## Installation - OpenRouter Balance Checker

1. Install from VS Code Marketplace
2. Or install from VSIX file: `code --install-extension opencredits-1.0.1.vsix`

## Quick Start - Track OpenRouter Usage

1. Install the OpenCredits extension
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run `OpenCredits: Configure Providers`
4. Add your OpenRouter API key
5. Enable OpenRouter monitoring
6. Your OpenRouter credits will appear in the status bar!

## Usage

### Configuration

- **Command Palette**: `OpenCredits: Configure Providers`
- **Settings**: Search for "opencredits" in VS Code settings
- **Status Bar**: Click the credits display to refresh

### Status Bar Display

- **With Credits**: `OpenRouter: $5.20` - Shows remaining balance in dollars
- **Pay-As-You-Go**: `OpenRouter: PAYG` - For accounts without prepaid credits
- **Error State**: `OpenRouter: Error` - When there's an issue fetching credits

### Commands

- `OpenCredits: Refresh Credits` - Manual refresh
- `OpenCredits: Configure Providers` - Open configuration UI

## Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `opencredits.updateInterval` | How often to update credits | `5 minutes` |
| `opencredits.showInStatusBar` | Show credits in status bar | `true` |
| `opencredits.providers.openrouter.enabled` | Enable OpenRouter monitoring | `false` |

## How OpenCredits Works

OpenCredits connects to OpenRouter's official API endpoints to provide accurate credit monitoring:

- **Primary**: Uses `/api/v1/credits` endpoint to calculate remaining balance as `total_credits - total_usage`
- **Fallback**: Uses `/api/v1/auth/key` for validation when credits endpoint is unavailable
- **Smart Detection**: Automatically detects Pay-As-You-Go accounts and displays appropriate status

## Security

- API keys are stored securely using VS Code's SecretStorage
- Keys are never logged or transmitted except to official OpenRouter APIs
- All API requests use HTTPS with proper authentication headers
- No sensitive information is included in error messages or logs

## Requirements

- VS Code 1.74.0 or higher
- Internet connection for API calls
- Valid OpenRouter API key

## Troubleshooting

### Credits Not Showing
1. Ensure OpenRouter is enabled in settings
2. Verify your API key is correct
3. Check your internet connection
4. Use "Refresh Credits" command

### Error States
- **Network Error**: Check internet connection
- **Invalid API Key**: Verify key in configuration
- **Rate Limited**: Wait and try again later

## FAQ - OpenRouter Credit Monitoring

### How often does OpenCredits check my OpenRouter balance?
By default, OpenCredits checks your OpenRouter credits every 5 minutes. You can configure this interval from 1 minute to 24 hours in the extension settings.

### Does OpenCredits work with OpenRouter pay-as-you-go accounts?
Yes! OpenCredits automatically detects pay-as-you-go accounts and displays "PAYG" in the status bar when no prepaid credits are available.

### Is my OpenRouter API key secure?
Absolutely. OpenCredits stores your API key using VS Code's built-in SecretStorage, which is encrypted and secure. Your key is never logged or transmitted anywhere except to official OpenRouter endpoints.

### Can I use OpenCredits with multiple OpenRouter accounts?
Currently, OpenCredits supports one OpenRouter API key per VS Code workspace. Multi-account support may be added in future versions.

### Why should I use OpenCredits instead of checking the OpenRouter dashboard?
OpenCredits saves you time by displaying your credit balance directly in VS Code without interrupting your development workflow. You'll never accidentally run out of credits mid-project again.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Roadmap

Future versions may include:
- Support for additional API providers
- Usage analytics and trends
- Credit alerts and notifications
- Historical usage tracking
- Multi-account OpenRouter support

## License

Creative Commons Attribution-NonCommercial 4.0 International License - see [LICENSE](LICENSE) file for details.

**Free for personal and educational use. Commercial use requires permission.**

## Support

- [Report Issues](https://github.com/antiu-org/opencredits/issues)
- [Documentation](https://github.com/antiu-org/opencredits)
- [Changelog](CHANGELOG.md)

---

**Note**: This extension focuses exclusively on OpenRouter credit monitoring and usage tracking. Support for additional API providers may be added in future releases based on user demand and API availability.
