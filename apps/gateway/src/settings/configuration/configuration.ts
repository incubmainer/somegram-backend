import { ValidateNested, validateSync } from 'class-validator';
import { EnvSettings, EnvState, EnvVariableType } from '../env/env.settings';
import * as dotenv from 'dotenv';
import * as process from 'node:process';

export const envRoot: string = './apps/gateway/';
export const loadEnv = (): string[] => {
  const env = process.env.NODE_ENV as EnvState;
  switch (env) {
    case EnvState.DEVELOPMENT:
      return [`${envRoot}.env.dev`];
    case EnvState.TESTING:
      return [`${envRoot}.env.test`];
    default:
      return [];
  }
};

dotenv.config({ path: loadEnv() });

export type ConfigurationType = Configuration;

export class Configuration {
  @ValidateNested()
  envSettings: EnvSettings;

  // Private constructor, class creates itself, "new" construct is not available
  private constructor(configuration: Configuration) {
    Object.assign(this, configuration); // Copies all properties from the passed object to the current one
  }

  static createConfig(environmentVariables: EnvVariableType): Configuration {
    const envSettings = new EnvSettings(environmentVariables);
    return new this({
      envSettings,
    });
  }
}

export function validate(environmentVariables: EnvVariableType): Configuration {
  const config = Configuration.createConfig(environmentVariables); // Create a Configuration object with the passed environment variables

  const errors = validateSync(config, {
    // Perform synchronous validation of the config object using the class-validator library (We collect all errors when starting the application)
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return config;
}

// Default export of a function that creates configuration from environment variables
export default () => {
  const envVariables = process.env as EnvVariableType;
  // Create and return a Configuration object with these environment variables
  return Configuration.createConfig(envVariables);
};
