# Plan: frozen-test-guard

## Decisions

- D1. New optional command-owned state field `frozen`: `z.record(z.string(), z.string().nullable()).optional()` on `stateSchema` in `src/state.ts`. Key is a repo-relative path; value is the file's git blob id at HEAD, or `null` when planning deleted the path. `frozen: {}` (empty map) is valid and differs from a missing field; a missing field means the leaf predates the feature and moves under today's guard only.
- D2. The record is computed and written only on a real `plan.synthesis` → `implement` move in `transition` (`src/phase.ts`): after all guards pass, after the `checkOnly` early return (a `--check` never writes it), after the incomplete-slots `recorded` save, before `commitMove`, into the `recorded` state object so `commitMove` persists it through its spread. It is recomputed on every such move, replacing any earlier record (covers `failed` → `plan.synthesis` → `implement` replanning). No other `commitMove` caller writes it.
- D3. Record content: `git diff --no-renames --name-status <target>...HEAD` in the worktree lists every path the branch changed (all statuses, not only test files — criterion 4). Each path's blob id comes from one `git ls-tree -r --full-tree HEAD` lookup map (`<mode> <type> <sha>\t<path>`); a path absent from the tree records `null`.
- D4. New sibling guard `requireFrozenCitations(repo, worktree, frozen, from = target(repo), to = 'HEAD')` in `src/phase.ts`, called from `transition` at the same place as `requireTestChangeCitations` (today `src/phase.ts:282`), only when `state.frozen !== undefined`. The three explicit-range call sites (`src/phase.ts:421,427,904` area: batchCheck member ranges and the `--culprit` path) never call it — merge behavior is unchanged (held disagreement B F3).
- D5. Frozen violations, two kinds, both refused with each path and the exact `Test-Change: <path> <source and reason>` line, same trailer-block/empty-commit tail sentence as the existing error:
  - Recorded path whose content at `to` differs from its record: HEAD blob id ≠ recorded id, recorded `null` but the path exists, or recorded id but the path is now absent (covers renames with `--no-renames`, which surface as D+A).
  - `A` line in `git diff --no-renames --name-status <from>...<to>` matched by `testFile()` and not a key of the record.
- D6. Citation rule for frozen violations: a path is cited only by a `Test-Change` trailer naming it in the last commit in `<from>..<to>` touching the path, or a later commit. `lastTouch` is the first line of `git log --format=%H <from>..<to> -- <path>`. When `lastTouch` exists the trailer scan is `git log --format=%(trailers:key=Test-Change,valueonly,unfold) <lastTouch>^..<to>` (no `--` filter; the citing commit need not touch the path). `lastTouch` always has a parent because it sits strictly after `<from>`. When `lastTouch` is absent — the rebase case where the target changed a recorded path and no leaf commit in range touches it — the scan is the whole `<from>..<to>`, so a later trailer-only commit cites it (criterion 5). Trailer parsing reuses the existing rule: value matches `/^\S+\s+\S/`, first whitespace token is the path. Extract the trailers→cited-paths parsing into a helper shared with `requireTestChangeCitations` rather than duplicating it.
- D7. The existing `requireTestChangeCitations` M/D/T behavior is unchanged in code and citation semantics (any trailer in range still cites there — criterion 6); the frozen check runs after it, so a recorded old test file edited after planning is refused by the frozen rule even when the planner's trailer satisfies the old one.
- D8. At merge time the holder's `transition` call inside `batchCheck`/`transition(checkOnly)` still runs the frozen check against the stack-top worktree (design keeps the merge path unchanged; the stack replay is the criterion-5 rebase case). Carried members keep skipping it — their last seat move already passed the guard (B F3).
- D9. Criterion tests extend `tests/phase.test.ts` (existing Test-Change block ~:1620-1780 and helpers `oldFileBranch`, `commitAll`, `leaf`, `cli`, `fakeHerdr`), driving `akrogon phase` against the real fixture git repo and worktree — no git mocks. One case per criterion plus the deliberate break below; cases reuse the fixture's bare `origin` and push/fetch/rebase for real.
- D10. Docs owned and updated (one line each in the checklist): `skills/implement-issue/SKILL.md:64`, `skills/merge-issue/SKILL.md:51`, `skills/implement-issue/brief-template.md:45`, `skills/chart-issues/assets/shapes.md:276` (add `frozen` to the command-owned field sentence), `docs/guide/merge.md:11`, `README.md:134`, `src/AREA.md` (one Non-obvious patterns line). `skills/check-issue/SKILL.md:47` and `:83` do not conflict and stay unchanged: :47 is B's review duty over all trailers in range, not the command's citation rule; :83's "existing file matched by the path rule" already covers planner-added files.

