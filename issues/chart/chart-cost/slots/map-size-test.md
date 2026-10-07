# map-size, replay test result, 2026-10-06

Design and pass rule: slots/map-size-final-shape.md (fixed before the run, with the peers' corrections). Test maps: slots/map-size-test-map-B.md, -C.md. Coverage judgement by a separate Opus 5.5 session that saw only the four maps and the nine fork questions: slots/map-size-test-judge.md. A spot-checked four of its quotes against the files.

## Measured, original map turn against test map turn (same intake, same commit, same model)
| | B original | B test | C original | C test |
|---|---|---|---|---|
| Minutes of work | 6.4 | 5.1 | 4.7 | 13.2 |
| Tool calls | 11 | 14 | 27 | 56 |
| Web calls | 4 | 2 | 15 | 20 |
| Output tokens | 9.5k | 9.8k | 24.9k | not recorded |
| Input tokens read | 0.90M | 1.24M | 1.01M cache read, 154k cache write | 3.80M cache read, 262k cache write |
| Cost | unmeasured | unmeasured | about $4.6 | at least $6.3, output not counted |
| Map bytes | 31.3KB | 30.5KB | 28.5KB | 33.4KB |
| Forks named | 7 | 8 | 8 | 16 |
| Share of bytes that is option design | about 30% | about 1% | about 40% | about 1-2% |
| Coverage of the 9 questions the chart later asked (yes=1, partial=0.5) | 6.5 | 6.0 | 7.5 | 6.5 |

## Findings
- The rule was followed. Option text fell from 30-40% of each map to about 1%.
- The maps did not shrink. The space went to more forks, findings and pitfalls.
- No saving. B is level within one run's noise. C took 2.8 times the minutes, twice the tool calls and 3.8 times the cache read.
- In C's original turn, reading cost about $3.3 (cache write and read) and writing cost about $1.2 (output). The map turn's cost is set by how much the seat reads, and the rule does not bound reading.
- Coverage did not hold. Each seat scored lower, and the two test maps together lost one question the originals covered in part (where a carried leaf's B records Nits) and weakened one (where a returning leaf rejoins the order). The judge lists 7 dependencies or pitfalls lost for B and 11 for C, against 5 gained for each.
- Pass rule result: point 1 fails per seat and together. Point 2 shows no saving. Contamination: no tool call outside the clones in either test session.

## Limits
One chart and one run per seat. C's test ran as a fresh sub-session and not in the operator's pane, with an unmatched effort setting, and its output tokens were not recorded. Framework evidence came from commit e612d10ee, without the uncommitted state of that evening. The cost of map text re-read on later turns was not measured.
