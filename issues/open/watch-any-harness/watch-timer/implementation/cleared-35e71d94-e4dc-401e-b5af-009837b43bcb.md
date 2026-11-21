Cleared abandoned capture 35e71d94 (watch-live-standin-root, this seat, pre-timeout).
- Discovery: hc ls --json on akr-e2e-watch -> 0 terminals; find over /var/tmp,
  ~/.local/state/herdr-core and /run/user/1000/herdr-core -> no akr-e2e-watch artifacts.
- Cleanup: killed leftover terminals + stopped the tier server after the first timeout
  (the stand-in tier had launched; subsequent `akrogon run-check` cleaned leftovers itself).
- Absence read: clean; the rerun produced the intended-red pair 302d6437 (recorded in plan.md).
