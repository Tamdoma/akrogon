# Plan: solo-turns

Debate: no. Synthesis comes straight from `brief.md` and the locked `design.md` (operator 1a and 5a on stack-fate).

## Read first

- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md`
- `src/state.ts` (`batchMemberSchema`, `batchSchema`, `readState`)
- `src/batch.ts` (`pickMembers`, `buildStack`, `memberBase`, `applyTop`)
- `src/attempts.ts` (`attemptRecordSchema`, `redMemberHeads`, `appendAttempt`)
- `src/next.ts` 919-1160 (`reconcileBatch`, `mergeTurn`, `mergeContext`)
- `src/phase.ts` 505-850 (`requireBatchTop`, `batchCheck`, `batchPush`, `restack`, `finishPush`, `phaseCommand` check.fix branch)
- `src/timing.ts` batch event schema, `readTimings`
- `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md` line 93, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/state.md`, `docs/guide/files.md`
- Tests: `tests/batch-dispatch.test.ts`, `tests/batch-merge.test.ts`, `tests/merge-attempts.test.ts`, `tests/batch.test.ts`, `tests/next.test.ts` (`mergeText`)

Gaps: none. The lessons that apply are the 2026-09-11 rule that doc greps must cover `docs/` and the 2026-10-10 attempt-record replay. Both are respected below.

## Decisions

- D1. `batchSchema` loses `members`. `batchMemberSchema` and `BatchMember` are deleted. `readState` builds the object it parses: it strips the existing top-level legacy keys, and when `batch` is an object whose `members` is exactly an empty array, it drops that one nested key. This is a pure construction with no mutation. Any other `members` value stays in place and fails the strict parse. `readState` catches only `z.ZodError` from `stateSchema.parse` and rethrows `Error("Invalid state <abs path>/state.yaml: <zod message>", { cause })`. Nothing else is caught. The nested drop only reads. It never rewrites the file, rebases, pushes or moves phases. The key vanishes from disk on the next `saveState` of that leaf.
- D2. `buildStack(repo, builtOn, holderHead, retirementHead = holderHead): Promise<{ ok: true; top: string } | { ok: false }>`. The member loop and the `tips` map go. `removeRetiredLessons` gets only `[{ base: memberBase(repo, builtOn, retirementHead), head: retirementHead }]`. `StackResult` loses `tips`.
- D3. `pickMembers` and `redMemberHeads` are deleted. `attemptRecordSchema.members` stays optional, accepting both the string and the `{slug, head}` forms so old lines still read. `appendAttempt` stops writing `members`. The timing `batch` event schema keeps `members` optional, and `mergeTurn` no longer writes it.
- D4. `mergeTurn` creates the batch record without members and builds the stack once. There is no member snapshot, no `kept` drift check and no `'rebuild'` loop. Under the lock the applied record is `{ ...batch, applied: true, top }` when `staged.ok` and `applyTop` succeed, and `{ ...batch, applied: true }` (solo) otherwise. The `for (;;)` loop goes.
- D5. `mergeContext` returns `attempt=<id> top=<sha>` or `attempt=<id> solo`, with no `members=`.
- D6. `reconcileBatch`: the unlanded path loses its member `move`. The landed path loses the member loop, `moved`, `closable` and the whole second `withLock` block that closed member tabs and dispatched member dependents. The holder's own dependents are still woken by the next pass, as `tests/batch-dispatch.test.ts` 'a landed candidate moves the holder once…' proves today. A parameter or import that becomes unused because of a deletion is removed with it (`global` in `reconcileBatch`, `restack` and `finishPush`, if unused).
- D7. `phase.ts`:
  - `requireBatchTop` always requires HEAD to descend from `record.top`, which is the memberless rule today.
  - `batchCheck` loses its member loop. The retired-lesson range is `[record.holder]`.
  - `batchPush` loses the member drift check and member moves.
  - `restack` always uses the live `refs/heads/<slug>` as the holder head and calls `buildStack(repo, builtOn, holderHead, record.holder.head)`.
  - `finishPush` loses its member moves.
  - In the `check.fix` branch of `phaseCommand`, the `record.members.length > 0` "stack red" branch goes. A red on a held record always runs the existing `transition(... appendAttempt(red) ...)` path.
