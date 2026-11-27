# Charting mode

Separating how questions get answered from how code gets built lets you hand off routine planning overnight without losing control of risky changes.

**Charting mode decides who answers the questions while the work is charted. [Build route](07-build-route.md) decides who builds the work once every question is answered.**

They are two independent choices — with one firm rule linking them: **the Direct build route is offered only under No autopilot.** Under Semi-autopilot and Full autopilot, every chart uses the Lifecycle build route.

## The three Charting modes at a glance

| Charting mode | Who answers signposts | Who answers each fork | Direct route offered? | Best fit |
|---|---|---|---|---|
| **No autopilot** (default) | You | You | Yes (when eligible) | New features, client-facing decisions, small fast changes built today |
| **Semi-autopilot** | You (once per session) | Charting agent | No — Lifecycle only | Overnight batch where you want to set priorities and limits first |
| **Full autopilot** | Charting agent | Charting agent | No — Lifecycle only | Overnight batch of low-stakes, well-bounded work you will review in the morning |

You turn on a Charting mode in your own words inside your `c-` tab — no fixed command syntax is required. The charting agent reads your intent and the scope of work you hand it. Both Semi-autopilot and Full autopilot require running inside herdr (`hc`, herdr's background controller); outside herdr, the charting agent tells you autopilot cannot start.

## No autopilot

**No autopilot** is the default mode. You answer the [signposts](05-signposts.md) round and every fork question yourself, and you review and approve the hand-off before contracts are written.

**Example jobs that fit No autopilot:**

- Designing the **weekly client report export** in `client-portal`, where client-facing columns, date windows, and delivery options are business decisions only you should make.
- Building **a small, clear new CSV export button fast today** on an existing report table — No autopilot lets you settle the single open question in one turn and take the [Direct](07-build-route.md) build route.

**How to use it in your own words:**

Just open `/chart-issues` in `c-client-portal` without asking for autopilot:

```text
/chart-issues Add a weekly client report export to client-portal. Use consultants B and C.
```

## Semi-autopilot

Under **Semi-autopilot**, you answer the signposts round once for the whole session, and the charting agent answers every fork, split proposal, and hand-off review after that.

At each decision point, the charting agent writes the full question in its terminal and answers it itself using inspected evidence, your signposts, and — where your signposts are silent — standing engineering values (simplicity, function over form, removing over adding, systems thinking, speed, and price). Every pick is recorded in the fork file as the charting agent's own choice (never as your words), along with its reason, rejected options, and any standing consultant dissent.

**Example jobs that fit Semi-autopilot:**

- You are going to bed and want **three `client-portal` report bug reports** charted and handed off by morning, after you spend two minutes setting the priorities and hard limits in the signposts round.
- A batch of five follow-up cleanup issues for `client-portal` where you want to set one hard rule ("no database structure changes") and let the charting agent settle the implementation forks.

**How to turn it on in your own words:**

In `c-client-portal`, say you want autopilot while you answer the signposts, naming the work to chart and which consultants to use (or none):

```text
/chart-issues Chart these three client-portal report issues on autopilot, I'll answer the signposts. Use consultants B and C.
```

You can also switch Semi-autopilot on mid-chart by naming the chart in `c-client-portal`. Any answers you already gave stay recorded as yours, and if the session has no signposts yet, the charting agent asks the signposts round before answering anything itself.

## Full autopilot

Under **Full autopilot**, the charting agent answers **both** the signposts and every fork after them.

In its first reply, the charting agent echoes the mode, your handed list of work, the consultants, its signpost picks (recorded clearly as its own), and a preview of the session's needs sheet. It may order the charts you handed it, but it can never drop one — any drop it would make is noted for you instead.

**Example jobs that fit Full autopilot:**

- You are going to bed and want **three low-stakes internal `client-portal` report cleanup issues** charted and handed off without even answering signposts first.
- A batch of routine audit findings where the written contracts will be easy to scan in the morning before you run them.

**How to turn it on in your own words:**

In `c-client-portal`, tell the charting agent to run full autopilot and answer the signposts as well, naming the work and consultants (or none):

```text
/chart-issues Run full autopilot on these three client-portal cleanup reports — answer the signposts and all forks yourself. Use consultant B.
```

If your message asks the charting agent to answer only the signposts while you keep answering the forks, that does not match any of the three modes, so the charting agent asks which mode you meant before proceeding.

## Direct is offered only under No autopilot

**Direct is offered only under No autopilot. Semi-autopilot and Full autopilot always use the Lifecycle build route — Direct is never offered under either autopilot mode.**

Because autopilot makes design picks while you are away, every autopilot chart produces written task contracts under `issues/open/` for a fresh **slot A (the builder)** and **slot B (the reviewer)** instead of letting the charting agent edit code straight away. And remember: autopilot charts and hands off only — it never starts building the handed-off work.

## What still waits for you under Semi-autopilot and Full autopilot

Autopilot never crosses human-only boundaries. If a chart hits any of the following, the charting agent parks that chart, moves on to the next runnable chart in your handed list, and alerts you when needed:

- **A pending needs-sheet row**: a missing API key or file, a live-account grant approval, permission to keep a test fixture alive, or a secret-saving approval.
- **A real-world check that changes external data** and needs your grant, or a **human-only prerequisite** (like updating a DNS record).
- **A late-found need or wider authority** discovered after the opening needs sheet that cannot stay inside what you already approved (parks the chart and sends one `akrogon notice --attention`).
- **A new-chart proposal**: when charting uncovers required work that needs its own separate destination, the charting agent parks the waiting chart, sends one attention alert, and asks one fixed question: `"chart <X> on its own (yes) or bring it into <waiting chart> (no)?"`.
- **A blocking finding on a GitHub seed's operator decision**, where the pre-decided requirement cannot be built or verified as written (sends one attention alert).
- **A conflict between your own answers** (such as two seed decisions contradicting each other, or a seed decision clashing with your reply).

Your next message in `c-client-portal` — such as adding a key or answering `"yes"` — resumes the waiting chart while keeping autopilot active.

## Boundaries, records, and turning autopilot off

- **Fixed list only**: Semi-autopilot and Full autopilot chart only the work you handed them. They do not import extra GitHub seeds on their own, and they hold off on any item already covered by another open charting session.
- **Lost consultants**: If a consultant errors out, blocks, or stops replying twice without returning its file, autopilot drops that consultant for the rest of the session and keeps going with the rest, logging the drop.
- **Clear audit trail**: Every mode change goes into `CHART.md` under `## Mode record`, and every autopilot run writes an `## Autopilot` summary listing any boundary breaches first, your switch-on words, consultants, who answered signposts, handed-off tasks, waits, proposals, and any picks that went against a recommendation. At the end of a pass, the charting agent prints one summary line per chart.
- **Ending the mode**: Autopilot ends automatically once every handed chart is marked `Handed off` or `Closed`. To stop earlier, tell the charting agent in `c-client-portal` to turn autopilot off; once any in-flight consultant turn finishes, the next question comes back to you.

Read the `## Autopilot` record before starting handed-off work so you can catch any pick you disagree with before code reaches your default branch (your main live code).

Previous: [Signposts](05-signposts.md) · Next: [Build route](07-build-route.md)
