# Change Log

All notable changes to the "OpenCredits" extension will be documented in this file.

## [0.1.0] - 2025-01-06

### Added
- Initial release of OpenCredits extension
- OpenRouter provider with full credit monitoring support
- Status bar integration with configurable display formats
- Secure API key storage using VS Code SecretStorage
- Configurable update intervals (1 minute to 24 hours)
- Command palette integration for configuration
- Real-time credit refresh functionality
- Provider enable/disable toggles
- Smart status bar display based on number of enabled providers
- Comprehensive error handling and logging
- Automatic periodic updates with manual refresh option

### Providers
- ✅ OpenRouter - Full implementation with credit fetching
- 🚧 OpenAI - Stub implementation (coming in future release)
- 🚧 Anthropic - Stub implementation (coming in future release)
- 🚧 Gemini - Stub implementation (coming in future release)

### Commands
- `OpenCredits: Refresh Credits` - Manually refresh credit information
- `OpenCredits: Configure Providers` - Open configuration interface

### Configuration
- `opencredits.updateInterval` - Set update frequency
- `opencredits.showInStatusBar` - Toggle status bar display
- `opencredits.providers.*.enabled` - Enable/disable specific providers

### Security
- API keys stored in VS Code SecretStorage
- Secure HTTPS API communication
- No logging of sensitive information

## [Unreleased]

### Planned
- Full OpenAI provider implementation
- Full Anthropic provider implementation  
- Full Gemini provider implementation
- Usage tracking and analytics
- Credit alerts and notifications
- More granular refresh controls
- Export functionality for credit history
