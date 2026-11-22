# Leaf re-review 2: watch-any-harness (slot C)

1. **`forks/timer-design.md` `## Taken` Correction item 6 contradicts lock `4a` and `watch-timer/brief.md` #2/#9:**
   - Evidence: Correction item 6 says *"start runs its one check in every case ... then claims the name, reports the live timer or the conflict"*. `forks/signposts.md` lock `4a` locks *"a second start reports the running one and starts nothing"* (specifically to avoid double steering of one seat); `watch-timer/brief.md` #2 requires conflict starts to *"report them and change nothing"*, and #1/#9 require refused starts (unset `HC_TERMINAL_ID`, wrong session, failed foreground-ancestor check) to do nothing.
   - Consequence: Running the check before ownership/conflict/refusal checks lets a duplicate, conflicted, or refused start mutate leaves (`akrogon next`, seat steering) before reporting. Check refusals, conflicts, and an existing live timer before running the check (and drop *"runs its check"* from #2), or exclude conflicts/refusals from *"in every case"* and confirm relaxing `4a`.

2. **`watch-timer/brief.md` #11 contradicts #8, and `watch-timer/design.md` § Binding decisions (Standing design) contradicts itself:**
   - Evidence: `watch-timer/brief.md` #11 requires *"every check on the registered root's waiting stand-in leaf running `akrogon next` for it ... and a paused check (8)"*, while #8 requires a paused check to act on nothing. `watch-timer/design.md` asserts `akrogon next` (Judge waiting rule) in one bullet and still states *"the check's judgment (Judge section) is unchanged and read, never asserted"* in its final bullet.
   - Consequence: #11 literally demands `akrogon next` on the paused check that #8 forbids, and `design.md` gives conflicting test rules. Change #11 to *"every unpaused check"* and align `design.md`'s final Standing design bullet with the mechanical `akrogon next` waiting-rule assertion.

3. **`watch-timer/brief.md` #10 still omits `docs/pictures/watch-loop.svg` (B L10):**
   - Evidence: `watch-timer/design.md` § Leaf architecture added `docs/pictures/watch-loop.svg` (visible text *"cron every 20 min"*) to Owned surfaces, but `brief.md` #10 names only `SKILL.md`, `docs/use/watch-while-away.md`, and `docs/reference/skills.md`.
   - Consequence: #10 can pass while the diagram embedded in `docs/use/watch-while-away.md` still advertises Claude's 20-minute cron; include `docs/pictures/watch-loop.svg` in #10.
