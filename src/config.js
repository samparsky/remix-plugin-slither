module.exports = {
    port: 8000,
    version: "0.0.10",
    slitherVersion: {
        majorVersion: 0,
        minorVersion: 3,
        patch: 1
    },
    bodyLimit: "100kb",
    corsHeaders: [],
    detectors: [
        "suicidal",
        "uninitialized-state",
        "uninitialized-storage",
        "arbitrary-send",
        "controlled-delegatecall",
        "reentrancy",
        "locked-ether",
        "constant-function",
        "tx-origin",
        "uninitialized-local",
        "unused-return",
        "assembly",
        "constable-states",
        "external-function",
        "low-level-calls",
        "naming-convention",
        "pragma",
        "solc-version",
        "unused-state"
    ],
}