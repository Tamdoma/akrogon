# Implementation report: seed-cause-evidence

Base: `ce4c9813982b690c78f075d1aecbb17ebcb01f9c` · Head: `57bbe3c`

## Changed files

- `skills/seed-issue/SKILL.md` (commits `0d15906`, `3b8fdb5`): Report section reworded in place — six sections, title names a cause only when the statement is itself a cause (marked suspected), diagnosis lifted, banned items kept; `## Suspected cause` added after Urgency with five placeholder lines; one discovery rule (one hop, reads only); one lookup rule (two gh reads, one warned retry, body-judged, failed lookup still posts with "search failed"); one root-line rule (five conditions) with the footer reason naming a printed line or lookup failure.
- `docs/guide/create.md` (`5267b76`): seed-issue section describes the sixth section, bounded discovery, related searches and the optional root line; retains "not invented" framing.

No other file touched; chart-issues, `src/pull.ts`, routing rules and the compaction header unchanged.

## C1 rule count (by meaning, design method)

19 rules, under the cap of 20:

1. Compaction re-read directive. 2. Standalone on every harness, `gh` only added dependency. 3-7. Routing rules unchanged (root `akrogon.yaml`, validity, stop conditions, origin fallback, no asking). 8. Merged report rule: title/observed-only + cause clause + six sections + unverified intake + "Not provided" + urgency + banned items. 9-13. Five Suspected cause placeholders. 14. Discovery rule. 15. Lookup rule. 16. `gh issue create` invocation. 17. One report, no staging/labels/lifecycle. 18. Root-line rule. 19. Merged outcome+footer rule.

## Commands run

| Command | Result |
|---|---|
| `bun test --changed=$AKROGON_BASE --timeout=30000` | 0 affected test files (markdown-only diff) |
| `bun test --timeout=30000` | 415 pass / 0 fail, 12.46s |
| `bun run format` | clean |
| `bun run typecheck` | clean |
| `wc -lc skills/seed-issue/SKILL.md` | 82 lines, 6,451 bytes (about 1,613 tokens) |
| `git diff --check` (workers) | clean |

## Criterion evidence

See verification/results.md. B replaced the invalid captures at head `57bbe3c` with seven intact local replays and three deliberate instruction-break comparisons under `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/seed-B-proof-7v0irj41`. Every new submitted body is nonempty and each run invokes create once. #124 separates mechanism reasoning, #126 omits parser diagnosis from its title, #125 prints the root action with the corrected footer, isolated cause-statement and closed-only cases suppress it, and failed lookup records command/error in its submitted body and final outcome. Previously valid thin-input, contradicted-suspicion, failed-creation, copy-provenance and live post-#128 evidence is retained with explicit limits.

## Repairs

- B F1: commit `57bbe3c` makes the existing report sentence explicitly separate observed facts from supplied/inferred cause reasoning. The rule grouping stays 19.
- B F2 and A Fix 1: B's replacement local proof corrects empty/truncated captures, #124 reasoning placement, #126 title, printed-root-line footer and isolated cause-statement coverage. The new closed #40 edge fixture is labelled synthetic rather than asserted as live history. Reports now describe actual captures and their limits. These changes affect pass artifacts only, with no additional code commit or test-file changes.

## Known limitations

- Harnesses exercised: pi fresh agents and Codex B local model-authored replays. Other harnesses unproven.
- Root coverage and reporter-statement classification are model judgments; proof records the evidence for the demonstrated decisions rather than promising identical decisions across runs.
- No live create. The original read-only post-#128 list/view run is retained; cross-org views remain unproven.
- Discovery-rule-only removal is redundant with the files-read placeholder and did not change behavior. The meaningful root-action, cause-guard and lookup breaks are recorded separately.
- Invalid original captures remain available for audit and are explicitly excluded from passing proof.
