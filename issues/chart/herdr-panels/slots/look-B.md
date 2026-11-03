# Slot B: panel look

Evidence date: 2026-11-03. No visual changes or rendering probes were performed. Operator sources are cited by intake section; installed sources are better-than-training evidence. Design picks are recommendations from those sources.

## Q1. Panel shape

**D1. Pick:** keep today's Files/Changes card treatment for all four views: radius 10, one 1px `border`, `background` fill, 42px title/header, 14px horizontal header padding, 13px body text. Keep existing list/diff styling. New Tasks/Needs-you content uses the same outer treatment, without another enclosing card. At full width the outer panel fills the available area but keeps the same radius, spacing and type sizes. Full width gives content more room, not larger controls. Cost: this preserves a rounded panel inside the otherwise flat terminal layout.

Tasks uses the settled two-line rows, approximately 48px high, with aligned 16px logos, a strong slug and muted metadata. Hover/selection use native theme backgrounds. Needs-you uses compact identity headers followed by wrapping question text and the reply controls. Neither list needs a separate border/shadow around every row. Keep file/diff viewports expansive; avoid a new width cap on the full-width panel.

**Rejected:** flattening Files/Changes to radius 0 during this work, which changes an interface the operator likes. Large dashboard cards, additional shadows and arbitrary branding colors. Enlarging padding/fonts just because the panel is full width.

**Evidence:** operator tier: intake **Source: operator 2026-11-03**, message 2 asks for beauty with the same theme; **Round 2** preserves existing interfaces; **Round 4** explicitly adds full-width mode. Installed: `/home/ivan/.config/herdr-app/mods/files/main.js:159`, `:160`, `:164`; `mods/changes/main.js:179`, `:183`, `:187`. The flat terminal's separate radius-0 treatment is at `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:116`.

**Pitfalls removed:** one outer frame prevents doubled borders; unchanged scale prevents full-width mode becoming a different design. **P1** checks populated, empty, error and long-content states at 368px and full width.

**Additional question:** none needed if keeping today's card style is accepted. A radius change would be a separate visible choice, not an inferred meaning of “flat.”

## Q2. Harness logos and two seats

**D2. Pick:** match the approved left Agents rows exactly: use the live target's `Program.icon`, 16px square, `svg` tinted `theme().foreground` only when `Program.tint` is true, otherwise `image` with its original colors. Preserve aspect ratio and reserve a stable icon slot. Do not color the logo by status or add harness names after it.

A two-seat Tasks row shows two separate compact items, `A [logo]` and `B [logo]`, in a stable order, with seat status shown separately. The letters identify lifecycle seats, not harness names. They remain necessary when both seats use the same harness. Keep the identity visible beside each Go to A/B action in expanded details. Needs-you uses one logo for its exact agent.

Before the port, Tasks must distinguish planned seat configuration from a verified running program. Use a Program logo only through a proven canonical program-table lookup; never infer one from a tab title, slug or a guessed harness-name map. If no verified Program is available, show the seat letter without inventing a brand. Cost: some pre-port rows can lack a logo until the data contract supplies the identity.

**Rejected:** downloaded replacement logos, universal monochrome masks, stacked/overlapping A/B logos, status-colored brand marks, and reading next-start config as proof of the currently running harness.

**Evidence:** operator tier: intake **Round 2**, A8 says logos already identify harnesses and adds no names. Installed: `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:66`, `:284`; `/home/ivan/.config/herdr-app/herdr.d.ts:137`. Manual **Programs: `programs.json`** establishes the shared table and live-program precedence. Targeted status prints “Seats for the next agent start” (`src/status.ts:500`), which is a different fact.

**Pitfalls removed:** **P2** verifies Program identity from the producer/live join, custom program-table overrides and two identical harnesses. Missing identity stays visible as missing, rather than displaying a convincing incorrect logo.

**Additional question:** does the Tasks producer provide canonical planned Program identity before the port, or only harness configuration strings? That must be settled before promising logos on every pre-port row.

## Q3. Top bar, narrow windows and count

**D3. Pick:** retain Files and Changes first, then Tasks and Needs you in the same button style. Use 14px line icons and the current 26px button height, 12px labels, 8px horizontal padding and radius 6. Tasks gets a checklist glyph; Needs you a speech-bubble glyph. Use small SVG assets owned by the tabs clone, with the same stroke style as its existing icons. The one agreed expand/shrink control stays beside this group, visible only while a panel is open, with “Full-width panel” / “Side panel” tooltips. It controls the panel, not the application window.

Keep labels at normal widths. When available toolbar space is insufficient, collapse all four panel labels together to icons, retaining tooltips, accessible names, active state and the count. Let the existing terminal-tab strip keep its horizontal scrolling. Measure available space rather than guessing from character counts or assuming a particular sidebar width. Cost: icon-only controls are less discoverable in narrow windows, so they need hover and keyboard identification.

