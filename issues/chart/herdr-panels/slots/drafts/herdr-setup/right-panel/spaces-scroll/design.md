# Design: spaces-scroll

## Binding decisions, verbatim

### Spaces list height (A8) (`issues/chart/herdr-panels/forks/spaces.md`)

Operator, verbatim: "Ok, b is better. That thing in brackets, does it have to have that name? I can already see what agent harness they are based on the logos. What would change compared to what they are today, except for the height?"

Settled: b. Only the heights in `layouts/flat.json` change: Spaces a fixed share of about 5 rows and scrolls, Agents takes the rest. The rows, logos and names stay as today; no harness names.

### Where the panel code lives and which layout gets it (`issues/chart/herdr-panels/forks/code-home.md`)

Operator, verbatim: "Yes, and it needs to be turned into a repo. I've created the remote repo so it needs to be connected to it: https://github.com/Tamdoma/herdr-setup.git. Also, we need to make sure that all of the customizations I've done so far on herdr-app for myself are also there, not just the layout itself." and "push both, then next round. Make sure that what we do is the default layout. I want everything we're doing to be the default layout. Is that clear?"

Settled: general panels (Files, Changes, Needs you, top bar, Spaces) live in `/home/ivan/Work/infra/herdr-setup`; only the Tasks board ships from akrogon (chart `issues/chart/tasks-panel`). Every change goes into `layouts/flat.json`, the default layout; `board` gets none. Foreclosed: panels inside akrogon; registering omarchy-customizations.


Excluded here: every right-panel change.

Standing design: `~/.akrogon/current/skills/chart-issues/assets/standing-design.md`. Applied here: a layout-only change, proven by one live session look; no tests.

## Leaf architecture

Owned: flat.json `sidebar-lists` children `spaces` (`size` becomes `{"px": <about five rows>}`) and `agents` (`size` `{"weight": 1}`). The shipped `spaces` mod already scrolls (`overflow_y_scrollbar` in `~/.config/herdr-app/mods/spaces/main.js`). Layout edits reload live in a session window (intake "Round 1 follow-through").