- D8. The brief and design differ on docs. Brief criterion 6 and the design's owned surfaces name only the two skills and `src/AREA.md`. `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/state.md` and `docs/guide/files.md` describe members too, and leaving them would be stale docs (lesson 2026-09-11). The plan owns them as a doc-only edit with no scope change. This is a note for review.
- D9. Tests that only prove member stacking are deleted, because operator 1a removed the behavior. Tests that also guard a holder path are rewritten without members. Fixture literals carrying `batch.members: []` are cleaned in the product unit, because the `Batch`/`State` types reject them once D1 lands. Each touched existing test file gets a `Test-Change` trailer.
- D10. No live model run and no new proof machinery. All proofs use `bun test` with the existing `tests/helpers.ts` fixtures at the `akrogon next` / `akrogon phase` boundary, or a direct read of the real source and doc files.
- Deploy timing (design): the merge report records that no leaf in any registered repo holds a `batch` with non-empty `members` at merge time.

Open for the plan: the design has none.

Credentials: the design names no variable. `akrogon status solo-turns` printed no `Missing:` line.

## Interfaces

```ts
// src/batch.ts
export type StackResult = { ok: true; top: string } | { ok: false };
export async function buildStack(repo: Repo, builtOn: string, holderHead: string, retirementHead?: string): Promise<StackResult>;
// src/state.ts
export function readState(path: string): State; // throws Error naming <path>/state.yaml on schema failure
```

## Waves

Wave 1 (two units, disjoint paths, no shared test resource):

