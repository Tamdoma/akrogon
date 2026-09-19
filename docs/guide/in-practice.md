# In practice

What you actually do, hour by hour, plus the questions that come up. This is the page I wish I had on day one. Read it with coffee. Prerequisites: installed, widgets set up, a leaf like export-csv exists. Which directory you're in: ~/Work/widgets for sync and targeted next, anywhere for status.

## A working day

Morning, start. Open Herdr. The plugin runs akrogon pull --all and akrogon next --all. Merged leaves from yesterday are cleaned up, new GitHub issues land in issues/seeds/, and every ready leaf starts up to the seat limit. If you would rather choose what starts, set max_active to 0 before opening Herdr, then raise it and run akrogon next <folder> yourself. I do this on Mondays when I want to pick the order.

Bring your checkout up to date with the code that merged overnight:

    akrogon sync

Run that from the registered checkout, ~/Work/widgets for us. It commits your issue files, rebases, pushes. Quiet success.

Adding work, any time. In your own agent session, run /chart-issues. It imports pulled seeds, asks what it must, and writes the leaf. A small clear item like export-csv goes straight to handoff with the same files. Or write the two files by hand. Then akrogon sync or gacp. The next hook call, or akrogon next, picks it up.

Watching, glance don't stare. From anywhere:

    akrogon status
    akrogon status export-csv
    akrogon status --charts
    herdr plugin log list --plugin akrogon

The first shows this repo open leaves, phase, age, blockers — every repo when run outside one, plus parked per repo. The second shows one leaf state and last ten log lines. The third shows every chart: taken and total forks, fog items, stage, age. The fourth shows why the hook did or did not act. Or read the tab — A left, B right. Or read the leaf folder: plan.md, review-A.md, review-B.md. I mostly read status and the reviews. Tabs are for when something smells off.

Answering, when asked. An agent showing a startup dialog or permission prompt is blocked on a human. Answer it in the pane. The hook sees the status change and continues. No attempt is counted against the leaf. Blocked is free, stuck is not — more in [Limits](limits.md).

A failed leaf shows a Herdr notification. Read review-A.md and the last paragraph of plan.md, fix the brief if the brief was the problem, then:

    akrogon phase export-csv implement --slot B

Or whichever phase it should resume from — failed can go to any active phase, not just implement. The command resets fix_rounds and attempts. Don't edit phase by hand to move forward; the command owns the bookkeeping.

Evening, stop. Close Herdr, or just leave it. Every leaf phase is in its file. Nothing is lost. Tomorrow startup sweep resumes from the files. The last tab that merged closes itself. If one is still open, the startup sweep closes it. Run akrogon sync once more so the day issue files are on the remote.

## The questions that come up, answered

I've one epic and one normal issue. Can they run in parallel? Yes, by default. Every ready leaf in every repo competes for the same seats. If the epic has three unblocked leaves and the global max_active is 3, the epic can take all three and the issue waits for the first merge. The tool doesn't balance between folders. It's first come, first served. I've learned to park the epic when I want the small thing first.

I only want this epic to use the free seats. Park everything, then unpark the one epic:

    akrogon park --all
    akrogon unpark search

Parked folders sit in issues/parked/ and no sweep touches them, not the hook and not startup next --all. When the epic is done, akrogon unpark --all brings the rest back. Running leaves can't be parked, so park before you start the day. To keep one leaf inside an epic from starting, give it a blocker or set hand_built true.

I want to stop today and do it in a different order tomorrow. Nothing is remembered between runs except state.yaml. Edit the blocked-by lists of leaves that have not started. Add a slug to make one wait, remove a slug to free one. Then run next. Two limits: a leaf that already has a tab keeps its tab — dispatch still checks blockers every time, but an already-running leaf will keep getting prompted for its current phase — and you can only name leaves, so to make issue 2 wait for a whole epic, name the epic last leaf.

I want to run one leaf by hand. Set hand_built true. next skips it. Do the work yourself in a branch, and move its phase with the same akrogon phase commands the agents use. Useful for the first leaf of a new repo, before you trust the loop there. I did export-csv by hand first, then let the loop take export-json. Good way to learn.

I want to send a leaf back. Use akrogon phase <slug> <phase> to where it should resume, then akrogon next <slug>. The command resets done, verdict, prompted, attempts, and fix_rounds when leaving failed. Don't edit phase by hand — the file is truth, but the command keeps the truth consistent. Old advice said edit by hand. That was wrong and cost me a stuck leaf once.

I want to stop one running leaf. Close its tab. Nothing restarts it until the next next, and that will reopen a tab and re-prompt the current phase. If you want it to stay stopped, add a blocker or set hand_built true first. Closing alone is a pause, not a stop.

I want to pause everything. Set max_active to 0 in the global config. Leaves without a tab will not get new tabs. Leaves that already have tabs keep getting prompted for their current phase — 0 stops new starts, not in-flight prompts. To freeze harder, close tabs too. I pause this way when I need the machine quiet for a demo.

Two leaves touched the same lines. Nothing to do. A resolves the conflict in the merge, records it in review-A.md and reruns the checks; only a red check sends the leaf to check.fix, and the repair is re-reviewed.

A skill needs changing. Skills only change through akrogon leaves in the akrogon repo. File a seed there. Once merged, every agent on the machine sees the new text at its next prompt, because the skill folders are symlinks. Don't hand-edit the linked copies — edit the source via a leaf.

Previous: [Merge](merge.md) · Next: [Limits](limits.md) · [Home](../../README.md)
