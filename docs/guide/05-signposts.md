# Signposts and the needs sheet

Setting direction once up front keeps a charting session aligned with your business priorities instead of debating trade-offs from scratch on every question.

## What signposts are and when they are asked

**Signposts are your ranked priorities, hard limits, and the order of the session's charts (including any chart you choose to drop). They are asked once per session, before any territory map.**

![One charting session in the c- tab: your first message, the signposts asked once, the territory map, then charts 1, 2 and 3. Waits, compaction and handovers stay inside the session. Signposts hold ranked priorities, hard limits and the chart order, including drops.](../pictures/signposts-session.svg)

A single charting session covers everything from your first message in the `c-` tab until you start a new charting run. It survives waits, conversation compaction (summarizing a long chat), and automatic handovers between charts. If you resume an unfinished chart in a later session, it uses the new session's signposts rather than stale ones from days ago.

## How the signposts round works

Right after intake (and after starting or restarting any consultants), the charting agent runs one quick consultant exchange to catch angles it might have missed, then presents the signposts round.

![A quick consultant exchange, then the signposts round card: 4 to 7 questions, 2 or 3 options each with one recommendation, no research block, and same to reuse earlier answers. A short account follows, and forks/signposts.md is saved in the original chart with verbatim copies in the other charts.](../pictures/signposts-round.svg)

Compared to normal fork rounds, signposts stay deliberately light:

- **4 to 7 questions** drawn from the work in front of you, covering only choices that steer several later decisions across the session's charts.
- **2 or 3 options** per question, one labelled recommendation, and a short note saying which later decisions the answer steers.
- **No research block** (just the reply key and challenge check, plus small text drawings only when visual options differ).

If an earlier session on the same repository already recorded signposts, the charting agent proposes those earlier answers first so you can reply `"same"` or change only what shifted.

Once answered, the charting agent prints one short account stating what the session will prioritize and what it will give up, and saves the record in `forks/signposts.md`. The original lives in the chart where the round ran, and every other chart in the same session receives a verbatim copy naming the original. If you later correct a signpost, the charting agent appends your dated correction to the original and re-copies it to every open chart in the session.

## Who answers signposts in each Charting mode

Who answers the signposts round depends on your [Charting mode](06-charting-mode.md):

![Who answers in each Charting mode. No autopilot: you answer signposts and forks, and an unanswered signpost is asked again. Semi-autopilot: you answer signposts once, the charting agent answers forks, and standing values fill an unanswered signpost. Full autopilot: the charting agent answers both.](../pictures/signposts-by-mode.svg)

| Charting mode | Who answers signposts | Who answers the forks after | If you leave a material signpost unanswered |
|---|---|---|---|
| **No autopilot** | You | You | Stays open and is asked again before the first fork |
| **Semi-autopilot** | You (once, for the whole session) | The charting agent | Recorded as unanswered; built-in standing values fill the gap and it is not asked again |
| **Full autopilot** | The charting agent | The charting agent | Answered by the charting agent and echoed in its first reply |

Under **Full autopilot**, the charting agent records its signpost picks clearly as its own (never as your words). It may put your handed charts into a sensible order, but it can never drop a chart you asked it to work on. Any drop it would have chosen is recorded as a note for you instead.

If two of your own statements about signposts conflict, the charting agent shows the clash in one line and asks you under No autopilot and Semi-autopilot; only Full autopilot resolves signpost conflicts on its own. A conflict between two of your answers on a specific fork (for example, a GitHub seed decision clashing with a reply) always waits for you in every mode.

## The needs sheet

One **needs sheet** travels with the signposts round, asked once per session before the first territory map and covering every chart in the session.

![The needs sheet lists four kinds of rows: keys, logins and files, accounts and permissions, approvals, and human-only actions, each with status pending, supplied or late. Only you answer rows, and pending rows let charting continue, waiting only at proofs and the hand-off.](../pictures/needs-sheet.svg)

The needs sheet lists every foreseeable item that only you can supply or approve:

