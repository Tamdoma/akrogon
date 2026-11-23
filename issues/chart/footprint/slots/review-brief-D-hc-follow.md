# Review brief: hc-follow (slot D)

Operator decisions after slots/hc-drift-{B,C,D}.md: D1 O1 delete the pinned schema test; D2 O1 the event reader skips unknown line kinds.
Worktree /home/ivan/.akrogon/worktrees/akrogon/hc-follow on origin/main 40a57770. Two commits:
- 87b6aab8 test: removes the pin test (tests/hc-identity.test.ts), pinnedSchema (tests/hc-fixture.ts), tests/fixtures/hc-schema.json.
- 35a103a7 fix: src/hc.ts follow() checks a line's kind first (kindSchema + knownLine): terminals snapshot, event with terminal, or doc event are parsed strictly by lineSchema as before; any other kind is skipped (replaces the heartbeat-only skip). New test drives follow() in a bun subprocess against a fake hc on PATH; fails on the old reader.
Check: the kind test cannot swallow a malformed line of a kind akrogon reads (e.g. terminals not an array, terminal present but wrong type, doc event with bad data); no other hc stream reader (skills/watch-issues/scripts/hc.ts, waitForDoc) still throws on unknown kinds; nothing else referenced the pin. Verdict ready or fix.
