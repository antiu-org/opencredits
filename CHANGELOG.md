# Change Log

All notable changes to the "OpenCredits" extension will be documented in this file.

## [1.0.2] - 2025-09-17

### Added
- **SEO Optimization**: Enhanced README for VS Code Marketplace discoverability
- **Marketplace Badges**: Added version, downloads, and license badges
- **FAQ Section**: Added comprehensive FAQ with keyword-rich questions
- **Enhanced Content**: Expanded README with 63% more content for better search ranking

### Improved
- **Keyword Optimization**: Strategic placement of "OpenRouter", "credits", "balance", "usage" keywords
- **Visual Enhancement**: Updated screenshot alt text with SEO-friendly descriptions
- **User Benefits**: Added "Why Use OpenCredits?" section highlighting key advantages
- **Search Rankings**: Optimized for marketplace searches like "OpenRouter credits" and "balance tracker"

## [1.0.1] - 2025-09-17

### Added
- **Visual Enhancements**: Added extension icon and screenshot showcase
- **Documentation**: Enhanced README with visual demonstration
- **Repository Migration**: Moved to antiu-org organization

### Technical
- Improved marketplace presentation with visual assets
- Updated all repository references to new organization
- Maintained API attribution headers for potential OpenRouter partnerships

## [1.0.0] - 2025-01-17

### Added
- **Initial Release** of OpenCredits extension
- **OpenRouter Provider**: Full implementation with comprehensive credit monitoring
  - Uses official `/api/v1/credits` endpoint to compute remaining balance as `total_credits - total_usage`
  - Displays balance in dollars in the status bar
  - Handles Pay-As-You-Go accounts by displaying "PAYG" when no prepaid credits are available
  - Graceful fallback logic via `/api/v1/auth/key` when `/credits` endpoint is unavailable
  - API key validation and comprehensive error handling

### Features
- **Status Bar Integration**: Real-time credit display with smart formatting
- **Secure API Key Storage**: Uses VS Code's built-in SecretStorage for maximum security
- **Configurable Update Intervals**: Choose from 1 minute to 24 hours (default: 5 minutes)
- **Command Palette Integration**: Easy access to configuration and refresh functions
- **Real-time Credit Refresh**: Manual refresh capability with automatic periodic updates
- **Provider Enable/Disable Toggles**: Granular control over which providers to monitor
- **Comprehensive Error Handling**: Robust error management with detailed logging
- **Automatic Periodic Updates**: Set-and-forget credit monitoring

### Commands
- `OpenCredits: Refresh Credits` - Manually refresh credit information
- `OpenCredits: Configure Providers` - Open configuration interface

### Configuration Options
- `opencredits.updateInterval` - Set update frequency (1 minute to 24 hours)
- `opencredits.showInStatusBar` - Toggle status bar display
- `opencredits.providers.openrouter.enabled` - Enable/disable OpenRouter monitoring

### Technical Implementation
- **Modern HTTP Client**: Uses node-fetch for reliable API communication
- **Optimized Dependencies**: Minimal runtime footprint with carefully selected dependencies
- **TypeScript**: Full type safety throughout the codebase
- **VS Code API Integration**: Native integration with VS Code's extension ecosystem
- **Secure HTTPS Communication**: All API requests use encrypted connections
- **No Sensitive Data Logging**: API keys and sensitive information are never logged

### Security
- API keys stored securely in VS Code SecretStorage
- Secure HTTPS API communication with official provider endpoints
- No logging of sensitive information
- Proper error sanitization before display

## Future Releases

Support for additional providers (OpenAI, Anthropic, Gemini) will be added in future releases based on user demand and API availability.
