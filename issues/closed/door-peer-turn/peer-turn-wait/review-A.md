# Review A — peer-turn-wait

Base: `69038ef0` · Reviewed head: `745413f` · Verdict: **ready**

## Verification evidence

- Read the full diff `69038ef..HEAD` (7 files, +330/−5) against brief criteria 1–5, design decisions, and the leaf checklist.
- Ran live probes beyond the test suite (per the review-by-running lesson):
  - `blocked` pane + non-empty file → `{"outcome":"blocked",...,"status":"blocked"}` exit 0 (precedence confirmed live).
  - `working` pane + waitScript `[{sleepMs:30},{sleepMs:30},{status:done}]` + missing file → `{"outcome":"failure",...,"status":"done"}`; `.calls` shows `--timeout` values 4999→4949→4900, i.e. `min(10000, remaining)` decrements per call.
  - Fake crash on malformed db → raw non-JSON stderr passed through, exit 1, no result line.
- `bun test --timeout=30000`: 404 pass / 0 fail (run at implement end; no code change since, not rerun).
- `bun run typecheck`, `bun run format`: clean at implement end.
- Criterion 3/4 prose: the two verbatim-protected sentences in questions.md are byte-identical (the diff line preserves them); all six required statements are present in the rewritten paragraph; SKILL.md carries the footer rule and one pointer each in Drain and Take with no other changes.
- No AREA.md or docs/ files touched; tests/AREA.md lists only representative key files and is not made stale by one added test file. No documented behavior outside the three edited prose files changed.

## Findings

No Fix.

Nits (non-blocking):

- **N1** If `herdr` is not on PATH, `runWait`'s catch makes spawn failure indistinguishable from a timeout: the script spins until budget and prints `budget` instead of surfacing the missing binary. Deferred because the script only runs inside a herdr pane session (`HERDR_ENV=1`) where the binary exists; promotion evidence would be a call path that runs peer-wait outside herdr.
- **N2** A scripted herdr success reporting `working` spins at full rate for the budget (no sleep between iterations) — the test injects exactly this. Real herdr `agent wait` blocks and never returns `working` as a success per its documented contract; promotion evidence would be herdr 0.9.3 returning `working` on exit 0.
- **N3** Exit-0 with unparseable stdout exits 1 writing only stderr (possibly empty), which reads as a herdr failure rather than a contract violation. Deferred: no realistic path produces an unparseable success body from herdr.
- **N4** The pre-prompt wait in questions.md stays a hand-retry `herdr agent wait` loop rather than the script. Deferred: criterion 3 scopes the script to post-prompt waits and the pre-prompt loop checks no file, so the AND/OR failure mode does not apply; the design's "before and after" wording vs the correction is noted for the record, not a defect.
- **N5** `agent_status` is parsed as `z.string()` not the enum, so an unknown status loops until budget; a typo'd fake/forward-incompatible status would silently wait. Deferred: herdr's enum is closed and `unknown` is a legitimate member.

## Missing-test assessment

Every done-criterion has a test that would catch its failure: all five outcome branches, the done-on-timeout OR rule, the byte-identical pass-through, the per-call timeout clamp proven against `.calls`, and argv rejection. No criterion relies on assertion-free code.

## Operator actions

None.
