# Review A: peer-wait-signal

Base `76e7f93`, reviewed head `87f9a48` (commits `4f89012` tests, `79bd9d4` peer-wait, `48bba1a` test correction, `045fcdc` peer-ask, `7cf5d91` prose+lesson, `87f9a48` prettier).

## Evidence

- `akrogon verify` on `87f9a48`: green (format, 945 tests, typecheck). Logs in `implementation/`.
- Targeted: `check final peer-wait fmt: 0` (33/33), `check final peer-ask fmt: 0` (7/7).
- Deliberate breaks recorded red: `check break pi-authority: 1`, `check break codex-turnid: 1`, `check break claude-always: 1`.
- Diff inspected: `git diff 76e7f93...HEAD` — 8 files, all inside the leaf's owned surfaces.

## Judgment against criteria

- C1–C7 map to the planned tests, all green on the reviewed head; identity and carry rules match the design verbatim, including pi's session-change exemption and codex's bound-turn binding.
- C8: outcome line carries `signal`/`exchange` and questions.md holds the rerun `'exchange'` arg plus the unproven-budget operator rule (verified in the diff).
- C9: LESSONS.md line removed; history file gains `Applied 2026-10-16 by skills/chart-issues/scripts/peer-wait.ts:226` — verified line 226 is `turnVerdict`, the running guard covering every non-claude/pi/codex kind on every grace path.
- Tests were committed red before product code (`4f89012`); the one corrected expectation carries its `Test-Change` trailer citing real output.
- No AREA.md in the diff; SKILL.md wording stays generic; no documented behavior left stale beyond the questions.md update which is present.

## Findings

None blocking. One observation below the Fix bar: `peer-ask.seedExchange` reports `No herdr agent on pane` when `agent list` exits 0 with an unparseable body — the wait is still skipped and the call fails non-zero, only the label is wrong; no realistic source produces a malformed list (handcrafted input only), so it is noted and deferred.

## Verdict

ready
