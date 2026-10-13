# Notes A: framework-fanout (before reading B/C)
Pick: no framework chart now. Decide on the ceiling-values rerun proof. The 16-thread quota already bounds one run's CPU. Its rerun shows whether 409 Chrome and 8 parallel branches still pass inside 16 threads at about 239 s. If it passes, fan-out inside one run only costs the boxed slice, never the desktop, and a framework cap adds code in a second repo for no host gain. If it times out or slows materially, the quota comes out (ceiling-values Taken) and this fork reopens with that measurement as its evidence.
Rejected: cap now (second repo, guessing values before the quota run measures the need). Rejected: never (the quota rerun can still fail).
Evidence: forks/ceiling-values.md Taken, measurement 2 (8.3 cores average, peaks load 40).
Pitfall: Chrome under CPU throttling may hit test timeouts before the run is slow overall. The rerun must report timeouts, not only exit code and wall time.
