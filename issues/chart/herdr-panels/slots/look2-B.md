# Slot B: stage palette and Needs-you shortcut

Research and local measurements: 2026-11-03. No app, theme, binding or terminal state was changed. Rendered-color and keyboard probes remain pending.

## Q1. Stage colors

**D1. Pick:** separate stage identity from urgency. Use the theme's existing palette slots below, retain exact stage text, and reserve success green for the completed merge. Not every stage needs a unique hue.

| Code | Stage | Token | Reason |
|---|---|---|---|
| S1 | Plan and its substeps | `ansi4` | Informational/planning family; retains the CLI's blue association. |
| S2 | Implement | `ansi6` | Active execution, without borrowing warning amber. |
| S3 | Check and fix rounds | `ansi5` | Retains the CLI's established check category. Purple does not mean an error. |
| S4 | Merge, still pending/running | `ansi6` | Integration is execution still in progress; shares Implement's activity family. |
| S5 | Merged | `ansi2` | Completed outcome; add the explicit Merged label/check mark. |
| S6 | Failed or another real block | `ansi1` | Reserved danger/error role. |
| S7 | Parked | Neutral `foreground`/`border`, no colored tint | Deliberately inactive, not a failure. |
| S8 | Slow-merge alert | `ansi3` | Reserved nonblocking warning; separate from the stage pill and time. |

Cost: Implement and Merge share a hue, and the UI differs from CLI yellow-for-Implement/green-for-Merge. Labels distinguish the exact stage. This avoids claiming that active merging has already succeeded.

