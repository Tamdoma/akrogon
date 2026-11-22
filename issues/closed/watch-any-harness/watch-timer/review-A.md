# review-A: watch-timer

Base reviewed: `ceb444fa08d15c8f39ccbbe1bcf5edea0bae2b40` (AKROGON_BASE at review).
Reviewed head: `800000fb1f43c6bb421653b2e5fd43f832b09a71` (`git diff ceb444fa...HEAD`, 21 files).

## Verification evidence

- `akrogon verify` on head 800000fb: green — format, typecheck, test
  (check-test-1795212798496-3940019.log, 1241 pass).
- Free suite: `check-watch-timer-1795212655133-3910427.log` — 8/8.
- Stand-in cells: `check-watch-live-standin-root-1795209224916-1557179.log`,
  `...-shell-1795209311031-1591354.log` — pass.
- Preflights: pi `-1638955`, claude `-1644186`, codex `-1644940`, agy `-2868032` — pass.
- Paid cells: `check-watch-live-{claude,codex,pi,agy}-{root,shell}-*.log` — all pass.

## Grant count audit

`issues/timings.jsonl` and `check-watch-live-*` logs for the grants[1] window show exactly 10
prompted sessions: 8 green cells + codex-root and agy-root reds (each rerun green). Bound 12,
no `stop_line` touch. Correction applied by this review: `implementation/report.md` said
"9 of the 12 bound units (8 cells + 1 red rerun)" — the two red cells each prompted a session
of their own, so the correct count is 10; the report's per-row lines already showed both reds,
only the total was wrong (fixed in place, no code touched).

## Diff judgment

- `tick.ts`: every refusal prints `no-watch <reason>` with the plan-D4 family table; `stale`
  verbatim; catch binds `error.message`. `stopped` keeps its bare word (the hook's ` t=` suffix
  reads as the reason slot only after `no-watch`; the free test's `(?!t=)` anchor holds).
- `SKILL.md`: one-operand removal of `<root>` on `akrogon status`; all criterion-10 assertions
  still hold (harness names, /new, compaction, draft, no cron/expir).
- `timer.ts`: prints each new refused-read, skipped-send, failed-send and exit reason to its own
  output; non-rm direct launches in the free suite read every reason family off the screen.
- `tests/e2e/watch-live.e2e.ts`: stand-in cells cover criteria 1-9+12 incl. unpause socket
  survival, held due, space root, forged pid, stale due, agent exit; preflights prove one
  leaf `watch-issues` per harness with no prompt; paid cells run the corrected criterion-11
  sequence. No assertion counts model commands or matches model wording; receipts, call lines,
  hc turn and screens are the observable effects.
- `watch-tier.ts` `rootName` + `worktree_root` sibling folder: criterion 12 as designed
  (the unpause socket-deletion cause F2).
- agy wiring: shallow copy (SKILL.md real, scripts symlinked) per the chart-door seat note —
  agy 1.5.13 lists no symlinked workspace skill; no home file touched anywhere.
- AREA checks: `tests/AREA.md` + `skills/AREA.md` named paths all exist (one-shot listing,
  zero MISSING besides the intentional `tests/hc-*` glob).
- Docs (`watch-while-away.md`, `reference/skills.md`, `watch-loop.svg`): describe the same
  behavior the criteria name; no documented behavior left stale.
- `Test-Change:` trailers in `ceb444fa..HEAD` name every touched frozen path with a Corrections
  citation (seat-note added on the agy commits); the deleted `watch-check.e2e.ts` was cited on
  its deleting commit earlier in the range.

## Findings

Fixes: none — the count error was corrected in place and is recorded above; every done-criterion
maps to a passing planned proof; no check or gate decides by model wording.

Nits:
- N1 (deferred): two one-off suite flakes seen under `bun test --parallel=4` — "each due runs one
  check" once (`statusCalls >= 4` got 3, a wait-sampling race) and "two simultaneous base runs
  produce one notice file" once; both green on isolated rerun and in the final verify. Deferred
  because neither names a leaf defect and both cleared without a diff; promote if the same name
  reds on a run where it is the only failure and repeats.
- N2 (deferred): `tickRunsNoCheck`'s `(?!t=)` reason regex keys on the hook's ` t=` log suffix —
  a hypothetical reason word literally `t=…` would read as bare; the product's reason words are
  fixed and none collides today.

## Verdict

ready
