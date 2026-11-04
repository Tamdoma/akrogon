# Rebuttal C on map-merged.md

- Pitfall "Proof renders the states that collide ... no pixel tests (B,C)": map-C makes no such claim. I agree with it, but it is B's; tag it (B).

- M1 (emphasis) is the wrong fork after the operator's second note. "Which rows earn emphasis" is a content question: the row that needs the operator earns it, and that set is already defined in the producer (`status.ts` leafRed: failed, missing, undelivered prompt) and drives the panel-bar dot (`panel-bar/routine.js` redDot). The fork is which definition the board uses and whether to widen it (stopped, blocked on parked or missing, land dead), not whether working or waiting rows are louder. Asking the operator to pick an emphasis style (A, B) asks them to decide what a category decides. Withdraw "C settles it by pill placement": pill placement is the type answer, the category is the content answer.

- M1 and the merged map miss the Agents list precedent for the whole list shape: `mods/agents/main.js` sections by state (Needs you, Working, Done, Idle). D19 asks the panel to match herdr-app's mods. A state-sectioned list is the option that follows D19; the map lists it only as A's idea, not as the shipped pattern.

- M4 A's "centered or split view" at full width reopens D19's reading-width rule ("Needs-you and Tasks content keeps a 760 px column at full width", `plan.md` D19). An option that contradicts a standing decision should say so.

- M8 / P9 A's one-color pills reopen look.md Taken 6b and D19 "Status pills: ... status color text on its 15% fill". The sidebar's one-color change today was about avatars and agent icons (`spaces-list`, `agents-by-tab`), not status pills; the Agents list beside Tasks still colors its status pill (`mods/agents/main.js` status(), `t.blocked` fill). No evidence extends that change to pills.

- Missing problem: the header count "N open" counts every row with a pill, so a leaf blocked on another and a stopped leaf count as open (`main.js` render, `open`; tt-01 shows "2 open" for one working and one blocked leaf). The count the operator needs is how many rows need them, and it should equal what the panel-bar dot counts.

- Missing problem: the run-line alert (`env.run`) is a multi-line CLI table (`status.ts` envelope section: "run line (one per repo)" rendered with header rows) printed inside one alert line. No hierarchy fix on the board shapes it; it needs the producer to emit fields.

- Missing pitfall: the Needs you panel was removed today (herdr-setup commit "Remove the Needs you panel; prefix f toggles Files"). Tasks is now the only board, so any category it drops has nowhere else in the app to appear except the CLI. The map still treats Needs you as a sibling view (M4, D19 wording).

- Missing pitfall: the envelope carries `busy_since` per seat and `verdict`, `attempts` and `done` per leaf, and the model computes them (`model.js` leafRow detail) but the view never draws them. A hierarchy pass that only restyles what is drawn leaves the operator's stuck-seat signal (busy duration) and the review verdict off the board.