Needs you gets a small count of its actual local list rows after the settled filters, including retained draft rows. Hide the badge at zero, but keep its button. This is an attention-card count, not a claim to count only unanswered questions. Use neutral styling for done-only rows; use the real-block styling only when a listed agent is actually blocked. Do not include another session's agents.

**Rejected:** a new toolbar row, permanently shrinking the tab strip to keep every label, an always-red count, hiding Needs you when empty, and tooltip-only identification without an accessible label.

**Evidence:** installed: `/home/ivan/.config/herdr-app/mods/tabs/main.js:82`, `:84`, `:90`, `:95`, `:97`; `/home/ivan/.config/herdr-app/gpui-kit.d.ts:725`, `:947`, `:981` supports size observation, native tooltips and accessibility labels. Operator tier: intake **Round 2** defines which rows count; **Round 3b** keeps prefix behavior; **Round 4** establishes the shared full-width control.

**Pitfalls removed:** **P3** checks long tab names, all four buttons, window controls, zoom and a count badge while resizing. Compacting must not oscillate between layouts or hide the toggle. Preserve existing panel selection/close behavior and `ctrl-b f`/`ctrl-b t` semantics.

**Additional question:** approve icon-only labels under width pressure. This changes only the toolbar's narrow presentation, not its actions.

## Q4. Theme colors and missing tokens

**D4. Pick:** use the documented tokens below, without changing the Omarchy theme or writing color literals/alpha suffixes into the new UI.

| Code | Meaning | Tokens |
|---|---|---|
| C1 | Real block: failed, delivery error, missing key, deploy failure, unreadable repo, verified blocked prompt | `ansi1` text/icon or border; readable neutral background; explicit reason label |
| C2 | Existing slow-merge alert and other nonblocking warnings | `ansi3` plus a text label; never color elapsed time |
| C3 | Normal phase pill, paused/stopped tags, queue place | `muted` text on `raised`, with `border` where needed |
| C4 | Live agent status | `working` native spinner, `done` completion mark, `idle`/`unknown` indicators; blocked uses C1 in these new panels |
| C5 | Content and interaction | `foreground` primary text, `muted` supporting text, `hover`/`selected` row fills, `accent` focus |
| C6 | Reply input and Send | `input`/`border` and `accent` focus; `solid` + `solid_foreground` primary action |

The documented theme API has no dedicated `error`/`danger` or `warning` token. `ansi1` and `ansi3` supply the existing palette's red and amber roles without adding theme keys. `blocked` is a semantic attention color, not a documented promise of literal red, so it should not be assumed to satisfy the operator's red requirement. Do not recolor the existing left Agents list.

Use `dim` sparingly for nonessential secondary decoration. In the current Omarchy palette, calculated contrast against `background` is 3.07:1 for dim, 8.96:1 for muted, 5.16:1 for ansi1 and 7.60:1 for ansi3. Required small metadata and error explanations therefore use muted/foreground rather than dim. Cost: color meaning is reinforced with words instead of depending on hue alone.

**Rejected:** red for long elapsed time, stopped/paused controls, or every finished agent; a different color for every phase; fixed hex palettes; and adding a new theme solely to obtain error colors.

**Evidence:** operator tier: intake **Round 3b**, 2a explicitly defines real-block red and uncolored time. Installed: `/home/ivan/.config/herdr-app/herdr.d.ts:260` documents the tokens; `/home/ivan/Work/infra/herdr-setup/omarchy/apply-herdr-app-theme:32` writes the palette and chrome overrides. Settings selects omarchy, flat has no theme override in the inspected main/infra saved state, and the palette file is `/home/ivan/.config/herdr-app/themes/omarchy.json`. Contrast figures were calculated read-only from that file using relative luminance.

**Pitfalls removed:** retrieve theme values during rendering so changes update existing rows and previews. **P4** tests the current palette and a light theme, all semantic states, selected/hovered blocked rows, and brand glyph visibility. Color never replaces the failure reason or seat label.

**Additional question:** none beyond accepting this mapping. No new token is required.

## Probes before handoff

- **P1. Panel geometry:** inspect all four views at side/full width, including empty, populated, failed and long-content states. Pass: one consistent outer frame, unchanged Files/Changes organization, no clipped question/diff text or new full-width cap.
- **P2. Logo identity:** in a throwaway app home, render the same terminal in Agents and Needs you/Tasks, including tint/full-color/custom Program entries and two equal harnesses. Pass: identical 16px assets/tint and unambiguous A/B ownership. Prove planned-versus-live resolution before promising pre-port logos.
- **P3. Toolbar:** narrow and widen a real window with all controls and long names, including increased zoom. Pass: icons/count/toggle remain reachable, labels collapse predictably, native tooltips/accessibility labels identify controls, and existing shortcuts/actions remain intact.
- **P4. Theme:** switch palettes in a throwaway session and exercise every row/alert/reply state. Pass: no stale colors, all text remains legible, real-block red and warning amber follow palette tokens, and only valid attention rows affect the badge. Run `herdr-app check` and inspect the actual app; a passing check alone cannot prove layout.
