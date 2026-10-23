# Why it works

Akrogon rests on three choices. Progress lives in files. Building and reviewing are separate jobs. A contract comes before any code.

## Progress lives in files

Each leaf has a `state.yaml` file. It records the leaf's phase and which seats have finished their part of it. Seats report their work with `akrogon phase`, which checks the move and writes the file. Each pass also leaves its work in the leaf folder: the plan, the build report, each review.

The command reads these files, not an agent's memory. When `akrogon next` runs, it looks at each leaf's state and prompts the seat whose turn it is. So a closed terminal, a crashed agent or a full context window does not lose the work. The next pass picks up from the files.

You can read the same files. They are plain text in your repository, so Git keeps their history. To see where a leaf stands, run `akrogon status <slug>`. The fields are listed in [State and phases](../reference/state-and-phases.md), and the folders in [Files](../reference/files.md).

## Build and review are separate seats

![Two seats: A implements, then A and B each review blind, and neither reads the other's review. With no findings the leaf goes to merge. With findings, B repairs most of them in check.repair and hands named exceptions to A in check.fix, and B re-checks A's fixes before the leaf goes to merge.](../pictures/two-seats.svg)

Seat A builds. Then A and B review the build, each without reading the other's review. Each review ends in a verdict: `ready`, `nits` or `fix`. A `fix` names a concrete defect, with its cause and what it breaks.

When there is a fix, B repairs most findings itself. B hands back to A only the few kinds of fix B may not make, such as a change to a test's expected result, and then re-checks A's repair. The seat that wrote the code is never the only one that judges it.

Both seats can use the same agent CLI and model. Two seats give two separate passes over the work. They do not promise that every mistake is caught. See [check-issue](../../skills/check-issue/SKILL.md) for how a review is done.

## A contract comes before code

A leaf starts from `brief.md` and `design.md`, which the chart door writes after you have answered every open question. The brief says what to build, why, and the done-criteria: the results that show the work is finished. The design holds the settled decisions the build must follow.

Seats do not stop to ask you questions. Everything they need is in the contract. When a seat hits something only a person can do, such as a missing key, it stops the leaf as `failed` with the reason, and you fix it. See [When work fails](../use/when-work-fails.md).

The contract also guards the tests. A's plan names how each done-criterion is proved. When building starts, the command records the files the plan changed. After that, changing an old test file, changing a recorded file or adding a new test file needs a `Test-Change:` line in a commit that says why. So a test cannot be quietly weakened to pass. See [Checks](../reference/checks.md#test-change-refusals).

Next: [Install](install.md)
