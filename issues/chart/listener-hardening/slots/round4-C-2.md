# Round 4, slot C, re-check of 4c9f2688

- D1: `src/listen.ts:118-121`: `watchSocket` now runs before `follow` and `subscribed.add`, so a socket gone since the scan throws with nothing started and nothing marked; the scan's rejection goes to the retry and the other sessions of that scan still subscribe (`Promise.all` does not cancel them). Fixed.
- D2: `src/listen.ts:43,54-65`: the retry keeps the failed passes in a set and re-enqueues each one when the timer fires, one timer at a time, a scan with it; a stream or scan failure retries `next --resume`. A failure arriving while the timer is pending joins the set; a retried pass that fails again starts a new timer, so a lasting cause retries every 60 s and stops when it clears. The new test shows a failed `pull --all` coming back as `pull --all` after the resume pass. Fixed.

No further defects.

Re-check: ready
