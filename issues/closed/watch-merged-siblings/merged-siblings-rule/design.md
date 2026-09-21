# Design: merged-siblings-rule

## Binding decisions, verbatim

### sibling-evidence (issues/chart/watch-merged-siblings/forks/sibling-evidence.md)
Q1 How does the watch learn whether a merged leaf's owner folder still holds an unmerged leaf.
1-A (operator 2026-09-21). Wording only in the watch skill: a merged leaf still under `issues/open` has its top-level owner folder's state files read; any sibling not merged means report waiting on siblings and run no `next`; all merged means run `akrogon next <slug>` once this fire, re-observe, and apply the existing command-error rule; remaining under open alone is never an error; unreadable sibling state is reported as a gap. Reason: smallest change that meets the seed's no-next expectation and keeps the completion retry. Foreclosed: keeping the per-tick `next` (B); an `owner=` observe field (C); deleting the merged rule (D).

### Locks
- No watchers or automation beyond what exists; the watch stays operator-started and read-only except `next`/`phase`.
- The watch never edits `issues/`, `state.yaml` or worktrees (SKILL.md Never list).

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: a prose-only skill leaf; no auth, secrets or backend mutation; the verification commands are the repo test suite and the skill's own test, both unchanged; no user-visible flow beyond the watch reply line, which the rule text already specifies.

## Leaf architecture
Owned surface: `skills/watch-issues/SKILL.md`, Judge section, the one "Merged still under open" bullet.

Literal interface, the replacement bullet (wording may vary, order and content may not):
"Merged still under open: read the state files beneath the leaf's top-level owner folder under `issues/open`, an issue or an epic. If any is not merged, report waiting on siblings and run no `next` for this leaf. If all are merged, run `akrogon next <slug>` once this fire, then re-observe; a failed command follows the command-error rule, and remaining under open alone is not an error. If sibling state cannot be read, report that gap rather than assume completion."

Exclusions: `scripts/observe.ts` and `observe.test.ts`; `src/next.ts`, `src/phase.ts`; `docs/guide/in-practice.md` (it does not state the merged rule, checked 2026-09-21); other Judge bullets; the installed skill copy under `~/.claude/skills`, linked by `akrogon install`.

Dependencies: none.
