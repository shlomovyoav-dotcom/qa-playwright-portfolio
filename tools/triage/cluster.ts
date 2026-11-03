/**
 * Pure grouping logic for the triage tool. No I/O, so it can be unit tested.
 *
 * Two failures belong together when their error messages match after the volatile
 * parts are stripped: numbers, hex ids, quoted strings, file paths, durations.
 */
export interface Failure {
  title: string;
  file: string;
  project: string;
  outcome: 'failed' | 'flaky';
  attempts: number;
  error: string;
  attachments: string[];
  annotations: string[];
}

export interface Cluster {
  signature: string;
  headline: string;
  area: string;
  failures: Failure[];
  flakyCount: number;
  llm?: string;
}

/** Collapse the parts of an error that change between runs. */
export const signatureOf = (error: string): string =>
  error
    .split('\n')[0]
    .replace(/\u001b\[[0-9;]*m/g, '')            // ANSI colours
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/(?:\/[\w.-]+){2,}/g, '<path>')
    .replace(/0x[0-9a-f]+/gi, '<hex>')
    .replace(/\b[0-9a-f]{8,}\b/gi, '<id>')
    .replace(/locator\((?:[^()]|\([^()]*\))*\)/g, 'locator(<sel>)')
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '<str>')
    .replace(/\d+(\.\d+)?\s?(ms|s)\b/g, '<dur>')
    .replace(/\d+/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160) || '<no message>';

/** First path segment under tests/, e.g. "e2e" or "api"; falls back to the project. */
export const areaOf = (f: Failure): string =>
  /tests?\/([^/]+)\//.exec(f.file)?.[1] ?? f.project ?? 'unknown';

const headlineOf = (f: Failure): string => {
  const first = f.error.split('\n')[0].replace(/\u001b\[[0-9;]*m/g, '').trim();
  return first.length > 90 ? `${first.slice(0, 87)}…` : first || f.title;
};

export const clusterFailures = (failures: Failure[]): Cluster[] => {
  const map = new Map<string, Cluster>();
  for (const f of failures) {
    const key = `${areaOf(f)}::${signatureOf(f.error)}`;
    const c = map.get(key);
    if (c) {
      c.failures.push(f);
      if (f.outcome === 'flaky') c.flakyCount += 1;
    } else {
      map.set(key, {
        signature: signatureOf(f.error),
        headline: headlineOf(f),
        area: areaOf(f),
        failures: [f],
        flakyCount: f.outcome === 'flaky' ? 1 : 0,
      });
    }
  }
  // Consistent failures first, then by size.
  return [...map.values()].sort(
    (a, b) => (b.failures.length - b.flakyCount) - (a.failures.length - a.flakyCount) || b.failures.length - a.failures.length,
  );
};
