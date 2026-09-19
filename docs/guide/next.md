# Next

The start button, and what it actually does. Run this and leaves move. Don't run it and nothing moves — well, except the hook runs it for you all day, but you know what I mean.

Prerequisites: leaves exist under issues/open/ with valid states. Which directory you're in matters a lot here, see below. The command:

    akrogon next --all

What you should see: usually nothing. Quiet success. With a slug that can't start, it prints the reason when there is one: dependencies not merged, hand-built can't be dispatched. A full machine prints nothing — waiting for a seat is silent. What to do when it fails: read the reason, or check akrogon status when there isn't one. Missing leaf means slug typo or parked. No leaves match means wrong folder.

In order, for --all inside a repo, it sweeps that repo's leaves; outside any repo, it sweeps every registered repo. A lot of people miss that. Inside widgets, next --all means widgets. Outside, in your home, it means everywhere. Same for bare next: inside a repo it nudges that repo, then cleans that repo's merged leaves.

That's the whole start button. In order:

1. Walk issues/open/ in folder order and look at every leaf.
2. Skip a leaf if it's merged, failed, or hand_built. Skip it if any slug in blocked-by is not merged. Blockers are checked before every dispatch, every time, not cached.
3. If the leaf already has a tab, prompt whoever its phase needs, if they are idle.
4. If it has no tab and fewer than the global max_active leaves are running anywhere, create the worktree and branch, open a tab with two panes, start the agent, and send one prompt. Merged and failed never count as running, even if their tab is still open.
5. Exit. Nothing keeps running afterwards.

The prompt is always five fields: skill, slug, slot, phase, and the leaf folder. For example plan-issue export-csv slot=B phase=plan.synthesis leaf=/home/me/widgets/issues/open/export-csv/export-csv. The agent reads the skill file and does the rest.

Nothing keeps running afterwards. The Herdr hook calls akrogon next again every time an agent goes idle or a pane exits or closes, or a tab closes. That call finds the leaf that owns the pane, reads its new phase, and prompts whoever is next. When a leaf reaches merged, that same call sweeps every repo once, so leaves waiting on it start right away.

## The four forms

akrogon next --all looks at every leaf in every registered repo when run outside one, or the current repo when inside one, plus cleanup of merged leaves. Use it when starting the day by hand. Herdr runs this itself at startup.

akrogon next with no arg looks at every leaf in the repo you're standing in, then cleans up that repo's merged leaves. A quick nudge from inside a repo.

akrogon next <folder> looks only at leaves under that folder. The folder can be an epic, an issue, or one leaf, or a worktree path. You want only this epic to take the free seats right now? This is it. But note: it starts only that folder now; the next hook call sweeps everything again. To keep work out for real, park it.

akrogon next <slug> looks at exactly this leaf. Prints the reason if it can't start and the reason is an error: dependencies not merged, hand-built can't be dispatched. Waiting on a free seat prints nothing — check akrogon status instead. One leaf is stuck and you want to know why? This one. For us: akrogon next export-csv.

## Parking work you don't want yet

To keep whole top-level issues or epics out of the loop, park them. A parked folder moves to issues/parked/, where next never looks. Unpark it to bring it back. Names are space separated, and --all takes everything not running and not needed.

    akrogon park search billing
    akrogon unpark search
    akrogon park --all
    akrogon unpark --all

Park works on whole top-level folders, never on one leaf inside them. It refuses a folder that has a leaf running, and it keeps a folder that another open leaf still depends on. akrogon status lists what is parked.

## How order is decided

There's no priority field the tool reads. The priority line in old state files is ignored. First come, first served, no priority field is read. Order comes from two things only:

Blocked-by. A leaf waits until every named leaf is merged. This is the strong ordering.

Folder scan. Among leaves that are ready, the tool starts them in folder order until the seats are full. Rename folders if you care which ready leaf gets the last seat.

An epic is not a queue. If five leaves in an epic have no blockers, they all count as ready and race for seats along with every other ready leaf in every repo. If you want an epic to run in a fixed order, chain the leaves with blocked-by. The prose in EPIC.md, ISSUE.md, or brief.md is for humans and planners. The tool never reads it for ordering.

Concrete use: you synced export-csv, you run akrogon next export-csv from ~/Work/widgets. If it says nothing, check akrogon status export-csv — you should see a tab and worktree assigned. If it says dependencies not merged, you named a blocker that's not done. If it says nothing and status shows no tab, max_active is full — wait for a merge or raise the ceiling.

Previous: [Chart](chart.md) · Next: [Phases](phases.md) · [Home](../../README.md)
