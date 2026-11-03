/**
 * Failure triage, public version.
 *
 * Reads Playwright's JSON report (test-results/results.json), groups failed and
 * flaky tests by error signature, and writes a bug-report skeleton per group in
 * the same shape as samples/bug-report.md. The grouping is deterministic and runs
 * in CI without any API key. With ANTHROPIC_API_KEY set and --llm, each group also
 * gets a two-sentence summary and a suggested severity drafted by Claude; that step
 * is optional and never changes the exit code.
 *
 *   npm run triage            # deterministic
 *   npm run triage -- --llm   # plus LLM summaries (needs ANTHROPIC_API_KEY)
 *
 * Outputs: tools/triage/triage.json and tools/triage/triage.md
 * Exit code: 0 always. This is a reporting step, not a gate.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clusterFailures, type Failure, type Cluster } from './cluster.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const reportPath = process.argv.find((a) => a.endsWith('.json') && !a.includes('triage')) ?? join(root, 'test-results', 'results.json');
const useLlm = process.argv.includes('--llm') && !!process.env.ANTHROPIC_API_KEY;

// --- Minimal shape of Playwright's JSON reporter -----------------------------
interface PwError { message?: string; stack?: string }
interface PwAttachment { name: string; path?: string; contentType: string }
interface PwResult { status: string; retry: number; duration: number; errors?: PwError[]; attachments?: PwAttachment[] }
interface PwTest { title?: string; projectName?: string; status: string; results: PwResult[]; annotations?: { type: string; description?: string }[] }
interface PwSpec { title: string; file: string; line: number; tests: PwTest[] }
interface PwSuite { title: string; file?: string; specs?: PwSpec[]; suites?: PwSuite[] }
interface PwReport { suites: PwSuite[]; stats?: Record<string, number> }

export const collectFailures = (report: PwReport): Failure[] => {
  const out: Failure[] = [];
  const walk = (suite: PwSuite, path: string[]) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests) {
        if (t.status !== 'unexpected' && t.status !== 'flaky') continue;
        const failing = t.results.filter((r) => r.status === 'failed' || r.status === 'timedOut');
        const last = failing.at(-1) ?? t.results.at(-1);
        const err = last?.errors?.[0];
        out.push({
          title: [...path, spec.title].filter(Boolean).join(' › '),
          file: `${spec.file}:${spec.line}`,
          project: t.projectName ?? '',
          outcome: t.status === 'flaky' ? 'flaky' : 'failed',
          attempts: t.results.length,
          error: (err?.message ?? err?.stack ?? last?.status ?? 'no error captured').split('\n').slice(0, 6).join('\n'),
          attachments: (last?.attachments ?? []).filter((a) => a.path).map((a) => `${a.name}: ${relative(root, a.path!)}`),
          annotations: (t.annotations ?? []).map((a) => `${a.type}${a.description ? `: ${a.description}` : ''}`),
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child, [...path, child.title].filter(Boolean));
  };
  for (const s of report.suites) walk(s, []);
  return out;
};

const skeleton = (c: Cluster): string => {
  const f = c.failures[0];
  const where = f.file.replace(/:\d+$/, '');
  const lines = [
    `### [${c.area}] ${c.headline}`,
    '',
    `**Where:** ${where}`,
    `**Environment:** ${f.project || 'unknown project'} · CI`,
    `**Signature:** \`${c.signature}\``,
    `**Occurrences:** ${c.failures.length} test(s) · ${c.flakyCount} flaky · ${c.failures.length - c.flakyCount} consistent`,
    '',
    '#### Expected',
    '',
    'Fill in from the test title: the assertion that should hold.',
    '',
    '#### Actual',
    '',
    '```',
    f.error,
    '```',
    '',
    '#### Tests',
    '',
    ...c.failures.map((x) => `- ${x.outcome.toUpperCase()} · ${x.title} (${x.file}, ${x.attempts} attempt${x.attempts === 1 ? '' : 's'})`),
  ];
  const att = c.failures.flatMap((x) => x.attachments);
  if (att.length) lines.push('', '#### Evidence', '', ...att.slice(0, 8).map((a) => `- ${a}`));
  const notes = c.failures.flatMap((x) => x.annotations);
  if (notes.length) lines.push('', '#### Annotations', '', ...notes.map((a) => `- ${a}`));
  if (c.llm) lines.push('', '#### Draft summary (Claude, review before filing)', '', c.llm);
  return lines.join('\n');
};

const draftWithClaude = async (c: Cluster): Promise<string | undefined> => {
  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are helping a QA engineer triage a Playwright failure cluster. Write two plain sentences: (1) what most likely broke, from the error only, hedged where uncertain; (2) a suggested severity (blocker/major/minor) with a five-word reason. No markdown.\n\nTests:\n${c.failures.map((f) => `- ${f.title} [${f.outcome}, ${f.attempts} attempts]`).join('\n')}\n\nError:\n${c.failures[0].error}`,
    }],
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { content?: { text?: string }[] };
  return json.content?.[0]?.text?.trim();
};

const main = async () => {
  if (!existsSync(reportPath)) {
    console.log(`triage: no report at ${relative(root, reportPath)} — run the tests first.`);
    return;
  }
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as PwReport;
  const failures = collectFailures(report);
  const clusters = clusterFailures(failures);
  if (useLlm) for (const c of clusters) c.llm = await draftWithClaude(c);

  const md = [
    `# Triage — ${new Date().toISOString()}`,
    '',
    `${failures.length} failing or flaky test(s) in ${clusters.length} cluster(s). Stats: ${JSON.stringify(report.stats ?? {})}`,
    '',
    ...(clusters.length ? clusters.map(skeleton) : ['Nothing to triage.']),
    '',
  ].join('\n');
  writeFileSync(join(here, 'triage.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), failures, clusters }, null, 2)}\n`);
  writeFileSync(join(here, 'triage.md'), md);
  console.log(`triage: ${failures.length} failure(s) → ${clusters.length} cluster(s). See tools/triage/triage.md`);
};

main().catch((e) => { console.error(e); });
