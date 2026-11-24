# Slot D delivery-flakes round 8

Verdict **fix** for `ba622967` on `29e6a65c`. Reviewed `git diff f7690e9c ba622967 -- src tests` and the immediate-report case.

- **F18 · test can fail under load.** The 20 ms interval controls polling frequency. The shell and its replies still have to run within the 2 s proof budget. I delayed the fake `working` report by 2.2 s after its poll had seen the send. The send ran once, but the test reported `unconfirmed` and failed. I reproduced the failure with an injected delay, and the unmodified case passed. Use the normal test wait budget and make the mock reject the wrong launch order promptly. In a disposable replay, the normal budget accepted the delayed report, and closing the mock stream on a late subscription made `c79a18ff` fail in 65 ms. See `tests/hc-identity.test.ts:344–374` and `tests/AREA.md:35–36`.

**F16 and F17 closed.** All six targeted cases passed with 250 ms delays at snapshot and dialog delivery. Both rejection reasons logged a warning and returned `null`.

Typecheck, diff check and all 15 identity tests passed. The supplied verify log records 1,428 suite passes and 75 repeat passes. I did not rerun the 20-copy stress run.
