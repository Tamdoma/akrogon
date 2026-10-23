# One change, start to finish

This page tells how one real change went through Akrogon: an optional two-step sign-in, with codes from an authenticator app, added to a translation web app. It follows the change from the first note to the merged commit. Each step links the page that covers it in detail.

![How one change flows from plan to merged: plan, build, review, then the command lands it and it is merged. A review with no finding goes straight to landing. A finding goes to repair: when B fixed it all the leaf goes on to landing, and when some fixes were handed to A, B re-checks A's fixes first.](../pictures/change-flow.svg)

This change took the shortest path in the picture: the review had no finding, so nothing went to repair.

## The note

The operator wanted every account to have the option of a second sign-in step, if it was easy to build. Nobody would be forced to use it. Some people keep their codes in a password manager instead of on a phone, so the secret key had to be viewable, not only shown as a QR code. Many people shared office computers, so there would be no "remember this device" option.

## Charting

The operator ran `/chart-issues` in an agent pane, which made that pane the chart door. See [Plan work](../use/plan-work.md). This change was one part of a bigger build of the app, so earlier fork rounds had already settled many of its rules: how sign-in works, who counts as an admin, what every data change must record, how error messages read and what the screens must do for keyboard and screen reader users.

Two chart consultants worked beside the door. When the forks were settled, the door drafted the contracts, and each consultant reviewed them as if it had to build them. The door marked the lines they agreed on.

The brief listed eight done-criteria. Three examples:

- A person turns two-step sign-in on from their account page by entering their password, scanning the QR code and typing one valid code. They see their backup codes once.
- After the correct password, a person with two-step sign-in on gets a code step, and no session exists until a valid code is accepted.
- An admin can turn it off for a person who lost their phone, and every session of that person ends at once.

## Handoff

At the handoff review the operator approved the leaf with no debate, so it would start with A writing the plan alone. The door wrote the leaf folder under `issues/open/`, inside an issue inside an epic. The folder held `brief.md`, `design.md`, `readiness.yaml` and `state.yaml`, and the door marked the chart `Handed off`. See [Review the handoff](../use/plan-work.md#review-the-handoff).

The design copied each settled decision word for word from its fork, so the seats would not have to look them up. It also named two earlier leaves this one built on: the sign-in leaf and the roles leaf. They went into `blocked-by` in `state.yaml`. See [Order leaves with blocked-by](../use/write-issues-by-hand.md#order-leaves-with-blocked-by).

## akrogon next

The operator ran `akrogon next`. The leaf waited until both earlier leaves had merged. Then `akrogon next` made its worktree, opened a Herdr tab with a pane for seat A and a pane for seat B, and prompted A. See [Run work](../use/run-work.md).

## The plan

With no debate, the leaf started at `plan.synthesis`. A read the brief, the design and the live code, and wrote `plan.md` with [plan-issue](../../skills/plan-issue/SKILL.md).

The plan found one gap between the design and the code. The design said the sign-in record is confirmed only for a finished session. The code confirmed every session, including the one made after the password and before the code. The plan made that rule true in this leaf and wrote a note so the reviewers would see why.

The plan split the work into four units in two waves. The first wave held the server side and the error message text. The second wave held the sign-in and account pages, and the user list where admins reset a person's codes. For each done-criterion it named the test and the command that proves it.

A wrote the tests first and ran them on the unchanged code. Every new test failed, which showed they tested something real. A also listed five break checks: small breaks of the new code that a test must catch. When A moved the leaf to `implement`, the command recorded the planned test files, so a later change to them would need a reason.

## The build

A built the leaf with [implement-issue](../../skills/implement-issue/SKILL.md). It handed each unit to a worker agent in its own worktree, one wave at a time, and picked their commits onto the leaf branch.

Then A walked through the accessibility checklist in a real browser and found two real bugs:

- After each step, keyboard focus fell back to the top of the page.
- The page's content security policy blocked the QR image, so people saw its text label instead of a code to scan.

The test files were already recorded, so A added a test that caught the blocked QR in a commit with a `Test-Change:` line naming its source. That test failed first. A fifth unit then fixed both bugs, and the test passed. A ran `akrogon verify` on the final commit, which ran the project's checks on a fresh checkout and came back green. Without that green result, the move to review is refused. A wrote `implementation/report.md` and moved the leaf to `check.review`.

## Review by both seats

A and B reviewed the build with [check-issue](../../skills/check-issue/SKILL.md), each without reading the other's review. Each one walked the done-criteria through the code and checked the planned proof runs. Both tried the obvious way around the limit on wrong codes: sending a code with the attacker's own session attached. Both found it did not work.

Both verdicts were `nits`, with no fixes. The nits were real but small, for example:

- The copy buttons gave no sign that the copy worked.
- The admin reset counted a setup a person had started and abandoned as "on".

Each nit said what new evidence would turn it into a fix. With no fix, the leaf skipped repair and moved to `merge` with no repair rounds used.

## Landing

No seat was needed to land. `akrogon next` saw that the merge attempt was ready and started `akrogon land`. The land run checked the attempt, pushed it to the default branch and moved the leaf to `merged`. See [Merge and announce](../use/merge-and-announce.md).

## Merged

The change reached the default branch with one plan, two waves of workers plus one repair unit before review, two `nits` verdicts and no repair rounds. The leaf folder kept the brief, design, plan, report and both reviews as the record of what was decided and why.

Next: [A working day](../use/a-working-day.md)
