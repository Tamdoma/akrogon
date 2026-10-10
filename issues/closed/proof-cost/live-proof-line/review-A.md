# Review A — live-proof-line

Base: 9e2dfbebcfd98e647d34bed995741410ce95c2e4
Reviewed head: 975139ddda571ae01f5a5d4cc3b4b5ad629ab43e
Verdict: **ready**

## Evidence

- `git status --porcelain` empty; head is one commit ahead of base; diff is exactly the four owned files, 4 insertions / 4 deletions (word-level additions in place).
- `bun test --timeout=30000`: 673 pass, 0 fail (run on reviewed head).
- `bun run typecheck`: pass. `bun run format`: pass (pre-existing drift reverted by A, outside owned paths).
- Added-token gate scan (`git diff --word-diff` over the four files, pattern `[0-9]|budget|timer|duration|deadline|cap on|limit`): zero matches — criterion 5 holds; `timeout` appears only as the required basis field name.

## Criterion check

1. SKILL.md `## Handoff`: added sentence sits beside the chart-usage sentence, is explicitly door prose outside that script output, and carries every required element — session count, concurrency with rounds counted, estimated elapsed time, timeout worst case, estimate label, timeout basis named by file and value, measured-case replacement, `unknown` with reason, and the information-only rule (never times out a leaf, never waives a criterion, operator approves or narrows scope). Met.
2. standing-design.md: appended to the "A slow or live-run leaf" line — side-by-side sessions each with own working root and log, named shared-resource exception, unnamed shared resource → criterion cannot pass → pass ends `failed` under the existing red-criterion exit. Met.
3. shapes.md implementer-audit paragraph: both new refusals present (serial sessions without named shared resource; session count in a live-run criterion); the test-count refusal is intact. Met.
4. chart.md: one sentence in the handoff review paragraph describes the live-run line's purpose; no rules restated. Met.
5. No numerals or budget/timer/duration gates in added tokens; D3 refusals and the `failed` exit are the allowed exceptions. Met.

## Doc and index check

- The doc page describing the changed behavior is chart.md itself (edited here); the claim is accurate against SKILL.md's new sentence. No stale or dead pointers introduced; the only named path is the chart-usage script already referenced.
- No `AREA.md` in the diff.
- Design exclusions hold: no command code, no new script, no state/readiness fields, leaf-run-stalls exit reused not changed. One rule per place as designed.

## Findings

None. No Fixes, no Nits, no operator actions. Uncertainty items: none — the diff is four sentence-level text edits and every criterion field was compared verbatim against the added prose.