## Read-first

- `docs/reference-index.md` — grounding index.
- `src/AREA.md`, `tests/AREA.md` — area contracts.
- `src/phase.ts` — `transition` (:225-311), `requireTestChangeCitations` (:318-367), `commitMove` (:132-183), batch/culprit call sites (:421,427,904), phaseCommand tail (:775-953).
- `src/state.ts` — `stateSchema`, `readState`, `saveState`.
- `src/test-files.ts` — `testFile()` path rule.
- `src/config.ts:248` `target(repo)` → `<remote>/<default_branch>`; `src/preflight.ts:4` `trackingRef`.
- `tests/helpers.ts`, `tests/phase.test.ts:1600-2027` — fixture, leaf builder, existing trailer tests.
- `skills/chart-issues/assets/standing-design.md` — proof boundary rules.
- `skills/implement-issue/SKILL.md:64`, `skills/merge-issue/SKILL.md:51`, `skills/implement-issue/brief-template.md:45`, `skills/chart-issues/assets/shapes.md:276`, `docs/guide/merge.md:11`, `README.md:134` — the owned doc lines.
- `learnings/LESSONS.md` — context only; the 2026-10-08 prettier-drift lesson applies to `bun run format` (revert unrelated rewrites).

## Interfaces

- `State.frozen?: Record<string, string | null>` — read via `readState`, written via `saveState`/`commitMove` spread.
- `requireFrozenCitations(repo: Repo, worktree: string, frozen: Record<string, string | null>, from?: string, to?: string): Promise<void>` — throws the citation error; no return.
- Shared helper (new, private to `src/phase.ts`): trailer-scan → `Set<string>` of cited paths over a rev range.

## Waves

### Wave 1

- U1 — Frozen record and guard with criterion tests. Owns: `src/state.ts`, `src/phase.ts`, `tests/phase.test.ts`. Shared test resource: none beyond the file's own fixtures. Prerequisites: none.
  - Cases (each asserts refusal stderr names the path and `Test-Change: <path> <source and reason>`):
    1. Record write: leaf at `plan.synthesis` with a worktree branch carrying a modified old file, a new test file, a deleted file and an added `scripts/` file → `phase <slug> implement --slot A` moves and `state.yaml` gains `frozen` with blob ids and `null`; a no-change planning branch gets `frozen: {}`; existing leaf fixtures without the field keep passing (criterion 1).
    2. Recorded path edited after the move → refused at the next move; a commit touching it with the trailer cites; a trailer only in the planning commit does not cite; a trailer-only later commit cites; recorded-`null` path reappearing and recorded path now missing both refuse (criterion 2).
    3. Newly added `testFile()`-matched path absent from the record → refused, accepted with the trailer (criterion 3).
    4. Recorded non-test path (`scripts/proof.ts`) edited → refused and accepted identically (criterion 4).
    5. Rebase: `origin/main` advances while the leaf edits a recorded path; `git fetch` + `git rebase` in the worktree → criteria 2-4 unchanged; when the target's own change to a recorded path leaves HEAD differing and no leaf commit in range touches it, refused until a trailer-only commit names it (criterion 5).
    6. Old M/D/T guard cases already in the file stay green (criterion 6).
