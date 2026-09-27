# Brief 3: resume docs

## 1. Goal

Describe startup as resume-only per plan D9 and acceptance A5. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`. Leaf: `startup-resume`.

Binding facts: startup runs `next.sh --resume`, which resumes allocated leaves (tab or worktree set) plus merged leaves and cleans completed worktrees. It starts no new leaf. The cleanup lines in `limits.md`, `problems.md` and `merge.md` stay true because the resume branch still runs global cleanup. Manual `--all` behavior is unchanged.

## 2. Numbered acceptance criteria

1. `docs/guide/next.md` no longer says startup runs a sweep; it says startup resumes allocated work only and cleans up completed worktrees.
2. `limits.md:10`, `problems.md:51` and `merge.md:27` are read and confirmed still true, with no edit.
3. The manual `--all` mentions in `docs/guide/cheat.md` and `skills/watch-issues/SKILL.md` are read and confirmed unaffected, with no edit.
4. No occurrence of the old startup sentence remains in live docs, checked by grep over `docs/`, `README.md`, `plugin/`, `skills/`, `src/` and `tests/`.

## 3. Read-first list

- `docs/guide/next.md`, around the `Startup also runs a sweep.` line.
- `docs/guide/limits.md`, `docs/guide/problems.md`, `docs/guide/merge.md`, `docs/guide/cheat.md`, `skills/watch-issues/SKILL.md`.
- This skill folder's `ponytail.md`.
- Open the index only for a gap in this list.

Pattern to copy: the neighboring guide sentences, short and plain.

## 4. Change list and needed interfaces

- `docs/guide/next.md`: replace the `Startup also runs a sweep.` sentence only, keeping the sentences around it. Name allocated work plus cleanup.
- No other file changes. No code interfaces apply.

## 5. Do-not, reasons and exceptions

- Do not edit any other doc line. The plan verified those lines; extra edits add review noise.
- Do not touch code, tests, `README.md` or the plugin. Briefs 1 and 2 own them.
- Do not touch `issues/` records, including closed history that may quote the old sentence. History stays as written.
- On any conflict between this brief and the plan or live text, return a mismatch naming the conflict, the evidence and the smallest brief correction instead of changing scope. The exception is a revised brief from B authorizing that change.

Reasons restated: one-line docs keep review trivial; code and tests stay with their briefs; history stays intact; mismatch returns keep scope with B, whose revised brief is the only exception.

## 6. Ordered steps

1. In `docs/guide/next.md`, replace the startup sentence (criterion 1).
2. Read the three cleanup lines and confirm each still true (criterion 2).
3. Read the two manual `--all` mentions and confirm each unaffected (criterion 3).
4. Grep the six directories for the old sentence and paste the empty result (criterion 4).
5. Run the section 7 command and paste the result.

Advisory size: 1 file, under 6 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`, this command only:

```sh
AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed=1a21e22e0056a7e9d6b5e35a5a395b867847a844
```

## 8. Done-when, evidence and report

Done when criteria 1 to 4 hold with the grep and command output pasted. Report limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
