# Review A: fresh-test-proof

Base: `fe7d558c255305f897fe66c8e2c625d3724e46e7`. Reviewed head: `013f7c3`.
Diff: 3 commits, 3 files, text only. Worktree clean.

## Verification evidence

- C1 freshness rule in both proof steps: `grep -c "latest change to that test and to
  every helper or fixture it uses" skills/implement-issue/SKILL.md` → 2 (:65
  implement, :86 check.fix). Pass.
- C2 report records command/commit/result per proof: clause `each proof result
  recording the command, the commit it ran on and the result` present at :65. Pass.
- C3 B rejects stale proof: :55 gains `rejects proof for an added or changed test
  that ran before the latest change to that test or a helper or fixture it uses,
  asking for the missing current run` plus the green-runs/new-case example. Pass.
- C4 guide describes the rule: `phases.md` hits at :94 (reuse only after latest
  change) and :104 (review rejects stale proof); description, not full restatement.
  Pass.
- C5 scope: `git diff --name-only` lists only the three owned files; no run count,
  phase step, command code or `checks`/`merge_checks` scheduling change; the
  rejected-command replay sentence is untouched. Pass.
- Drift sweep: `grep -rn "unchanged evidence"` across repo markdown → no stale
  phrase remains. `skills/AREA.md:24` describes run order only, no freshness claim,
  so no stale rule there.
- Report ran the planned tests through `plan.md` commands: all greps and the four
  `checks` commands ran on `013f7c3` with pasted results; nothing skipped or
  filtered. No added or changed tests exist, so the stale-proof check has nothing
  to reject.
- Docs: `phases.md` and both skills changed behavior and were updated in the same
  diff; `docs/reference-index.md` needs no new pointer.
- `checks`: format pass, typecheck pass, test 843/0, test_changed pass — all on the
  reviewed head per report.

## Findings

No Fixes. No Nits recorded (no reusable mechanism worth a lesson; the change is
small prose work matching plan decisions D1–D5).

## Verdict

ready
