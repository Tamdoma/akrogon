# Implementation report: named-targets

## Outcome

GREEN. The first pass stopped red-on-base on 3 `harness-template` tests (`config.yaml:12` literal vs
substitution test). Main fixed it in `4534a56 config: restore {model} subagent placeholder in claude
harness`; the lane was rebased onto that commit (same diff, new SHAs) and this repeated pass re-ran
the gates: whole suite `bun test --timeout=30000` → 550 pass, 0 fail. All leaf criteria 1-7 proven.

- Base (merge-base): `4534a569205c3903bcfd56145e74ec8caa4197d5`
- Committed head: `f91a268` (lane `named-targets`, clean; 4 commits, no worker worktrees remain)

## Changed files and reasons

- `src/next.ts` (+49/-2, commit `ced5d01` U1): `ownerCandidates` helper plus `resolveName` branch in
  `selectLeaves` implementing plan D1-D7. No `Test-Change` trailer (no test file touched).
- `tests/next.test.ts` (+258, commit `6dd0316` U2): 11 CLI boundary tests T1-T6 proving criteria 1-6.
  Trailer: `Test-Change: tests/next.test.ts added T1-T6 named-target cases; no existing expectation changed`.
- `docs/guide/next.md` (+15), `docs/guide/parts.md` (+6/-1, commit `cd0b26e` U3): name target forms,
  ambiguity refusal, same-name folder path (criterion 7). No trailer (docs only).
- `src/next.ts` + `tests/next.test.ts` reflow (commit `f91a268`): prettier `--write` fixes to U1/U2 lines.
  Trailer: `Test-Change: tests/next.test.ts prettier reflow of added helpers; no expectation changed`.
- Reverted, not committed: prettier also rewrote `src/status.ts` (pre-existing long-line drift, still
  present at base `4534a56`); restored via `git checkout --` in both passes to keep the diff to owned
  paths.

## Delegation outage (why this pass ran inline)

Config says `implement: subagents`. Three wave workers were spawned with briefs
`implementation/brief-1.md`, `brief-2.md`, `brief-3.md` in detached worktrees `named-targets-u1..u3`.
All three returned instantly claiming no file/shell tools (`sa-1`, `sa-2`, `sa-3`); a fourth probe
(`sa-4`, U3 relaunch with explicit tool guidance) failed identically. Transcripts:

- `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-named-targets-u1--/2026-10-08T21-24-34-099Z_01a11d67-56b3-75e1-8551-84984b891760.jsonl`
- `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-named-targets-u2--/2026-10-08T21-24-34-125Z_01a11d67-56cd-75e1-8551-849a03bf4b6d.jsonl`
- `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-named-targets-u3--/2026-10-08T21-25-12-174Z_01a11d67-eb6e-75e1-8551-849e2adc72b9.jsonl` (relaunch; first U3 attempt `...21-24-34-135Z_01a11d67-56d7-75e1-8551-849c3889bdb0.jsonl`)

This is a systematic worker-environment failure, not a provider error, mismatch, or budget stop, so no
protocol relaunch applied. A implemented all three units directly in the lane in wave order instead.
Worker worktrees were removed untouched.

## Commands run with results

All in lane `/home/ivan/Work/infra/akrogon/issues/worktrees/named-targets` unless noted. No command
reached minutes; wall times below are the longest observed.

Re-run pass (rebased head `f91a268`, base `4534a56`):

- `bun run format` → no owned-path changes; `src/status.ts` drift rewritten and reverted again (see above).
- `bun run typecheck` → clean (`tsc --noEmit`, no output). Seconds.
- `AKROGON_BASE=4534a56 bun test --changed="$AKROGON_BASE" --timeout=30000` → 246 pass, 0 fail, 29.3s.
- `bun test --timeout=30000` (whole suite, the gate that was red) → 550 pass, 0 fail, 38.1s. The 3
  harness-template fails are gone; the base config fix resolved them without any leaf change.
- `bun test tests/docs-links.test.ts --timeout=30000` → 3 pass, 0 fail; guide grep confirms name /
  refusal / same-name lines in both `next.md` and `parts.md`.

First pass (pre-rebase head `df29b90`, base `3e034de`), unchanged-behavior evidence:

- `bun run typecheck` → clean (`tsc --noEmit`, no output). Seconds.
- `bun test tests/next.test.ts --timeout=30000` after U1 (existing suite, pre-U2) → 186 pass, 0 fail.
- New tests after U2, per plan `-t` filters (all green with U1):
  - `-t "named target equivalence"` → 1 pass, 48 expects, 13.1s
  - `-t "leaf slug"` → 1 pass; `-t "shadow"` → 1 pass; `-t "ambigu"` → 4 pass;
    `-t "closed owner"` → 1 pass; `-t "empty folder"` → 1 pass; `-t "unreadable leaf"` → 2 pass
    (new test plus one pre-existing name match); `-t "owners resolve"` → 1 pass.
