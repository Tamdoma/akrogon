# Stage palette and Needs-you shortcut: seat A notes

## 1. Which stage gets which color

Pick: plan = cyan (`ansi6`), implement = blue (`ansi4`), check = magenta (`ansi5`), merge = green (`ansi2`), parked = grey (`dim`), failed = red (`ansi1`, real block). Red and yellow stay reserved (red = real block, yellow/amber = slow merge warning).
Reason: practitioners agree on three anchors: red = failed/blocked, green = good/ready, grey = inactive (Atlassian Lozenge: danger "failed, blocked", success "completed, approved", neutral "draft, inactive"; Primer: danger, success). They disagree on in-progress: Atlassian uses information/blue ("in progress, reviewing"), Primer uses attention/yellow ("queued PRs, running tests"). Yellow is taken by the slow-merge warning here, so Atlassian's blue wins for active work. The three active stages then step through the cool hues cyan → blue → magenta toward green at merge, so the order reads left to right like the lifecycle.
Cost: implement changes from the CLI's yellow (status.ts phaseColor 33) to blue, and plan from blue to cyan; the terminal and the panel differ until the CLI follows (not in this scope).
Rejected: the CLI's colors as they are (implement yellow collides with the amber slow-merge alert, operator 3b/5 locks). Rejected: Primer's purple for "done": merged leaves only appear in Last merges, where the word says it.
Evidence: practitioner · Atlassian Design System, Lozenge, https://atlassian.design/components/lozenge/examples, read 2026-11-03 · Primer, Color overview, https://primer.style/foundations/color/overview, read 2026-11-03 · searches for Linear and Carbon status colors found only third-party write-ups (Linear: blue in progress, green done, red blocked; Carbon: color plus a second cue, never color alone).

## 2. How a pill is drawn

Pick: colored dot (6 px, the stage color) + stage word in `t.foreground` on a background of the stage color at 15% alpha, radius 4, no border. Color comes only from the theme's own ANSI slots, so saturation and lightness follow whichever Omarchy theme is on (the theme author tuned them together).
Reason: measured contrast of colored text on that pill, across the 25 installed Omarchy themes (/usr/share/omarchy/themes and ~/.config/omarchy/themes, read 2026-11-03): cyan median 5.44:1 but 9 themes under 4.5:1; blue 10 under; magenta 13 under; red 15 under (WCAG AA for small text is 4.5:1). Colored words fail on a third of the themes; a colored dot with foreground text never does. Current theme sage-terra: blue text would be 4.20:1.
Rejected: colored text (fails contrast on many themes); solid filled pills (louder than anything in the shipped mods, which use 9-15% tints: changes/main.js:170 `ansi2+"18"`, agents-by-tab/main.js:203 `blocked+"26"`).
Pitfall: two stages read alike on a theme with close cyan and blue. Removed by the word in the pill; color is the second cue, never the only one.

## 3. Needs-you shortcut

Pick: `ctrl-b a` ("answer"). Free in prefix ACTIONS (herdr-setup/mods/prefix/main.js), one hand, sits next to the operator's habit of answering rounds.
Rejected: `ctrl-b n` (tab.next, taken). `ctrl-b shift-o` (pairs with `o` "jump to the agent that needs you", but shift in the prefix means space actions: shift-c/r/k/p/n/g). `ctrl-b y` ("you"): free but reads oddly.
