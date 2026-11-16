# Brief: blocked-seat-notice

## What

When a leaf seat's hc status is `blocked`, the controller writes one attention notice at once. The title is "Blocked leaf: <repo>/<slug> seat <S> (<kind>)" and the body is the last 40 screen lines. A per-slot field `blocked_notified` gates it to one notice per blocked episode. The field is cleared, and a still-pending notice removed, when a pass sees the live seat not blocked, when that slot's seat is replaced, and on every phase move. The 60-minute busy notice is not sent while the seat is blocked. No keys are sent to the seat.

## Why

Report Tamdoma/akrogon#135, notice half. Today `observeBusy` (src/next.ts) treats `blocked` like `working`, so a seat stuck on a prompt waits silently for an hour and then gets a quiet "Busy leaf" notice.

## Done-criteria

1. A dispatch pass that sees a leaf seat with status `blocked` writes one attention notice titled "Blocked leaf: <repo>/<slug> seat <S> (<kind>)" whose body holds the seat's screen tail. Later passes in the same episode write no second notice. No key or text input reaches the seat.
2. When a pass sees that seat not blocked, the pending notice is removed and the field cleared, so a later blocked episode gets a new notice.
3. A blocked seat that is replaced (its terminal finished or gone) and whose replacement is then seen blocked gets a new notice. A phase move clears the field and removes the pending notice too.
4. A seat blocked for more than 60 minutes gets no "Busy leaf" notice. A working seat keeps today's busy notice.

Criteria 1 to 4 are proven by the leaf's own tests at the controller boundary (a dispatch pass on the hc test core, with a stand-in that reports `blocked` through OSC 7501 as the door-exchange fixtures do). Criterion 3's replacement case turns red under one deliberate break (no clear on replacement).
