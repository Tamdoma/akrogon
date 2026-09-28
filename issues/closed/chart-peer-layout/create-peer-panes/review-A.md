# Review A: create-peer-panes

- Base: `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`
- Reviewed head: `e4d6e4bbae05a6551216857a1e14603c96ca66bb`
- Debate: `no`; no positions-A/rebuttal-A expected or present.

## Scope check

`git diff` base..head touches exactly the two D1 files: `skills/chart-issues/SKILL.md` (+2 lines) and `skills/chart-issues/assets/questions.md` (1 line modified). No `src/`, `issues/`, or other skill changes. Worktree clean. (C6, done-criterion 6)

## Criteria verification

- C1: Both files state the trigger verbatim (B, optionally C, without naming panes AND `HERDR_ENV=1` in the door's own environment) and the single ask at open for each created peer's harness kind and arguments. Pass.
- C2: Both files carry the identical creation sentence: `herdr pane split <A pane> --direction right --ratio 0.5 --cwd <root> --no-focus` for B, conditional `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus` for C, `.result.pane.pane_id`, `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer, pane-ID addressing. Order matches the split-A-before-B pitfall. Pass.
- C3: Both files state supplied panes are used as given and never moved or resized, the door moves no pane it did not create, and the halves caveat. Pass.
- C4: Both files state the outside-herdr fallback (says so, continues single slot or with supplied panes). Pass.
- C5: `/tmp/create-peer-panes-u1-layout.json` exists (653 B, dated Sep 28 15:45). Content verified: tab `w8:t73`, root `w8:pD2` rect 60x37 at x=0 (full height, left), B `w8:pD3` 59x19 at x=60 y=0 (top right), C `w8:pD4` 59x18 at x=60 y=19 (bottom right). `/tmp/create-peer-panes-u1-tab.json` corroborates `tab create --no-focus` response. Report records the path; no agent start, only the created tab closed. Pass.
- C6: `git status --porcelain` clean post-commit; diff stat shows only the two files. Report records the judged `docs/` grep. Pass.
- C7: Report pastes `bun test` (306 pass, 0 fail, 14 files), `bun run format` rc=0, `bun run typecheck` rc=0, and the changed-test command (0 tests, expected for prose-only). Blocking checks all pass on recorded evidence; prose-only diff gives no specific concern to justify a rerun.

## Doc-page check (changed behavior)

`docs/guide/chart.md:160-201` describes the changed behavior. Line 162 says charting can run in one slot and "If you name a B pane, A and B first map and research independently" — conditional on naming, so creation is additive and the claim stays accurate. No contradiction found; no other `docs/` hit contradicts the new rule (`idea.md`, `next.md`, `phases.md` hits are generic). No doc edit owed. No documented behavior claim is wrong.

## AREA.md paths

No `AREA.md` appears in the diff; nothing to enumerate.

## Findings

- None.

## Nits

- None.

## Verdict

`ready` — both files carry the C1–C4 rule verbatim, live-capture evidence exists and matches the expected three-pane arrangement, scope is clean, and all blocking checks have pasted passing evidence.

## Merge evidence (slot A, phase=merge)

- Rebase onto `origin/main`: no-op, branch already up to date. Base unchanged: `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`.
- Post-rebase checks in worktree: `bun run format` all files unchanged rc=0; `bun run typecheck` rc=0; `bun test --changed` 0 tests (prose-only, expected); `bun test` 306 pass / 0 fail / 14 files [120.56s].
- Push: `d5b2735..e4d6e4b HEAD -> main`; `git merge-base --is-ancestor HEAD origin/main` confirms landed.
- Rebased head: `e4d6e4bbae05a6551216857a1e14603c96ca66bb`.
