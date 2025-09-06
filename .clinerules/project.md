# OpenCredits VS Code Extension - Project Rules

## Project Overview
A VS Code extension that monitors API credits for multiple providers (OpenRouter, OpenAI, Anthropic, Gemini) and displays them in the status bar.

## Architecture Guidelines

### Core Principles
- **Modular Design**: Each provider implements the same interface
- **Type Safety**: Full TypeScript implementation with strict typing
- **Security**: API keys stored in VS Code's SecretStorage
- **Error Resilience**: Graceful handling of API failures with visual feedback
- **Performance**: Efficient polling with configurable intervals

### Code Structure
```
src/
├── extension.ts              # Main entry point
├── providers/
│   ├── interfaces/
│   │   └── ICreditProvider.ts    # Provider interface
│   ├── base/
│   │   └── BaseProvider.ts       # Common functionality
│   ├── OpenRouterProvider.ts
│   ├── OpenAIProvider.ts
│   ├── AnthropicProvider.ts
│   └── GeminiProvider.ts
├── statusBar/
│   └── StatusBarManager.ts
├── config/
│   └── ConfigurationManager.ts
└── utils/
    └── apiClient.ts
```

### Provider Interface Contract
All providers must implement:
- `getCredits(): Promise<CreditInfo>`
- `validateApiKey(): Promise<boolean>`
- `getName(): string`
- `getShortName(): string`
- `getIcon(): string`

### Status Bar Display Rules
- 1 provider: `OpenRouter: $5.20`
- 2 providers: `OR: $5.20 | OA: $10.50`
- 3+ providers: `OR: $5.20 | OA: $10.50 | AN: 1.2M`
- Error states: Show error icon with tooltip

### Configuration
- API keys: Stored securely in VS Code SecretStorage
- Update intervals: 1min, 5min, 15min, 30min, 1h, 6h, 24h
- Provider toggles: Individual enable/disable per provider
- Native credit formats: Mix of dollars, tokens, etc.

### Error Handling
- Network failures: Show error icon in status bar
- Invalid API keys: Visual feedback with configuration prompt
- Rate limiting: Respect provider rate limits
- Timeout handling: 10-second timeout for all API calls

### Development Standards
- **No console.log**: Use VS Code's output channel for logging
- **Async/await**: Preferred over Promises
- **Error boundaries**: Catch and handle all async errors
- **Memory cleanup**: Proper disposal of timers and subscriptions
- **Testing**: Unit tests for all providers and core logic

### Security
- Never log API keys
- Use VS Code SecretStorage for sensitive data
- Validate all user inputs
- Sanitize error messages before display

## Implementation Priority
1. Core architecture (interfaces, base classes)
2. OpenRouter provider (primary focus)
3. Status bar integration
4. Configuration management
5. Other providers (stubs initially)
6. Polish and testing
