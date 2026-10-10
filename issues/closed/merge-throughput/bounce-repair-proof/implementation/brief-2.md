# Brief 2: implement-issue check.fix replays the rejected merge command

## 1. Goal

Plan decisions D2 and D3 (implement-issue sites) of leaf `bounce-repair-proof`: when a leaf enters `check.fix` because the merge turn's checks went red, the repair pass replays the exact rejected command on the rebased head before `check.review`, and the two "merge_checks only at merge" clauses name this as the single exception. One unit: `skills/implement-issue/SKILL.md` only.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` `check.fix` section: the merge-repair line (currently :78, "A repair requested from merge starts at the rebased head recorded in `review-B.md` and treats the failing output as the finding.") is expanded so the pass, after the repair commits and their normal proof, fetches the remote, rebases the repaired head onto the current `<remote>/<default_branch>`, reruns every exact command recorded at the red ending verbatim (same command, arguments and scope) in the leaf worktree, and records in `implementation/report.md`: each command and its arguments, the rejected run's base and head, the rerun's base and head, and the result.
2. A red rerun is repaired and replayed again within the same `check.fix` pass; a red rerun is never handed to `check.review`.
3. Rebase conflicts during the replay resolve keeping both true sides under the merge-issue solo rule; the resolved head is the rerun's recorded head.
4. The "run `merge_checks` only at merge unless a done-criterion needs a whole run" clauses (currently at :63 and :84) each gain one sentence naming the bounce replay as the only other case a seat runs a `merge_checks` command: the `check.fix` repair after a red merge ending reruns the exact rejected command.
5. The :80 input sentence ("Red merge checks mean the failing output is the finding.") names the recorded command as what the replay reruns.
6. The implement-issue:38 base-run rule, worker waves, operator and credential rules, and all other sections are unchanged.

Proof is read/grep over the diff; no test asserts skill text.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` (whole file; :61-63 implement-end proof, :72-84 check.fix, :38 base-run rule to leave alone)
- `skills/merge-issue/SKILL.md` (:51-55 solo rebase and conflict rule the replay defers to, :61-65 the red-ending record that becomes the replay's input)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `skills/implement-issue/SKILL.md` only.

- :78 expansion (D2). Keep it one paragraph; the concrete order is: do the repair work, run its normal proof (done-criteria proof, changed tests, `checks`), then fetch, rebase onto the current `<remote>/<default_branch>`, replay the recorded command(s) verbatim, record the evidence in `implementation/report.md`, and only then move to `check.review`. A red rerun means more repair work and the replay repeats inside the same pass.
- :63 and :84 exception sentences (D3). Same meaning at both sites; wording may differ to fit each sentence, e.g. after "unless a done-criterion needs a whole run" append "; the one other case is a `check.fix` pass after a red merge ending, which reruns the exact rejected command recorded in `review-B.md`".
- :80: extend "Red merge checks mean the failing output is the finding." so it also points at the recorded command and arguments as what the replay reruns, e.g. "Red merge checks mean the failing output and the recorded command are the finding and the replay's target."

Lands first: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not touch the :38 base-run rule or the check.review/cross-skill base-run text: the replay is a separate rule; the design holds it unchanged.
- Do not move the replay to the merge turn or to `check.repair`: the bounce rerun belongs to A's repair seat only.
- Do not require rerunning commands whose red run is not recorded: the replay consumes exactly what the red ending recorded.
- Do not edit any other file.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

Restated: only `skills/implement-issue/SKILL.md` changes, only at :63, :78, :80 and :84, preserving every other sentence; any needed extra change is returned as a mismatch, not made.

## 6. Ordered steps

1. Read `skills/implement-issue/SKILL.md` and the merge-issue context lines (criteria 3, 6).
2. Make the four edits per section 4 (criteria 1, 2, 4, 5).
3. `git --no-pager diff` and confirm the diff touches only those sentences (criterion 6).
4. Run the changed-test command in section 7.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/bounce-repair-proof-u2
bun install
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

If `bun test --changed` reports no changed tests to run, that is a valid green result for a doc-only diff; record it as such.

## 8. Done-when, evidence and report

Done when all six criteria hold in the diff, the file is committed in this worktree, and the changed-test command has run green or vacuous.

Commit with a short message like `implement-issue: check.fix replays rejected merge command after rebase`. No `Test-Change:` trailer is needed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
