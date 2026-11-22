# Leaf re-review 3: watch-any-harness (slot C)

1. **`forks/timer-design.md` `## Taken` Correction 2 item 6 (copied into `watch-timer/design.md` § Binding decisions) orders an impossible `hc` sequence for the zero-timer branch:**
   - Evidence: Correction 2 item 6 states *"zero: start claims the name, runs its check and starts the timer."* In `hc` (`hc run --help`), `--name` is unique among live terminals and has no separate reserve/claim primitive: starting the timer terminal (`hc run --bg --name <prefix>-watch ...`) *is* what claims the name.
   - Consequence: An implementer cannot both claim `<prefix>-watch` before the check and start the timer after it. State one concrete order: either start the timer first (claiming `<prefix>-watch`, then run the immediate check so concurrent starts cannot race) or run the check first and then start the timer (accepting a concurrent-start race until `name_taken`).
