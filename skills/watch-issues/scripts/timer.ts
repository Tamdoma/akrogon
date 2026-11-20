// watch-timer: dues numbered 1,2,… accrue at every WATCH_TICK_SECONDS boundary (default 1200 s).
// With dues pending and the watcher idle or done the oldest goes out at once — dues accrued while
// the watcher works wait for it, one due at a time after the previous turn ends, none merged. The send is one untagged
// `watch-issues tick timer=<self> pid=<pin> due=<n> <root>`; delivery is the timer's own
// akrogon.watch-due label reading n, and an undelivered due resends once at a later boundary then
// drops. The loop exits (and --rm frees the name) when the pinned watcher foreground dies or is
// swapped, the watcher terminal goes away, or the resolved transcript moves off the pinned one.
import { HcError, send, terminal, type Seen } from '../../../src/hc';
import { transcriptFor } from '../../../src/transcript';
import { isDescendant, procStart } from './proc';

type Args = {
  session: string;
  watcher: string;
  root: string;
  repo: string;
  pinPid: number;
  pinStart: string;
  transcript: string | null;
};

function parseArgs(): Args {
  const raw: Record<string, string> = {};
  const argv: string[] = process.argv.slice(2);
  for (let i: number = 0; i + 1 < argv.length; i += 2) {
    if (argv[i].startsWith('--')) raw[argv[i].slice(2)] = argv[i + 1];
  }
  const pinPid: number = Number(raw['pin-pid']);
  const missing: string[] = ['session', 'watcher', 'root', 'repo', 'pin-start'].filter(
    (name: string) => raw[name] === undefined || raw[name] === '',
  );
  if (missing.length > 0 || !Number.isSafeInteger(pinPid)) {
    throw new Error(`timer.ts: bad argv ${JSON.stringify(argv)}`);
  }
  return {
    session: raw.session,
    watcher: raw.watcher,
    root: raw.root,
    repo: raw.repo,
    pinPid,
    pinStart: raw['pin-start'],
    transcript: raw.transcript ?? null,
  };
}

const args: Args = parseArgs();
const self: string = process.env.HC_TERMINAL_ID ?? '';
const seconds: number = Number(process.env.WATCH_TICK_SECONDS) || 1200;
const intervalMs: number = seconds * 1000;
const pollMs: number = Math.max(1, Math.min(1000, intervalMs / 8));

type Due = { n: number; attempts: number };
type Awaiting = { n: number; turn: number; deadline: number };

const dues: Due[] = [];
let dueCount: number = 0;
let nextBoundary: number = Date.now() + intervalMs;
let awaiting: Awaiting | null = null;
let effectiveTranscript: string | null = args.transcript;

const ready = (w: Seen): boolean =>
  w.status !== null && (w.status.state === 'idle' || w.status.state === 'done');

// The timer's own akrogon.watch-due label; null when it can't be read (foreign runs read no receipt).
async function receipt(): Promise<string | null> {
  if (self === '') return null;
  try {
    const me: Seen = await terminal(args.session, self);
    return me.labels['akrogon.watch-due'] ?? null;
  } catch (error) {
    if (error instanceof HcError) return null;
    throw error;
  }
}

async function poll(): Promise<'exit' | 'stay'> {
  const now: number = Date.now();
  const crossed: boolean = nextBoundary <= now;
  while (nextBoundary <= now) {
    dueCount += 1;
    dues.push({ n: dueCount, attempts: 0 });
    nextBoundary += intervalMs;
  }

  const start: string | null = procStart(args.pinPid);
  if (start === null || start !== args.pinStart) return 'exit';

  let w: Seen;
  try {
    w = await terminal(args.session, args.watcher);
  } catch (error) {
    if (error instanceof HcError && error.kind === 'not_found') return 'exit';
    if (error instanceof HcError) return 'stay'; // hc refused: watcher state unknown this poll
    throw error;
  }
  if (w.state === 'finished') return 'exit';
  // An idle shell reports foreground null; the pty program itself (w.pid) is the tracked process then.
  const tracked: number | null = w.foreground?.pid ?? w.pid;
  if (tracked === null) return 'exit';
  if (tracked !== args.pinPid && !isDescendant(tracked, args.pinPid)) return 'exit';

  const resolved: string | null = await transcriptFor({ session: args.session, address: args.watcher });
  if (resolved !== null) {
    if (effectiveTranscript === null) effectiveTranscript = resolved;
    else if (resolved !== effectiveTranscript) return 'exit';
  }

  if (awaiting !== null) {
    const settled: boolean = w.turn > awaiting.turn && ready(w);
    if ((settled || now >= awaiting.deadline) && dues.length > 0 && dues[0].n === awaiting.n) {
      if ((settled && (await receipt()) === String(awaiting.n)) || dues[0].attempts >= 2) {
        dues.shift();
      }
      awaiting = null;
    }
  }

  // One send while any due is pending and the watcher is ready, and only at a boundary.
  if (!crossed || awaiting !== null || dues.length === 0 || !ready(w)) {
    return 'stay';
  }
  const due: Due = dues[0];
  if ((await receipt()) === String(due.n)) {
    dues.shift();
    return 'stay';
  }
  try {
    const sent: { started: boolean | null } = await send(
      args.session,
      args.watcher,
      `watch-issues tick timer=${self} pid=${args.pinPid} due=${due.n} ${args.root}`,
    );
    due.attempts += 1;
    if (sent.started === true) {
      awaiting = { n: due.n, turn: w.turn, deadline: Date.now() + intervalMs };
    } else if (due.attempts >= 2) {
      dues.shift();
    }
  } catch (error) {
    if (!(error instanceof HcError)) throw error;
    due.attempts += 1;
    if (due.attempts >= 2) dues.shift();
  }
  return 'stay';
}

// The watcher program's own exec can update /proc environ (a harness path shows up only then)
// and a transcript can flip right at startup, so the first polls run faster: the latch has to land
// on the path the watch settles on, not on a stale read.
let early: number = 20;
for (;;) {
  if ((await poll()) === 'exit') break;
  await Bun.sleep(early-- > 0 ? Math.min(pollMs, 50) : pollMs);
}
