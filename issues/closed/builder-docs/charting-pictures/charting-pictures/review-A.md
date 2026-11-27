# Review A: charting-pictures

check.review, slot A, 2026-11-27. Base `4aff0f6881e486a15fd98db8d595644469cd4901`. Reviewed head `74c5659eb2e649a9177e6eddaf58b687df2b3a87`. Reviewed blind (B's review not read).

## Scope reviewed

`git diff 4aff0f68..74c5659e`: 6 files. Two new SVGs, one image line each in guide pages 04, 06 and 07, and the picture lines plus a new `## Pictures` section in `docs/reference/where-things-go.md`. Nothing outside the plan's owned paths changed. The design's exclusions hold: no guide prose changed, and the old pictures and the other four pictures are untouched.

## Against the plan and brief

- D1, D2: the embeds sit at the planned lines with the planned alt text. Each alt text says what the picture draws, checked against the renders.
- D3: no `href`, `<use>`, `<image>`, `<script>`, `@import`, `@font-face` or `animation` in either file (`check final-forbidden-search: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-forbidden-search-1795777660623-3448887.log`, grep exit 1).
- D4: both files use the shared frame. All colours are tokens listed in where-things-go.md. The worker's off-palette `#f8f6ee` was replaced in d73b6db2.
- D5: "created by" plus a group with `<title>Tamdoma</title>` holding the 8 logotype paths in ink, bottom-right, in both files.
- D6: mode-and-route shows three modes and two routes, a solid No autopilot to Direct line, dashed lines from every mode to Lifecycle, and "only with No autopilot" under Direct. Every label is an approved word.
- D7: charting-session shows the c-client-portal tab with six numbered stations matching the guide's step headings, consultants B and C on the territory map, fork cards under Decisions, and the hand-off splitting into Lifecycle and Direct. The four stations the brief names are drawn in sage.
- D9: where-things-go.md states card, palette, strokes, fonts, mark, still and layout. Its pointer `docs/pictures/mode-and-route.svg` exists.
- My reading of the renders (C4 is B's step; this is A's own read): `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/mode-and-route-light.png`, `-dark.png`, `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/charting-session-light.png`, `-dark.png`. Both pictures read on white and on #0d1117 because the card is opaque. Nothing overlaps and no text overflows.

## Verification evidence (head 74c5659e)

- P1 `check final-embeds: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-embeds-1795777660158-3448512.log`
- P2 `check final-svg-style: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-svg-style-1795777660314-3448584.log`
- P3 `check final-style-rules: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-style-rules-1795777660422-3448696.log`
- docs-links `check final-docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-docs-links-1795777660533-3448791.log` (13 pass)
- `akrogon verify` on 74c5659e: green (format, typecheck, test 0; `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-test-1795777773794-3449185.log`). The head is unchanged since, so nothing was rerun.

## Docs, tests, area files

- No `AREA.md` is in the diff. No test file was added or changed. The plan's proofs run through the commands plan.md names.
- Documented behavior: `docs/reference/where-things-go.md` is the only home of the picture rule (plan read-first grep), and it is updated. No other documented behavior changed.

## Findings

No Fix.

- Nit 1 (logotype size). The logotype is drawn at scale 0.05, about 56x20 px, so the wordmark letters are about 7 px tall. GitHub's content column shrinks a 960 px image to about 880 px, which makes them smaller still. It is legible in the local renders and the brief asks for a small mark, so this is deferred. Evidence that would make it a Fix: a GitHub-width screenshot where "Tamdoma" cannot be read.
- Nit 2 (charting-session layout). The Lifecycle outcome box sits partly under station 5. The dashed connector clearly branches from station 6, so the meaning holds. Deferred because the renders read correctly. Evidence that would make it a Fix: B's or a reader's answer to "what does this show" pairing Lifecycle with step 5.
- Nit 3 (wording). The note under Direct reads "charting agent builds, consultant B reviews" without "the". Deferred because it is a width trade-off on a soft note and the meaning is plain.

## Verdict

nits
