# Review A: signposts-references

Base `bfca777d`, reviewed head `8c47e1e1` (two commits: `1dd486de`, `8c47e1e1`).

## Evidence

- `akrogon verify` green on `8c47e1e1` (format, typecheck, `bun test` 1309 pass). Log: `implementation/check-test-1793796802169-921783.log`.
- `bun test tests/docs-links.test.ts` green on head, 8 pass — all new links and the `#handover` anchor resolve. Log: `implementation/check-docs-links-1793796720947-921400.log`.
- `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the 11 files named in What; no `src/`, `tests/` or `issues/` paths. Log: `implementation/check-diff-scope-1793796721042-921581.log`.
- `skills/AREA.md` path listing (review rule): `skills/chart-issues/SKILL.md`, `assets/`, `shapes.md`, `questions.md`, `standing-design.md` all exist; file stays 34 lines.

## Criterion check

- C1 files.md: chart row carries the full shapes.md "Chart records" list plus the original/copy signposts wording and the handover Mode-record signposts path, linking the skill's Handover section. Matches shapes.md lines 4–17 and SKILL.md `## Handover`.
- C2 plan-work.md: every D2 fact present and faithful to questions.md line 41 and SKILL.md Autopilot (`four to seven`, `two or three`, `no research line`, prioritize/give-up account, session lasts until a new door run surviving waits/compaction/handovers, resume takes the new run's signposts, original + verbatim copies, correction recorded with date and re-copied, conflict asked in one line, order and drop from signposts, per-mode unanswered rule, skill link). "Open a chart" names the mode/signposts first reply and `forks/signposts.md` as the session record, matching SKILL.md "Open".
- C3 autopilot.md: mid-chart signposts-first, presented-not-a-wait, order-but-never-drop with the would-be drop recorded, next chart not waiting in the signposts order, and the `signposts:` record line naming who answered and the chart holding the original — all match SKILL.md `## Autopilot`/`## Drain` and shapes.md's `signposts:` field.
- C4: the five named pages link `docs/use/autopilot.md` instead of restating modes; no "you answer every fork" claim remains on them. limits.md keeps the approvals clause locally. words.md "Signposts" entry restates per-mode answering — Nit, below.
- C5: TAKEN clause matches `chartRow` (`forks/*.md` with non-empty `## Taken`, signposts included); skills.md names the signposts round and the three modes; SVG label `A answers the forks` is 19 chars in the same text node and box; AREA.md gains the chart-issues line.
- C6: links green and scope diff clean (logs above); `set-the-signposts` heading unchanged.

## Findings

### Nits

1. words.md "Signposts" entry ends with "Answered per the mode: by you in manual and autopilot, by A under full autopilot." — a small mode restatement on a page C4 otherwise makes link-only. The named What entries are "Chart door" and "Fork" only, and the term entry for the mode's own concept keeps the fact at its owning term; changing it would also rephrase the one-line-per-term style. Deferred: a fix would restyle one entry against its page convention. Promote to Fix if B reads C4 as covering every mode mention on words.md.
2. The SVG label `A answers the forks` is verified only by character count and sibling sizes, not a rendered screenshot. Deferred: no rendering check exists in the suite; 19 chars is well inside the 26–27-char-neighbour box at the same font. Promote if the label is made longer later.

## Verdict

ready
