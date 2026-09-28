# Review B: chart-destination-intake

Blind initial review. No peer review file exists yet; judged the diff against plan decisions/AC/checklist, design exclusions, report claims, and live contracts only.

- Base: `a2f3e7a378d025930e12ac05ce8710f57f0752a2`
- Reviewed head: `5414dc3dd6dd41f80d2c4d9bbdecf09aca4650b2` (lane `chart-destination-intake`, ahead of base, `git status --porcelain` empty)
- Diff: exactly 3 files, all plan-owned: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. Zero paths under `issues/`, `src/`, `tests/`, `plugin/`; `README.md` diff empty; no `AREA.md` in diff (AREA existence check N/A).

## Criterion verification (read against landed text)

- C1: SKILL.md:63 states which ("source repo plus each selected registered destination, deduplicated within a checkpoint"), when ("at destination selection and again right before the handoff review, one check when both coincide", "opening pull counting only when it coincides", "source is never exempt, including when it is also the only destination"), how ("plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config` `repos`"), and distinctness ("checking never imports a destination's unrelated seeds"). Holds.
- C2: shapes.md:164 states all four outcomes: full unowned match verbatim into INTAKE.md under its own `Source` heading with GitHub provenance plus identity into `sources` of every leaf under the delivering completion owner; partial stays open shown with uncovered part; owned-elsewhere shown as conflict, never reassigned; failed/non-GitHub pull holds only that destination and is reported. SKILL.md:63 repeats the hold and no-import rules. Holds.
- C3: shapes.md preflight contains "Refuse a handoff to a destination whose check right before the handoff review did not succeed, and name that destination." Holds.
- C4: guide:203 sits inside "Turn the answers into a buildable contract" (last `##` heading at :187) and explains which/when/how plus covered-report outcome in plain words. Exemptions present at guide:128 ("confirmed fully covered but still undelivered and unowned ... stays open in `sources`") and SKILL.md:33 ("confirmed full match with no other owner whose work is undelivered is exempt"). Re-ran the sweep grep: 20 hits, matching the report's enumerated 20; other hits are schema examples or generic mentions, none contradictory. Holds.
- C5: report replays #38 as pre-handoff state (#5 open/unowned), and every quoted line was verified byte-present at SKILL.md:63/:33 and shapes.md:164, including the `Tamdoma/pi-extensions#5`-into-both-leaves sourcing via the fan-out rule. Five scenario reviews each name instructions and refresh/import/sources/handoff outcomes. `/tmp/chart-destination-intake-pull.log` exists with `pi-extensions: 0 open issues pulled` (outside tracked `issues/`). Checks evidence pasted: format exit 0, test 324 pass / 0 fail, typecheck clean. No wording tests added. Holds.

## Contract and exclusion checks

- shapes.md:162 single-owner sentence verified byte-identical between base and head via diff. Design Q1-A/Q2-A/Q3-A Taken all present in the new text; Off-route items (completion closure, `next --all`, seed-issue routing, pi-extensions#5) untouched; no `--all`, no new command/flag/config/state; matching stays "act only on operator confirmation" (no automatic matcher).
- Unchanged behavior page opened: README command table (`akrogon close ... unowned ...`, `akrogon pull ...`, install/intake lines) read; no wrong claim, no contradiction with the exemption. Index pointers need no update (no new files). No lesson claimed, no `learnings/` change on branch.
- Tests-vs-AC: prose leaf per D6, verification by read plus suite; no mocks, no prose-wording tests. Full-suite rerun not needed: prose-only diff with complete pasted evidence and no specific concern.
- Worker worktrees: zero `chart-destination-intake-u*` worktrees remain; only the lane is registered.

## Findings

No fixes. No nits. The diff is minimal (3 prose files, additive plus two in-place exemption clauses), every done-criterion holds against the landed text, and every report evidence claim verified live.

## Verdict

ready
