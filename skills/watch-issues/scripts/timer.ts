// watch-timer: dues numbered 1,2,… accrue at every WATCH_TICK_SECONDS boundary (default 1200 s).
// The oldest unreceipted due goes out as soon as the watcher is ready; each due is delivered at
// most once plus one resend. Readiness requires hc's idle or done status. The send is one untagged
// `watch-issues tick timer=<self> pid=<pin> due=<n> <root>`; delivery requires the watcher's turn to
// advance and the timer's own akrogon.watch-due receipt. An undelivered due resends once then
// drops while later dues continue. The loop exits (and --rm frees the name) when the
// pinned watcher foreground dies or is swapped, the watcher terminal goes away, or the resolved
// transcript stays off the pinned one. Every refused read, skipped send, failed send and exit
// reason prints to this terminal's own output.
import { hc, HcError, send, terminal, terminals, type Seen } from '../../../src/hc';
import { transcriptFor } from '../../../src/transcript';
import { isVerifiedConsultant } from './hc';
import { isDescendant, procStart } from './proc';

type Args = {
  session: string;
  watcher: string;
  root: string;
  repo: string;
  prefix: string | null;
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
    // start.ts always launches with --prefix (plan D4); an older direct launch without it
    // still runs — the exit sweep just has no consultant name to verify against.
    prefix: raw.prefix ?? null,
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
type Due = { n: number; attempts: number; sent: { at: number; turn: number } | null };

const dues: Due[] = [];
let dueCount: number = 0;
let nextBoundary: number = Date.now() + intervalMs;
let effectiveTranscript: string | null = args.transcript;
let transcriptMiss: number = 0;

// The timer's own akrogon.watch-due label. A missing label and a failed read are distinct.
async function receipt(): Promise<string | null> {
  if (self === '') return null;
  const me: Seen = await terminal(args.session, self);
  return me.labels['akrogon.watch-due'] ?? null;
}

async function readWatcher(): Promise<Seen | 'exit' | 'stay'> {
  const start: string | null = procStart(args.pinPid);
  if (start === null || start !== args.pinStart) {
    console.log(
      `[watch-timer] exit: pinned process ${args.pinPid} ${start === null ? 'gone' : `replaced (start ${start} != ${args.pinStart})`}`,
    );
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
  return w;
}

async function poll(): Promise<'exit' | 'stay'> {
  const now: number = Date.now();
  const watcher = await readWatcher();
  if (typeof watcher === 'string') return watcher;

  let resolved: string | null;
  try {
    resolved = await transcriptFor({ session: args.session, address: args.watcher });
  } catch (error) {
    if (!(error instanceof HcError)) throw error;
    note(`hc transcript lookup failed: ${error.kind}`);
    return 'stay';
  }
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

  let rcpt: string | null;
  try {
    rcpt = await receipt();
  } catch (error) {
    if (!(error instanceof HcError)) throw error;
    note(`receipt read failed: ${error.kind}`);
    return 'stay';
  }
  const status: string | null = watcher.status?.state ?? null;
  const busy: boolean = status !== 'idle' && status !== 'done';
  const head: Due | undefined = dues[0];
  const delivered: boolean =
    head !== undefined && head.sent !== null && watcher.turn > head.sent.turn && Number(rcpt) >= head.n;
  // One idle poll can queue several elapsed dues. While the watcher works, and on the poll that
  // first sees its head due's turn done (boundaries can pass between the last busy poll and this
  // one), keep the sent head and only the newest unsent due.
  const working: boolean = busy || delivered;
  if (working) {
    const firstUnsent: number = dues[0]?.sent ? 1 : 0;
    const obsolete: number = dues.length - firstUnsent - 1;
    if (obsolete > 0) dues.splice(firstUnsent, obsolete);
  }
  while (nextBoundary <= now) {
    dueCount += 1;
    const pending: Due | undefined = working ? dues.at(-1) : undefined;
    if (pending?.sent === null) pending.n = dueCount;
    else dues.push({ n: dueCount, attempts: 0, sent: null });
    nextBoundary += intervalMs;
  }

  const oldest: Due | undefined = dues[0];
  if (oldest === undefined) return 'stay';
  if (busy) {
    note(`hold due=${oldest.n}: watcher ${status ?? 'has no reported status'}`);
    return 'stay';
  }
  if (delivered) dues.shift();
  const due: Due | undefined = dues[0];
  if (due === undefined) return 'stay';
  if (due.sent !== null) {
    if (now - due.sent.at < intervalMs) return 'stay';
    if (due.attempts >= 2) {
      dues.shift();
      console.log(`[watch-timer] due=${due.n} dropped: no completed turn and receipt after ${due.attempts} sends`);
      return 'stay';
    }
  }

  const current = await readWatcher();
  if (typeof current === 'string') return current;
  const ready: string | null = current.status?.state ?? null;
  if (ready !== 'idle' && ready !== 'done') {
    note(`hold due=${due.n}: watcher ${ready ?? 'has no reported status'}`);
    return 'stay';
  }
  try {
    // hc can guard idle at delivery. It has no conditional send for done.
    const sent = await send(
      args.session,
      args.watcher,
      `watch-issues tick timer=${self} pid=${args.pinPid} due=${due.n} ${args.root}`,
      ready === 'idle' ? { if: 'idle' } : {},
    );
    due.attempts += 1;
    if (sent.started !== true || (sent.status !== 'idle' && sent.status !== 'done')) {
      due.sent = null;
      note(`send due=${due.n} not started (status=${sent.status})`);
      if (due.attempts >= 2) {
        dues.shift();
        console.log(`[watch-timer] due=${due.n} dropped: send never started`);
      }
      return 'stay';
    }
    due.sent = { at: Date.now(), turn: sent.turn };
    console.log(`[watch-timer] due=${due.n} sent (attempt ${due.attempts}, turn=${sent.turn})`);
  } catch (error) {
    if (error instanceof HcError && error.kind === 'not_found') {
      console.log(`[watch-timer] exit: watcher ${args.watcher} not_found during send`);
      return 'exit';
    }
    if (!(error instanceof HcError)) throw error;
    if (error.kind === 'status_mismatch') {
      note(`hold due=${due.n}: watcher changed status before send`);
      return 'stay';
    }
    note(`send due=${due.n} failed: ${error.kind}`);
    due.attempts += 1;
    due.sent = null;
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

// The exit sweep frees this watch's verified consultant however the loop ended (pinned death,
// missing watcher, moved transcript): a missed consultant would outlive the watch paid. Only the
// verified shape is touched — foreign-repo or unverified terminals stay; non-not_found errors are
// noted and the exit still happens.
async function sweepConsultant(): Promise<void> {
  const prefix: string | null = args.prefix;
  if (prefix === null) return;
  let listed: Seen[];
  try {
    listed = await terminals(args.session, {});
  } catch (error) {
    console.log(`[watch-timer] consultant sweep failed: ${error instanceof HcError ? error.kind : String(error)}`);
    return;
  }
  for (const term of listed.filter((t: Seen) => isVerifiedConsultant(prefix, args.repo, args.watcher, t))) {
    for (const verb of ['kill', 'rm']) {
      try {
        await hc(args.session, [verb, term.address]);
      } catch (error) {
        if (error instanceof HcError && error.kind === 'not_found') continue;
        console.log(
          `[watch-timer] consultant ${verb} ${term.address} failed: ${error instanceof HcError ? error.kind : String(error)}`,
        );
      }
    }
  }
}
await sweepConsultant();
console.log(`[watch-timer] exited`);
