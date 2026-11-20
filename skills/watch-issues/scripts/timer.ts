// watch-timer: dues numbered 1,2,… accrue at every WATCH_TICK_SECONDS boundary (default 1200 s).
// The oldest unreceipted due goes out as soon as the watcher is ready; each due is delivered at
// most once plus one resend. Readiness = watcher status idle/done, or status null (hc does not
// detect a shell-launched agent, so its status never sets — queued input still serializes there,
// each tick runs its own check after the previous turn ends, none merge). The send is one untagged
// `watch-issues tick timer=<self> pid=<pin> due=<n> <root>`; delivery is the timer's own
// akrogon.watch-due label reading n, and an undelivered due resends once when its interval window
// lapses then drops while later dues continue. The loop exits (and --rm frees the name) when the
// pinned watcher foreground dies or is swapped, the watcher terminal goes away, or the resolved
// transcript stays off the pinned one. Every refused read, skipped send, failed send and exit
// reason prints to this terminal's own output.
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

// Reasons print to the timer's own output (hc read shows them); a repeated reason prints once
// per change so a fast poll does not flood the screen.
let lastNote: string = '';
function note(line: string): void {
  if (line === lastNote) return;
  lastNote = line;
  console.log(`[watch-timer] ${line}`);
}
const errText = (error: unknown): string =>
  error instanceof HcError ? `${error.kind}` : error instanceof Error ? error.message : String(error);

type Due = { n: number; attempts: number; lastSent: number | null };

const dues: Due[] = [];
let dueCount: number = 0;
let nextBoundary: number = Date.now() + intervalMs;
let effectiveTranscript: string | null = args.transcript;
let transcriptMiss: number = 0;

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
  while (nextBoundary <= now) {
    dueCount += 1;
    dues.push({ n: dueCount, attempts: 0, lastSent: null });
    nextBoundary += intervalMs;
  }

  const start: string | null = procStart(args.pinPid);
  if (start === null || start !== args.pinStart) {
    console.log(`[watch-timer] exit: pinned process ${args.pinPid} ${start === null ? 'gone' : `replaced (start ${start} != ${args.pinStart})`}`);
    return 'exit';
  }

  let w: Seen;
  try {
    w = await terminal(args.session, args.watcher);
  } catch (error) {
    if (error instanceof HcError && error.kind === 'not_found') {
      console.log(`[watch-timer] exit: watcher ${args.watcher} not_found`);
      return 'exit';
    }
    if (error instanceof HcError) {
      note(`hc get watcher failed: ${error.kind}`); // refused: watcher state unknown this poll
      return 'stay';
    }
    throw error;
  }
  if (w.state === 'finished') {
    console.log(`[watch-timer] exit: watcher ${args.watcher} finished`);
    return 'exit';
  }
  // An idle shell reports foreground null; the pty program itself (w.pid) is the tracked process then.
  const tracked: number | null = w.foreground?.pid ?? w.pid;
  if (tracked === null) {
    console.log(`[watch-timer] exit: watcher has no tracked pid`);
    return 'exit';
  }
  if (tracked !== args.pinPid && !isDescendant(tracked, args.pinPid)) {
    console.log(`[watch-timer] exit: watcher foreground ${tracked} is not the pinned ${args.pinPid} or its descendant`);
    return 'exit';
  }

  const resolved: string | null = await transcriptFor({ session: args.session, address: args.watcher });
  if (resolved !== null) {
    if (effectiveTranscript === null) effectiveTranscript = resolved;
    else if (resolved !== effectiveTranscript) {
      // Require the moved path to hold for several polls: a harness can open another transcript
      // mid-conversation (sub-agent rollout, session record rewrite); that is not a reset.
      transcriptMiss += 1;
      if (transcriptMiss >= 3) {
        console.log(`[watch-timer] exit: transcript moved ${effectiveTranscript} -> ${resolved}`);
        return 'exit';
      }
      note(`transcript moved ${effectiveTranscript} -> ${resolved} (${transcriptMiss}/3)`);
    } else transcriptMiss = 0;
  } else transcriptMiss = 0;

  // Delivery check on every poll: the receipt stamp is the whole proof, so no turn tracking is
  // needed (an untracked watcher's turn never moves). A due whose window lapses unreceipted
  // resends once, then drops while later dues continue.
  let rcpt: string | null = null;
  try {
    rcpt = await receipt();
  } catch (error) {
    note(`receipt read failed: ${errText(error)}`);
    return 'stay';
  }
  while (dues.length > 0 && rcpt !== null && dues[0].n <= Number(rcpt)) {
    dues.shift();
  }

  if (dues.length === 0) return 'stay';
  const due: Due = dues[0];
  if (due.lastSent !== null) {
    if (now - due.lastSent < intervalMs) return 'stay';
    if (due.attempts >= 2) {
      dues.shift();
      console.log(`[watch-timer] due=${due.n} dropped: no receipt after ${due.attempts} sends`);
      return 'stay';
    }
    due.lastSent = null; // unreceipted after one interval: the one allowed resend
  }
  if (w.status !== null && w.status.state !== 'idle' && w.status.state !== 'done') {
    note(`hold due=${due.n}: watcher busy (${w.status.state})`);
    return 'stay';
  }
  try {
    const sent = await send(
      args.session,
      args.watcher,
      `watch-issues tick timer=${self} pid=${args.pinPid} due=${due.n} ${args.root}`,
    );
    due.attempts += 1;
    if (sent.started === false) {
      note(`send due=${due.n} not started (status=${sent.status})`);
      if (due.attempts >= 2) {
        dues.shift();
        console.log(`[watch-timer] due=${due.n} dropped: send never started`);
      }
      return 'stay';
    }
    due.lastSent = Date.now();
    console.log(`[watch-timer] due=${due.n} sent (attempt ${due.attempts}, turn=${sent.turn})`);
  } catch (error) {
    if (error instanceof HcError && error.kind === 'not_found') {
      console.log(`[watch-timer] exit: watcher ${args.watcher} not_found during send`);
      return 'exit';
    }
    if (!(error instanceof HcError)) throw error;
    note(`send due=${due.n} failed: ${error.kind}`);
    due.attempts += 1;
    if (due.attempts >= 2) {
      dues.shift();
      console.log(`[watch-timer] due=${due.n} dropped: send failed (${error.kind})`);
    }
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
console.log(`[watch-timer] exited`);
