# Sub-brief 2: temp-file sentences and skills sweep

## 1. Goal

Implement plan decisions D4 and D5 of `guard-at-creation`: the temp-file sentence in three skills stops placing base copies under `$TMPDIR`, and a sweep of `skills/` by meaning confirms no skill instructs making a base checkout by hand or inside a repo.

## 2. Acceptance criteria

1. The temp-file sentence in `skills/implement-issue/SKILL.md` (today `:25`), `skills/check-issue/SKILL.md` (today `:18`) and `skills/merge-issue/SKILL.md` (today `:18`) reads, in all three files identically: ``Temp files and logs go under `$TMPDIR`, never a fixed `/tmp/<name>`; a base copy is made only through `akrogon base-run`; anything needed later goes in the leaf folder.``
2. A sweep of `skills/` for instructions to make a base checkout by hand or inside a repo finds none. Every grep hit you examine that is outside these three files is recorded in your report with its path, line and why it is out of scope. Already known out-of-scope hits to verify, not edit: `skills/init-akrogon/SKILL.md:72` (`mktemp` for a proposal file, not a base copy); `skills/watch-issues/scripts/log-tail.test.ts` and `observe-log-tail.test.ts` comments (mktemp cwd provenance).
3. No other sentence in the three files changes; base-run instructions elsewhere in the skills are unchanged.

## 3. Read-first

- The three skill files around their temp-file sentence.
- `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md` base-run mentions (`akrogon base-run` usages near `check-issue:65`, `implement-issue:38`) so the sweep judges wording correctly.
- This skill folder's `ponytail.md`: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `skills/implement-issue/SKILL.md`: replace `Temp files, logs, and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder.` with the criterion-1 sentence.
- `skills/check-issue/SKILL.md`: same replacement.
- `skills/merge-issue/SKILL.md`: same replacement.
- Then sweep: `grep -rn 'base cop\|base checkout\|mktemp\|\$TMPDIR' skills/` plus a meaning-level read of any skill paragraph mentioning base runs or checkouts; record examined hits.
- Interfaces: none; documentation-only unit.
- Chunk ownership: this unit owns exactly those three files. No prerequisite units. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not change any base-run instruction, heading or other sentence: the design leaves base-run wording untouched. Exception: a revised brief from A.
- Do not edit hits outside the three files: out-of-scope text is reported, not changed. Exception: a revised brief.
- Do not write or edit any test or `src/` file. Exception: a revised brief.
- Return a mismatch with evidence to the plan author instead of changing scope or wording intent; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read each temp-file sentence and apply the criterion-1 replacement in the three files.
2. Run the sweep commands from section 4 and examine every hit by meaning (open the surrounding lines for any ambiguous hit).
3. Verify `git diff` touches exactly the three sentences.
4. Run the section-7 changed-test command; a green or empty result both count (docs-only diff).
5. Commit with a message like `docs: base copies only through akrogon base-run in temp-file rules`.

Advisory size: about 3 files and under 14 turns.

## 7. Commands

```
AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

Run it from the worktree root after `bun install --frozen-lockfile`. A docs-only diff may produce no changed tests; that is a pass.

## 8. Done-when, evidence and report

All three sentences match criterion 1 verbatim (paste the `grep -n` lines), the sweep results with per-hit scope verdicts are in your report, and the commit id is included.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
