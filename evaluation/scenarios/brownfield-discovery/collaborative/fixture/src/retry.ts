export const automaticRetryCount = 1;

export function retryPolicy(): string {
  return `automatic:${automaticRetryCount}`;
}

