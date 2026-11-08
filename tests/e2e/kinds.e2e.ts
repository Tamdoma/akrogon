// Criterion 9, attended paid per-kind tier under readiness grants[0] (at most 8 harness sessions,
// at most 4 prompts each): one real seat per kind through the start verb in akr-e2e-engine.
// Run: AKROGON_E2E=kinds AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/kinds-tier
//      bun test ./tests/e2e/kinds.e2e.ts
// Each seat gets 2 prompts: the first task (argv, or agy's first send) and one later send.
import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { readState } from '../../src/state';
import { type SpawnResult } from '../../src/shell';
import { realHome, required, startTier, stopTier, trustedWorkspaces, type Tier } from './tier';

const homedir = (): string => realHome;

// trust: the folder-trust answer a kind shows in the tier's throwaway git repo (plans O3, O4), or null.
// pi's -a trusts project files for the run; the start verb answers agy's dialog itself.
const kinds: Record<string, { line: string; model: string; transcript: RegExp; trust: string | null }> = {
  claude: {
    line: 'claude --model {model} --effort {effort} --dangerously-skip-permissions',
    model: 'claude-haiku-5-5',
    transcript: new RegExp(`^${homedir()}/\\.claude/projects/[^/]+/[0-9a-f-]{36}\\.jsonl$`),
    trust: 'Yes, I trust this folder',
  },
  codex: {
    line: 'codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access',
    model: 'gpt-6.1-sol',
    transcript: new RegExp(`^${homedir()}/\\.codex/sessions/.+/rollout-.+\\.jsonl$`),
    trust: 'Trust and continue',
  },
  pi: {
    line: 'pi --model {model} --thinking {effort} -a --exclude-tools request_user_input',
    model: 'devin/swe-2-max',
    transcript: new RegExp(`^${homedir()}/\\.pi/agent/sessions/[^/]+/.+_[0-9a-f-]{36}\\.jsonl$`),
    trust: null,
  },
  agy: {
    line: 'agy --model {model} --effort {effort} --mode auto',
    model: 'gemini-3.8-flash-low',
    transcript: new RegExp(`^${homedir()}/\\.gemini/antigravity-cli/conversation_summaries\\.db$`),
    trust: null,
  },
};

const terminalSchema = z.object({
  address: z.string(),
  state: z.string(),
  turn: z.number(),
  labels: z.record(z.string(), z.string()),
  status: z.object({ state: z.string() }).passthrough().nullable(),
});

async function seat(tier: Tier, slug: string) {
  const listed = z
    .object({ terminals: z.array(terminalSchema) })
    .parse(await tier.rpc('terminal.list', { labels: { 'akrogon.leaf': slug } }));
  expect(listed.terminals.filter((t) => t.state === 'live')).toHaveLength(1);
  return listed.terminals.filter((t) => t.state === 'live')[0];
}

// Bounded by hc's own wait (event-driven), never a sleep.
async function turnEnded(tier: Tier, address: string, turn: number): Promise<void> {
  for (let attempt: number = 0; attempt < 10; attempt += 1) {
    const current = terminalSchema.parse(JSON.parse((await tier.hc(['get', '--json', address])).stdout));
    if (current.turn >= turn && current.status?.state !== 'working') return;
    await tier.hc(['wait', address, '--timeout', '60']);
  }
  throw new Error(`${address} did not finish turn ${turn}`);
}

// Plans O3, O4: Claude Code and codex ask whether to trust the tier's throwaway git repo before they
// run the argv task. The trust answer is chosen once, inside the start verb's proof window, so the
// start is still proven by the task itself. Each harness writes its own trust entry; no script edits
// those files. Claude's cursor starts on "No, exit", so the keys follow the screen: Enter when the
// cursor sits on the answer, else Down then Enter. Once the entry exists (it names the tier repo,
// which every run recreates at the same path) the dialog no longer shows, so the wait ends when the
// start verb returns.
async function answerTrust(
  tier: Tier,
  kind: string,
  slug: string,
  trust: string,
  starting: Promise<SpawnResult>,
): Promise<void> {
  const returned: Promise<boolean> = starting.then(() => true);
  for (let attempt: number = 0; attempt < 90; attempt += 1) {
    const live = z
      .object({ terminals: z.array(terminalSchema) })
      .parse(await tier.rpc('terminal.list', { labels: { 'akrogon.leaf': slug } }))
      .terminals.filter((t) => t.state === 'live');
    const shown: string = live.length === 1 ? (await tier.hc(['read', live[0].address])).stdout : '';
    if (shown.includes(trust)) {
      const line: string = shown.split('\n').find((l: string) => l.includes(trust)) ?? '';
      const answer: string[] = /[❯›]/.test(line) ? ['enter'] : ['down', 'enter'];
      tier.record(`${kind}-trust.txt`, `${shown}\nkeys: ${answer.join(' ')}\n`);
      expect((await tier.hc(['keys', live[0].address, ...answer])).code).toBe(0);
      return;
    }
    if (await Promise.race([returned, Bun.sleep(1000).then(() => false)])) {
      tier.record(`${kind}-trust.txt`, 'no folder-trust dialog before the start verb returned\n');
      return;
    }
  }
  throw new Error(`${slug}: neither a folder-trust dialog nor the start verb's return in 90 s`);
}

