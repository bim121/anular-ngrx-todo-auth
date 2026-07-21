export interface AppConfigState {
  apiBaseUrl: string;
  features: Record<string, boolean>;
}

/** Shape of `/assets/app-config.json`. */
export interface AppConfigFile {
  apiBaseUrl: string;
  features: Record<string, boolean>;
}

export const DEFAULT_APP_CONFIG: AppConfigState = {
  apiBaseUrl: 'http://localhost:3000',
  features: {},
};
