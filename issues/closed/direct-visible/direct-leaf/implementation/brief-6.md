# Brief 6 — U6: skills and prose docs rewrite

## 1. Goal

Implement plan decision D15 and the U6 wave line of `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` (read it first — D15 and design item 10 referenced there). Outcome: the chart-issues direct route documentation describes the new leaf-lifecycle flow (`akrogon direct` / phase moves / `akrogon direct-drop`), the door's self-landing machinery is fully removed, and no dangling references to it survive anywhere.

Context you need (copied binding facts): the NEW flow is — the chart door writes `ISSUE.md`, `brief.md`, `design.md`, `readiness.yaml` under `issues/open/<chart-slug>/<slug>/`, runs `akrogon direct <slug> --reviewer <address> [--source ...]` inside hc, which creates the unlocked worktree and `state.yaml` (`phase: implement`, `direct: true`, seat.A the caller, seat.B the reviewer, no tab). The door implements in that worktree as slot A using the leaf form of implement-issue (`implement-issue <slug> slot=A phase=implement leaf=<folder>`). Review rounds: A finishes with `akrogon phase <slug> check.review --slot A`; B reviews (`check.review` needs only B at every round); A repairs in `check.repair`/`check.fix` steps; merge queue and land land it like any leaf; it broadcasts on landing like any leaf. Abandon/growth-stop: `akrogon direct-drop <slug> --chart issues/chart/<chart-slug>` stops runs, removes worktree+branch, moves the owner folder to `<chart>/direct/`. The command never touches the door/reviewer terminals, never records a tab, never counts toward max_active. The OLD flow being deleted: the door itself rebased/verified/pushed to main, closed sources, broadcast, and ran `direct-guards.ts` (steps 5.1-5.9 of assets/direct-route.md).

## 2. Numbered acceptance criteria

1. `skills/chart-issues/assets/direct-route.md` and `skills/chart-issues/scripts/direct-guards.ts` and `tests/direct-guards.test.ts` no longer exist.
2. `grep -rn "direct-guards" skills docs src tests README.md` finds nothing (binary/cache dirs excluded).
3. `grep -rn "direct-route" skills docs src tests README.md` finds nothing except references that correctly describe the new flow (there should be none — the file is gone; decide by reading).
4. `skills/chart-issues/SKILL.md`'s direct section and `assets/shapes.md` describe the new flow accurately — a reader following them would run `akrogon direct`, implement as slot A with the leaf form, move phases, and use direct-drop; no step has the door pushing to main, closing sources, broadcasting or running guards itself.
5. `skills/implement-issue/SKILL.md` direct form rewritten: chart-door direct work uses the leaf form; the old `implement-issue direct chart=... worktree=...` form is gone.
6. `docs/use/quick-fix.md`, `README.md`, `docs/README.md` direct-route prose matches the new flow.
7. `tests/receipt-gates.test.ts` and `tests/docs-links.test.ts` pass after your edits (direct-guards cases removed, direct-landing expectations removed or retargeted at surviving docs).
8. `bun run typecheck` exits 0 (tests must still compile after deletions).
9. No other test file broken: `bun test tests/receipt-gates.test.ts tests/docs-links.test.ts tests/command-reference.test.ts --timeout=120000` green (command-reference is unmodified by you — it validates docs/reference/commands.md which you do NOT touch).

