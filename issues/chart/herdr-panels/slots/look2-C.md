# Stage palette + Needs-you shortcut — seat C notes

Facts verified 2026-11-03: phaseSchema at src/routing.ts:2-10 (plan.synthesis, implement, check.review/repair/fix, merge, merged, failed), CLI phaseColor src/status.ts:263-270, sage-terra colors.toml (read today), all installed Omarchy palettes /usr/share/omarchy/themes/*/colors.toml (24 themes grepped), prefix ACTIONS herdr-setup/mods/prefix/main.js:28-59, keys.json global/terminal tables. Contrast computed below (WCAG relative luminance). No web tool available — practitioner sources cited from model-knowledge, named with the searches I ran (local greps of Omarchy palettes and shipped mods only).

## Q1 — Which stage gets which color

**Pick.** Follow the CLI's own map (it is the palette the operator already reads), expressed as theme tokens, with one change — `merged` gets no pill:

| stage | token | sage-terra | why |
|---|---|---|---|
| plan.synthesis (+ retired plan.* rows) | `ansi4` | blue #7F9AA8 | new/thinking/informational |
| implement | `ansi3` | amber #D6AE64 | in-flight, attention-adjacent |
| check.review / check.repair / check.fix | `ansi5` | magenta #B98E91 | review state, distinct from every reserved color |
| merge | `ansi2` | green #A3B18A | landing/success |
| failed | `ansi1` | red #D47C61 | reserved: real blocks only |
| parked | `t.dim` | #687061 | de-emphasized by design |
| merged rows (Last merges) | none, `t.muted` | — | pill would be uniform noise; solves the purple collision |

Reasoning against the reserved meanings: `ansi1` is never used for a phase (failed is not a phase pill the operator tracks as progress — it's an alert); `ansi3` amber shared between implement-pill and slow-merge-alert reads consistently ("time-related attention") rather than colliding, because they appear in different row anatomy (pill vs alert line). Every phase pill color is a *position* in the ansi table, not a hue: degenerate themes (matte-black, where green=#FFC107 and blue=orange) still render theme-coherent, just hue-shifted — same rule terminals already live under.

**Practitioner grounding** (model-knowledge; searches run: greps of the 24 installed Omarchy colors.toml, shipped mods, no web):
- GitHub Primer (primer.style, GitHub's own design system, the most-referenced code-review status palette): green=open/success, purple=merged, red=danger, amber=attention. Why hear them: they own the largest PR-review UI; their one idiosyncrasy is purple-for-merged.
- CI status conventions (GitHub Actions/GitLab CI badges): blue=running, green=success, red=failed, grey=skipped, amber=pending. Why: the operator reads these daily in merge contexts.
- VS Code testing/SCM tokens: pass=green, fail=red, modified=blue, queued=neutral.
- Agreement: red is always failure; green is always completion; amber is always "attention pending"; blue is informational/in-progress. Disagreement: purple-for-merged (GitHub) vs green/neutral-for-done (CI, VS Code). Resolved by giving merged no pill — the fork doesn't need to take a side.
- The CLI precedent (src/status.ts:263-270) aligns exactly: plan 34→ansi4, implement 33→ansi3, check 35→ansi5, merge 32→ansi2, failed 31→ansi1, parked→dim. It is the one palette the operator demonstrably scans today — the strongest "fit" argument.

**Rejected.** R1 Neutral pills (my earlier seat-B/C/D position lost to operator's "pick a palette that makes sense" — settled, closed). R2 Re-hue the map (implement=blue): loses CLI parity for zero gain. R3 `merged`=ansi5 purple (GitHub): collides with check; dropping the pill is cheaper and the section is folded anyway. R4 `ansi6` cyan for implement: cyan≈blue in many themes (sage-terra #8FB9A8 vs #7F9AA8 both muted blue-green), blurs the plan→implement boundary; amber separates it in every palette.

**Cost.** In themes where ansi3 reads as green (matte-black ansi3=#FFC107 is amber anyway; hackerman's palette is monochrome-ish), "amber=implement" reads differently — accepted: tokens are positions.

## Q2 — How the pill is drawn

**Pick.** Text in the ansi token on a same-color alpha-tinted chip: `bg(color + "1F")` (~12%), `rounded(4)`, `px(5) py(1)`, `text_size(10)` — the geometry of changes' existing "N files" badge (changes/main.js:185), tint instead of the badge's border_1. The alpha-tint bg matches muted-theme saturation (sage-terra's accent is itself a desaturated #A3B18A) better than a flat `t.raised` chip, which would erase the color cue entirely.
Contrast (computed today, WCAG, text vs background #1F241E and vs raised #2A3028): ansi1 5.16/4.42, ansi2 6.93/5.94, ansi3 7.60/6.51, ansi4 5.33/4.57, ansi5 5.52/4.73, ansi6 7.28/6.23, dim 3.07/2.63, muted 8.96/7.67. All phase colors pass 4.4:1 on both surfaces — readable as 10-11px text. `dim` (parked) fails at 3.07: intentional, parked is de-emphasis; if a pill is wanted there, use `muted` not `dim`.
Cost: alpha-suffix (`color+"1F"`) is a hex-concat idiom, but it's the established mod pattern (board `color+"26"`), no literal hex.

**Rejected.** R1 Solid chip, `accent_foreground` text: five saturated blocks per repo is the loudest option; sage-terra is muted. R2 Colored text, no chip: pills lose their "tag" affordance vs the detail line (also ansi text on bg). R3 border_1 in the ansi color: border+text double-weights the color; the badge it copies uses neutral border because its text is muted — colored border is busier at 10px.

**Pitfalls.** Alpha values differ per token brightness? No — one alpha for all keeps the palette visually uniform; per-token tuning is the fiddling this fork exists to avoid. Done-criterion: shot shows all five pills side by side in sage-terra; also run once after an `omarchy theme-set` to a light theme (sage-terra-light exists) to confirm tokens still read.

## Q3 — Needs-you shortcut

**Pick.** `ctrl-b y` — "y" for *you*, the panel's own word; toggle semantics identical to `ctrl-b t` (open on Needs you; pressed while it shows, closes). Free in prefix ACTIONS (grep today: no `y` key) and unused in keys.json global/terminal.
- `y` survives the mnemonic test better than any free letter: Needs *you* starts with "you", and `ctrl-b o` (agent that needs you most, openNotificationTarget) already taught the operator "attention lives near o/y".
- Toggle like `t` (not open-only like `f`): 3b settled the toggle pattern for Tasks; same gesture set.

**Rejected.** R1 `ctrl-b i` (inbox): free, decent mnemonic, but "inbox" isn't the feature's name; `i` also reads as "info". R2 `ctrl-b q` (questions): free (`q` documented "not needed" in README), but q reads as quit in TUI muscle memory — bad neighbor for a close-adjacent action. R3 `ctrl-b a` (agents/attention): free but `a` is the most generic letter; in old herdr muscle memory `a` meant "attach". R4 Global `ctrl-shift-y`: free in keys.json, but the operator's pattern is prefix for features (t/f/o/w/s all live there); a global chord is reserved for window/tab mechanics (alt-*, ctrl-shift-*). R5 `n`: taken (tab.next); `shift-n` taken (space.prev).

**Cost/pitfall.** `y` is bound in the prefix popup's own context, so it never reaches programs — same containment as every other ACTIONS key (main.js:63-65, "Bindings in the popup's own key context take precedence"). Done-criterion mirrors `t`: `ctrl-b y` opens Needs you, second press closes, in a new space.

## Probes before build

- P1 Shot all five pills in sage-terra at 368px and full width; also in one light theme (sage-terra-light is installed) — settles alpha value and dim-vs-muted parked.
- P2 `ctrl-b y` pressed inside a program that binds `y` (e.g. confirm prompt): confirm the prefix context still captures it (structure says it does; one manual press verifies).

## Question this fork doesn't ask

- `merged` rows also appear as `done`-equivalents in "Last merges" — the folded section should show age and total time *uncolored* (round 3b), and my no-pill pick keeps that section visually one quiet list. State it so nobody adds a pill there later.
- The `land` tag (operator action pending) reuses `t.accent` from my earlier look note — confirm it isn't confused with phase pills: it's a tag on the detail line, not a phase pill, so it's fine; say it once.
