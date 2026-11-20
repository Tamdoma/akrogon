# Correction 5 draft (S4a), for watch-timer brief.md and design.md

A's finding while drafting: E's mitigation ("the tick carries the turn the timer read; tick.ts refuses a later turn") cannot tell the two cases apart. A tick in its own turn and a tick that joined a person's turn both land in the turn after the one the timer read. hc's send reply does tell them apart: it reports the watcher's status at delivery, `working` when the text joined a running turn (timer.ts :194 already reads it).

Brief, criterion 4 addition:
"On a watcher showing `done`, hc offers no guarded send (stated limit, operator S4a): a tick can land in a turn a person starts in the watcher terminal, including during hc's draft hold. On claude and agy it joins that turn, and on codex the running task is dropped (P5). A tick hc reports delivered into a running turn (send reply status other than `idle` or `done`) runs no check and stamps no receipt in that turn, and the timer resends that due once as its own turn."

Brief, criterion 10 addition: the skill, docs/use/watch-while-away.md and docs/reference/skills.md name this limit and say not to type into the watcher terminal while the watch runs.

Design, Corrections: the timer marks each send's delivery outcome on its own label before the watcher's tick gate reads it, and tick.ts runs a check only for a due marked delivered into its own turn. The route is the plan seat's, proven free on the stand-in through real hc: a person turn simulated by the stand-in going `working` right before the send, with the check absent in that turn and present once in a later turn.

Not changed: hc, the timer's idle guard, every other check.fix item.
