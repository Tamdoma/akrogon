# Review A: failed-with-cause

Base: `43ef0f7a7cb8908df33a734bbdee406b1563d408`
Reviewed head: `d0582362b8e09a4e3dab997308e3c3bc9dc467a4` — `failed-with-cause: seat-declared failed stop with typed cause`

Debate off (`debate: "no"`); no positions/rebuttal artifacts, expected.

## Verification evidence

- `bun test` — 239 pass, 0 fail, 3028 expect() calls, 12 files (run in worktree).
- `bun run typecheck` — clean.
- Manual smoke (fixture + real CLI): dirty implement worktree, `phase <slug> failed --reason 'blocked on creds'` → `moved failed`, dirty file survives, `failure` block recorded; `phase <slug> implement` → `moved implement` with worktree still dirty and `failure` removed.
- Live defect probe: `phase <slug> failed --reason ' '` → `moved failed`, `failure.reason` stored as `' '`.
- AREA.md check: no `AREA.md` file appears in the reviewed diff; nothing to enumerate.
- `commitMove`/`transition` callers grepped: only `phase.ts` and `next.ts:385`; every `to === 'failed'` call site passes a `failure` record.

## Decision check

- D1 routing: `failed` in every active phase's `next`; `check.fix` in `failed.next`; `merged.next` empty. Confirmed in `src/routing.ts` and by tests (`failed -> check.fix` moves, `failed -> merged` refuses).
- D2 `--reason`: parsed `z.string().min(1).optional()`; required on `failed`, refused elsewhere. Partially broken — see F1.
- D3 stop path: runs after routing legality and slot/done validation, before `requireClean`/`requireNoIssueFiles`/`requireNonEmpty`/verdict/barrier/destination override; never touches the worktree. Confirmed by reading `transition` and by the dirty-worktree smoke.
- D4 `commitMove`: `failure` written only on `to === 'failed'`, cleared otherwise; `busy_since`/`busy_notified` cleared on `failed`/`merged`; `tab`/`worktree`/`pane` untouched. Confirmed by tests and smoke.
- D5 restart: `requireClean` skipped only for `cause: 'blocked'`; `attempts` and legacy (no `failure`) records keep the check. Confirmed by test `blocked restart skips clean check...`.
- D6 both producers record `cause: 'attempts'` (`dispatchSlot` cap, fix-rounds cap). Confirmed.
- D7 `activeCount` excludes `failed` in both branches; `dispatchLeaf` skips seat observation for `failed`. Confirmed by the two new capacity tests and the blocked-pane test.
- D8 `note()` prints `failed <cause> <reason>`, `failed` for legacy, suppresses busy for `failed`/`merged`. Confirmed by status test.
- D9 strict optional `failure` object with reserved `delivery`. Confirmed; unknown keys rejected by test.
- D10 README + command-reference contract updated together. Confirmed.

## Findings

### Fix

- F1: `--reason` accepts whitespace-only input, contradicting D2's "empty or whitespace-only is refused". `z.string().min(1)` checks length only. Reproduced live: `akrogon phase <slug> failed --reason ' '` exits 0 with `moved failed` and stores `reason: ' '`, so `akrogon status` prints `failed blocked ` with a blank reason — the operator-facing contract (status shows the cause and reason) carries no information. Fix: `.trim().min(1)` or a `\S` check at the `phaseCommand` boundary (and the same for `failureSchema.reason` if stored records should also be protected).

### Nits

- N1: `src/AREA.md`'s "every phase move rejects a dirty worktree" line is stale after this change (stops and `blocked` restarts skip `requireClean`). The plan flags it as a known limitation outside the owned surface; recorded so B can weigh doc/index authorship.
- N2: Dead fallbacks `slot ?? required[0]` in the stop path and the fix-cap `commitMove` — `slot` is always defined there because `state.phase !== 'failed'` in the stop path and `check.review` requires a slot at the cap. Harmless; the `reason as string` cast is documented in the report.

## Verdict

`fix` — F1 is a reproducible contract defect against D2.

## Re-check after check.fix (repair diff d058236..f91cea9)

Repair head: `f91cea9` — `failed-with-cause: refuse whitespace-only --reason, correct AREA.md invariant`

- F1 resolved: `phaseCommand` and `failureSchema.reason` both use `z.string().trim().min(1)`. Live probe: `--reason ' '` exits 1 with ZodError and leaves the leaf in `implement`; `--reason '  real reason  '` stores `reason: 'real reason'`. New tests cover blank, empty and padded reasons plus a stored whitespace record rejection.
- N1 resolved: `src/AREA.md` invariant corrected — stops into `failed` skip both guards, `cause: blocked` restarts skip only the dirty check. All paths named in the file exist (src/akrogon.ts, src/config.ts, src/phase.ts, src/shell.ts, docs/reference-index.md, tests/helpers.ts, tests/phase.test.ts).
- N2 unchanged: dead `slot ?? required[0]` fallbacks remain; still a nit.
- No defects introduced by the repair. `bun test tests/phase.test.ts tests/state.test.ts` — 57 pass, 0 fail. `bun run typecheck` — clean.

Verdict: `ready`.

## Merge evidence (slot A)

- Rebase target: `origin/main` = `43ef0f7a7cb8908df33a734bbdee406b1563d408`; no-op, HEAD `f91cea9` already contains it. No conflict, no range-diff needed.
- `bun run format` — applied, all files unchanged.
- `bun run typecheck` — clean.
- `bun test --changed=43ef0f7…` — 168 pass, 0 fail, 2326 expect() calls, 5 files.
- `bun test` — 239 pass, 0 fail, 3035 expect() calls, 12 files.
