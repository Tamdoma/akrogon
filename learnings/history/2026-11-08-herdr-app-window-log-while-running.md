# herdr-app window log read while the window ran

## Case

notices-on-hc's attended notices tier (`tests/e2e/notices.e2e.ts`, launch T1, run `7a46df82`) read herdr-app's window log `~/.local/state/herdrapp/akr-e2e-notices.log` right after herdr-setup's session-status handler deleted a notice, to find its `akrogon-notice … "outcome":"shown"` line. The log was 0 bytes and the tier failed before its toast and sound observations, using up both window starts the grant allowed.

## Evidence

- `issues/open/herdr-app/hc-doors/notices-on-hc/implementation/check-tier-notices-1794107396693-3070533.log`: the shown-line check fails right after the notice file was gone.
- `implementation/notices-tier/window.log`: 0 bytes.
- Launch T2 (`implementation/check-tier-notices-2-1794108306763-3688012.log`, commit `e79eed95`) read the log after `herdrapp session stop` and found one shown line per notice (o1, o2, o3).
- herdr-setup's status-notices first window run also saw an empty or partial log while its window lived. Its passing replay saved the log at the end.

## Learning

herdr-app's window log was empty while the window ran and complete after the window stopped. A proof that reads mod console lines from it read them after stopping the window, and made its other observations first, so one run of a start-bounded tier was not spent on the log.
