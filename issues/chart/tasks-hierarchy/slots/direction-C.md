# Direction angles C

Read: forks/direction.md whole, forks/list-shape.md Taken, slots/sections-A.md, sections-B.md, my own sections-C.md, INTAKE.md.

## Angles not yet asked

G1 When a row is red, is the board where you read the problem, or where you see that there is one?
- a) The board is the landing page: the row carries the whole reason and the recovery step, nothing else to open.
- b) The board is a pointer: one phrase, and a click takes you to the seat's pane or the log where you actually read.
- c) The notification or Discord message is where you read; the board only has to count right.
Reshapes: how long the reason phrase is (N4), what the open row holds (N7), whether Files/Changes stay the only buttons or a "go to pane" action is added (N9), how much the machine block says. Evidence cannot settle it: the envelope can supply any depth; which depth is used is the operator's reading habit.

G2 Is the panel open beside your terminals most of the day, or do you open it when the dot lights?
- a) Open all day at the side: calm sections must be truly calm, spinners and row moves are motion in your eye corner, Working and Waiting matter.
- b) Opened on the dot: the board could open on Needs you alone with the other sections folded, and motion costs nothing.
- c) Opened full width at review moments (end of a wave, before merges): density and the wide layout matter more than the narrow one.
Reshapes: default folded sections, whether the spinner stays on the row or only in detail, how 5c is read (narrow as the primary or the fallback), tick rate and re-render policy. 5c settles the width, not the habit; only the operator knows which they do.

G3 How long is too long? Do you want age to turn a calm row loud, and at what point?
- a) Never. Age is a number you read; only recorded facts are loud (B's position, A's and mine by default).
- b) Yes, with one threshold you name for a busy seat (for example two hours) and one for a leaf waiting between seats.
- c) Yes, but relative: loud when a seat or wait is far above that phase's normal time (the producer already computes a normal for merges).
Reshapes: the time column (N6), whether the producer records the last dispatch pass (3a scope), whether the watch cron and the board share a threshold, whether Waiting can ever be red. 1a says problems loud; whether a stuck seat is a problem at 30 minutes or at 4 hours is the operator's tolerance, not evidence.

G4 When several rows need you, which comes first?
- a) Oldest first: the one waiting longest on you.
- b) Current repo first, then the rest (what the board does today).
- c) The one that blocks the most other work first, dependents counted.
Reshapes: sort inside every section, whether a dependents count is shown on the row, whether the current-space test lock stays. Taste and working habit; the code can do any of the three.

G5 Does "needs you" cover only tasks, or also akrogon things waiting on your answer, such as a chart door waiting for a direction reply or a leftover the watch could not recover?
- a) Tasks only. Charts and housekeeping stay off (today's lock removed the folds).
- b) Tasks plus anything recorded as waiting on the operator's reply, one line each, in Needs you.
- c) Tasks plus a single count line "2 charts waiting on you" that opens nothing.
Reshapes: the producer envelope (charts rows exist in it, unused by the board), Needs you membership and the header count, whether the removed Charts fold was "all charts" or "charts at all". The lock removed a fold of 233 charts as clutter; whether a chart that is waiting on the operator is clutter is their call.

G6 How long will this board live? The kept-row lock says the move to herdr-app is soon.
- a) Weeks: the smallest change that fixes the look; no width-adaptive row, no Done section, producer changes only where already agreed.
- b) The board for the next year: build it properly, including the narrow layout and the producer fields.
- c) A prototype for the herdr-app-native one: decisions should port, so prefer what herdr-app's own mods do over what akrogon's envelope makes easy.
Reshapes: nearly every "do it properly vs do the minimum" call A will make on autopilot: 5c's narrow layout work, Done section, on_size_change, test depth, how far 3a goes. Only the operator knows the plan.

## Dropped

- Actions from the board (start a stopped leaf, run next): 6a says something automatic starts the next seat, and the remaining action, jumping to the pane, is G1's option b.
- Whether a watch runs today: A asked it in sections-A; cron list is evidence, and 6a already states the intent.
- Name on the row (slug vs a title): 2a says name, state word, one reason; the envelope has no title, so slug it is.
- Which section sits on top: 1a, problems loud, puts Needs you first.
- Section order vs the Agents list's words, pill shape, grey and white: 4a and D19 settle look; the word choice is a sections-fork detail.
- Post-merge broadcast tracking (B's Q1): a producer contract question that evidence and 3a scope settle, not direction.
- Theme, machines, agent readers: evidence settles them (theme() follows Omarchy; exec is local; agents read the CLI).
