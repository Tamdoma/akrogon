F1 Wrong B attribution: “up to one 20-minute tick per leaf” is not a supported upper bound. My R1 explicitly says the schedule is not a guaranteed start deadline. Pause, prerequisites, expiry or session loss can delay execution indefinitely. The watcher can also dispatch several eligible leaves in one tick, so “per leaf” suggests a delay that does not apply serially. Evidence: watch-issues/SKILL.md, Invocations and Judge/Waiting.

F2 Replace “handoffs wait for the watcher” and “leaves start at the watcher’s next tick” with “handed-off leaves are eligible for existing dispatch; the operator’s watcher normally picks them up.” My D1 preserves all existing lifecycle triggers, not only the operator’s manual command. Another trigger may act first, while the watcher may be unable to act. This distinction preserves the keep-running lock that nothing depends on the watch and avoids claiming execution from handoff alone.

END watcher-seam-rebuttal-B
