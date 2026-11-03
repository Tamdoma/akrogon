# Brief: needs-you-panel

## What

A new mod `needs-you` in the `needs-you` block of flat.json's `panel-body`. It lists this session's agents that are `blocked` (with hc's `kind`) and top-level agents that are `done`, each with logo, space/tab, kind or state, waiting time, the last lines of its screen and a reply box. When the agent's last reply carries coded options, option buttons fill an editable draft that Send submits; "Recommended" fills every recommended pick; "elid" sends at once. Clicking a row's name jumps to the agent. Straight outer edges.

## Why

The operator answers agents by finding the right tab; about 220 of 1,240 prompts in two weeks were coded replies such as "1a | 2b" and 263 were "elid" (intake "Agent findings").

## Done-criteria

1. With one blocked agent and one finished top-level agent in a throwaway session, both rows show with their logo, place, state or kind, waiting time and last screen lines without terminal chrome; a sub-agent shows only while blocked, and clicking its row opens it the way the Agents list does (D).
2. On the recorded screens in `issues/chart/herdr-panels/slots/fixtures/needs-you/` (claude, codex, pi, agy rounds and code-bearing screens), buttons appear for every round with coded options and for no other screen.
3. Clicking option buttons builds an editable draft such as "1a | 2b"; Send delivers it to a `done` agent with a plain `hc send`, and "elid" sends "elid" at once.
4. For a `blocked` agent with `kind: question`, Send types the draft with `hc send --force` only when the agent is Claude Code; for any other harness, and for every permission or auth prompt, the row's action opens the agent instead.
5. If the terminal, its state or its turn changed between render and click, Send refuses with a visible message and types nothing.
6. A row with a half-written draft stays until it is sent or the agent's turn advances; a "load the rest" button reads history once when the round's first question scrolled off.
7. The mod's view has no outer radius or border, and each row's logo is the agent's live `program` drawn with the Agents list's `icon()` helper (B).

Live checks run in a throwaway session (`herdrapp --session <name>`, with `HERDR_APP_HOME` and `HC_SESSION` pointed at it and `HC_TERMINAL_*`, `HC_SCOPE` unset), deleted afterwards. The worktree's `layouts/flat.json` and changed `mods/*` are linked into that session home directly; `./install` is never run from a worktree, since it relinks the operator's live `~/.config/herdr-app` (D). Sessions with `herdr-app shot` evidence run one after another: every window shares the one display, and a covered window stops drawing, so each shot follows `herdrapp session stop` and `attach` (P6) (D). Theme screenshots never change the operator's Omarchy theme: each theme's herdr theme file is generated into the throwaway session home by running herdr-setup's `omarchy/apply-herdr-app-theme` with `XDG_STATE_HOME` pointed at a temporary folder holding that theme's files under `omarchy/current/theme` and `HERDR_APP_HOME` at the session home (A). The option parser is a pure module proven by the repo's `test` check over the committed fixtures.
