# Brief-2: temp-repo git scenario (C3)

## 1. Goal

Prove the checkpoint-then-cherry-pick protocol with real git in a temp repo and return the transcript for B's report. Plan decisions D4, D5, D7.

## 2. Numbered acceptance criteria

1. Clean pair: a temp lane repo with uncommitted edits runs checkpoint commit, two `git worktree add --detach issues/worktrees/<slug>-u<N>` worktrees, one commit in each, serial `git cherry-pick` of both, and `git worktree remove` of both, ending with `git status --porcelain` empty on the lane.
2. Conflicting pair: a second temp lane run shows `cherry-pick --abort` leaves the lane clean and the conflicting worker worktree is kept so its commit stays reachable (shown via `git log --oneline -1` in that worktree).
3. Scenario script lived only under `/tmp`, is deleted after the run, and no file was added under `tests/` or anywhere in the leaf worktree.
4. Transcript returned contains every command with its output, including checkpoint hash, both worker commit hashes, both picks, both removals, the abort, the final empty status, and the kept-worktree log line.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/skills/implement-issue/ponytail.md`
- No other reads needed; the protocol steps are copied into section 4. Open `docs/reference-index.md` only on a gap.

## 4. Change list and needed interfaces

- Edit no repo file. Create one throwaway shell script under `/tmp`, for example `/tmp/parallel-chunks-scenario-<pid>.sh`, run it, capture its full output, then delete the script and both temp repos.
- Literal git steps for the clean pair (slug `demo`, lane dir `/tmp/<uniq>-lane`):
  `git init -b main`, one base commit, uncommitted edit to a tracked file, `git add -A && git commit -m checkpoint`, `git worktree add --detach issues/worktrees/demo-u1 HEAD`, `git worktree add --detach issues/worktrees/demo-u2 HEAD`, one commit in each worktree on disjoint files, back on lane `git cherry-pick <u1-hash>` then `git cherry-pick <u2-hash>`, `git worktree remove issues/worktrees/demo-u1`, `git worktree remove issues/worktrees/demo-u2`, `git status --porcelain` (must print nothing).
- Literal git steps for the conflicting pair (fresh lane dir): same setup, but both workers edit the same line of the same file; `git cherry-pick <u1-hash>` succeeds, `git cherry-pick <u2-hash>` conflicts, `git cherry-pick --abort`, `git status --porcelain` (must print nothing), conflicting worktree NOT removed, `git -C issues/worktrees/demo-u2 log --oneline -1` shows its commit.
- No preceding-worker output needed; brief-1 prose and this scenario are independent.

## 5. Do-not, reasons and exceptions

- Do not create or edit any file in the leaf worktree or under `tests/`. Reason: the scenario is temporary by design; only its transcript lands in the report. Exception: none.
- Do not mock git or hand-write hashes. Reason: standing design requires real invocation; the transcript is the artifact. Exception: none.
- Do not leave the script or temp repos behind. Reason: temp means temp; residue pollutes the next run. Exception: none.
- Do not change scope on mismatch; return a mismatch naming the conflicting requirement, actual observed git output, and the smallest brief correction. Reason: plan author owns scope. Exception: a revised brief from B authorizing that change.
- Reasons restated: temp scope, real git, no residue, mismatches belong to B. Exceptions restated: only a revised brief from B authorizes a change.

## 6. Ordered steps

1. Write the temp script under `/tmp` covering the clean pair for criterion 1, with `set -u`, echoing every command before running it.
2. Extend it with the conflicting pair for criterion 2, asserting empty `git status --porcelain` after the abort and printing the kept-worktree log line.
3. Run it, capture the full transcript, verify criterion 4 completeness.
4. Delete the script and both temp repos; verify criterion 3 with `ls /tmp` for the script name and `git -C /home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks status --porcelain` showing no scenario files (brief-1 prose edits may show; that is expected).
5. Run the section-7 command for evidence.

Advisory size: 0 repo files, under 8 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

`AKROGON_BASE=755babc1e1c4f0e539c78562f38771d899f30d2a bun test --changed="755babc1e1c4f0e539c78562f38771d899f30d2a"` run from `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks`. B runs the full suite separately. The git scenario in section 6 is the verification artifact, not a substitute suite.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold: both temp runs passed with real output, residue deleted, transcript complete. Paste the full transcript in the returned report under Tests run plus the changed-test result; limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why, or none>
Tests run: <full scenario transcript plus changed-test command and result>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
