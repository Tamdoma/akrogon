# Where the panel code lives and which layout gets it

## Question

Q1: Where does the panel code live: akrogon, omarchy-customizations, or its own repo? Which layout gets the new work?

### Carries

Operator: herdr UI code does not belong in akrogon ("does it make sense to have the actual Herder code inside of Akron? To me it doesn't make any sense.").

## Findings

Seat notes `slots/map-{A,B,C,D}.md`, merged `slots/map-merged.md`. herdr-app's manual treats a layout and its mods as one shareable folder (INTAKE "Round 1").

## Taken

Operator, verbatim: "Yes, and it needs to be turned into a repo. I've created the remote repo so it needs to be connected to it: https://github.com/Tamdoma/herdr-setup.git. Also, we need to make sure that all of the customizations I've done so far on herdr-app for myself are also there, not just the layout itself." and "push both, then next round. Make sure that what we do is the default layout. I want everything we're doing to be the default layout. Is that clear?"

Settled: general panels (Files, Changes, Needs you, top bar, Spaces) live in `/home/ivan/Work/infra/herdr-setup`; only the Tasks board ships from akrogon (chart `issues/chart/tasks-panel`). Every change goes into `layouts/flat.json`, the default layout; `board` gets none. Foreclosed: panels inside akrogon; registering omarchy-customizations.
