# Final-shape check, slot C

## turn-count

D1 (Taken 3, the `lost` charge condition). As written, the charge keys on "a seat whose prompted turn never ended". `startSeat` in src/seat.ts writes `prompted[slot]` only on a confirmed first task, and its launch record clears `prompted[slot]` before that. A seat that dies during the start proof returns a failed start through `firstTask`, and a seat that times out the proof records a delivery error, and both leave `prompted[slot]` unset. Read literally, replacing those seats charges no loss, so the fastest dying seats are exactly the uncounted ones and the paid restart bound has a hole at its center. The charge has to key on a prior seat record in `state.seat[slot]` with no observed turn end since that start, not on a prompted record existing.

Nothing else in turn-count.

## failed-refusal

None.

## blocked-prompts

D1 (Taken 2, clearing `blocked_notified`). The gate clears "when the seat leaves blocked", but no pass is guaranteed to observe that state. In src/listen.ts `onLine`, wakes fire on turn, blocked, finished and lost events, so a blocked to working transition wakes nothing. In src/next.ts `dispatchSlot` the finished or gone start branch returns before `observeBusy` runs, so an episode that ends by seat death never reaches the clearing code, and `clearBusyNotices` in src/phase.ts knows only the busy notice id, so a phase move does not clear it either. Two concrete results follow. A replacement seat that blocks during its first turn gets no notice, because the field still holds the dead seat's episode. A seat that is unblocked by hand and blocks again inside the same turn gets no second notice, because no pass observed the working gap. The field has to clear on the replacement start and on phase moves as well, or key on something that changes per episode.

Nothing else in blocked-prompts.

## door-address

None.
