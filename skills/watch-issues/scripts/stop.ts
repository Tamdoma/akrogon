// watch-issues stop <root>: end the repo's verified timer from any terminal. The session comes
// from the repo itself, never from HC_TERMINAL_ID. Prints `stopped` (nothing running, or after
// kill+rm it prints `stopped <address>`) exit 0, or `conflict <details>` exit 2 touching nothing.
import { terminals, watchConsultName, type Seen } from '../../../src/hc';
import { getTerm, hcCall, isVerifiedConsultant, isVerifiedTimer, type HcReply, type Term } from './hc';
import { watchTarget, type WatchTarget } from './repo';

const TIMER_LABEL: string = 'akrogon.watch-timer';

function out(line: string, code: number): never {
  console.log(line);
  process.exit(code);
}

async function main(): Promise<void> {
  const root: string = process.argv.slice(2).join(' ');
  if (root === '') {
    console.error('usage: stop.ts <root>');
    process.exit(1);
  }
  const target: WatchTarget = await watchTarget(root);
  const watchName: string = `${target.prefix}-watch`;

  const labelled: Seen[] = (await terminals(target.session, { [TIMER_LABEL]: target.repo })).filter(
    (t: Seen) => t.state === 'live',
  );
  if (labelled.length > 1) {
    out(`conflict labelled ${labelled.map((t: Seen) => t.address).join(',')}`, 2);
  }
  if (labelled.length === 0) {
    const named: Seen[] = (await terminals(target.session, {})).filter(
      (t: Seen) => t.name === watchName,
    );
    if (named.length > 0) out(`conflict named ${named.map((t: Seen) => t.address).join(',')}`, 2);
    out('stopped', 0);
  }
  const timer: { ok: true; term: Term } | { ok: false; kind: string } = await getTerm(
    target.session,
    labelled[0].address,
  );
  if (!timer.ok || !isVerifiedTimer(target.prefix, timer.term) || timer.term.state !== 'live') {
    out(`conflict labelled ${labelled[0].address}`, 2);
  }
  // The watcher address the consultant must be parented to comes from the timer's own --watcher
  // argv: launched detached, term.parent can be null while the argv always carries the pin.
  const argv: string[] = timer.term.argv ?? [];
  const watcherFlag: number = argv.indexOf('--watcher');
  const watcher: string | null = watcherFlag === -1 ? null : (argv[watcherFlag + 1] ?? null);

  // A live terminal that names itself <prefix>-watch-consult or carries the repo's
  // akrogon.watch-consult label but fails the verified predicate is a conflict: stop touches
  // nothing, same shape as the timer conflicts. Foreign-repo labels are not candidates.
  const consultName: string = watchConsultName(target.prefix);
  const candidates: Seen[] = (await terminals(target.session, {})).filter(
    (t: Seen) =>
      t.state === 'live' &&
      (t.name === consultName || t.labels['akrogon.watch-consult'] === target.repo),
  );
  const consultants: Seen[] = candidates.filter((t: Seen) =>
    watcher !== null && isVerifiedConsultant(target.prefix, target.repo, watcher, t),
  );
  const bad: Seen | undefined = candidates.find((t: Seen) => !consultants.includes(t));
  if (bad !== undefined) {
    out(`conflict consultant ${bad.address}`, 2);
  }

  // A timer that exited between the list and the kill is already the goal state.
  const killed: HcReply = await hcCall(target.session, ['kill', timer.term.address]);
  if (!killed.ok && killed.kind !== 'not_found') {
    out(`conflict ${timer.term.address} ${killed.kind}`, 2);
  }
  const removed: HcReply = await hcCall(target.session, ['rm', timer.term.address]);
  if (!removed.ok && removed.kind !== 'not_found') {
    out(`conflict ${timer.term.address} ${removed.kind}`, 2);
  }
  // The verified timer is down; now the watch's own verified consultants, tolerating a terminal
  // that already left on its own.
  const lines: string[] = [`stopped ${timer.term.address}`];
  for (const consultant of consultants) {
    for (const verb of ['kill', 'rm']) {
      const reply: HcReply = await hcCall(target.session, [verb, consultant.address]);
      if (!reply.ok && reply.kind !== 'not_found') {
        out(`conflict ${consultant.address} ${reply.kind}`, 2);
      }
    }
    lines.push(`stopped consultant ${consultant.address}`);
  }
  out(lines.join(' '), 0);
}

try {
  await main();
} catch (error) {
  out(`conflict ${error instanceof Error ? error.message : String(error)}`, 2);
}
