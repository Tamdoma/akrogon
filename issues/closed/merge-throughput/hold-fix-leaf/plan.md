# Plan: hold-fix-leaf

`akrogon hold-fix <slug>` names one merge leaf in the current repo's hold record (`held.yaml`, field `fix` already in `holdSchema`, src/hold.ts:13). While the hold exists, `mergeTurn` selects that leaf as holder instead of the queue head, builds a solo attempt (no members) through the full gate, and phase authorization accepts it. Everything ends when the hold clears or proves stale.

## Decisions

- **D1 — one shared holder resolver.** New `mergeHolder(repo, global, leaves, log)` in `src/turn.ts`: `const queue = mergeQueue(global, leaves, log); const fix = heldFor(repo.name)?.fix; return fix === undefined ? queue[0] : queue.find(e => e.leaf.state.slug === fix) ?? queue[0]`. All three holder-decision sites use it: `mergeTurn` (src/next.ts:989), the `dispatchLeaf` merge gate (src/next.ts:701-705), and phase authorization (src/phase.ts:773-783). `turn.ts` imports `heldFor` from `./hold` (chain turn→hold→state, no cycle).
- **D2 — hold guards compare against the resolved holder.** In `mergeTurn`, both the pre-lock `heldBefore` guard (src/next.ts:1026-1031) and the in-lock `heldNow` guard (src/next.ts:1041-1047) only `return` early when the hold is equal-to-base AND the resolved holder is not the fix leaf. In-lock order: staleness check first (`dropHeld` when main moved), then re-resolve; if the resolved holder is not the fix leaf and the hold was live, print `held ...` and return; if the hold was stale and dropped, fall back to the queue-head identity check so a fix leaf that is no longer head does not build.
- **D3 — fix attempt is memberless, full gate.** In the locked build, when `heldNow.fix === fresh.state.slug` skip member collection (`members: []`) and keep `solo: fresh.state.solo`, `applied: fresh.state.solo === true`. A solo fix leaf takes the existing `batch.solo` dispatch; a normal fix leaf flows through `buildStack`/`applyStack` with zero members, `applied: true`, dispatch context `attempt=<id> solo` — same path an empty queue head takes today. `merge_stamp` is never written anywhere in this flow (criterion 5 holds by construction; the test asserts it anyway).
- **D4 — `holdFixCommand(cwd)` in `src/hold.ts`, verb `hold-fix` in `src/akrogon.ts`.** Under `.lock`: refuse `No hold on <repo>` when none; resolve the leaf and refuse `Leaf not found in <repo>` when it does not exist; refuse when the slug is not a member of the merge queue (`<slug> is not in the merge queue`) so naming never silently no-ops; then `writeHeld(repo.name, { ...hold, fix: slug })` and print `held <repo> fix <slug>`. `merge_stamp` and leaf state are untouched. `requireRepo` + `findLeaf` + `mergeHolder`'s queue give the validation; `hold.ts` needs `mergeQueue` from `./turn` — check cycle direction: turn.ts already must not import a hold-fix helper that imports turn; instead `holdFixCommand` computes the queue via `mergeQueue` imported from `./turn`, and `turn.ts` imports only `heldFor` from `./hold`. That makes turn→hold→turn a cycle — avoid it: `mergeHolder` takes `repo.name` not the hold, i.e. signature `mergeHolder(repoName, global, leaves, log)`, and `holdFixCommand` validates membership by calling `mergeQueue` directly, with `hold.ts` importing `mergeQueue` from `./turn` and `turn.ts` importing `heldFor` from `./hold`. That IS a cycle. Resolution: put `mergeHolder` in `src/hold.ts` instead — `hold.ts` already imports `withLock` from `./state`; it imports `mergeQueue`/`QueueEntry` from `./turn` (hold→turn→state, no cycle since turn.ts does not import hold.ts). Callers in `next.ts` and `phase.ts` import `mergeHolder` from `./hold`. Final: `mergeHolder(repoName, global, leaves, log)` and `holdFixCommand(cwd)` both live in `src/hold.ts`; `turn.ts` is untouched.
- **D5 — phase authorization uses `mergeHolder`, records stay first.** Replace the `mergeQueue(...)[0]` head check in `phaseCommand` (src/phase.ts:774-779) with `mergeHolder(repo.name, global, allLeaves(repo), ...)`. Error text keeps the existing shape, naming `queue[0]`'s slug as holder when different. Criterion 6 needs no special case: when the hold clears mid-attempt, F's batch record sorts it first in `mergeQueue`, so `mergeHolder` returns F and `phase F merged` is accepted — the test pins this.
- **D6 — status names the fix leaf.** Leaf status `held:` line (src/status.ts:342): `held: <sha> <command> fix <slug>` when `hold.fix` set. Repo heading mark (src/status.ts:388): `(held fix <slug>)`. Unpause hold line (src/akrogon.ts:124): same ` fix <slug>` suffix. Hold lines printed by `mergeTurn` stay unchanged.
- **D7 — docs.** README command row `akrogon hold-fix <slug>` + `contracts` entry in `tests/command-reference.test.ts`. `docs/guide/merge.md` and `docs/guide/next.md`: one sentence each that a hold may name one merge leaf via `akrogon hold-fix` to take the turn solo while the hold stands. `skills/merge-issue/SKILL.md:35`: extend the holder rule with the fix override. `src/AREA.md`: update the hold line to mention the `fix` field and the holder override.

