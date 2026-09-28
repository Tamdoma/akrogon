# Brief-1: wave-rule prose (C1, C2)

## 1. Goal

Write the parallel-chunks wave rule into the 5 owned prose files. Plan decisions D1, D2, D3, D4, D5, D6.

## 2. Numbered acceptance criteria

1. `brief-template.md` section 4 requires B to record chunks that must land first, owned paths, and shared test resource or consumed output.
2. `worker-protocol.md` launch-and-return states: up to 3 chunks at once with landed prerequisites and independent edits and verification, one at a time when unsure; per-worker detached worktree at `<lane>/<worktree_root>/<slug>-u<N>` at lane head, inside repo so gitignored and inside pi parent root so no confirm dialog, removed after its result lands; B commits pending lane edits before each wave when any, else reuses HEAD, no empty commits; worker commits only its chunk and returns commit ID with report; B cherry-picks serially, runs lane changed tests after each, removes that worktree; all worker worktrees gone before full suite, checks, `akrogon phase`; fresh worktree installs dependencies before changed tests.
3. `worker-protocol.md` failure ownership states: conflicting pick is aborted, worker worktree kept so commit stays reachable, B resolves or delegates only the remainder; after a crash B inspects and resumes a retained worktree; remainder sub-brief reads state from the retained worktree.
4. `SKILL.md` updated at description, leaf-worktree scope (code may be read and edited in leaf worktree and its worker worktrees), implement delegation (wave rule for delegated leaf passes), final commit (remaining edits on top of wave commits, no empty commit, cleanup order), check.fix worker sentence (waves before last round); inline, standalone, last-round self-repair explicitly unchanged.
5. `skills/AREA.md` Non-obvious patterns line and `docs/guide/phases.md` implement-issue paragraph state the same wave rule in one line each.
6. No leaf-worker sentence still says sequential execution in one worktree.
7. `skills/AREA.md` stays at most 40 lines with exactly Commands, Key files, Non-obvious patterns, See also as H2 sections.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/skills/implement-issue/SKILL.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/skills/implement-issue/worker-protocol.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/skills/implement-issue/brief-template.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/skills/implement-issue/ponytail.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/skills/AREA.md`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks/docs/guide/phases.md`
- Pattern to copy: existing terse skill sentences (one rule per sentence, literal commands in backticks). Open `docs/reference-index.md` only on a gap.

## 4. Change list and needed interfaces

- `skills/implement-issue/brief-template.md` section 4: add the three record fields (prerequisites-must-land-first, owned paths, shared test resource or consumed output).
- `skills/implement-issue/worker-protocol.md` launch-and-return: replace the sequential-in-one-worktree sentence with the wave rule, worktree path/lifecycle, checkpoint/commit-ID/cherry-pick/per-pick-tests/per-pick-removal, dependency install, final cleanup order.
- `skills/implement-issue/worker-protocol.md` failure ownership: replace single-worktree remainder wording with abort/keep/resolve-or-remainder and crash resume.
- `skills/implement-issue/SKILL.md`: description (cap-3 waves, not sequential workers); shared-context scope lines (leaf worktree plus its worker worktrees); implement delegation sentence (sub-briefs then waves per protocol); final-commit sentence (remaining edits on top of wave commits, no empty commit, worktrees gone before suite/checks/phase); check.fix worker sentence (waves before last round, self-repair on last round).
- `skills/AREA.md` line 21 and `docs/guide/phases.md` line 87: one-line wave rule each.
- No code interfaces. Literal strings to use: `<lane>/<worktree_root>/<slug>-u<N>`, `git worktree add --detach`, `git cherry-pick`, `git cherry-pick --abort`, `git worktree remove`, default root `issues/worktrees`. No preceding-worker output; this is the first unit.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `issues/config.yaml`, `plan-issue`, `tamdoma-subagents`, or any test file. Reason: design excludes them; prose leaf only. Exception: none.
- Do not add an `after:` field, configurable cap, or patch-apply return. Reason: design foreclosed them. Exception: a revised brief from B authorizing the change.
- Do not add a `bun test` wording assert. Reason: standing design forbids vanity tests; scenario transcript is the evidence. Exception: none.
- Do not change scope or an interface on mismatch; return a mismatch naming the conflicting requirement, actual code/interface or scale evidence, and the smallest brief correction. Reason: plan author owns scope. Exception: a revised brief from B authorizing that change.
- Reasons restated: exclusions protect locked scope, vanity tests add no signal, mismatches belong to B. Exceptions restated: only a revised brief from B authorizes a change.

## 6. Ordered steps

1. Edit `brief-template.md` section 4 for criterion 1.
2. Edit `worker-protocol.md` launch-and-return for criterion 2, deleting the sequential-in-one-worktree sentence.
3. Edit `worker-protocol.md` failure ownership for criterion 3.
4. Edit `SKILL.md` five sites for criterion 4.
5. Edit `skills/AREA.md` and `docs/guide/phases.md` one-liners for criterion 5; verify AREA.md shape for criterion 7.
6. Grep for `sequential`, `one worktree`, `in this worktree` across `skills/` and `docs/` for criterion 6; fix stragglers in owned files.
7. Run the section-7 command for evidence.

Advisory size: 5 files, under 20 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

`AKROGON_BASE=755babc1e1c4f0e539c78562f38771d899f30d2a bun test --changed="755babc1e1c4f0e539c78562f38771d899f30d2a"` run from `/home/ivan/Work/infra/akrogon/issues/worktrees/parallel-chunks`. B runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1-8 hold: prose complete, grep clean, AREA.md shape kept, changed-test output pasted. No end-to-end artifact beyond the edited files; limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