**Practitioner evidence and synthesis:** IBM's Carbon team maintains an enterprise product design system. Its [status-indicator guidance](https://www.carbondesignsystem.com/building-blocks/core/patterns/status-indicators) separates severity from contextual lifecycle indicators, associates blue with progress, green with normal/success, and gray with inactive work. Atlassian's team builds workflow UI for products such as Jira. Its [Lozenge guidance](https://atlassian.design/components/lozenge) separates information/in-progress, success, warning, danger and neutral roles. Both support reserving attention colors and keeping descriptive labels. They differ on purple: Carbon associates it with undefined/outlier states, Atlassian with discovery. Neither says “purple means code review,” nor defines our four-stage palette. The Check hue is therefore a local convention retained from inspected CLI code, not a researched universal meaning. Product-specific categories can differ; urgency meanings should remain consistent.

**Other evidence:** operator tier: intake **Round 3b** and **Round 5** reserve real-block red and require researched stage colors. Better-than-training: `src/status.ts:259` contains the existing phase hues; `/usr/share/omarchy/default/themed/ghostty.conf.tpl:8` maps ANSI slots to theme colors. Installed palettes include substantial hue variations: Rose Pine's named green is blue-toned and cyan is coral (`/usr/share/omarchy/themes/rose-pine/colors.toml:20`). These are theme slots, not promises of identical physical hues across themes.

**Rejected:** copying all CLI hues unchanged, because ordinary Implement would look like the reserved amber warning and active Merge would use completed-success green. All active stages in blue is semantically defensible but loses most requested stage differentiation. A new fixed RGB/HSL rainbow would ignore the operator's themes. Assigning unique hues to every planning substep/fix round adds categories without new meaning.

**Pitfalls removed:** color existing phase families without adding or resurrecting lifecycle states. Show stop/pause as separate neutral tags. A real block gets its explicit red reason even while the underlying stage remains visible. Validate labels and symbols in grayscale; do not make stage interpretation depend on hue alone.

## Q2. Pill saturation and contrast

**D2. Pick:** 20px-high pill, 11px medium text, 6px horizontal padding and radius 4. Text is always `theme().foreground`. Paint a separate background layer using the stage token at 12% opacity over `theme().background`; keep the label fully opaque. Use a 1px stage-token border as a redundant decorative cue. Parked uses a neutral border without a stage tint. Do not lower opacity on the whole pill, which also fades its text. No fixed hue values or bright ANSI variants.

The fill inherits each theme's actual saturation; the small translucent area keeps it quiet. This is an appearance choice, not a claim that 12% is an accessibility standard. Cost: more restrained color than solid badges, and the border alone is not a reliable status signal in every palette.

**Measured, modeled sRGB composition on current sage-terra:**

| Label | Token | Foreground-text contrast against 12% tinted fill |
|---|---|---:|
| Plan | `ansi4` | 9.89:1 |
| Implement / Merge | `ansi6` | 9.45:1 |
| Check | `ansi5` | 9.87:1 |
| Merged | `ansi2` | 9.52:1 |
| Failed | `ansi1` | 10.03:1 |
| Slow alert | `ansi3` | 9.42:1 |

I also modeled these six palette slots in all 25 installed built-in/custom `colors.toml` files. Foreground text on the 12% fills remained above 4.5:1; the minimum was 5.64:1 in Rose Pine. Using the colored token itself as small text failed in several palettes, reaching 1.89:1 in Rose Pine. Even current sage-terra gives only 4.43:1 for blue text on its blue tint. These are calculations from palette inputs, not sampled app pixels or rendered QA.

**Evidence:** better-than-training: [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) sets 4.5:1 for ordinary small text. Source inputs: `/home/ivan/.config/herdr-app/themes/omarchy.json`; `/usr/share/omarchy/themes/*/colors.toml`; `/home/ivan/.config/omarchy/themes/*/colors.toml`. The ANSI mapping comes from `/usr/share/omarchy/default/themed/ghostty.conf.tpl:7`; the hook copies that palette (`/home/ivan/Work/infra/herdr-setup/omarchy/apply-herdr-app-theme:36`). The installed builder supports opacity on a separate element (`/home/ivan/.config/herdr-app/gpui-kit.d.ts:1389`).

**Rejected:** colored small text in every theme, solid saturated fills, global theme-token overrides, and runtime saturation/contrast correction machinery. The measured theme foreground already solves the tested readability problem with fewer moving parts.

**Pitfalls removed:** give the pill its own background base so hover/selected row fills do not change the assumed text backdrop. Re-read theme tokens during render. Before handoff, render sage-terra dark/light, Catppuccin Latte and Rose Pine, including selected/hovered rows. Pass: readable text, visible stage labels, unchanged time color and no faded foreground. Retain label/check/error symbols when colors are hard to distinguish.

## Q3. Needs-you shortcut

**D3. Pick:** `ctrl-b i`, for Inbox. The prefix already captures the second key, so this adds no new global modifier combination. `i` is free in both the maintained and installed ACTIONS inspected today, and is not among the settled reservations. Cost: the button says Needs you while the mnemonic is Inbox. Show “Needs you — Ctrl+B, I” in its tooltip/help.

Use the same panel controller as Tasks: select/open Needs you at full width, or close it when it is already showing. Preserve `ctrl-b o` as the existing jump-to-agent action, `ctrl-b t` as the settled Tasks toggle, and `ctrl-b f` as open-only Files. The new key must not send a reply or select a particular agent.

| Code | Candidate | Inspected collision or cost |
|---|---|---|
| K1 | `ctrl-b i` | No ACTIONS collision; recommended Inbox mnemonic. |
| K2 | `ctrl-b u` | Also free, but “you” is a less direct mnemonic than Inbox. |
| K3 | `ctrl-b n` / `ctrl-b N` | Taken by next tab / next space. |
| K4 | `ctrl-b o` | Taken by jumping to the blocked/done agent. Replacing it removes a distinct useful action. |
| K5 | `ctrl-shift-n` | Already creates a space. |
| K6 | `alt-i` or another apparently free global key | No explicit `alt-i` binding was found in this app config, but that does not prove freedom in every foreground harness. A new global interception is unnecessary when the prefix has a clear free key. |

**Evidence:** better-than-training: `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:28` defines ACTIONS, `:37` binds o, `:51` n, `:57` Shift+n, and `:85` dispatches the captured key. `/home/ivan/Work/infra/herdr-setup/keys.json:48` binds Ctrl+Shift+N and `:61` binds Ctrl+B. Operator tier: intake **Round 3b** reserves t for Tasks; **Round 5** requests a free intuitive Needs-you shortcut. These are scoped collision checks, not an assertion about every application on the PC.

**Rejected:** reusing n/o, adding a second global shortcut, or changing t/f semantics to make the keys symmetrical.

**Pitfalls removed:** before handoff, test `ctrl-b i` from a terminal, another panel and an active reply input. Pass: it opens/closes Needs you through the shared full/side transition, keeps panel memory intact, restores terminals on close and never inserts the i into a draft or terminal. Confirm o, t, f, n and Shift+n retain their separate actions.
