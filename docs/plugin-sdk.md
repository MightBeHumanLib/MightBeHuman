# Plugin SDK

The plugin SDK exposes typed contracts for mutation, validation, detection, and scoring plugins.

## Goals

- Versioned plugin manifests
- Explicit plugin categories
- Host-controlled registration
- Simple snapshotting for diagnostics

## Registry behavior

- Validates manifests on registration.
- Executes plugins in registration order.
- Aggregates detector and scoring outputs by mean.
