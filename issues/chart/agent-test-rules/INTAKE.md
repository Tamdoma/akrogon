# Intake: agent-test-rules

## Scope
Destination akrogon (skills plan/implement/check/merge, chart-issues assets, `src/phase.ts`). Rules for which tests are worth having, who may change an existing test expectation and on what proof, outcome-only done-criteria, fixing a bad test already on main, and a mechanical check on changed existing tests. Test selection and speed stay with framework-test-scope and akrogon-slow-phases.

## Provenance
- Operator: /chart-issues session 858cdae8 (2026-10-02 to 2026-10-03), slots A (claude), B (codex, herdr w8:pGA), C (claude fable 5.1, herdr w8:pGD from round 4).

## Source: operator 2026-10-02 (chart-issues args)
Leadership. I want you to look at the Logs In the past one week inside of the pie harness. I want you to tell me how many times exactly has the slot B reviewer changed the unit tests to make them fit its own findings. My intent is to cut down on tests as much as possible, And only run the most important tests and force agents not to change tests to make them fit their own findings. Use slot b consultant which is active in your next pane (codex).

## Source: operator correction 1
yes, but make sure it also checks pi. You can look into the pi-extensions workspace in herdr here, and you can also check the implement-issue and check-issue skills in this repo. Pass this on to slot B

## Source: operator correction 2
https://x.com/dwlz/status/2103463289875280041 <- look into this x thread and get the info from real humans about this. Pass it on to slot B consultant.

## Source: operator correction 3
A pasted block of X thread replies followed by "<- this is the x thread, pass it on." Condensed copy: [slots/thread-pasted.md](slots/thread-pasted.md).

## Source: operator correction 4
also do real, very recent research on problems with testing. We might not get rid of it fully, but everything that's blocking us are stupid AI-crafted unit tests that don't have any background in the real world. Pass it on

## Source: operator 2026-10-03 round 1 answer
1 - we need to fix the criterion as well. We need to find from great practitioners what's actually worth testing. Some people on X are starting to say they only do e2e and integration tests now and are completely removing unit tests. Not sure if that is correct, but they are saying it: [Image #3] [Image #4], and here: [Image #5]. Find out what the professionals are doing to eliminate tests that are bloated and not necessary, and even new for if needed
Images: [slots/img-dwlz.png](slots/img-dwlz.png), [slots/img-dwlz-replies.png](slots/img-dwlz-replies.png), [slots/img-wu.png](slots/img-wu.png).

## Source: operator 2026-10-03 later rounds
- "4 - I don't want anything to come back manually. At what phase would that happen? | 5a | 6a | 7a |"
- "There must be a more elegant, automated way. Spawn slot c consultant (claude code fable 5.1 with high effort) and find out a better way without polluting the charting process with testing. All 3 of you consult."
- "4 - What makes this different from what we have now?" then "and what makes this change different and what makes it work better?" then "4h, continue asking me all the questions."
- "8a | 9a | 2a | 3a |"
- Mid-pass: "why would you stop? You need to seed this to improve the script during charting. The script that waits for other consulting slots." (seeded as Tamdoma/akrogon#54, not in this chart's scope)

## Agent findings
Window 2026-09-25..2026-10-02. Full maps: [slots/count-merged.md](slots/count-merged.md), [slots/count-B.md](slots/count-B.md), [slots/count-A.md](slots/count-A.md).
- Seat letters swapped 2026-09-29 22:41 (bde1032). Before: A = pi reviewer/merger. After: B = codex reviewer/repairer/merger. (A,B)
- Codex B changed tests in review or repair in 7 leaves. 5 changed an existing expectation (readiness-contract 820ed82, env-link fc74745, emdash-health-run 5794bdfb2, capture-asset-bytes 03b1ff9d2, emdash-launch 87c27d871 under the operator's "Just do those fixes yourself"). 2 only added a failing test (failure-log f376eca, log-tail da14fd8/b15247b). 0 proven weakenings of a correct test to fit a wrong finding. (A,B)
- Pi reviewer in check.review: 0 test edits. Pi merger (A, pre-swap) re-recorded tests, fixtures and goldens in 10 framework leaves (119 edit calls). (A,B)
- 39 failed transitions in 14 leaves. One confirmed bad assertion (TMPDIR, 175b862, from leaf-temp-dir brief criterion 6) blocked wave-table and proof-order until 2dd1106. One source-free review demand (offer-join-deploy F17). The rest: browser races, live route defects, env gates, red base, timeouts. (A,B)
