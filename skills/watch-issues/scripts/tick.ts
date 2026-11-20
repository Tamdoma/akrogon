// watch-issues tick timer=<a> pid=<p> due=<n> <root>: the watcher's per-due gate. Prints one
// outcome: `accept` exit 0 after stamping the timer's akrogon.watch-due receipt FIRST; `stopped`
// exit 0 when the tick's pid is not the watcher foreground (the timer lost its pin → kill+rm it);
// `no-watch` exit 1 for unparseable fields, a dead/unverified/foreign timer, or a stale due.
import { getTerm, hcCall, isVerifiedTimer, type HcReply, type Term } from './hc';
import { isAncestor } from './proc';
import { watchTarget } from './repo';

const DUE_LABEL: string = 'akrogon.watch-due';

function out(line: string, code: number): never {
  console.log(line);
  process.exit(code);
}

function noWatch(): never {
  out('no-watch', 1);
}

function field(argv: string[], name: string): string | null {
  const hit: string | undefined = argv.find((arg: string) => arg.startsWith(`${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 1);
}

async function main(): Promise<void> {
  const argv: string[] = process.argv.slice(2);
  const timer: string | null = field(argv, 'timer');
  const pidRaw: string | null = field(argv, 'pid');
  const dueIndex: number = argv.findIndex((arg: string) => arg.startsWith('due='));
  const due: number = dueIndex === -1 ? NaN : Number(argv[dueIndex].slice(4));
  const root: string = dueIndex === -1 ? '' : argv.slice(dueIndex + 1).join(' ');
  const own: string | undefined = process.env.HC_TERMINAL_ID;
  if (
    timer === null ||
    timer === '' ||
    pidRaw === null ||
    !/^\d+$/.test(pidRaw) ||
    !Number.isSafeInteger(due) ||
    due < 1 ||
    root === '' ||
    own === undefined ||
    own.trim() === ''
  ) {
    noWatch();
  }
  const pinPid: number = Number(pidRaw);
  const target = await watchTarget(root).catch(noWatch);

  const timerReply: { ok: true; term: Term } | { ok: false; kind: string } = await getTerm(
    target.session,
    timer,
  );
  if (
    !timerReply.ok ||
    timerReply.term.state !== 'live' ||
    !isVerifiedTimer(target.prefix, timerReply.term) ||
    timerReply.term.parent !== own
  ) {
    noWatch();
  }
  const self: { ok: true; term: Term } | { ok: false; kind: string } = await getTerm(
    target.session,
    own,
  );
  if (!self.ok || self.term.foreground === null) noWatch();
  const fg: number = self.term.foreground.pid;
  if (fg !== pinPid || !isAncestor(fg, process.pid)) {
    await hcCall(target.session, ['kill', timer]);
    await hcCall(target.session, ['rm', timer]);
    out('stopped', 0);
  }
  const receipt: number = Number(timerReply.term.labels[DUE_LABEL] ?? '0');
  if (due <= receipt) noWatch();
  const stamped: HcReply = await hcCall(target.session, ['label', timer, `${DUE_LABEL}=${due}`]);
  if (!stamped.ok) noWatch();
  out('accept', 0);
}

try {
  await main();
} catch {
  noWatch();
}
