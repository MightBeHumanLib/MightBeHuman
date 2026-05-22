export interface PipelineStage<TState, TMetrics = unknown> {
  readonly name: string;
  run(state: TState): TState;
  analyze?(state: TState): TMetrics;
  rollback?(state: TState, error: unknown): TState;
}

export interface PipelineStep<TState, TMetrics = unknown> {
  readonly name: string;
  readonly before: TState;
  readonly after: TState;
  readonly elapsedMs: number;
  readonly metrics?: TMetrics;
}

export interface PipelineRunResult<TState, TMetrics = unknown> {
  readonly state: TState;
  readonly steps: readonly PipelineStep<TState, TMetrics>[];
  readonly error?: Error;
}

export function runPipeline<TState, TMetrics = unknown>(
  initialState: TState,
  stages: readonly PipelineStage<TState, TMetrics>[],
): PipelineRunResult<TState, TMetrics> {
  const steps: PipelineStep<TState, TMetrics>[] = [];
  let currentState = initialState;

  for (const stage of stages) {
    const start = performance.now();
    const before = currentState;

    try {
      const after = stage.run(currentState);
      const metrics = stage.analyze?.(after);
      currentState = after;
      steps.push({
        name: stage.name,
        before,
        after,
        elapsedMs: performance.now() - start,
        ...(metrics === undefined ? {} : { metrics }),
      });
    } catch (error) {
      if (stage.rollback) {
        currentState = stage.rollback(before, error);
      }
      return {
        state: currentState,
        steps,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  return {
    state: currentState,
    steps,
  };
}