- **Keys, logins, and files**: API keys or credentials that belong in a project's `.env` file (the local, unshared secrets file), or local files the work depends on.
- **Accounts, resources, and permissions**: access to a staging environment, test account, or external service.
- **Approvals**: permission for live changes on external accounts (a scoped grant), keeping a test resource alive after a check, or approving a narrow secret-saving step.
- **Human-only actions**: steps an agent physically cannot perform, such as adding a DNS record or clicking a vendor confirmation email.

Each row states its purpose, which tasks use it, exact permissions or resources, where it goes, and what done looks like. The rows live under `## Needs` in `forks/signposts.md` with status `pending`, `supplied`, or `late` (or `none` when the session needs nothing from you).

Two rules keep the needs sheet practical:

1. **Only you answer needs-sheet rows, never the charting agent, even under Full autopilot.** The charting agent cannot grant itself live-account permissions or invent API keys.
2. **Pending rows do not pause charting.** You can supply keys or approvals at your own pace while charting continues. Only the real-world checks (proofs) that need a missing item and the final hand-off wait on it, and a pending row is never re-asked as a question mid-chart.

If charting later uncovers a new key or wider permission that was not on the opening sheet, the charting agent either keeps the work inside the authority you already approved or parks that chart, moves on to any other ready chart, and sends one attention alert (`akrogon notice --attention`) naming what is blocking it.

## Worked example: `client-portal`

Suppose you open `c-client-portal` on Monday morning with three items: the **weekly client report export**, a **CRM sync retry fix**, and an **agency logo header tweak**.

![The client-portal example: three charts, the weekly client report export, the CRM sync retry fix and the agency logo header tweak, your reply 1a 2a 3a 4a, the chart order, three needs rows with the key pending, the approval supplied and the human-only check pending, then the territory map starts.](../pictures/signposts-example.svg)

Before mapping any code, the charting agent presents a light signposts round and needs sheet together:

```text
Signposts for this session (3 charts in client-portal):

1. Speed vs format polish for the weekly client report export?
   - 1a (recommended) Ship clean CSV first; leave branded PDF layout for a later chart.
     Steers: scope split, dependencies, and delivery order.
   - 1b Ship CSV and branded PDF together in one pass.
     Steers: scope split and PDF library choice.

2. Hard limit on paid external services?
   - 2a (recommended) Zero new paid APIs or third-party rendering services; use existing stack only.
     Steers: PDF/export tooling and email delivery options.
   - 2b Allow a paid rendering service up to $50/month.

3. Which timezone should report dates and sync times use?
   - 3a (recommended) Each client's own timezone, stored on the client account.
     Steers: the weekly report's date window, the CRM sync timestamps, and the header labels.
   - 3b One agency-wide timezone for every client.
     Steers: the same three, with less setup but wrong week edges for clients elsewhere.

4. Order for this session's three charts?
   - 4a (recommended) Weekly client report export first, CRM sync fix second, logo tweak third.
     Steers: which chart is charted and handed off first.
   - 4b CRM sync fix first, drop logo tweak for this session.

Needs sheet (answer at your own pace; pending rows wait only at proofs and hand-off):
- Row 1 (key): POSTMARK_API_KEY in client-portal/.env, needed to verify scheduled report emails.
- Row 2 (approval): Scoped grant to send 1 test report email to staging-reports@agency.example and verify delivery.
- Row 3 (human-only): Confirm SPF/DKIM sending domain is verified in Postmark before scheduled emails hand off.

Reply `1a 2a 3a 4a` (or answer in your own words), plus any needs rows you already want to approve.

Challenge check
Consultant B prefers 3b because most clients share the agency's timezone. 3a stays recommended because a wrong week edge changes the report totals.
```

You reply:

```text
1a 2a 3a 4a. Approved row 2 for staging-reports@agency.example only. I'll add the Postmark key and verify DNS before hand-off.
```

The charting agent prints a two-sentence account: *"This session prioritizes shipping the weekly client report export as CSV first with zero new paid services and each client's own timezone, followed by the CRM sync fix and logo tweak; branded PDF layout is left out of scope for now."* It then records your answers and the three needs rows in `forks/signposts.md`, and moves straight into the territory map while rows 1 and 3 stay `pending`.

Previous: [A charting session](04-a-charting-session.md) · Next: [Charting mode](06-charting-mode.md)
