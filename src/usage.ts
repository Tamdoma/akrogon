export type FlagSpec = { type: 'string' | 'boolean' };

export const VERB_OPTIONS: Record<string, Record<string, FlagSpec>> = {
  install: {},
  listen: {},
  init: { from: { type: 'string' }, toolkit: { type: 'string' } },
  config: {},
  preflight: {},
  phase: {
    slot: { type: 'string' },
    verdict: { type: 'string' },
    reason: { type: 'string' },
    check: { type: 'boolean' },
    attempt: { type: 'string' },
  },
  land: { attempt: { type: 'string' } },
  next: { all: { type: 'boolean' }, resume: { type: 'boolean' }, wake: { type: 'boolean' } },
  seat: {
    task: { type: 'string' },
    slot: { type: 'string' },
    harness: { type: 'string' },
    model: { type: 'string' },
    effort: { type: 'string' },
  },
  pull: { all: { type: 'boolean' } },
  close: { by: { type: 'string' } },
  park: { all: { type: 'boolean' } },
  unpark: { all: { type: 'boolean' } },
  pause: {},
  unpause: {},
  stop: { all: { type: 'boolean' } },
  'stop-run': {},
  start: {},
  sync: {},
  status: { charts: { type: 'boolean' }, json: { type: 'boolean' } },
  leftovers: {},
  timing: { cohort: { type: 'boolean' }, flow: { type: 'boolean' }, since: { type: 'string' } },
  flaky: {},
  log: {},
  'run-check': { name: { type: 'string' }, leaf: { type: 'string' }, holder: { type: 'string' } },
  verify: {
    sha: { type: 'string' },
    attempt: { type: 'string' },
    holder: { type: 'string' },
    'known-red': { type: 'boolean' },
  },
  guard: {},
  pack: {},
  notice: { title: { type: 'string' }, body: { type: 'string' }, attention: { type: 'boolean' } },
  rollback: {},
};

export const VERB_USAGE: string = `Usage: akrogon <${Object.keys(VERB_OPTIONS).join('|')}>`;
export const PACK_USAGE: string = 'Usage: akrogon pack issues/closed/<owner> | issues/chart/<chart> ...';
export const STOP_USAGE: string = 'Usage: akrogon stop <slug> | --all';
export const TIMING_USAGE: string =
  'Usage: akrogon timing <slug> | --cohort --since <iso> | --flow --since <YYYY-MM-DD>';
export const GUARD_USAGE: string = 'Usage: akrogon guard <ancestors|own-modules>';
export const RUN_CHECK_USAGE: string =
  'Usage: akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...';

export const USAGE_LINES: Record<string, string> = {
  pack: PACK_USAGE,
  stop: STOP_USAGE,
  timing: TIMING_USAGE,
  guard: GUARD_USAGE,
  'run-check': RUN_CHECK_USAGE,
};

export function optionsFor(verb: string): Record<string, FlagSpec> {
  return { ...(VERB_OPTIONS[verb] ?? {}), help: { type: 'boolean' } };
}

export function verbFlags(verb: string): string[] {
  return Object.keys(optionsFor(verb)).map((name: string) => '--' + name);
}

export function helpText(verb: string): string {
  const line: string = 'akrogon ' + verb + ' ' + verbFlags(verb).join(' ');
  return USAGE_LINES[verb] === undefined ? line : line + '\n' + USAGE_LINES[verb];
}
