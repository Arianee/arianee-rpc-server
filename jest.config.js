module.exports = {
    roots: [
        '<rootDir>/e2e'
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testEnvironment: 'jest-environment-node',
    collectCoverage: true,
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ],
    setupFilesAfterEnv: ['./e2e/setup.ts'],
    moduleNameMapper: {
        '@adraffy/ens-normalize': require.resolve('@adraffy/ens-normalize')
    }
}
