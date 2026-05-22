# Benchmarking Methodology

Benchmarks compare source and transformed text using two layers:

- engine scoring from rhythm, stylometry, entropy, and preservation metrics
- detector-lab signals for repetition, burstiness, readability, and sentence distribution

## Rules

- Use fixed corpora for regression runs.
- Track source, transformed, and delta values per sample.
- Keep benchmark summaries deterministic and serializable.
- Treat preservation regressions as hard failures.

## Outputs

- per-sample records
- average improvement
- average detector reduction
- signal breakdowns for debugging
