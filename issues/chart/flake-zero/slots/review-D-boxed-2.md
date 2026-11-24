# Slot D boxed-tests review, round 2

Verdict **ready** for `bdc34423` on `7aafd2eb`.

- **F1 is closed.** A test selected by a regex matching literal `${HOME}` passed through the new package script. The old script rejected the same regex.
- **F2 is closed.** The guidance explains the user-bus requirement and the inherited environment. It directs runs needing other caller variables or lacking the bus to direct `bun test`.
- **F3 is closed.** The guidance distinguishes service cleanup from launcher death, gives the one-hour cap, identifies slice stop as affecting every boxed run, and calls out separate-unit cleanup.

All seven CLI-help tests passed through the wrapper. Diff check passed.
