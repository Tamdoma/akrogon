# May a leaf tab hold an extra operator pane?

## Question
What does allocate do with a third pane?

### Carries
`src/next.ts:170-171`.

## Findings
(both) three panes throw `Expected one or two panes`. Operator asked why anyone would open one; answer: a shell to poke around.

## Resolution
Operator 2026-09-11: `11a`. Extra panes are ignored; the recorded A and B seats stay authoritative; a vanished seat is replaced by a new split, never by adopting an unrecorded pane. Foreclosed: keeping the two-pane rule.