## Notes for review

- **N1:** A merge leaf with no batch record that passes authorization transitions straight to `merged` without a push (pre-existing path, src/phase.ts:871-873). The fix override widens who can reach that path during a hold. Same exposure as the queue head has today; not changed here.
- **N2:** Naming F while F holds an unapplied batch record takes the existing `recorded` restore-and-rebuild path; F is rebuilt solo.
- **N3:** Sequencing lock from red-main-hold: long-running `akrogon next` processes keep old code until the operator restarts them at handoff. No restart boundary inside this leaf.

## Read-first

- `src/hold.ts` — hold record, `held.yaml` helpers, `unholdCommand` shape to mirror.
- `src/turn.ts:81-105` — `mergeQueue` ordering (batch record first, then dependents, then stamp).
- `src/next.ts:973-1090` — `mergeTurn`: reconcile, holder, recorded paths, fetch, both hold guards, locked build.
- `src/next.ts:690-710` — `dispatchLeaf` merge gate; `src/next.ts:1078-1090` solo dispatch; `src/next.ts:1256-1276` `mergePass` loop.
- `src/phase.ts:757-785` — holder authorization check; `src/phase.ts:785-877` record/redOnBase/push paths.
- `src/akrogon.ts:100-140` — verb dispatch and usage line.
- `src/status.ts:330-395` — held line and repo heading marks.
- `tests/hold.test.ts` — `batchFixture`, `soloFixture`, `heldRecords`, `cli`, `headOf`; hold scenarios to extend.
- `tests/helpers.ts`, `tests/fake-herdr.ts` — fixture repo, fake herdr env.
- `tests/command-reference.test.ts` — README/verb contract.

## Waves

### Wave 1

- **U1 (code):** `src/hold.ts` (`mergeHolder`, `holdFixCommand`), `src/next.ts` (mergeTurn holder + both guards + dispatchLeaf gate), `src/phase.ts` (authorization), `src/akrogon.ts` (verb, usage, unpause line), `src/status.ts` (held line, heading mark).
- **U2 (docs):** `README.md` command row, `docs/guide/merge.md`, `docs/guide/next.md`, `skills/merge-issue/SKILL.md`, `src/AREA.md`. Disjoint from U1; can run in parallel.

### Wave 2

- **U3 (tests):** `tests/hold.test.ts` (new `hold-fix` scenarios below), `tests/command-reference.test.ts` (`hold-fix: '<slug>'` contract). Depends on U1's behavior; disjoint paths from U2.

## Scenarios (U3)

1. Hold on repo, two merge leaves H (head) and F (behind). `hold-fix F` → exit 0, `held repo fix F`, `held.yaml` gains `fix: F`, F's `merge_stamp` unchanged. `next` → F gets a batch record with `members: []`, `applied: true`, H gets none.
2. `phase F merged --slot B --attempt <id>` accepted (drives `finishPush` against the fixture remote); `phase H merged` refused naming the holder; `phase F check.fix` also authorized.
3. After F's merged attempt lands and origin main gains a non-record commit, next `mergeTurn` drops the hold; `held.yaml` empty; queue order returns to H.
4. `hold-fix F` with no hold → nonzero, names the repo; `hold-fix bogus` during a hold → nonzero, `held.yaml` unchanged byte-for-byte; `hold-fix` on a leaf not in the merge queue → refused, record unchanged.
5. Mid-attempt: F holds a batch record, `unhold`, then `phase F merged --attempt <id>` → accepted via record-first sort.
6. `akrogon status` on the held repo shows the fix leaf (heading mark `(held fix F)` and/or leaf `held:` line); `status` with no fix keeps old format.
7. Deliberate break: revert D1's `mergeHolder` selection in `mergeTurn` only → scenarios 1 and 2 go red while 4-6 stay green, proving tests bind the override and not incidental behavior.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 solo attempt, F holder | `bun test tests/hold.test.ts` (scenarios 1) | hold guard still returns early; members collected for F | seconds | any mergeTurn/hold.ts change |
| 2 F accepted, others refused | `bun test tests/hold.test.ts` (scenario 2) | phase check still head-only; override too broad | seconds | src/phase.ts change |
| 3 hold clears, order returns | `bun test tests/hold.test.ts` (scenario 3) | stale hold not dropped; fix override persists | seconds | hold guard change |
| 4 invalid hold-fix refuses | `bun test tests/hold.test.ts` (scenario 4) | missing validation; mutation before validation | seconds | holdFixCommand change |
| 5 merge_stamp untouched | scenario 1 assertions on `merge_stamp` | stray `saveState` touching the stamp | seconds | any state write in the flow |
| 6 mid-attempt clear | `bun test tests/hold.test.ts` (scenario 5) | authorization tied to live hold instead of record | seconds | phase/queue change |
| 7 status + docs | `bun test tests/hold.test.ts` (scenario 6) + `bun test tests/command-reference.test.ts` | missing fix display; README/dispatcher contract drift | seconds | status.ts/README change |
| 8 blocking checks | `bun run format && bun run typecheck && bun test --timeout=30000` | format/type/regression | minutes | before `phase merged` |
| Deliberate break | revert `mergeHolder` pick in `mergeTurn`, rerun hold.test.ts | tests pass without the behavior (vacuous) | seconds | once, after U3 lands |

No credentials needed: `readiness.yaml` has no inputs and `akrogon status hold-fix-leaf` shows no `Missing:` lines.
