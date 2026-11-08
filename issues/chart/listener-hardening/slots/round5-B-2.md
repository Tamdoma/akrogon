Reviewed `4d1375a1f0b26309d57b258bc0e9a6245a33e29e`. Original F1 is fixed, but the readiness guard introduces F2.

## F2 — P2: One offline machine disables placement for healthy machines

`mods/session-status/main.js:38` requires every machine to be ready before processing any space. An offline configured remote has layout `unavailable` (documented at `/home/ivan/.config/herdr-app/herdr.d.ts:130-132`), so this condition remains false indefinitely. New local leaf tabs then remain in the middle even though the local layout is ready and its commands can succeed.

Reproduced using the actual helper and caller expression: local machine ready, remote machine unavailable, local tabs `[a,leaf,w]`, known IDs `[a,w,offline/tab]`. The result is `{commands: [], changed: false}`. Preserve unavailable machines' history while processing ready machines independently. Add a ready-local/unavailable-remote regression.

Targeted tab and update-check suites: 17 pass, 0 fail. Also inspected rename commit `020d282`; no additional concrete defect found there.

Re-check: changes needed
