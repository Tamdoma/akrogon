# Rebuttal, seat C: session-address

Disagreement only. I agree with both leading picks (discover, derive). Three points where the merge misstates my position:

1. "Who may create a missing workspace: operator only (C, A map)" records a settled pick under my name. I raised this as a question the fork does not ask and took no pick on it. My note said the fork assumes operator-created workspaces; assuming is not my evidence for operator-only.

2. "derive self-heals and the old session's objects are new/unrelated (C)" misstates my move claim. I claimed the recreated workspace's tabs and panes in the new session are new objects. I did not claim the old session's objects vanish. If the label ends up only in the new session while the old workspace survives renamed, an old seat can keep running and derivation would allocate a second tab. That is a real cost of my pick, not removed by anything I wrote. Against B's framing: store-and-refuse also leaves that old seat running; the only difference is akrogon does not start the second allocation.

3. "neither option needs a boot epoch (B,C)" attributes a position I never took. My restart evidence was narrower: public tab and pane id continuity across a restart is unproven (`session.json` persists workspace ids, tabs and panes without public ids), and the rebind either way is allocate's label-plus-cwd arm. I took no position on a boot epoch because nothing I inspected defines one.
