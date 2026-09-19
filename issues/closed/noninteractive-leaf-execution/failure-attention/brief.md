# Brief: failure-attention

## What
Inside `commitMove`, after a move to `failed` is persisted, akrogon runs `herdr notification show "<repo>/<slug> failed" --body "<cause>: <reason>" --sound request` and persists the response reason (`shown`, `disabled`, `rate_limited`, `no_foreground_client`, `busy`) or the literal `error` in `state.failure.delivery` before anything else happens, then runs `herdr tab rename <state.tab> "<slug> failed"` when the leaf has a tab. A later move out of `failed` renames the tab back to `<slug>`. Each herdr call is attempted once and retried once with a structured warning on a retryable herdr error. On a final failure the committed lifecycle move and the recorded delivery outcome stand, the other call is still attempted, and the command then exits non-zero with the last herdr error, so `failed` stays visible and the transport failure is not reported as success. The existing "Failed leaf" notification on redispatch is removed and `failed_notified` leaves the runtime; `readState` still strips it from legacy records.

## Why
The only alert last night was an in-app toast raised on a later dispatch pass; nothing persisted where the operator looks (Tamdoma/akrogon#19, #20 item 3). Operator 2026-09-19: no webhooks, no external programs, herdr only. Measured 2026-09-19: `notification show` returns `{"result":{"reason":"shown","shown":true}}`; `tab rename` returns the tab with the new label (chart forks/push-notification.md, Measurements).

## Done-criteria
1. `bun test` with the herdr fake: a move to `failed` records one `notification show` call with `--sound request` and one `tab rename` to `<slug> failed`, and `failure.delivery` equals the fake's reason.
2. A move from `failed` to `implement` records a `tab rename` back to `<slug>`; when that rename fails twice, the move still stands and the command exits non-zero with the herdr error.
3. A failed move for a leaf without a tab records the notification and no rename.
4. Notification error with rename success persists `delivery: error` and the renamed tab; notification success with rename error persists the real reason; both leave the leaf `failed` and exit non-zero with the last herdr error.
5. Runtime code and serialization no longer use `failed_notified`; a test reads a legacy state containing it and succeeds; the "Failed leaf" notification block in `next` is gone, and repeated `next` runs against a failed leaf issue no notification.