test('kinds tier: first task, later send, report by hc send, transcript label, agy trust and outside write', async () => {
  expect(required('AKROGON_E2E')).toBe('kinds');
  const root: string = required('AKROGON_E2E_ROOT');
  const harnesses: Record<string, string> = Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, v.line]));
  const tier: Tier = await startTier('kinds', harnesses, {
    a: { harness: 'claude', model: kinds.claude.model, effort: 'low' },
    b: { harness: 'claude', model: kinds.claude.model, effort: 'low' },
  });
  // transcriptFor runs in this process, whose preload points XDG_RUNTIME_DIR at the suite's own
  // runtime; it must find akr-e2e-engine where akrogon's runs find it, in the tier runtime.
  process.env.XDG_RUNTIME_DIR = tier.runtime;
  const cwds: string[] = Object.keys(kinds).map((kind: string) => resolve(root, `akr-e2e-engine-${kind}`));
  const trustedBefore: string[] = trustedWorkspaces();
  tier.record('cwds.json', cwds);
  try {
    const inbox = z
      .object({ address: z.string() })
      .parse(
        JSON.parse((await tier.hc(['run', '--bg', '--json', '--no-parent', '--name', 'inbox', '--', 'cat'])).stdout),
      );
    for (const [kind, spec] of Object.entries(kinds)) {
      const slug: string = `akr-e2e-engine-${kind}`;
      const path: string = resolve(tier.root, 'issues/open/e2e', slug);
      mkdirSync(path, { recursive: true });
      await Bun.write(
        resolve(path, 'state.yaml'),
        Bun.YAML.stringify({ slug, phase: 'plan.synthesis', created: '2026-11-07', repo: 'akre2e', 'blocked-by': [] }),
      );
      await Bun.write(
        resolve(tier.home, 'config.yaml'),
        Bun.YAML.stringify({
          slots: {
            a: { harness: kind, model: spec.model, effort: 'low' },
            b: { harness: kind, model: spec.model, effort: 'low' },
          },
          harnesses,
          repos: { akre2e: tier.root },
          prefixes: { akre2e: 'ae' },
        }),
      );
      const outside: string = resolve(root, `akr-e2e-engine-${kind}-outside.txt`);
      const first: string = `Run exactly this shell command and nothing else: hc send ${inbox.address} 'done ${kind} 1'${kind === 'agy' ? ` && echo ok > ${outside}` : ''}`;
      const starting = tier.akrogon(['seat', slug, 'A', '--task', first]);
      if (spec.trust !== null) await answerTrust(tier, kind, slug, spec.trust, starting);
      const started = await starting;
      tier.record(`${kind}-start.txt`, `${started.stdout}\n${started.stderr}`);
      expect(started.code).toBe(0);
      const t = await seat(tier, slug);
      expect(readState(path).prompted.A).toMatchObject({ address: t.address });
      await turnEnded(tier, t.address, 1);
      const later = z
        .object({ started: z.boolean().nullable(), turn: z.number() })
        .parse(
          JSON.parse(
            (await tier.hc(['send', '--json', t.address, `Run exactly: hc send ${inbox.address} 'done ${kind} 2'`]))
              .stdout,
          ),
        );
      expect(later.started).toBe(true);
      await turnEnded(tier, t.address, later.turn + 1);
      const screen: string = (await tier.hc(['read', inbox.address])).stdout;
      tier.record(`${kind}-inbox.txt`, screen);
      expect(screen).toContain(`done ${kind} 1`);
      expect(screen).toContain(`done ${kind} 2`);
      const { transcriptFor } = await import('../../src/transcript');
      const found: string | null = await transcriptFor({ session: 'akr-e2e-engine', address: t.address });
      tier.record(`${kind}-transcript.txt`, String(found));
      expect(found).toMatch(spec.transcript);
      const labelled = terminalSchema.parse(JSON.parse((await tier.hc(['get', '--json', t.address])).stdout));
      expect(labelled.labels['akrogon.transcript']).toBe(z.string().parse(found));
      if (kind === 'claude') expect(statSync(z.string().parse(found)).size).toBeGreaterThan(0);
      if (kind === 'agy') {
        const log: string = (await tier.hc(['read', t.address])).stdout;
        tier.record('agy-screen.txt', log);
        expect(existsSync(outside)).toBe(true);
        expect(trustedWorkspaces()).toContain(resolve(root, slug));
      }
    }
  } finally {
    const left: string[] = await stopTier(tier, cwds);
    const trusted: string[] = trustedWorkspaces();
    tier.record(
      'absence.txt',
      JSON.stringify({ left, trusted_added: trusted.filter((p) => !trustedBefore.includes(p)) }),
    );
    expect(left).toEqual([]);
  }
}, 1_800_000);
