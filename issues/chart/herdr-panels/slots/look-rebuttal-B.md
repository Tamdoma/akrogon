# Slot B rebuttal

Evidence date: 2026-11-03. Installed sources are better-than-training evidence; design recommendations are inference.

- **F1. Do not change the Omarchy hook to obtain red.** Overriding blocked/working/done/idle changes the approved left Agents list too, because it already reads those tokens. Use `ansi1` locally for real blocks and retain the existing theme. Evidence: `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:201`, `:202`, `:204`, `:206`; `omarchy/apply-herdr-app-theme:37`; operator tier: intake **Source: operator 2026-11-03**, message 2, and **Round 2**, A8. The documented theme API does not promise that `blocked` is red (`/home/ivan/.config/herdr-app/herdr.d.ts:260`).

- **F2. A/B letters should identify two seats, and idle must not dim their logos.** Two identical harness icons cannot identify which seat owns which status/action. The approved list renders its main icon at 16px in foreground/full color; idle dims the name, not the icon. Preserve that distinction. Evidence: `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:284`, `:299`, `:349`; operator tier: intake **Round 3**, separate Go to A/B actions.

- **F3. A command's first word is not a proven Program resolver.** Wrappers and custom launch commands can differ from the program that actually runs. Next-start seat configuration also does not prove the current harness. Before promising pre-port logos, prove the canonical program-table lookup and label planned versus live identity. Otherwise retain the seat letter. Evidence: manual **Programs: `programs.json`** defines runtime precedence and custom run commands; `/home/ivan/.config/herdr-app/herdr.d.ts:137`; `src/status.ts:500`; B notes **Q2. Harness logos and two seats**.

- **F4. Corner notches and doubled borders are not established as measured visual defects by the cited code alone.** Keep that diagnosis pending an in-app comparison before using it to justify flattening the panels. Today's rounded card is the interface the operator asked to preserve. Evidence: `/home/ivan/.config/herdr-app/mods/files/main.js:159`; `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:90`, `:156`, `:178`; operator tier: intake **Round 2**. B's P1 requires the actual comparison.

- **F5. Narrow controls need more than tooltips.** Preserve accessible names and visible keyboard focus when labels collapse, and keep the count/toggle reachable. This was omitted from B's narrow-toolbar contract. Evidence: `/home/ivan/.config/herdr-app/gpui-kit.d.ts:944`, `:981`; B notes **Q3. Top bar, narrow windows and count**.

- **F6. Keep Files and Changes first.** Adding Tasks/Needs you after them preserves the existing order. Putting the new buttons first is a separate visible change that needs an operator choice. Evidence: `/home/ivan/.config/herdr-app/mods/tabs/main.js:97`, `:98`; operator tier: intake **Round 2**, “I don't want to be complicating the existing interfaces.”
