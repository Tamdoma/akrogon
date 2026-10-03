# Map A
#54: transcript 858cdae8 rows 591-609: B wrote round2-B.md 05:32 UTC; background-wait task-notification enqueued 05:42:17, 2 s after operator message. Earlier round (row 399) was notified on time. questions.md:44 defines the wait but not "stay in turn". SKILL.md footer lets "Next: none" name a peer wait.
Fork 1 options: 1a foreground wait loop in same turn, no background peer waits, footer never names a pending peer, end turn only on operator round / peer failure / blocked (recommended). 1b rely on harness notifications. 1c `akrogon peer-wait` command.
#55: src/phase.ts:112-118 rename after save when leaving failed; src/phase.ts:72-82 announceFailed rename after save when entering failed. herdr 0.9.3 `tab rename wA:zzzz probe` -> exit 1 tab_not_found. src/next.ts:387-393 creates a new tab and overwrites state.tab when no live match.
Fork 2 options: 2a list live tabs, rename only a live recorded tab, both sites (recommended). 2b catch tab_not_found and warn. 2c any herdr failure after save is a warning, exit 0.
Split: chart door-turn-and-stale-tab; issue door-peer-turn / leaf peer-turn-wait; issue stale-tab / leaf phase-stale-tab; parallel, no blocked-by; debate no.
