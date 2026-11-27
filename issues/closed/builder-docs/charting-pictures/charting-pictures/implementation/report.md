# Implementation report: charting-pictures

Slot A, implement, 2026-11-27. Base `4aff0f6881e486a15fd98db8d595644469cd4901` (= origin/main at both refreshes; no refresh moved the branch). Committed head `74c5659eb2e649a9177e6eddaf58b687df2b3a87`. Mode: delegated (`implement: subagents`), wave 1 = U1, U2, U3; wave 2 = U4.

## Changed files and reasons

| File | Unit | Commit | Reason |
|---|---|---|---|
| `docs/pictures/mode-and-route.svg` (new, 960x440) | U1 | af83265f | Charting mode against Build route; Direct only with No autopilot (D5, D6) |
| `docs/pictures/charting-session.svg` (new, 960x460) | U2 | 8aae5ad1, d73b6db2 | One charting session in the c- tab, six stations matching the guide steps (D5, D7) |
| `docs/reference/where-things-go.md` | U3 | 5f4c9a59 | Line 11 points at the new `## Pictures` section stating card, palette, strokes, fonts, mark, still, layout (D9) |
| `docs/guide/04-a-charting-session.md`, `06-charting-mode.md`, `07-build-route.md` | U4 | 74c5659e | One image line each with the D2 alt text (D1, D2) |

A repair (d73b6db2): U2 added an inner-frame fill `#f8f6ee`, which is not a Tamdoma token. A changed it to the parchment token `#f4f1e6`. Both SVGs now use only tokens listed in where-things-go.md (`grep -oiE '#[0-9a-f]{6}'` over both files).

Worker notes folded in: U1 added a `.h2` class (17 px, weight 600) for column headings and wrote "charting agent builds, consultant B reviews" without "the" for width. U2 added the subtitle "In the c- tab, from your request to the hand-off review" and "your request" under Intake; the Lifecycle outcome box sits partly under station 5, with its connector branching from station 6. No token value changed. Worker briefs: `implementation/brief-1.md` to `brief-4.md`, shared frame `implementation/skeleton.txt`.

## Proof per criterion (all on head 74c5659e unless noted)

- C1 (exist, embedded, alt text, content, words)
  - P1 embeds: `check final-embeds: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-embeds-1795777660158-3448512.log` (ok).
  - DL links: `check final-docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-docs-links-1795777660533-3448791.log` (13 pass, 0 fail).
  - P2 required names, retired words absent, parse: `check final-svg-style: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-svg-style-1795777660314-3448584.log` (ok).
  - Content and alt text (model-choice reading, plan Implementation notes): A looked at the light and dark renders. mode-and-route shows the three modes on the left, the two routes on the right, one solid line from No autopilot to Direct, dashed lines from all three modes to Lifecycle, and the note "only with No autopilot". charting-session shows the c-client-portal tab with six numbered stations (Intake, Signposts and the needs sheet, Territory map with consultants B and C, Decisions with fork cards, Charting mode and Build route, Hand-off review splitting into Lifecycle and Direct). Both alt texts say what is drawn. Final judgment is B's (C4).
- C2 (style, no outside resource)
  - P2: as above.
  - Brief's search: `check final-forbidden-search: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-forbidden-search-1795777660623-3448887.log`. `grep -nE "href=|<script|@import|@font-face|animation"` over both files printed nothing (grep exit 1). "created by" count 1 and `<title>Tamdoma</title>` count 1 in each file.
- C3 (style rules): P3 `check final-style-rules: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-final-style-rules-1795777660422-3448696.log` (ok).
- C4 (B's rendered reading): A's renders, made on d73b6db2 (the SVGs have not changed since):
  - `check render-mode-and-route: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-render-mode-and-route-1795777579898-3442316.log`: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/mode-and-route-light.png`, `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/mode-and-route-dark.png`
  - `check render-charting-session: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-render-charting-session-1795777580069-3442386.log`: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/charting-session-light.png`, `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/charting-session-dark.png`
- C5 (checks): `akrogon verify` on 74c5659e: setup 0, format 0, typecheck 0, test 0 (`/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/check-test-1795777773794-3449185.log`). Result: `verify leaf 74c5659eb2e649a9177e6eddaf58b687df2b3a87: green`. Wall time 1m50s.

## Tests

No test file was added or changed (design: "No new test"). No `Test-Change` trailer is needed.

## Known limitations

- Label widths were checked only with this host's system sans font. Each box keeps about 20 percent slack for other readers' fonts.
- The logotype is about 56x20 px. It is legible in the renders but small, as the brief asks.
- The old pictures and their embeds are untouched. guide-pictures owns them.

## Unverified criteria

- C4 is B's review step. A's reading is above.
