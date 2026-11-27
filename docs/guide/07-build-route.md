# Build route

Choosing the right build route lets you ship small, settled changes in minutes without sacrificing independent code review or automated safety checks.

**Build route decides who builds the work once every question is answered. [Charting mode](06-charting-mode.md) decides who answers the questions while the work is charted.**

Once a chart has no open questions left, Akrogon supports two Build routes: **Direct** and **Lifecycle**.

## Direct vs Lifecycle at a glance

| Build route | Who builds (slot A) | Who reviews (slot B) | When it is offered | Best fit |
|---|---|---|---|---|
| **Direct** | The charting agent itself, in a separate worktree | The charting agent's first consultant (`B`) | **Only under No autopilot**, when all eligibility checks pass | One small, settled change — a fast feature as well as a bug fix |
| **Lifecycle** | A fresh **slot A (the builder)** in its own tab | A fresh **slot B (the reviewer)** in its own tab | Always available (the only route under Semi-autopilot and Full autopilot) | Larger features, multi-task work, work needing keys/grants/live runs, or anything charted on autopilot |

## Direct

On the **Direct** route, the charting agent builds one small, settled change itself as **slot A (the builder)** inside an isolated **worktree** (a separate working copy of the project on its own git **branch**, or isolated line of changes, so your main folder stays untouched). The charting agent's first consultant acts as **slot B (the reviewer)**, and Akrogon's merge queue runs the project's checks and lands the tested **commit** (saved snapshot of changes) on your **default branch** (your main live code) just like any other task.

Direct skips handing the work off to fresh Lifecycle seats, while keeping every decision you made during charting, the task record under `issues/open/`, independent review by slot B, the merge queue, and any configured Discord announcement.

Direct is not limited to bug fixes — it is for **fast features as well as fixes** whenever the change is small, clear, and completely settled.

**Example jobs that fit Direct (paired with No autopilot):**

- **Fast feature**: *"I want a small, clear new CSV export button built fast today"* on `client-portal`'s existing client report table, reusing data the page already loads. This fits **No autopilot** with **Direct**.
- **Bug fix**: Correcting a wrong timezone label in the header of `client-portal`'s weekly client report export.

### When Direct is offered

**Direct is offered only under No autopilot — never under Semi-autopilot or Full autopilot.**

No repository setting is needed. At the [hand-off review](08-hand-off.md), the charting agent checks eligibility automatically and offers Direct only when **every** condition below holds:

1. **No autopilot** is active (neither Semi-autopilot nor Full autopilot).
2. **At least one consultant (`B`) is named**, so an independent reviewer is ready to act as slot B.
3. **The charting agent is running inside herdr (`hc`, herdr's background controller)**.
4. **One outcome with no unfinished dependency**: a single small task, not a multi-part feature.
5. **No readiness extras**: the task needs no extra keys or files (`inputs`), no live-account `grants`, no generated credentials (`produces`), and no kept live resources (`retained`).
6. **No live run or external call during building**: automated local tests prove the change (real-world checks already run during charting do not disqualify Direct).
7. **No pending human-only prerequisite**.

If any condition fails, the charting agent states why in one line at the hand-off review and takes the **Lifecycle** route instead. Even when a chart is eligible, the charting agent may still recommend Lifecycle if the change feels risky, and you can always decline Direct. Your chosen route is saved on the `Route:` line of `CHART.md`.

### What happens when you choose Direct

You do not have to run the underlying commands yourself — the charting agent drives the steps while you can watch progress in `akrogon status`:

1. The charting agent writes the standalone task files (`ISSUE.md`, `brief.md`, `design.md`, `readiness.yaml`) under `issues/open/<chart-slug>/` and runs `akrogon direct` with consultant `B` as reviewer, which verifies both terminals are live, creates the isolated worktree, and creates `state.yaml` with `direct: true` in the `implement` phase (no separate tab is opened).
2. The charting agent builds the change and runs tests in that worktree as **slot A**, then moves the task to review.
3. Consultant `B` reviews the code independently as **slot B**. If fixes are needed, the charting agent repairs as slot A and consultant `B` re-checks.
4. Akrogon's merge queue verifies the changes on a clean copy of the project, pushes that exact tested commit to your default branch, closes any linked GitHub issues, and moves the completed record to `issues/closed/`.
5. If Discord announcements are configured, consultant `B` sends the update and the charting agent waits for that turn to finish before reusing `B`, then marks `CHART.md` as `Closed`.

### If a Direct job turns out bigger than expected

If the work outgrows Direct mid-build — a settled decision needs to change, an unexpected API key or live grant appears, a check cannot pass, or a second outcome shows up — the task stops in `failed` so you can pick the next step:

- **Abandon it**: the charting agent runs `akrogon direct-drop`, which stops any running checks, removes the temporary worktree and branch, archives the task folder under `<chart>/direct/`, and marks the chart `Held`.
- **Move it to Lifecycle**: the Direct attempt is dropped the same way, and the work is handed off as a fresh Lifecycle task instead.

## Lifecycle

On the **Lifecycle** route, the charting agent writes complete **task contracts** (`brief.md`, `design.md`, `readiness.yaml`, and `state.yaml` under `issues/open/`) so a **fresh slot A (the builder)** and a **fresh slot B (the reviewer)** can plan, build, review, and land the work in their own dedicated herdr tab.

**Example jobs that fit Lifecycle:**

- The full **weekly client report export** in `client-portal`, which spans CSV generation, scheduled email delivery, an SMTP API key in `.env`, and a staging test-send grant across more than one task.
- Any work needing external credentials, live-account tests, or multiple independent tasks running in parallel.
- Any small change that touches sensitive billing or auth logic where you want fresh seats with clean context instead of the charting conversation.
- **Every chart run under Semi-autopilot or Full autopilot**, because Direct is offered only under No autopilot.

On Lifecycle, the charting agent writes the contracts and stops — it does not start slot A or slot B. See [Hand-off](08-hand-off.md) for what the review looks like and how you start handed-off work.

Previous: [Charting mode](06-charting-mode.md) · Next: [Hand-off](08-hand-off.md)