A worker writes and edits no test — EXCEPT the deletions/retargets this brief explicitly assigns in test files (they are the unit's assigned content, and their commits carry `Test-Change:` trailers, see section 8). Any other red test is a mismatch returned to A.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — D15 plus the wave line.
- `skills/chart-issues/SKILL.md` lines ~95-130 (direct section) and `skills/chart-issues/assets/shapes.md`.
- `skills/chart-issues/assets/direct-route.md` — what is being deleted; read it to know what behaviors the new text must absorb vs drop (most is dropped: the command now owns verify/merge/push/close/broadcast).
- `skills/implement-issue/SKILL.md` — the standalone/direct-form paragraphs.
- `tests/receipt-gates.test.ts` lines ~150-310 and `tests/docs-links.test.ts` lines ~250-300 — the exact cases to remove/retarget.
- `docs/use/quick-fix.md`, `README.md` (factory section), `docs/README.md`.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Paths this unit owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, delete `skills/chart-issues/assets/direct-route.md`, delete `skills/chart-issues/scripts/direct-guards.ts`, delete `tests/direct-guards.test.ts`, `tests/receipt-gates.test.ts` (remove the dedicated direct-guards test at ~L308 and the direct-guards invocations inside the two merge-gate tests at ~L152-181 and ~L228-276 — KEEP the remaining merge-gate assertions in those tests), `tests/docs-links.test.ts` (remove/retarget the direct-landing expectations at ~L260/L268/L294), `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/watch-issues/SKILL.md` (direct mentions shrink to what the leaf flow makes true — read each mention and judge), `docs/use/quick-fix.md`, `README.md`, `docs/README.md`. You do NOT touch `docs/reference/commands.md` or anything in `src/` or `tests/helpers.ts`/`tests/hc-fixture.ts`.

Must land first: nothing (wave 1). Creation commit: filled by A below.

Skill-rewrite guidance: keep the rewrites minimal and factual. The direct section of chart-issues should read as a short ordered flow, not a copy of this brief. Where old text described door-executed landing steps, delete rather than rephrase. The `Route: <lifecycle | direct>` recording in CHART.md stays. Direct eligibility rules in SKILL.md stay as they are (they are the door's routing judgment, unaffected). `shapes.md`'s direct bullet changes from "no leaf files" to the real-leaf shape.

## 5. Do-not, reasons and exceptions

- Do not edit `docs/reference/commands.md`: owned by another wave-1 unit; concurrent edits conflict at cherry-pick. No exception.
- Do not delete or rewrite any test content beyond the cases this brief names: uninvolved assertions are other criteria's protection. Exception: none.
- Do not invent new flow steps not in the plan's binding facts: the skill text must describe what the command actually does, and inventing steps documents vaporware. If a needed behavior is ambiguous, return a mismatch.
- Never run any `git stash` subcommand: every worktree shares one stash. Replacement: commit as WIP and squash before returning per the reset rule below.
- Do not kill processes by pattern.

## 6. Ordered steps

1. Read plan.md D15, the current direct-route asset, and the skill files' direct mentions.
2. Rewrite `skills/chart-issues/SKILL.md` direct section + `assets/shapes.md`.
3. Delete the three files (direct-route.md, direct-guards.ts, direct-guards.test.ts).
4. Edit `tests/receipt-gates.test.ts` and `tests/docs-links.test.ts`; run both until green.
5. Rewrite the implement-issue direct form; trim check/broadcast/plan/watch skill mentions.
6. Rewrite `docs/use/quick-fix.md`, README factory section, `docs/README.md` lines.
7. Run the greps of criteria 2-3; fix anything found. Run typecheck.
8. Final commands from section 7 green; squash per the reset rule; single commit `docs: direct route becomes the leaf lifecycle` (or similar) with `Test-Change:` trailers for each existing test file changed.

Advisory size: about 12 files (mostly small prose edits) and under 50 turns.

## 7. Commands

- `bun test tests/receipt-gates.test.ts tests/docs-links.test.ts tests/command-reference.test.ts --timeout=120000`
- `bun run typecheck`
- the grep proofs of criteria 2-3

Install first if node_modules is absent: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

Never `akrogon verify`. Long evidence commands through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when all criteria pass and the single squashed commit exists. Each commit changing an existing test file carries in its final trailer block one line per file: `Test-Change: tests/receipt-gates.test.ts brief item 7/design item 10: direct-guards cases removed with the door-landing route` (same shape for docs-links.test.ts; deletions of direct-guards.test.ts cite the same). Report the four lines plus commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit (A fills at wave start): 5c5337df — VERIFY with `git log --oneline -1` at start; if different, use what is there.
