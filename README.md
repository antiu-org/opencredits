# OpenCredits

Monitor your OpenRouter API credits directly in your VS Code status bar.

## Features

- **Real-time Credit Monitoring**: Track your OpenRouter API credits in real-time
- **Status Bar Integration**: See your credits at a glance in VS Code's status bar
- **Secure API Key Storage**: API keys are stored securely using VS Code's built-in SecretStorage
- **Configurable Updates**: Choose how often to update credit information (1 minute to 24 hours)
- **Smart Display**: Shows remaining balance with intelligent formatting for different account types
- **Pay-As-You-Go Support**: Displays "PAYG" for pay-as-you-go accounts without prepaid credits

## Screenshot

![OpenCredits in action](screenshot.png)

## Supported Providers

- ✅ **OpenRouter** - Full implementation with comprehensive credit monitoring

## Installation

1. Install from VS Code Marketplace
2. Or install from VSIX file: `code --install-extension opencredits-1.0.0.vsix`

## Quick Start

1. Install the extension
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run `OpenCredits: Configure Providers`
4. Add your OpenRouter API key
5. Enable OpenRouter monitoring
6. Your credits will appear in the status bar!

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

## How It Works

OpenCredits connects to OpenRouter's official API endpoints:

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

## License

Creative Commons Attribution-NonCommercial 4.0 International License - see [LICENSE](LICENSE) file for details.

**Free for personal and educational use. Commercial use requires permission.**

## Support

- [Report Issues](https://github.com/antiu-org/opencredits/issues)
- [Documentation](https://github.com/antiu-org/opencredits)
- [Changelog](CHANGELOG.md)

---

**Note**: This extension focuses exclusively on OpenRouter credit monitoring. Support for additional providers may be added in future releases based on user demand and API availability.
