// watch-issues stop <root>: end the repo's verified timer from any terminal. The session comes
// from the repo itself, never from HC_TERMINAL_ID. Prints `stopped` (nothing running, or after
// kill+rm it prints `stopped <address>`) exit 0, or `conflict <details>` exit 2 touching nothing.
import { terminals, type Seen } from '../../../src/hc';
import { getTerm, hcCall, isVerifiedTimer, type HcReply, type Term } from './hc';
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
  // A timer that exited between the list and the kill is already the goal state.
  const killed: HcReply = await hcCall(target.session, ['kill', timer.term.address]);
  if (!killed.ok && killed.kind !== 'not_found') {
    out(`conflict ${timer.term.address} ${killed.kind}`, 2);
  }
  const removed: HcReply = await hcCall(target.session, ['rm', timer.term.address]);
  if (!removed.ok && removed.kind !== 'not_found') {
    out(`conflict ${timer.term.address} ${removed.kind}`, 2);
  }
  out(`stopped ${timer.term.address}`, 0);
}

try {
  await main();
} catch (error) {
  out(`conflict ${error instanceof Error ? error.message : String(error)}`, 2);
}
