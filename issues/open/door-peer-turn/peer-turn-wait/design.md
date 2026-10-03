# Design: peer-turn-wait

## Binding decisions, verbatim

### Peer turn (issues/chart/door-turn-and-stale-tab/forks/peer-turn.md)
Operator 2026-10-03, verbatim: "1a - check every 10 seconds, with a deterministic script like what you have now so almost no tokens are spent"

Settled shape:
1. While a prompted peer's turn is open, A stays in its turn. No background waits. The footer never names a pending peer. A ends its turn only for an operator round, a peer failure or a peer in `blocked`.
2. The wait is a shipped script, `skills/chart-issues/assets/peer-wait.sh <pane> <return-file> <budget-seconds>`, called in the foreground. It loops `herdr agent wait <pane> --timeout <min(10000, remaining)>` on a monotonic deadline, starts no wait after the deadline, prints nothing per loop and one result line at the end. The budget stays below the harness command timeout with room for overhead.
3. Exit precedence after each return: a herdr failure other than `timeout` (pass the error through), then `blocked`, then done (return file non-empty), then peer failure (idle/done with the file missing or empty), then budget used up while still working (A reruns at once).
4. questions.md Blind peer exchange calls the script. SKILL.md Drain/Take and Printed footer get short pointers. Prompting is unchanged (guarded `--wait --until working --timeout 5000`, no automatic re-prompt).

Reason: a background wait plus a footer stranded B's return for 10 minutes (#54), and the hand-typed loop used AND where the rule says OR. A shipped script runs the same code every time and spends tokens only when it returns.
Foreclosed: 1b harness resume mechanism (does not exist, unproven); 1c `akrogon peer-wait` command (more code, still needs the stay-in-turn rule); inline loop typed by A (drifts, caused the AND/OR bug).

Correction 2026-10-03 (A, handoff drafting): the script is TypeScript at `skills/chart-issues/scripts/peer-wait.ts`, run with `bun`, not `assets/peer-wait.sh`. Reason: skill scripts in this repo are Bun TypeScript under `skills/<skill>/scripts` (`skills/watch-issues/scripts`), and strict typing and the repo test runner then apply. Behavior is unchanged.

Excluded: [Stale tab](../../stale-tab/phase-stale-tab/design.md) does not apply here.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

No auth, backend, secret, browser flow or chain stage is touched. The script's behavior is the property under test, so each outcome gets one test against the fake herdr. That is the cheapest check that catches a wrong precedence or an over-budget wait. Prose criteria 3 and 4 are checked by reading, with no wording-asserting test (it would be a vanity test). The outside call `herdr agent wait` was run for real at charting (readiness.yaml proofs). The leaf runs no live peer.

## Leaf architecture
Owned: `skills/chart-issues/scripts/peer-wait.ts` (new), `tests/peer-wait.test.ts` (new), `agent wait` support in `tests/fake-herdr.ts`, the Blind peer exchange paragraph of `skills/chart-issues/assets/questions.md`, the Drain peer-map paragraph, Take peer paragraph and Printed footer of `skills/chart-issues/SKILL.md`, `tsconfig.json` `include`.
Literal interfaces:
- `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>`
- herdr 0.9.3: `herdr agent wait <pane> --timeout <ms>` without `--until` matches idle, done or blocked; success prints `{"result":{"agent":{"agent_status":"idle"|"done"|"blocked",...}}}` exit 0; timeout prints stderr `{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}` exit 1.
- Result line (stdout, exit 0): `{"outcome":"done"|"blocked"|"failure"|"budget","pane":string,"file":string,"status":"idle"|"done"|"blocked"|"working"|null}`, `null` when herdr returned no status. A herdr failure other than `timeout` prints no result line: herdr's stderr unchanged and a non-zero exit.
Excluded: herdr itself; `src/next.ts` prompt delivery; the guarded prompt rule; any file under `issues/`.
Dependencies: none.
