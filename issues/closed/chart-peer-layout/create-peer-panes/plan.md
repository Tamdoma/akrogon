# Plan: create-peer-panes

Direct synthesis (`debate: no` in state.yaml). No positions or rebuttals exist. Source is brief.md and design.md plus live herdr verification done in this pass. No brief/design conflict found.

## Decisions

- D1: Prose-only change. Only `skills/chart-issues/SKILL.md` (Open section) and `skills/chart-issues/assets/questions.md` (blind peer exchange paragraph at :44) are edited. No `src/`, config, or other skill changes.
- D2: Creation triggers only when the operator asks for B (and optionally C) without naming panes AND the door's own environment has `HERDR_ENV=1`. Both conditions are stated in both files.
- D3: The door asks once at open for each created peer's harness kind and arguments. Supplied panes never trigger this question.
- D4: Exact creation sequence, stated verbatim in both files: `herdr pane split <A pane> --direction right --ratio 0.5 --cwd <root> --no-focus` for B, then only when C is asked for `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading each new ID from `.result.pane.pane_id`, then `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer. Peers are then addressed by pane ID. Order is fixed: split A before B (design pitfall: reversed order yields 25/75).
- D5: Supplied panes are used as given and never moved or resized. The door moves no pane it did not create. No `pane move`, no temporary-tab rearrangement. The requested halves hold only when A's pane fills its tab; otherwise only A's area is split.
- D6: Outside herdr the door says so and continues single slot or with supplied panes. No failure, no block.
- D7: Verification is a live capture, not a unit test: create a tab with `herdr tab create --no-focus`, run only the two split commands against `.result.root_pane.pane_id`, save `herdr pane layout --pane <root pane>` output showing root left, B top right, C bottom right to a file under the OS temp dir, then close only that tab with `herdr tab close <tab_id>`. No agent is started. The implementation report records the path.
- D8: Human docs unchanged. `docs/guide/chart.md` supplied-pane prose stays accurate because creation is additive; the plan records the confirming grep as evidence.

## Read-first

- `skills/chart-issues/SKILL.md` (Open section, :23)
- `skills/chart-issues/assets/questions.md` (blind peer exchange, :44)
- `skills/chart-issues/assets/standing-design.md` (standing rules)
- `skills/chart-issues/assets/shapes.md` (handoff shapes, untouched reference)
- `skills/AREA.md`, `docs/reference-index.md` (repo orientation)
- `learnings/LESSONS.md` plus `learnings/history/2026-09-11-stale-rule-in-docs.md` (grep `docs/` for changed rule)
- `issues/config.yaml` (checks commands)
- `issues/open/chart-peer-layout/create-peer-panes/brief.md`, `design.md` (contract)

## Needed interfaces (all verified live 2026-09-28)

- `herdr pane split [PANE_ID] --direction right|down --ratio 0.5 --cwd <root> --no-focus` returns new ID at `.result.pane.pane_id`.
- `herdr agent start <name> --kind <kind> --pane <id> -- <args>` starts the peer in the created pane.
- `herdr tab create --no-focus` returns `.result.root_pane.pane_id` and `.result.tab.tab_id`.
- `herdr pane layout --pane <root pane>` returns panes with rects; verified layout shows root left, B top right, C bottom right.
- `herdr tab close <tab_id>` removes only the verification tab.
- `HERDR_ENV=1` in the door's own environment gates creation.

## Acceptance criteria (from brief, implementation derives evidence from these)

- C1: Both files state the trigger (B/C asked without panes, `HERDR_ENV=1`) and the single harness-kind-and-arguments ask per created peer.
- C2: Both files name the D4 sequence with exact flags, JSON path, and pane-ID addressing.
- C3: Both files state supplied panes are never moved or resized and the halves guarantee caveat.
- C4: Both files state the outside-herdr fallback.
- C5: A layout capture file under the OS temp dir from the D7 procedure exists and shows the three-pane arrangement; the report records its path; no agent was started; only the created tab was closed.
- C6: `git status --porcelain` shows changes only in the two D1 files.
- C7: `bun run format`, `bun test`, `bun run typecheck` pass.

## Checklist (in order)

1. Edit `skills/chart-issues/SKILL.md` Open section: add creation trigger, single ask, D4 sequence, supplied-pane and fallback rules. (C1–C4)
2. Edit `skills/chart-issues/assets/questions.md` blind peer exchange paragraph: same rules, keeping the existing wait/`agent wait`/return-file and path-assignment prose intact. (C1–C4)
3. Grep `docs/` for `peer|pane` and confirm no human doc contradicts the new rule; record the hit review. (C6, D8)
4. Confirm `git status --porcelain` lists only the two D1 files. (C6)
5. Run the D7 live verification, save the layout file, close only the created tab, record the path. (C5)
6. Run `bun run format`, `bun test`, `bun run typecheck` from the repo root. (C7)

## Docs affected

- `skills/chart-issues/SKILL.md`: Open section gains the peer-pane creation rule (agent doc).
- `skills/chart-issues/assets/questions.md`: blind peer exchange gains the creation trigger and sequence (agent doc).
- Human docs: none affected; `docs/guide/chart.md` supplied-pane prose stays accurate.

## Credentials

None. Brief and design name no variable, so no `.env` presence check applies.

## Dependencies

None. `blocked-by` is empty; this is a single prose leaf with no ordering requirement.

## Open limitation

When A's pane shares its tab, only A's area is split, so B and C get quarters of the tab rather than halves; the prose states this instead of fixing it, because moving panes the door did not create is foreclosed.

## Verification (concrete)

```bash
git status --porcelain
grep -rn -i "peer\|pane" docs/ skills/chart-issues/ | head -n 30
TAB_JSON=$(herdr tab create --no-focus); echo "$TAB_JSON" > /tmp/create-peer-panes-tab.json
# read .result.root_pane.pane_id and .result.tab.tab_id from the file
herdr pane split <root> --direction right --ratio 0.5 --cwd <repo-root> --no-focus
herdr pane split <B> --direction down --ratio 0.5 --cwd <repo-root> --no-focus
herdr pane layout --pane <root> | tee /tmp/create-peer-panes-layout.json
herdr tab close <tab_id>
bun run format && bun test && bun run typecheck
```

Layout file must show three panes: root at x=0 full height, B at top right, C at bottom right.