- Break proof (src temporarily reverted to base, then restored; diff confirmed `tests/next.test.ts` only):
  `named target equivalence` 0/1, `ambigu` 0/4, `closed owner` 0/1, `owners resolve` 0/1 — every
  new-behavior group red without U1, green with it. Guard tests (leaf slug, shadow, missing/parked,
  unreadable fall-through) pass on both, by design: they prove no regression, not new behavior.
- `bun run format` (prettier `--write`) → rewrote U1/U2 lines (committed, see above) plus unrelated
  `src/status.ts` drift (reverted).
- Changed-tests gate `AKROGON_BASE=3e034de... bun test --changed="$AKROGON_BASE" --timeout=30000` →
  197 pass, 0 fail, 19.8s.
- `bun test tests/docs-links.test.ts --timeout=30000` → 3 pass, 0 fail (also re-run above).
- Whole-suite gate `bun test --timeout=30000` at old base (kept log + exit): exit=1, 547 pass, 3 fail,
  37.2s — superseded by the green 550/0 run on the rebased head above.
  Fails (all in `tests/harness-template.test.ts`, untouched by this leaf):
  `claude template carries no literal subagent model inside --settings`,
  `claude template substitutes opus into the subagent model env`,
  `claude template substitutes claude-opus-5-5 into the subagent model env`.
  Cause: checked-in `config.yaml:12` hardcodes `CLAUDE_CODE_SUBAGENT_MODEL: claude-sonnet-5-5`
  while the test demands `{model}` substitution with no literal. `git diff` file list
  (`src/next.ts`, `tests/next.test.ts`, 2 guides) shows no touched file or plausible cause.

## Base-run comparison (Shared context rule)

- Base worktree: `mktemp -d` + `git worktree add --detach <dir> 3e034dee43f0853446c2ba8f97bb72668ab213dc`,
  `bun install` (no `setup` key printed), same command `bun test --timeout=30000`, log outside the
  worktree, exit kept, worktree removed with `git worktree remove --force` before this outcome.
- Base result: exit=1, 536 pass, 3 fail, 48.3s — the same 3 `harness-template` names as the leaf run
  (539 = 550 − 11 new leaf tests). Both runs completed with kept exit status and terminal result.
- Why base explains leaf: identical failing names, identical checked-in cause (`config.yaml:12`
  literal vs substitution test), zero leaf-diff files in the failing path. The expectation cannot be
  judged wrong from a brief outcome or real source (the checked-in config and the test contradict each
  other with no tiebreaker in this leaf's scope), so no out-of-scope fix was made.
- Logs (originals under `$TMPDIR`, copies kept here):
  - leaf: `/tmp/akrogon-1000/named-targets-039ad75663c4/tmp.hJOlA80jVb/leaf-full.log`
    (copy: `implementation/leaf-full.log`), exit 1, tail `547 pass / 3 fail / 550 tests / 37.20s`
  - base: `/tmp/akrogon-1000/named-targets-039ad75663c4/tmp.hJOlA80jVb/base-full.log`
    (copy: `implementation/base-full.log`), exit 1, tail `536 pass / 3 fail / 539 tests / 48.29s`

## Criterion proof map

1. Equivalence root/subfolder/worktree for epic, nested and top-level issue: `named target equivalence` test — green.
2. Leaf slug open+closed: `leaf slug selection keeps open and closed behavior` — green.
3. Path shadow: `existing folder shadows a same-named owner or leaf` (dispatch half + `No leaves match` half) — green.
4. Four refusals with kind+path and no side effects: `ambiguous name refuses ...` ×4 — green.
5. Closed owner ignored + closed path works: `closed owner name does not block an open same-name owner` — green.
6. No-index owners, missing+parked, read errors: `owners resolve without ISSUE.md or EPIC.md`,
   `empty folder and unknown names give the missing-leaf message`,
   `unreadable leaf under a named issue reports its read error` — green.
7. Guide text: grep + `docs-links` — green.

## Known limitations

- A top-level folder holding both direct leaves and nested-issue leaves gets one candidate whose kind
  follows first discovery order; selection (all open leaves under it) is unaffected. No such layout
  exists in-repo; the plan's preserved separator limitation also holds (slash inputs never name-search).
- `src/status.ts` carries pre-existing prettier drift at base `4534a56` (reverted here); any
  `bun run format` re-dirties it until fixed on main.

## Unverified criteria

None — criteria 1-7 are verified green and every `checks` command passes on the committed head.
