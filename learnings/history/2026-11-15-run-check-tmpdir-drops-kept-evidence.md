# run-check removes failure evidence a child keeps under os.tmpdir()

Date: 2026-11-15. Case: framework leaf rewrite-copy-review (issue #617), slot A implement, second rewrite capture.

## Case

`capture-website.ts --case rewrite` was run through `akrogon run-check` as the lifecycle requires. It failed after 5 paid sessions and printed "failure evidence kept at /var/tmp/akr-1000/6855/898b454c/run-GBdO74/selected-page-rewrite-vRlF5s/failure-rewrite-2026-11-14T21-12-23-832Z/rewrite". The folder was gone right after run-check exited, so the page that broke the driver's plant rule could not be read. The grant's stop_line asks for an operator blocker naming the evidence root, and that root no longer existed.

## Evidence

- akrogon `src/run-check.ts:68` sets `env.TMPDIR = runRoot` for the child, and run-check removes its run root on exit.
- Capture log: framework `issues/open/rewrite-sibling-check/rewrite-copy-review/implementation/check-capture-rewrite-2-1794690744946-1746240.log` (evidence root line 1, kept-failure line 43). `ls /var/tmp/akr-1000/6855/898b454c/run-GBdO74` afterwards: no such file.
- The third capture ran as `akrogon run-check ... -- env TMPDIR=/var/tmp/rewrite-copy-review-evidence bun ...`, and its evidence root stayed reachable until the capture's own cleanup.

## Learning

A script that keeps failure evidence under `os.tmpdir()` loses it when run through `akrogon run-check`, because run-check owns and deletes that temp root. Before a bounded paid run, put kept evidence outside run-check's temp folder (pass the script's evidence-root flag or set TMPDIR inside the command), or copy it into the leaf before run-check exits. Which runs need evidence kept is a judgment, so this files nothing. A run-check change that preserves or refuses kept paths would retire it.
