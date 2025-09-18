export interface CreditInfo {
  balance: string;
  balanceNumeric?: number;
  currency: string;
  lastUpdated: Date;
  error?: string;
  // Consumption rate fields
  consumptionRate?: number; // Credits consumed per hour
  historicalData?: Array<{ timestamp: Date; balance: number }>; // Historical balance data
}

export interface ICreditProvider {
  /**
   * Get current credit information
   */
  getCredits(): Promise<CreditInfo>;

  /**
   * Validate the API key
   */
  validateApiKey(): Promise<boolean>;

  /**
   * Get the full name of the provider
   */
  getName(): string;

  /**
   * Get the short name for status bar display
   */
  getShortName(): string;

  /**
   * Get the icon for the provider
   */
  getIcon(): string;

  /**
   * Get the provider ID
   */
  getId(): string;

  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean;
}
