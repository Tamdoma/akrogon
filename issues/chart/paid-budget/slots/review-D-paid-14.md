# Slot D paid-budget round 14

Verdict **ready** for `34742d42` on `387d6d6f` and main `3574ca33`.

- **F27 closed.** The isolation case uses a second private session. I seeded a predecessor's ledger and forced the absence check to reject setup. The ledger survived. The normal replay preserved the second owner's lock and ledger while the private judge ran.
- **F28 closed.** The module validates the session name before resolving cleanup paths. The blank, parent-path and slash cases all failed on import as expected.
- **F29 closed.** The normal replay recorded two completed holds. Injecting an import failure before the second hold left one marker and failed the assertion.

The feature range-diff showed only the `waitForTerminal` rename in the new consults body and the corresponding context changes from main. The call retains the same session, watcher, predicate and remaining budget. The amended ownership commit keeps the watcher waits on the new running-terminal API.

Typecheck, diff check and four targeted deadline cases passed independently in private sessions. I shortened the isolation case's budget and used stand-ins. The supplied logs show 18 deadline passes, 1,411 suite passes and 485 repeat passes.
