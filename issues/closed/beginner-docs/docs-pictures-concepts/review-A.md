# Review A: docs-pictures-concepts

Base `7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8`. Reviewed head `51b8207614761e0926d1969468a2e52124cf406f`. `git status --porcelain` is empty, and the head is 4 commits ahead of the base.

## Scope

The diff adds the nine `docs/pictures/*.svg` files (633 lines) and nothing else, which matches plan D1 and the design's exclusions. It touches no `issues/` path, no `AREA.md`, no test and no doc page. No documented behavior changed: no page embeds these pictures yet, and the consumer leaves add alt text.

## Verification

- C1, files exist and are well-formed: `check pictures-present: 0` (report). Meaning was checked against live source in this review:
  - phases: the edges match `src/routing.ts:28-36` exactly.
  - two-seats: check.repair → merge or check.fix, check.fix → review, and the re-check is B's (`src/routing.ts:33-34`).
  - config-layers: ISSUE.md, then EPIC.md for a leaf under an epic, then repo, then machine (`src/config.ts:147-182`).
  - project-folders: the four `.jsonl` files are written under `issues/` (`src/log.ts:48`, `src/timing.ts:74`, `src/attempts.ts:51`, `src/verify.ts:42`). `issues/seeds/` is gitignored (`.gitignore:4`, `src/init.ts:62`). Leaving out `red-records.jsonl` is correct because `grep -rn red-records src skills plugin` finds nothing.
  - machine-parts: seat panes are adopted into the leaf slice (`src/next.ts:456`, `src/scope.ts:146`). Machine config is `~/.akrogon/config.yaml` (`src/config.ts:197-209`).
  - chart-door: one fork per round (`skills/chart-issues/SKILL.md:45`), and a disagreement-only rebuttal (`:55`).
  - ways-to-run: autopilot has no direct route (`:100`, `:139`).
  - The six spec-versus-source departures in the report all follow the source. The design says code wins.
- C2, picture check: the report cites run-check logs for every step.
  - Reduced-motion screenshots at load and at 4s match pixel for pixel on all nine.
  - With motion on, the three moving pictures change between shots and the six still ones do not.
  - I checked the CSS directly. Each of the three moving files' style ends with `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`.
  - The keyframes change only `stroke` and `stroke-width`, and their 0% and 100% frames equal the at-rest style, so nothing is hidden at rest.
  - Only those three files contain keyframes. No file has a script, a foreignObject or an external href.
  - Screenshots at 800px and 360px on white and #0d1117 exist in the report's paths. I viewed them while implementing.
- Checks: `akrogon verify` is green on the reviewed head. format, test (1115 pass, 0 fail) and typecheck logs are in the report.

## Findings

No Fix.

### Nits

- N1 phases.svg: the "a fix verdict" label sits at about (618, 795) in the screenshot, between the check.review → check.repair edge and the check.repair → check.fix edge. A reader could tie it to the wrong edge. It is deferred because the edge is still the nearest line and the meaning holds. A consumer-page reader actually misreading it would promote it.
- N2 360px at 1x density: labels render about 7 CSS px tall, which is legible but small. At 3x mobile density they are sharp. It is deferred because plan D2 chose a 640-wide layout and the brief's readability result holds at real phone density. A 360px 1x screenshot where a label cannot be read would promote it.
- N3 factory-overview: "independent review" reaches "command lands" only through "repair if needed". There is no direct pass edge. It is deferred because the spec's chain is exactly "review → repair if needed → lands", and "if needed" carries the skip. A source showing beginners misread it as "repair always happens" would promote it.

## Verdict

nits
