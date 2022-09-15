import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            tsconfig: './source/tsconfig.json'
        }
    },
    testTimeout: 60_000
};
export default config;
