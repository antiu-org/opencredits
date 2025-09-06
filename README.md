# OpenCredits

Monitor API credits for OpenRouter, OpenAI, Anthropic, and Gemini directly in your VS Code status bar.

## Features

- **Real-time Credit Monitoring**: Track your API credits from multiple providers in one place
- **Status Bar Integration**: See your credits at a glance in VS Code's status bar
- **Secure API Key Storage**: API keys are stored securely using VS Code's built-in SecretStorage
- **Configurable Updates**: Choose how often to update credit information (1 minute to 24 hours)
- **Multiple Providers**: Support for OpenRouter, OpenAI, Anthropic, and Gemini (more coming soon)
- **Smart Display**: Automatically adjusts display format based on number of enabled providers

## Supported Providers

- ✅ **OpenRouter** - Full implementation
- 🚧 **OpenAI** - Coming soon
- 🚧 **Anthropic** - Coming soon  
- 🚧 **Gemini** - Coming soon

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or install from VSIX file: `code --install-extension opencredits-0.1.0.vsix`

## Quick Start

1. Install the extension
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run `OpenCredits: Configure Providers`
4. Add your API keys for desired providers
5. Credits will appear in the status bar!

## Usage

### Configuration

- **Command Palette**: `OpenCredits: Configure Providers`
- **Settings**: Search for "opencredits" in VS Code settings
- **Status Bar**: Click the credits display to refresh

### Status Bar Display

- **Single provider**: `OpenRouter: $5.20`
- **Two providers**: `OR: $5.20 | OA: $10.50`
- **Three+ providers**: `OR: $5.20 | OA: $10.50 | AN: 1.2M`

### Commands

- `OpenCredits: Refresh Credits` - Manual refresh
- `OpenCredits: Configure Providers` - Open configuration UI

## Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `opencredits.updateInterval` | How often to update credits | `5 minutes` |
| `opencredits.showInStatusBar` | Show credits in status bar | `true` |
| `opencredits.providers.*.enabled` | Enable specific providers | `false` |

## Security

- API keys are stored securely using VS Code's SecretStorage
- Keys are never logged or transmitted except to official provider APIs
- All API requests use HTTPS with proper authentication headers

## Requirements

- VS Code 1.74.0 or higher
- Internet connection for API calls
- Valid API keys from supported providers

## Known Issues

- OpenAI, Anthropic, and Gemini providers are not yet implemented
- Rate limiting may cause temporary display errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### 0.1.0
- Initial release
- OpenRouter provider support
- Status bar integration
- Configuration UI
- Automatic updates

## Support

- [Report Issues](https://github.com/antiuconsulting/opencredits/issues)
- [Documentation](https://github.com/antiuconsulting/opencredits)
