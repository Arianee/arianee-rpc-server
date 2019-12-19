module.exports = {
    "roots": [
        "<rootDir>/src",
        "<rootDir>/e2e",
    ],
    "testEnvironment": "jest-environment-node",
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    setupFilesAfterEnv: ['./e2e/setup.ts'],
}