- U1 product deletion. Owns `src/state.ts`, `src/batch.ts`, `src/attempts.ts`, `src/next.ts`, `src/phase.ts`, `src/timing.ts` (only if needed, no schema change expected), and the fixture cleanup of `batch.members` in `tests/helpers.ts`, `tests/phase.test.ts`, `tests/receipt-gates.test.ts`, `tests/dependents-first.test.ts`, `tests/hold-retired.test.ts`, `tests/verify.test.ts`, `tests/reconcile.test.ts`, `tests/batch-merge.test.ts`, `tests/merge-attempts.test.ts` (fixture literals only, keeping the legacy history lines), `tests/timing.test.ts`, `tests/next.test.ts` (`mergeText` drops the members part), `tests/batch.test.ts` (schema test drops the member cases, so that a non-empty `members` now throws). Every changed test file gets a `Test-Change` trailer citing D1/D9. No prerequisite.
- U2 docs. Owns `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `src/AREA.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/state.md`, `docs/guide/files.md`. No prerequisite. It keeps the strings other tests require: `akrogon verify --attempt <id> --known-red`, `akrogon log`, `akrogon run-check`, `fetch`, `push`, `merged`, and the `bun -e ` retirement line in merge-issue.

Docs affected, one line each:
- `skills/merge-issue/SKILL.md`: the prompt, the turn description, the top section, the endings and the briefs describe the holder alone. The member-only rules go.
- `skills/check-issue/SKILL.md`: line 93 "merge verifies the stack top" becomes "merge verifies the holder's rebased top".
- `src/AREA.md`: the `buildStack` line describes the holder rebase plus the lesson fixup only.
- `docs/guide/merge.md`: the turn, `--check`, push, restack, red and reconcile paragraphs describe the holder alone.
- `docs/guide/next.md`: lines 137 and 157 change to "takes no merge turn" and drop the member snapshot.
- `docs/guide/state.md`: line 52 drops `members` from the batch fields.
- `docs/guide/files.md`: line 64 says `members` appears only on attempt lines written before solo turns.
- `tests/AREA.md`, `README.md`, `skills/AREA.md`: not affected. A grep found no member wording.

Not serial-solo: wave 1 holds two units.

## Criteria → proof

Each proof runs through `akrogon run-check --name <label> -- bun test --timeout=30000 <file> -t '<name>'`. Every one is sized in seconds to minutes and reruns when `src/next.ts`, `src/phase.ts`, `src/batch.ts`, `src/state.ts`, `src/attempts.ts` or the named test file changes. No model or outside stage is involved.

1. Holder alone with a waiting leaf. The test is `tests/batch-dispatch.test.ts` 'a waiting leaf stays out of the holder turn and lands in its own turn'. The boundary is `akrogon next` plus `phase merged --check/merged`, with two committed leaves in `merge`. The state before: aa and bb both wait. After aa's turn there is one prompt on aa's B with no `members=`, the top tree lacks `bb-file`, bb's branch, worktree HEAD and phase are unchanged, the push lands only aa (stdout has no `issue complete issue-bb`), and there is one `merged` line with no `members`. Then bb gets its own attempt built on aa's top and lands. The product failure it catches is a second leaf re-added to the turn. Label `c1`.
2. Red holder moves to check.fix. The test is `tests/batch-dispatch.test.ts` 'a red verify with another leaf waiting moves the holder to check.fix'. Boundary: `phase aa check.fix --slot B --attempt <id>` while bb waits. After the call: exit 0, no `stack red` output, aa in `check.fix`, exactly one `red` line for holder aa with no `members`, bb in `merge`, and bb then prompted for its own turn. It catches the stack-red restart. Label `c2`.
3. Restack and recovery of the holder only. (a) The test is `tests/batch-dispatch.test.ts` 'a refused push restacks only the holder while another leaf waits'. After the remote advances, `merged` prints `rerun tested=<sha> pushed=<sha>`, the new top stands on the advanced remote and lacks `bb-file`, bb's head and phase are unchanged, and the rerun lands aa alone. (b) The test is 'a push reported lost but landed moves only the holder to merged once'. A git shim reports exit 1 after a real push. aa ends `merged` with one `merged` line, which stays one after another `next --all`. bb stays in `merge` and does not complete. The existing 'a landed candidate moves the holder once…' and `tests/batch-merge.test.ts` 'a refused push restacks onto the new remote…' keep the memberless guards. Label `c3`.
4. History and in-flight records.
   - (a) The test is `tests/solo-turns.test.ts` 'old attempt and timing lines carrying members still parse'. `readAttempts` reads string-form and object-form `members` lines, and `readTimings` returns an old `batch` event with `members`. The `readTimings` check matters because it swallows parse errors into `[]`, so a dropped field would fail silently.
   - (b) The test is `tests/batch-dispatch.test.ts` 'a saved batch with an empty members list resumes as the same holder attempt'. An applied record gets `members: []` written into its raw `state.yaml`. `readState` shows no `members`, `--check` and `merged` with the same attempt succeed and land the top, and the saved `state.yaml` no longer holds `members`.
   - (c) The test is `tests/solo-turns.test.ts` 'a non-empty or malformed batch.members is refused naming the state.yaml path'. Each of `[{slug,base,head,tip}]` and `'x'` makes `akrogon phase` fail. The stderr names `<leaf>/state.yaml`, and the file bytes and branch are unchanged.
   - Label `c4`.
5. No member stacking code in `src/`. The test is `tests/solo-turns.test.ts` 'no member stacking code remains in src'. It reads every `src/**/*.ts` and asserts that none contains `pickMembers`, `redMemberHeads`, `BatchMember` or `batchMemberSchema`. It also asserts that `src/batch.ts` has no `members` token, that `batchSchema.shape` has no `members`, and that `attemptRecordSchema` still parses `members`. `bun run typecheck` (`checks.typecheck`) proves the call sites and the `buildStack` signature. Label `c5`.
6. Docs describe the holder alone. Proof is reviewer reading of the two skills, `src/AREA.md` and the guide pages against the code. No wording test: a vocabulary ban is a prose test, and it flagged correct archive "member" text (review-B F1, corrected 2026-10-19).

The whole suite (`checks.test`), `checks.typecheck` and `checks.format` run as the leaf's configured `checks`. No `merge_checks` are added.

Restart boundaries: none. Every proof runs in seconds to minutes.

Limitation kept open: 4a (parallel next-leaf testing) stays deferred under its recorded revisit trigger.

## Red evidence (plan.synthesis)

All of these ran against the unchanged product at `AKROGON_BASE` e522c186.

- `check c1c2c3c4b-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-c1c2c3c4b-red-1792420992807-1897814.log` (`bun test --timeout=30000 tests/batch-dispatch.test.ts`):
  - C1 'a waiting leaf stays out…' fails at `expect(record).not.toHaveProperty('members')`, because today's turn snapshots bb as a member. This is the deliberate break the design names: a second leaf added to the turn. The existing guard 'the holder gets a batch record… only the holder is prompted' also fails, because today's prompt carries `members=bb`.
  - C2 'a red verify with another leaf waiting…' fails at `expect(red.stdout).not.toContain('stack red')`.
  - C3a 'a refused push restacks only the holder…' fails at `expect(restacked).not.toHaveProperty('members')`. C3b 'a push reported lost…' fails at `expect(merged.stdout).not.toContain('issue complete issue-bb')`.
  - C4b 'a saved batch with an empty members list…' fails at `expect(readState(aa.path).batch).not.toHaveProperty('members')`.
- `check c4c5c6-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-c4c5c6-red-1792420968176-1896580.log` (`bun test --timeout=30000 tests/solo-turns.test.ts`):
  - C4c fails because stderr lacks `<leaf>/state.yaml`. Today a non-empty `members` parses, and the call dies later at the receipt gate.
  - C5 fails because `src/attempts.ts` names `redMemberHeads`.
  - C6 fails because `skills/merge-issue/SKILL.md` matches `/\bmembers?\b/i`.
  - C4a passes, as expected for a history guard.
- C4a deliberate breaks, each reverted at once:
  - `attemptRecordSchema` made strict without `members`: `check c4a-break-attempts: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-c4a-break-attempts-1792420986004-1897475.log`.
  - Timing batch `members` removed: `check c4a-break-timing: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-c4a-break-timing-1792420986142-1897580.log`. `readTimings` returned `[]`, the silent failure this guard exists for.

Deleted from `tests/batch-dispatch.test.ts` because they only prove member stacking (operator 1a): 'a member that conflicts…', 'a stopped waiting leaf is never stacked', 'a red stack records member heads…', 'a member head red on the old base…', 'a drifted member refuses the push…', 'reconcile moves every still-merge stacked member…', 'reconcile completes a landed member…', 'a red stack restarts only its holder…', 'a landed stack closes each member tab…'. The rewrites are listed under criteria 1 to 3. The `stacked` and `stopLeaf` helpers went with them. `expectedPrompt` drops its `members=` part.

## Implementation notes (2026-10-19)

- This refines D9 and U1. Workers edit no test, so A made the `batch.members` fixture cleanup and the `tests/batch.test.ts` / `tests/next.test.ts` expectation changes itself, in commit 1d1e652c with one `Test-Change` trailer per file. That commit landed before delegation. U1 now owns only `src/`.

## Implementation notes (2026-10-19, verify)

- D1 refined: `readState` rethrows a `z.ZodRealError` (what zod `parse` throws, both an `Error` and a `ZodError`) with an added custom issue `Invalid state <abs>/state.yaml` ahead of the original issues, instead of a plain `Error`. `status` (src/status.ts:104), `next` discovery and `tests/state.test.ts` / `tests/status.test.ts` rely on the error staying a `ZodError` and an `Error`. The plain wrap turned four tests red (check-test-1792421953596-2391159.log). A bare `new z.ZodError` is not `instanceof Error`, so `next` discovery rethrew it (check-test-1792422312396-3263471.log). Criterion 4's loud refusal naming the path is unchanged.

## Implementation notes (2026-10-19, check.fix)

- Review-B F1 corrects the criterion 6 proof. The 'merge docs describe the holder alone' test is deleted, because it banned words instead of checking function and forced the unrelated `src/AREA.md` archive "member" wording to "entry". That wording is restored. Criterion 6 is proven by reviewer reading. The check for the corrected rule: `tests/solo-turns.test.ts` reads no doc file (`grep -c 'SKILL.md\|AREA.md\|docs/guide' tests/solo-turns.test.ts` is 0).