- U2 — Doc updates. Owns: `skills/implement-issue/SKILL.md` (:64 only; :84 untouched, owned by test-proof-rules), `skills/merge-issue/SKILL.md` (:51 only), `skills/implement-issue/brief-template.md` (:45), `skills/chart-issues/assets/shapes.md` (:276), `docs/guide/merge.md` (:11), `README.md` (:134), `src/AREA.md`. Shared test resource: none. Prerequisites: none — D-numbers above pin the field name, move and citation rule the prose describes.
  - Content per line: the `plan.synthesis`→`implement` move records every branch-changed path with its content id (absent for deletions); on later moves a changed/vanished recorded path or a newly added `testFile()`-matched path outside the record is refused until a `Test-Change` trailer names it in the last commit touching it or a later one; the old M/D/T rule stays.
  - Criterion-7 sweep: `grep -rn "Test-Change\|test-files\|trailer" docs/ skills/ README.md`; every hit either is owned above, is confirmed non-contradicting (`check-issue` :47/:83, `merge-issue` :43/:65, `phases.md:92`, `merge.md:17`), or is listed in the report as out of scope.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1-6 | `bun test tests/phase.test.ts` | Guard refuses/accepts wrong, record absent/wrong | seconds | any `src/` or `tests/` change |
| all | `bun test --timeout=30000` (checks.test) | regressions elsewhere | minutes | same |
| types | `bun run typecheck` | schema/signature errors | seconds | `src/` change |
| style | `bun run format` | prettier drift | seconds | `src/`, `skills/`, `docs/`, README change; revert unrelated rewrites |
| changed tests | `bun test --changed=$AKROGON_BASE --timeout=30000` (checks.test_changed) | unrun touched tests | seconds | same |
| 7 | grep sweep above + `bun test tests/docs-links.test.ts` | stale/contradicting doc line, broken link | seconds | doc change |
| deliberate break | disable `requireFrozenCitations` locally (early return), rerun new cases → red, revert | tests prove the guard, not a no-op | seconds | once at implement end, recorded in report |

`AKROGON_BASE` comes from `akrogon config` (`354c80e...`). No `merge_checks` or whole-suite requirement beyond `checks` is added.

## Notes and limitations

- Design wins over the brief where they differ; none observed — the brief's citations match live lines.
- Held disagreements recorded verbatim in the design stand: no declared frozen list for unchanged runner/fixture/config paths (B F2 — `test-proof-rules` criterion 6 has B review the diff), and no frozen check for carried batch members at merge (B F3 — members already passed the guard at their last seat move).
- A recorded path edited by another member's stacked commits during a batch can trip the holder's merge-time frozen check; a trailer-only commit on the stack is the documented escape. Accepted, not worked around.
- A later formatter rewrite of a recorded file counts as a change and needs a trailer; that is the design's intent.
- This leaf's own branch gets no `frozen` record: the installed `akrogon` moving it predates the feature. Criterion 1's "no record → today's guard" covers it.

## Implementation notes

2026-10-11 (check.fix round 2, reconciles D6 with criteria 2/5 after review-B F1 second finding): a plain `git rebase` keeps deliberately-empty commits, so commit emptiness cannot mark "after the freeze/rebase". The only rebase-stable marker is trailer content: a planning-era `Test-Change` trailer is already in `<target>..HEAD` at freeze. The implement move therefore also records `frozen_cited` — the set of `Test-Change` trailer values matching `/^\S+\s+\S/` present in `target..HEAD` at freeze — as a second command-owned optional field, written and replaced under the same timing rule as `frozen`. An untouched violation (`lastTouch` empty) is cited only by a trailer on a commit in `<from>..<to>` that changes no files AND whose trailer value is not in `frozen_cited`. A post-drift trailer-only commit must carry a new trailer line; an identical-text replayed line does not cite (deliberate, documented). The touch case `lastTouch^..<to>` and `requireTestChangeCitations` are unchanged.

2026-10-11 (check.fix round 3, review-B F2): value-set freshness was wrong — a genuinely new trailer-only commit reusing identical trailer text must cite (criteria 2/5 ask only for a later commit). `frozen_cited` instead stores the multiset of `Test-Change` trailer values on EMPTY commits (touching no files) in `target..HEAD` at freeze; an untouched violation cites when a trailer value's occurrence count on empty commits in `<from>..<to>` exceeds its freeze-time count. Replays preserve the count (refused); any new trailer-only commit adds one (accepted, same text or not).

## Credential check

No env names in the design; `readiness.yaml` has empty `inputs`, `produces`, `grants`; `akrogon status` shows no `Missing:` lines. No operator blocker.
