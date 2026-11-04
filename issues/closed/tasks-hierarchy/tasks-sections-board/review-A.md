# Review A: tasks-sections-board

Base `f96367e6`, reviewed head `dcf39ce4` (five commits). Evidence: `akrogon verify` green on `ff06e7dd` — same tree as `dcf39ce4` (trailer-only commit on top) — receipts in `implementation/check-{format,typecheck,test}-*.log`; planned proofs cited in `implementation/report.md` (tasks-mod 12/12, tasks-mod-host 13/13).

Verdict: **fix**

## Fix

- **F1 — Chevron hit area is one line high, not full-row-height.** Source: a user clicking the right edge of a row's second line to expand it (the design's locked open-row control). `herdr-app/tasks/main.js:258` draws `chev-<key>` at `w(24).h(S(20))` inside the line-1 `h_flex().h(S(20))`, so the hit area covers only the first line of a two-line row. Below line 1, the last 24 px of the row is still the body click target, which pins the leaf folder and opens Files — the operator's expand gesture performs a different action. Design open-row: "behind the chevron with a full-row-height × 24 px hit area"; brief criterion 6 (the chevron toggles the expansion). The host tests only exercise the top-of-row chevron element, so the geometry gap is untested.

## Nits

- **N1 — Dead space context plumbing.** `ctx()` still computes `spaceName`/`spaceFolder` and `BoardContext` carries them, but `board()` no longer reads them (current-repo-first ordering removed by design). Harmless dead API surface; deferred because removing fields also rewrites the two committed ctx literals for zero behavior change. Promotes if a later leaf needs a smaller `BoardContext` or a new caller misreads them as used.
- **N2 — Parked rows keep the hover fill.** `row()` applies `.hover((s) => s.bg(t.hover))` unconditionally, so a parked row (no click, no expansion) signals interactivity it does not have. Cosmetic; the criteria say only "no click target". Promotes if hover is ever the only affordance check for parked.
- **N3 — Format commit carries a `Test-Change` trailer for a file prettier left unchanged** (`tests/tasks-mod-host.test.ts`). The citation rule tolerates extra trailers; the line's own claim ("no expectation changed") is accurate. No consequence.
- **N4 — `field` label column is a fixed 64 px** while other expansion text scales; long labels would clip. Current labels ("blocked by", "missing", "moves", "kept") all fit. Design's scale fork fixes "section labels, paddings, gaps" — an expansion label column is arguably a label, so this reads inside the lock. Recorded in case B or the herdr-app version wants every text role scaled (B's standing dissent).

## Notes

- Sections/reasons/blocks/machine lines/colors/sizing match design D-forks and criteria 1–5, 8, 9; folder pin/shared `worktree.pin`/chevron toggle vs Files|Changes worktree pin match criterion 6; expansion contents and exclusions match criterion 7; merged hidden + broadcast-pending Waiting, parked Paused, stopped+busy Paused, attention-beats-hold all verified in code and tests.
- Proof commands match `plan.md`; planned tests were shown red at planning per plan.md's recorded logs; trailer citations cover every test-matched path including the `model.d.ts` frozen boundary.
- No `AREA.md` files in the diff; no documented behavior changed — `src/AREA.md` and `docs/start/install.md` still describe the mod accurately.
- Report records the format-commit extra trailer; report content matches the committed work.
