# Plan: charting-guide

## Context and pre-planning checks

- **Authoritative leaf folder**: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide`
- **Worktree**: `/home/ivan/.akrogon/worktrees/akrogon/charting-guide` (`AKROGON_BASE`: `562611bd309252ddcbe7a18a04a88629d0e82c0e`)
- **Brief vs. design check**: No conflict between `brief.md` and `design.md`.
- **Open for the plan**: `design.md` lists no `Open for the plan:` questions. Remaining implementation choices (page-by-page structure, running example, navigation footers, wave order, behavior-claim ledger format) are resolved in D1–D7 below without reopening locked scope.
- **Credentials and readiness check**: `readiness.yaml` has empty `inputs`, `produces`, `grants`, `retained`, and `proofs`. `design.md` names no credential environment variables, and `akrogon status charting-guide` reports zero `Missing:` lines. Per `design.md`, slot B's cold-reader subagent runs inside slot B's own review session, so it is not a separate paid launch and needs no grant.
- **Grounding check**: `docs/reference-index.md` and all relevant linked area files exist and were read; no missing grounding resources.

## Read-first paths

Keep this list as worker/implement context (open the index only on a gap):

- `docs/reference-index.md` — repository grounding index
- `docs/README.md` — current human docs home (edited by Wave 2)
- `docs/reference/where-things-go.md` — docs ownership rules ("one home per fact", link rules)
- `skills/AREA.md` — skills overview
- `src/AREA.md` — command overview (direct route, status, readiness, notices, seats)
- `tests/AREA.md` — test suite overview
- `tests/docs-links.test.ts` — link, anchor, and image checker run by `checks`
- `skills/chart-issues/SKILL.md` — primary source of truth (`## Open`, `## Drain`, `## Take`, `## Handoff`, `## Direct route`, `## Autopilot`, `## Handover`)
- `skills/chart-issues/assets/questions.md` — operator round shape, signposts round, research tiers, blind peer exchange
- `skills/chart-issues/assets/autopilot.md` — Semi-autopilot and Full autopilot behavior, waits, new-chart proposals, records
- `skills/chart-issues/assets/shapes.md` — chart folder layout, `CHART.md`, `INTAKE.md`, `forks/signposts.md`, `forks/<slug>.md`, `readiness.yaml`, `ISSUE.md`/`EPIC.md` `slots:`
- `skills/chart-issues/assets/handover.md` — session reset between charts
- `skills/chart-issues/assets/standing-design.md` — standing design rules (model-choice line)
- `skills/chart-issues/scripts/door-reset.ts` — supported handover harnesses (`claude`, `agy`, `codex`, `pi`) and reset behavior
- `skills/chart-issues/scripts/chart-usage.ts` — usage summary run before hand-off review and at chart end
- `src/direct.ts` — `akrogon direct` and `akrogon direct-drop` behavior and refusals
- `src/status.ts` — `akrogon status --charts` (`TAKEN`, `FOG`, `STAGE`, `AGE`) and `Missing:` lines
- `src/readiness.ts` — `readiness.yaml` schema and presence gap checks (`gaps`)
- `src/notice.ts` — `akrogon notice --attention` toast/file behavior
- `learnings/LESSONS.md` — historical observations read for planning (not rules; notable observation: `2026-09-14` ambiguous prose after rename, `2026-09-11` stale rule in docs)

## Decisions

### D1 — File inventory, `docs/README.md` placement, and existing-only navigation links

- Create five new files under `docs/guide/`:
  1. `docs/guide/04-a-charting-session.md`
  2. `docs/guide/05-signposts.md`
  3. `docs/guide/06-charting-mode.md`
  4. `docs/guide/07-build-route.md`
  5. `docs/guide/08-hand-off.md`
- Add a `## Charting` section to `docs/README.md` right after `## Start` (so Chapter 1 / Start stays first and Chapter 2 / Charting follows in reading order), linking all five pages in numbered order (`04` -> `05` -> `06` -> `07` -> `08`) with a one-line plain description each. Leave the existing `## Start`, `## Use`, `## Reference`, and `## Examples` sections untouched (`guide-chapters` retires the old pages later).
- Link ONLY to files that exist at landing:
  - Never link `01`–`03` or `09`–`13` (owned by `guide-chapters`).
  - Never add image links or image placeholders (`charting-pictures` embeds the two SVGs later).
  - Do not link into `docs/start/`, `docs/use/`, or `docs/examples/` (those folders are scheduled for retirement by `guide-chapters`). Inside `04`–`08`, link only among `04`–`08`, `../README.md`, `../../skills/chart-issues/SKILL.md`, and (only if genuinely needed as an optional lookup) `../reference/commands.md` or `../reference/files.md`.
- Every page ends with a Previous / Next line naming only pages that exist at landing:
  - `04-a-charting-session.md`: `Previous: [Docs home](../README.md) · Next: [Signposts](05-signposts.md)`
  - `05-signposts.md`: `Previous: [A charting session](04-a-charting-session.md) · Next: [Charting mode](06-charting-mode.md)`
  - `06-charting-mode.md`: `Previous: [Signposts](05-signposts.md) · Next: [Build route](07-build-route.md)`
  - `07-build-route.md`: `Previous: [Charting mode](06-charting-mode.md) · Next: [Hand-off](08-hand-off.md)`
  - `08-hand-off.md`: `Previous: [Build route](07-build-route.md) · Back to [Docs home](../README.md)`

### D2 — Approved vocabulary and retired-phrase hygiene

- Use ONLY the operator-approved words across `docs/guide/04`–`08` and the new `## Charting` section in `docs/README.md`:
  - **Charting mode**: `No autopilot`, `Semi-autopilot`, `Full autopilot`
  - **Build route**: `Direct`, `Lifecycle`
  - **Build roles**: `slot A` (the builder) and `slot B` (the reviewer)
  - **Charting roles**: `charting agent` (the main agent in the `c-` tab, tagged `A` in merged consultant notes) and `consultants` (independent helper agents `B`, `C`, `D`… advising during charting — explicitly distinguished from the fresh `slot A` and `slot B` that build a Lifecycle task, while explaining that on the Direct route the charting agent acts as slot A and its first consultant acts as slot B)
  - **Direction step**: `signposts` and `needs sheet`
  - **Planning term**: `charting` / `chart`
- Never use any phrase retired by `design.md` Q4 (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`) or the word `manual` to describe a Charting mode or Build route — even in "formerly called…" notes — because `taxonomy-rename` lands a guard test banning those retired phrases in `README.md` and `docs/`. Also avoid calling the charting agent "the door" or "chart door" in guide prose; use "charting agent".
- Explain every technical or Akrogon term in plain English the first time it appears in the chapter (e.g., `herdr` workspace and the three daily tabs `t-`, `c-`, `w-`; `repository` / `repo`; `worktree`; `default branch`; `seed`; `fork`; `fog`; `leaf` / written task contract; `.env` file; `readiness.yaml`). Because `01`–`03` do not exist yet, `04-a-charting-session.md` briefly introduces the `c-` tab (and names `t-` and `w-` in one sentence) without assuming the reader has read chapter 1.

### D3 — Made-up running example carried across all five pages

- **Made-up project**: `client-portal`, an agency's internal client reporting web app (registered in Akrogon; daily herdr tabs `t-client-portal`, `c-client-portal`, `w-client-portal`). Names no real client and no repo from the operator's machine config.
- **Running example job**: **"Add a weekly client report export to `client-portal`"** — letting account managers export a weekly client performance summary (CSV and/or PDF) with an optional scheduled email delivery follow-up.
- **Per-page progression** (consistent names, facts, and tone across all 5 pages):
  - `04-a-charting-session.md`: Walks one complete session in `c-client-portal` from `/chart-issues Add a weekly client report export to client-portal` through signposts, territory map, blind consultant notes and rebuttals (consultants B and C), answering one fork per round (e.g., report columns and date window, CSV first vs PDF), clearing fog (e.g., "exports time out on large accounts"), and reaching the hand-off review.
  - `05-signposts.md`: Shows the concrete signposts round for a `client-portal` charting session covering the weekly client report export plus two queued items (a CRM sync bug and a header tweak) — illustrating ranked priorities, hard limits (e.g., no new paid third-party PDF service), chart order/drop, and a concrete **needs sheet** (e.g., SMTP API key in `.env` for scheduled report emails, operator approval for a staging test-send grant, a human-only DNS SPF check).
  - `06-charting-mode.md`: Maps `client-portal` work to all three Charting modes — **No autopilot** for designing the weekly client report export (or building a small, clear new export button fast today); **Semi-autopilot** for charting a batch of three report bug reports before bed where you set signposts once and the charting agent answers the forks; **Full autopilot** for three low-stakes internal report cleanup items before bed where the charting agent answers both signposts and forks — with natural-language prompt examples for each.
  - `07-build-route.md`: Contrasts **Direct** (a fast feature such as adding a small, clear "Export CSV" button to an existing client report table today, or a bug fix such as correcting a wrong timezone header on the weekly client report export — always under **No autopilot**) against **Lifecycle** (the full weekly client report export with scheduled emails, credentials, and multiple outcomes, or any chart run under Semi-autopilot or Full autopilot).
  - `08-hand-off.md`: Shows the settled weekly client report export records (`CHART.md`, `INTAKE.md`, `forks/*.md`, `Off route`, empty `Fog`), walks through the hand-off review (task tree, decisions, seed decisions, proofs, grants, seats, usage summary, live-run estimate), consultant draft review, and what gets written under `issues/open/` (and that Lifecycle hand-off does not start the work; you run `akrogon next` in `t-client-portal` or use the watcher in `w-client-portal`).

### D4 — Page-by-page content map and one-home-per-fact boundaries

Each page owns its topic without dumping raw skill mechanics, while guaranteeing every Cold-Reader Question (Q1–Q7) has an unambiguous, directly quotable answer:

1. **`docs/guide/04-a-charting-session.md`** (*A charting session*):
   - Opening (at most 1 sentence of soft selling): charting turns a rough request into clear written decisions before anyone writes code, so coding agents stop guessing.
   - Where charting happens: the `c-` tab (`c-client-portal`) in your herdr workspace — one-sentence orientation to the three daily tabs (`t-` for running commands and checking status, `c-` for charting with your charting agent, `w-` for the unattended watcher). Explicitly note this `t-`/`c-`/`w-` naming is your daily tab layout in the repo's herdr space (Akrogon resolves the repo space by repo name rather than hardcoding tab prefixes).
   - Opening a session: typing `/chart-issues` with a note in `c-client-portal`, or bringing in GitHub issues with `akrogon pull` (which mirrors them to `issues/seeds/`), plus `akrogon flaky` and `akrogon status` surfacing flaky tests and failed tasks as optional intake candidates. What the first reply reports (consultants named or working alone, Charting mode, who answers signposts).
   - How consultants work during charting (**Cold-reader Q7**): you can name existing consultant terminals or ask the charting agent to create consultants (`B`, `C`, `D`…) inside herdr (`hc`), arranged in a right-hand column beside the charting agent. **Explicit quotable statement**: *Consultants map the codebase and answer each open question independently (blind, without seeing the charting agent's or each other's notes), and the charting agent merges their views with tags showing who agreed — followed by one disagreement-only rebuttal from each consultant before you decide.* Note that charting-agent-created consultants restart with a fresh context when entering or switching charts, and clarify they are not the fresh slot A and slot B that build a Lifecycle task.
   - The session flow on `client-portal`'s weekly client report export:
     1. **Intake**: original words kept verbatim in `INTAKE.md` separate from agent findings; pre-decided `## Operator decision (<name>, <date>)` sections from authorized repo collaborators in GitHub seeds are locked at import and never re-asked.
     2. **Signposts and needs sheet**: brief summary linking to `05-signposts.md`.
     3. **Territory map**: charting agent and consultants inspect the live code independently and show affected areas, open choices, and lifetime risks/pitfalls before grilling starts.
     4. **One fork per round**: what a fork is (one sharp, answerable question), what a round contains (plain context, tiered research, labelled options with recommendation, optional small drawings when visual/structural options differ, pitfalls avoided, reply key like `1a 2b` or plain free text, and challenge check), how **Fog** holds unclear areas until sharpened into a fork, and how **Off route** records excluded work.
     5. **Charting mode and Build route**: one-paragraph bridge linking to `06-charting-mode.md` and `07-build-route.md`.
     6. **Hand-off and next chart**: one-paragraph bridge linking to `08-hand-off.md`; mention automatic conversation handover between charts (fresh conversation for Claude, agy, Codex, and pi inside herdr) so long sessions stay sharp.
   - Where chart files live (`issues/chart/<slug>/`: `CHART.md`, `INTAKE.md`, `forks/`, `slots/`, `seats.yaml`, `USAGE.md`) and `akrogon status --charts` to inspect progress.

2. **`docs/guide/05-signposts.md`** (*Signposts and the needs sheet*):
   - **What signposts are and when they are asked** (**Cold-reader Q4**): explicit quotable statement that *signposts are your ranked priorities, hard limits, and the order (or drop) of the session's charts — asked once per session, before any territory map*.
   - How the signposts round works: runs once per logical charting session (survives waits, compaction, and chart-to-chart handovers; a chart resumed in a later session uses the new session's signposts). Consultants add missed angles first. Light format: 4–7 questions, 2–3 options each, a recommendation, and what later decisions across the session's charts each answer steers — no research line, keeping the reply key and challenge check. Previous signposts on the same repo are offered as proposed answers ("same" or adjust). Ends with a short account of what the session prioritizes and gives up. Stored in `forks/signposts.md` (original in the first chart, verbatim copy in every other chart of the session; dated corrections re-copy everywhere).
   - **Who answers signposts in each Charting mode** (**Cold-reader Q3** & Criterion 3):
     - **No autopilot**: you answer the signposts (and every fork). An unanswered material signpost stays open and is asked again before the first fork.
     - **Semi-autopilot**: you answer the signposts once, and the charting agent answers the forks after. An unanswered material signpost is recorded as unanswered and filled by built-in standing values, not asked again.
     - **Full autopilot**: the charting agent answers the signposts too (and every fork), echoing its picks in its first reply and recording them as its own (it may order your handed charts, never drop one).
     - Conflict rule: an unresolved conflict between your signpost statements is asked in No autopilot and Semi-autopilot (resolved by the charting agent only under Full autopilot); conflicts between operator answers on a fork wait for you in every mode.
   - **The needs sheet** (Criterion 3): travels with the signposts round once per session before the first map, covering keys/env values, logins, files, accounts, permissions, human-only actions, and approvals (live-account grants, keeping a test fixture alive, secret-saving approval). **Answered only by you — never by the charting agent, even under Full autopilot.** Recorded under `## Needs` in `forks/signposts.md` with status (`pending`, `supplied`, `late`). Pending rows do not block charting; only the affected proofs and final hand-off wait on them, and pending rows are not re-asked mid-chart. Late-found needs either keep work inside recorded authority or park the chart and send one attention notice (`akrogon notice --attention`).
   - Concrete worked example on `client-portal` (signposts questions, replies, short account, and needs sheet for the weekly client report export session).

3. **`docs/guide/06-charting-mode.md`** (*Charting mode*):
   - **Definition and separation from Build route** (**Cold-reader Q1**): explicit quotable opening stating *Charting mode decides who answers the questions while the work is charted. Build route decides who builds the work once every question is answered* (linking to `07-build-route.md`).
   - Scannable comparison table of all three modes (`No autopilot`, `Semi-autopilot`, `Full autopilot`: who answers signposts, who answers forks, whether Direct is offered, best fit).
   - Detailed subsection for each mode with (a) what happens, (b) example jobs on `client-portal` that fit it, and (c) how to turn it on in your own words in `c-client-portal`:
     - **No autopilot** (default): you answer signposts and every fork. Fits new features, client-facing choices, and small fast jobs (e.g., designing the weekly client report export, or a small clear CSV export button built fast today). How to start: open `/chart-issues` with your request as usual.
     - **Semi-autopilot**: you answer signposts once; the charting agent answers every fork itself using evidence, your signposts, and (where silent) standing values (simplicity, function over form, removing over adding, systems thinking, speed, price), recording every pick as its own with reasons, rejected options, and consultant dissent. Fits a fixed batch you want charted overnight while you control the direction (**Cold-reader Q3**, e.g., three client-portal report bug reports before bed). How to turn on in plain words (requires herdr/`hc`): tell the charting agent to run autopilot while you answer signposts, naming the work and consultants (or none). Can also be switched on mid-chart (prior answers stay yours; signposts run first if not yet set).
     - **Full autopilot**: the charting agent answers both the signposts and every fork (**Cold-reader Q3**). Fits well-bounded, low-stakes batches (e.g., three internal report cleanup reports before bed). How to turn on in plain words (requires herdr/`hc`): tell the charting agent to run full autopilot and answer the signposts too, naming the work and consultants (or none). Note that delegating only signposts while keeping forks matches no mode, so the agent asks which mode you meant.
   - **Explicit Direct-route boundary** (Criterion 2 & **Cold-reader Q2, Q5**): prominent callout/paragraph stating **Direct is offered only under No autopilot. Under Semi-autopilot and Full autopilot, every chart uses the Lifecycle route — Direct is never offered.**
   - What still waits for you under Semi-autopilot and Full autopilot (pending needs-sheet rows, live-change/retention/secret-save approvals, human-only prerequisites, a new-chart proposal `"chart <X> on its own (yes) or bring it into <waiting chart> (no)?"`, blocking findings on a seed's operator decision, conflicts between your answers — moving on to other runnable charts in your list and sending one `akrogon notice --attention` on park). Clarify that Semi-autopilot and Full autopilot work only on your handed list, import nothing new, never start execution, record everything in `CHART.md` (`## Mode record` and `## Autopilot`), and end when all handed charts are handed off or closed (or when your words in `c-` turn autopilot off early).

4. **`docs/guide/07-build-route.md`** (*Build route*):
   - **Definition and separation from Charting mode** (**Cold-reader Q1**): explicit quotable opening stating *Build route decides who builds the work once every question is answered. Charting mode decides who answers the questions while the work is charted* (linking to `06-charting-mode.md`).
   - Scannable comparison table of **Direct** vs **Lifecycle** (who builds, who reviews, when offered, when to use).
   - **Direct**:
     - Definition: the charting agent builds one small, settled change itself as **slot A (the builder)** in an isolated worktree, its first consultant acts as **slot B (the reviewer)**, and Akrogon's merge queue verifies and lands it on your default branch like any other task.
     - Explicitly covers **fast features as well as fixes** (Criterion 2 & **Cold-reader Q2**): give both a fast-feature example ("a small, clear new CSV export button on an existing client report table built fast today") and a bug-fix example ("fixing a wrong timezone header on the weekly client report export").
     - **Explicit No-autopilot rule** (Criterion 2 & **Cold-reader Q2, Q5**): state clearly that **Direct is offered only under No autopilot — never under Semi-autopilot or Full autopilot.**
     - Full eligibility checklist in plain words (matching `skills/chart-issues/SKILL.md` `## Direct route` and `src/direct.ts`): no `inputs`, `grants`, `produces`, or `retained` entries needed; no live run or outside call required during implementation (charting proofs do not disqualify it); single outcome with no unfinished dependency; no pending human-only prerequisite; at least one consultant (B) named; running inside herdr (`hc`); running under No autopilot.
     - Route selection at hand-off review: eligible charts ask `lifecycle` or `direct` with a recommendation (you can always pick Lifecycle; the agent may recommend Lifecycle for a risky small job); ineligible charts print a one-line refusal and take Lifecycle. Choice recorded on `Route:` in `CHART.md`.
     - What happens on Direct: standalone contract written under `issues/open/<chart-slug>/`, `akrogon direct` creates the worktree and leaf state (`direct: true`, phase `implement`, no separate tab), charting agent builds as slot A, consultant B reviews as slot B, merge queue verifies and lands it, B sends any configured Discord broadcast, chart closes (`Closed`); if it outgrows Direct mid-pass it stops `failed` so you can abandon (`akrogon direct-drop`, chart `Held`) or drop and hand off as a fresh Lifecycle slug.
   - **Lifecycle**:
     - Definition: the charting agent writes task contracts (`brief.md`, `design.md`, `readiness.yaml`, `state.yaml`) under `issues/open/` built by a **fresh slot A (the builder)** and **fresh slot B (the reviewer)** in their own herdr tab.
     - Example jobs on `client-portal`: the full weekly client report export (CSV + PDF, scheduled email delivery, SMTP credentials and staging test-send grant, parallel or sequenced tasks), multi-outcome changes, risky changes wanting fresh eyes, and **every chart run under Semi-autopilot or Full autopilot**.
     - Clarify that Lifecycle hand-off writes contracts and stops — it does not start execution (linking to `08-hand-off.md`).

5. **`docs/guide/08-hand-off.md`** (*Decisions, review, and hand-off*):
   - **How decisions are locked before hand-off**:
     - Every open fork has a recorded answer in `forks/<slug>.md` (`## Taken`: operator's words under No autopilot, or charting agent's pick labelled as its own with reason, rejected options, and consultant dissent under Semi-/Full autopilot); `## Fog` is empty; excluded items sit in `## Off route`.
     - Pre-decided GitHub seed decisions (`## Operator decision (<name>, <date>)` from an authorized write/admin collaborator): locked at import, never re-asked, carried verbatim into leaf designs; blocking findings ask keep/change (or park under autopilot).
     - Real-world checks (`proofs`): before hand-off, every outside API/CLI call and pre-existing assumption a brief relies on gets one real observation (free before paid); anything unproven is cut from the contract rather than promised, with no waiver.
     - Readiness and grants (`readiness.yaml`): records `inputs` (keys/files), `produces`, `grants` (scoped live-change approvals plus standing paid-session entries), `retained`, and `proofs`; presence is checked before hand-off so `akrogon status` flags any `Missing:` item and `akrogon next` holds dispatch until supplied.
   - **The hand-off review**:
     - What the charting agent presents before writing contracts (or prints and answers itself under Semi-/Full autopilot): the issue/epic folder tree and leaf split (independent outcomes run in parallel; `blocked-by` only for true prerequisites), scope, destination repo, your settled decisions (and any seed decisions), confirmed grants, effective seats (asking for custom `slots:` overrides in `ISSUE.md`/`EPIC.md` only for model-sensitive work), the Build route question (or one-line Direct refusal), the chart usage summary (`USAGE.md`), live-run time/session estimates when relevant, and each pre-existing assumption with its proof or cut.
     - Destination refresh (`akrogon pull`) and `akrogon preflight` run before writing so collisions and duplicate GitHub issues are caught first.
     - With consultants, after review approval, each consultant reviews the draft contracts as a builder before the final files are written.
   - **What the charting agent hands off — and what happens next** (**Cold-reader Q6**):
     - **Lifecycle** (explicit quotable statement): *At the end of a Lifecycle chart, the charting agent hands off written task contracts (`ISSUE.md`/`EPIC.md`, `brief.md`, `design.md`, `readiness.yaml`, and `state.yaml`) under `issues/open/` for a fresh slot A and slot B, and marks `CHART.md` `Handed off <YYYY-MM-DD>`. It does not start the work.* You start ready tasks in your `t-` tab (`t-client-portal`) with `akrogon next` (or let the watcher in `w-client-portal` run them).
     - **Direct**: writes the single task files under `issues/open/<chart-slug>/`, runs `akrogon direct`, builds as slot A with consultant B reviewing as slot B, lands through the merge queue, and marks `CHART.md` `Closed <YYYY-MM-DD>` (or `Held` if dropped).
     - **Moving to the next chart**: after a chart hands off, closes, holds, or waits on a need/approval, the charting agent moves to the next runnable chart in signposts order (resetting its own conversation via handover for supported harnesses — Claude, agy, Codex, pi — while keeping the session's signposts).
   - Illustrated on `client-portal`'s weekly client report export (showing a realistic mini tree under `issues/open/weekly-client-report/` and the review checklist items).

### D5 — Tone and prose quality

- Write as a clear, grounded how-to guide for a sharp, tech-adjacent agency owner or mid-market leader who runs AI workflows, hates hype, and is new to git and Akrogon.
- Zero marketing jargon; zero unexplained developer jargon.
- At most one restrained sentence of soft selling in a page opener (practical outcome framing, no hype adjectives).
- Concrete examples and short scannable tables/lists; no copy-pasting raw skill syntax or internal script flags unless a human actually types or sees them (e.g., `/chart-issues`, `akrogon next`, `akrogon pull`, `akrogon status`, `akrogon status --charts`).

### D6 — Behavior-claim accuracy audit in `implementation/report.md`

- While writing `docs/guide/04`–`08`, verify every behavioral claim against `skills/chart-issues/` and `src/` in the worktree (noting that `taxonomy-rename` may not have landed yet on `AKROGON_BASE`, so skill files may still use older prose words like `manual`/`attended`/`autopilot signposts` for the same behaviors — judge by behavior, write using the approved names).
- In `implementation/report.md`, include a `## Behavior claims` table with columns `Page / section | Claim | Supporting path` covering every charting behavior claim across all five pages so reviewing seats can verify Criterion 5 directly.

### D7 — Execution plan: two sequential waves (serial-solo)

- **Wave 1 (Unit U1)**: Author all five mutually cross-linked guide pages (`docs/guide/04-a-charting-session.md` through `docs/guide/08-hand-off.md`) in one unit so the shared running example, consistent tone/vocabulary, and mutual Previous/Next cross-links stay coherent and `tests/docs-links.test.ts` passes cleanly at the end of Wave 1.
- **Wave 2 (Unit U2, depends on U1)**: Add the `## Charting` section to `docs/README.md` linking `04`–`08` in order. Depends on U1 because `tests/docs-links.test.ts` fails if `docs/README.md` links to files that do not yet exist.
- Because every wave holds exactly one unit (ordered by U2's real file-existence dependency on U1 and U1's connected internal link graph), this is a **serial-solo** run: under `implement-issue`'s rule, A implements Wave 1 then Wave 2 itself with no workers.

## Needed interfaces and contracts

### Cold-reader question coverage map (from `design.md`)

| # | Question | Expected answer (from `design.md`) | Primary owning page(s) |
|---|---|---|---|
| 1 | "What is the difference between Charting mode and Build route?" | Charting mode decides who answers the questions while the work is charted. Build route decides who builds it once every question is answered. | `06-charting-mode.md`, `07-build-route.md` |
| 2 | "I want a small, clear new export button built fast today. Which Charting mode and Build route fit?" | No autopilot with Direct. Direct is offered only under No autopilot. | `06-charting-mode.md`, `07-build-route.md` |
| 3 | "I'm going to bed and want three reports charted and handed off. Which two Charting modes fit, and what do you still answer in each?" | Semi-autopilot: you answer the signposts and the charting agent answers the rest. Full autopilot: the agent also answers the signposts. | `05-signposts.md`, `06-charting-mode.md` |
| 4 | "What are signposts and when are they asked?" | Ranked priorities, hard limits and the order of the session's charts, asked once per session before any map. | `05-signposts.md` (and overview in `04-a-charting-session.md`) |
| 5 | "Can Semi-autopilot use the Direct route?" | No, only Lifecycle. | `06-charting-mode.md`, `07-build-route.md` |
| 6 | "What does the charting agent hand off at the end of a Lifecycle chart, and does it start the work?" | Written task contracts for a fresh slot A and slot B. It does not start them. | `08-hand-off.md` (and summary in `07-build-route.md`) |
| 7 | "What do consultants do during charting?" | They map and answer independently, and the charting agent merges their views. | `04-a-charting-session.md` |

### Key charting behavior source paths (for Criterion 5 accuracy)

- Session open, consultants, column layout, consultant restarts, `akrogon pull` / `akrogon flaky` / `akrogon status`, GitHub seed `## Operator decision (<name>, <date>)` permission checks, `seats.yaml`: `skills/chart-issues/SKILL.md` (`## Open`), `src/pull.ts`, `src/flaky.ts`, `src/status.ts`, `src/seat.ts`
- Signposts round, light shape, unanswered rules, corrections, conflicts, needs sheet: `skills/chart-issues/SKILL.md` (`## Open`, `## Take`), `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `src/notice.ts` (`writeNotice`)
- Territory map, one fork per round, blind peer exchange, rebuttals, Fog, Off route, Drain chart ordering, handover reset: `skills/chart-issues/SKILL.md` (`## Drain`, `## Take`, `## Handover`), `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/handover.md`, `skills/chart-issues/scripts/door-reset.ts` (`resetWord`: `claude`, `agy`, `codex`, `pi`)
- Charting modes (`No autopilot`, `Semi-autopilot`, `Full autopilot`), switch-on, waiting conditions, new-chart proposals, `## Mode record` and `## Autopilot`: `skills/chart-issues/SKILL.md` (`## Autopilot`), `skills/chart-issues/assets/autopilot.md`, `skills/chart-issues/assets/shapes.md`
- Build routes (`Direct` vs `Lifecycle`), Direct eligibility & refusal rules, `akrogon direct`, `akrogon direct-drop`, broadcast wait, growth stop: `skills/chart-issues/SKILL.md` (`## Direct route`), `src/direct.ts` (`directCommand`, `directDropCommand`)
- Hand-off review, required operation proofs, `readiness.yaml` presence check, `akrogon preflight`, consultant draft review, `USAGE.md`, `Handed off` / `Closed` / `Held` markers, no automatic start (`akrogon next`): `skills/chart-issues/SKILL.md` (`## Take`, `## Handoff`), `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/scripts/chart-usage.ts`, `src/readiness.ts` (`gaps`), `src/preflight.ts`, `src/status.ts` (`lastStage`, `chartRow`)

## Wave checklist

Execution mode: **serial-solo** (every wave holds 1 unit; A implements directly with no workers).

### Wave 1

- **Unit U1 — Author Chapter 2 guide pages**
  - Owned paths:
    - `docs/guide/04-a-charting-session.md`
    - `docs/guide/05-signposts.md`
    - `docs/guide/06-charting-mode.md`
    - `docs/guide/07-build-route.md`
    - `docs/guide/08-hand-off.md`
  - Shared test resource: none
  - Prerequisites: none
  - Criteria addressed: Criteria 1, 2, 3, 4 (source material), 5 (claims grounded in `skills/chart-issues/` and `src/`), 7 (tone)
  - Targeted proof: `akrogon run-check --name docs-links-u1 -- bun test tests/docs-links.test.ts`

### Wave 2

- **Unit U2 — Link Chapter 2 from `docs/README.md` and compile behavior-claim ledger**
  - Owned paths:
    - `docs/README.md`
  - Shared test resource: none
  - Prerequisites: U1
  - Criteria addressed: Criterion 6 (`docs/README.md` links all five pages in order and resolves), Criterion 5 (complete claim-to-path table in `implementation/report.md`)
  - Targeted proof: `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` followed by `akrogon verify` on the committed head

### Affected docs checklist

Human docs changed by this leaf:
- `docs/guide/04-a-charting-session.md` — new human guide page (Chapter 2, page 4)
- `docs/guide/05-signposts.md` — new human guide page (Chapter 2, page 5)
- `docs/guide/06-charting-mode.md` — new human guide page (Chapter 2, page 6)
- `docs/guide/07-build-route.md` — new human guide page (Chapter 2, page 7)
- `docs/guide/08-hand-off.md` — new human guide page (Chapter 2, page 8)
- `docs/README.md` — add `## Charting` section linking pages 04–08 in order (existing sections kept until `guide-chapters`)

Human docs explicitly out of scope (per `design.md` exclusions):
- `README.md`, `docs/start/*`, `docs/use/*`, `docs/examples/*`, `docs/reference/*` — owned by `guide-chapters`
- `docs/pictures/*` — owned by `charting-pictures` and `guide-pictures`

Agent docs:
- No agent doc (`docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `skills/*`) is affected by this leaf (`skills/chart-issues/` and `skills/AREA.md` are owned by `taxonomy-rename`).

## Acceptance criteria and verification

### Standing-design test policy for this leaf

Per `design.md` (`standing-design.md` interpretation):
- **No new test** is added or committed at `plan.synthesis` (worktree stays clean at `AKROGON_BASE`).
- Mechanical link and file-existence verification is proven by the existing `tests/docs-links.test.ts` and the repo's configured `checks` (`akrogon verify`: `format`, `test`, `typecheck`), all of which already exist at `AKROGON_BASE`.
- Baseline check of `tests/docs-links.test.ts` at `AKROGON_BASE`:
  - `check docs-links-base: 0 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide/implementation/check-docs-links-base-1795772825029-3914446.log` (13 pass, 0 fail, 18 ms)
- Understanding, running-example coherence, vocabulary quality, and tone are model choices under standing-design's model-choice line: no count, reading-level score, or keyword-list script stands in for reading; reviewing seats judge them by reading the five guide pages and slot B's cold-reader subagent record in `review-B.md`.

### Done-criteria observation map and condition checks

#### Criterion 1 — Five guide pages exist, plain words, approved vocabulary, shared running example

- **Brief criterion**: `docs/guide/04` to `08` exist with the exact file names (`04-a-charting-session.md`, `05-signposts.md`, `06-charting-mode.md`, `07-build-route.md`, `08-hand-off.md`). Each explains its topic in plain words for the stated reader, uses the approved words (`Charting mode`: `No autopilot`, `Semi-autopilot`, `Full autopilot`; `Build route`: `Direct`, `Lifecycle`; `slot A`, the builder; `slot B`, the reviewer; `charting agent`; `consultants`; `signposts`), and carries the same made-up running example job.
- **Real boundary**:
  - Mechanical part (exact filenames exist on disk and are reachable): filesystem + `tests/docs-links.test.ts` verifying every relative link in `docs/README.md` resolves to those five exact paths.
  - Content/vocabulary/example part (model-choice reading): reviewing seats (`check.review`) reading `docs/guide/04-a-charting-session.md` through `docs/guide/08-hand-off.md`.
- **State before / after**: Before: `docs/guide/` does not exist. After: all five numbered files exist under `docs/guide/`, use the approved taxonomy with zero retired phrases, and carry the `client-portal` weekly client report export example across all five pages.
- **Product failure caught**: Missing or misnamed guide file; broken navigation link; use of retired/conflicting terminology (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`); disconnected or real-client example.
- **Observation**:
  - Mechanical command: `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` (plus `ls -1 docs/guide/` in `implementation/report.md`).
  - Model-choice reading: reviewing seats read `docs/guide/04-a-charting-session.md`..`08-hand-off.md` and record their verdict in `review-A.md` / `review-B.md`. Model-facing inputs: the five guide pages; what stays unproven: comprehension by an external live agency owner (deferred to the operator's post-landing read under signposts 7a).
- **Size**: `seconds` (mechanical check ~0.02 s); `minutes` (review reading).
- **Rerun trigger**: Any edit to `docs/guide/04`–`08` or `docs/README.md`.
- **Condition check (plan-issue rule)**:
  - *Exact filenames*: Governed by D1; a missing or misspelled filename fails `tests/docs-links.test.ts` once `docs/README.md` links it. No new test needed because `tests/docs-links.test.ts` already fails on `missing file`.
  - *Approved words only / no retired phrases / shared made-up running example*: Governed by D2 and D3; checked by review reading (model-choice reading per `design.md`: "No count, reading-level score or word list stands in for that reading", and `taxonomy-rename` owns the repo-wide retired-phrase guard test). Traced reason no new test is added: locked by `design.md` ("No new test").

#### Criterion 2 — `06-charting-mode.md` and `07-build-route.md` definitions, examples, switch-on words, and Direct-only-under-No-autopilot rule

- **Brief criterion**: `06-charting-mode.md` defines Charting mode as who answers the questions while the work is charted, gives each of the three values with one or more example jobs that fit it, and says how the operator turns each on in their own words. `07-build-route.md` defines Build route as who builds the work once every question is answered. Direct is the charting agent building one small, settled change itself (a fast feature as well as a fix), reviewed by the charting agent's first consultant acting as slot B. Lifecycle is written task contracts built by a fresh slot A and slot B. Each comes with example jobs. Both pages state that Direct is offered only under No autopilot.
- **Real boundary**: Model-choice comprehension & accuracy boundary — slot B's cold-reader subagent (Q1, Q2, Q3, Q5) reading ONLY `docs/guide/04`–`08`, plus slot B's direct reading of `docs/guide/06-charting-mode.md` and `docs/guide/07-build-route.md`.
- **State before / after**: Before: `06-charting-mode.md` and `07-build-route.md` do not exist; old `docs/use/` blurs mode and route. After: both pages exist with separate, crisp definitions, example jobs (including a fast feature and a fix for Direct), switch-on phrasing, and the explicit No-autopilot-only rule for Direct on both pages.
- **Product failure caught**: Reader confusing Charting mode with Build route; reader thinking Direct is only for bug fixes; reader thinking Semi-autopilot can use Direct; missing examples or missing switch-on wording.
- **Observation**: Model-choice reading recorded in `review-B.md` using the cold-reader subagent's Q1/Q2/Q3/Q5 answers and quoted lines from `docs/guide/06-charting-mode.md` and `docs/guide/07-build-route.md`, paired with the behavior-claim ledger in `implementation/report.md`. Model-facing inputs: `docs/guide/04`–`08`; what stays unproven: live human operator comprehension prior to post-landing review.
- **Size**: `minutes` (review reading + cold-reader subagent inside slot B's review session).
- **Rerun trigger**: Any edit to `docs/guide/06-charting-mode.md` or `docs/guide/07-build-route.md`.
- **Condition check (plan-issue rule)**:
  - *Direct-only-under-No-autopilot stated in BOTH `06` and `07`*; *fast feature + fix examples in `07`*; *all three modes + examples + own-words switch-on in `06`*: Governed by D4. A violation causes cold-reader Q1/Q2/Q3/Q5 or slot B's per-page reading to fail as a Fix. Traced reason no new test is added: model-choice prose criterion locked to "No new test" in `design.md`.

#### Criterion 3 — `05-signposts.md` covers signposts, timing, per-mode answerer, and needs sheet with example

- **Brief criterion**: `05-signposts.md` explains what signposts are (ranked priorities, hard limits, the order of the session's charts), when they are asked (once per session, before any map), who answers them in each Charting mode, and the needs sheet (keys, approvals and actions only the operator can give), with an example.
- **Real boundary**: Model-choice comprehension & accuracy boundary — slot B's cold-reader subagent (Q3, Q4) reading ONLY `docs/guide/04`–`08`, plus slot B's direct reading of `docs/guide/05-signposts.md`.
- **State before / after**: Before: `05-signposts.md` does not exist. After: `docs/guide/05-signposts.md` explains signposts, timing, per-mode answerers, and the operator-only needs sheet with a concrete `client-portal` example.
- **Product failure caught**: Reader misunderstanding what signposts cover, thinking they are asked per chart instead of once per session before any map, confusing who answers them under Semi- vs Full autopilot, or thinking Full autopilot can self-approve needs-sheet rows.
- **Observation**: Model-choice reading recorded in `review-B.md` using cold-reader Q3/Q4 answers and quoted lines from `docs/guide/05-signposts.md`, paired with the behavior-claim ledger in `implementation/report.md`. Model-facing inputs: `docs/guide/04`–`08`; what stays unproven: live human operator comprehension prior to post-landing review.
- **Size**: `minutes`.
- **Rerun trigger**: Any edit to `docs/guide/05-signposts.md`.
- **Condition check (plan-issue rule)**:
  - *All four components present (what, when, who per mode, needs sheet with example)* and *needs sheet stays operator-only even under Full autopilot*: Governed by D3 and D4. Caught by cold-reader Q3/Q4 and slot B's review of `05-signposts.md` + Criterion 5 behavior audit. Traced reason no new test is added: locked to "No new test" in `design.md`.

#### Criterion 4 — Slot B cold-reader subagent passes all 7 questions from `docs/guide/04`–`08` alone

- **Brief criterion**: Slot B gives a fresh subagent inside its review session only `docs/guide/04` to `08` and asks the questions in the design's `## Cold-reader questions`. Every answer matches the expected answer and quotes the line it came from, recorded in slot B's review. A wrong or unsupported answer is a Fix.
- **Real boundary**: Fresh subagent inside slot B's `check.review` session, strictly isolated to `docs/guide/04-a-charting-session.md` through `docs/guide/08-hand-off.md` (must not be given `design.md`, `brief.md`, `skills/`, or other docs).
- **State before / after**: Before: no cold-reader evaluation exists. After: `review-B.md` records all 7 questions, each cold-reader answer, its verbatim quoted line from `docs/guide/04`–`08`, and slot B's match verdict.
- **Product failure caught**: Ambiguous, missing, or contradictory explanation in `docs/guide/04`–`08` that a reader without prior repo context cannot answer accurately.
- **Observation**: Slot B invokes a fresh subagent inside `check.review` passing ONLY the paths/contents of `docs/guide/04-a-charting-session.md`..`08-hand-off.md` and the 7 questions from `design.md` `## Cold-reader questions`, compares each returned answer + quote against the expected answers in `design.md`, and records the full result in `review-B.md` (a seat's own lifecycle file — no script test per standing-design line 11). Model-facing inputs: `docs/guide/04`–`08`; runs inside slot B's own session (no separate paid launch/grant); what stays unproven: whether a human reader outside the model also finds every transition intuitive (covered post-landing by signposts 7a).
- **Size**: `minutes`.
- **Rerun trigger**: Any edit to `docs/guide/04`–`08` during `check.fix` or `check.repair`.
- **Condition check (plan-issue rule)**:
  - *Fresh subagent receives ONLY `docs/guide/04`–`08`* and *every answer quotes its supporting line*: Governed by D4 (every question mapped to explicit quotable statements in `04`–`08`) and verified by slot B's subagent invocation and `review-B.md` record. Traced reason no new test is added: review-seat model-choice procedure locked in `design.md`.

#### Criterion 5 — Every charting behavior claim matches `skills/chart-issues/` and `src/`, listed with path in report

- **Brief criterion**: Every claim about how charting behaves matches `skills/chart-issues/` and `src/`. The report lists each behavior claim with the path that supports it.
- **Real boundary**: Truthfulness audit comparing prose in `docs/guide/04`–`08` against live files under `skills/chart-issues/` and `src/` in the leaf worktree, recorded in `implementation/report.md`.
- **State before / after**: Before: no claim ledger exists. After: `implementation/report.md` contains a complete `## Behavior claims` table mapping every charting behavior claim in `04`–`08` to its supporting path in `skills/chart-issues/` or `src/`, and every cited path exists and supports the claim (judged by behavior rather than old vs. new skill wording while `taxonomy-rename` is in flight, per `design.md`).
- **Product failure caught**: Invented or outdated charting mechanics (such as misstating handover-supported harnesses, claiming `c-` tab names are code-enforced, claiming Direct works under autopilot, or misstating `readiness.yaml` / `akrogon direct` / `akrogon status --charts` behavior).
- **Observation**: A writes the claim-to-path table in `implementation/report.md` (a seat's own lifecycle file — read by reviewing seats with no script case per standing-design line 11); reviewing seats verify every row against the live worktree files and check for any unlogged behavioral claim in `04`–`08`.
- **Size**: `minutes` (inspection in review).
- **Rerun trigger**: Any edit to behavioral descriptions in `docs/guide/04`–`08`.
- **Condition check (plan-issue rule)**:
  - *Every behavior claim has a real supporting path in `skills/chart-issues/` or `src/`* and *no stale claim copied from old `docs/use/` (e.g. `door-reset.ts` supports `agy` as well as `claude`, `codex`, `pi`)*: Governed by D6. Caught by A's source audit during implementation and slot A/B inspection during `check.review`. Traced reason no new test is added: locked to "No new test" in `design.md` and lifecycle-file review under standing-design.

#### Criterion 6 — `docs/README.md` links all five pages in order, every link resolves, and destination `checks` pass

- **Brief criterion**: `docs/README.md` links all five pages in order, and every link resolves. The destination's `checks` pass, including `tests/docs-links.test.ts`.
- **Real boundary**: Existing link checker `tests/docs-links.test.ts` plus the destination's configured `checks` via `akrogon verify` (`format`, `test`, `typecheck`), plus diff inspection of `docs/README.md`'s `## Charting` section order (`04` -> `05` -> `06` -> `07` -> `08`).
- **State before / after**: Before: `docs/README.md` has no `## Charting` section and `docs/guide/` does not exist. After: `docs/README.md` has `## Charting` linking `guide/04-a-charting-session.md` through `guide/08-hand-off.md` in order; all links, anchors, and image references across `README.md`, `docs/`, and `skills/` resolve; all configured `checks` (`format`, `test`, `typecheck`) exit 0 on a fresh detached checkout via `akrogon verify`.
- **Product failure caught**: Broken relative link or anchor in `docs/README.md` or `docs/guide/04`–`08`; accidental link to uncreated `01`–`03` / `09`–`13` or placeholder image; wrong ordering in `docs/README.md`; any repo-level check regression.
- **Observation**:
  - Targeted command: `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`
  - Destination `checks` command (committed head): `akrogon verify` (runs `format`, `test` including `tests/docs-links.test.ts`, and `typecheck` on a detached fresh checkout and writes the green receipt required for `check.review`).
  - Order inspection: diff of `docs/README.md` recorded in `implementation/report.md` and read in review.
- **Size**: `seconds` (`tests/docs-links.test.ts` ~0.02 s); `minutes` (`akrogon verify` full `test` suite + `format` + `typecheck`).
- **Rerun trigger**: Any edit to `docs/README.md`, `docs/guide/04`–`08`, or any tracked file in the worktree (rerun on committed head after refresh onto current `origin/main`).
- **Condition check (plan-issue rule)**:
  - *Every link resolves and no link points to uncreated `01`–`03` / `09`–`13` or missing pictures*: Governed by D1; directly proven by existing `tests/docs-links.test.ts` (`brokenLinks` fails on any missing file, missing anchor, or missing image across `docs/**/*.md`).
  - *All five pages linked in order `04`–`08` in `docs/README.md`*: Governed by D1 and Wave 2; verified by inspecting `docs/README.md` diff and `tests/docs-links.test.ts`. Traced reason no new hardcoded list test is added: `design.md` locks "No new test" and `standing-design.md` forbids tests holding hand-copied lists of another file's entries.

#### Criterion 7 — Tone reading by slot B under standing-design's model-choice line

- **Brief criterion**: Tone is slot B's reading under standing-design's model-choice line: no marketing jargon, no developer jargon left unexplained, at most a sentence of soft selling in a page opener. Slot B records its reading and reason in its review.
- **Model-choice reading**: Explicitly governed by `standing-design.md`'s model-choice line and `design.md` ("Understanding and tone are model choices. Slot B decides them by reading, using the cold-reader subagent's answers as evidence, and records them in its review. No count, reading-level score or word list stands in for that reading."). The "at most a sentence of soft selling in a page opener" guidance is read qualitatively by slot B as part of its tone reading, with no script count or keyword check.
- **Real boundary**: Slot B reading `docs/guide/04-a-charting-session.md` through `docs/guide/08-hand-off.md` during `check.review` and recording its reading and reason in `review-B.md`.
- **State before / after**: Before: no tone reading exists. After: `review-B.md` holds slot B's recorded tone reading and reason for `docs/guide/04`–`08`.
- **Product failure caught**: Hype/marketing copy, unexplained git/CLI/Akrogon developer jargon, or overly salesy pages that alienate the target agency-owner / mid-market operator reader.
- **Observation**: Slot B reads `docs/guide/04`–`08` and records its reading and reason in `review-B.md` (a seat's own lifecycle file; no script test). Model-facing inputs: `docs/guide/04`–`08`; what stays unproven: subjective preference of the live operator before post-landing review (signposts 7a).
- **Size**: `minutes`.
- **Rerun trigger**: Any prose edit to `docs/guide/04`–`08`.
- **Condition check (plan-issue rule)**:
  - *No marketing jargon, no unexplained developer jargon, at most one sentence of soft selling in openers*: Governed by D5; verified by slot B's reading and recorded reason in `review-B.md`. Traced reason no new test is added: explicitly a model-choice reading with "No new test" in `design.md`.

## Open limitations preserved

- **Adjacent chapters absent at landing**: Pages `01`–`03` and `09`–`13` belong to parked leaf `guide-chapters`, so `docs/guide/04`–`08` cannot link to them yet and link only to `docs/README.md` and each other.
- **Pictures added later**: The two Chapter 2 SVGs (Charting mode against Build route, and one charting session) belong to `charting-pictures` (`blocked-by: charting-guide`), so these pages intentionally contain no picture embeds or placeholders.
- **Concurrent `taxonomy-rename` leaf**: `taxonomy-rename` may land before or after this leaf; `docs/guide/04`–`08` use the approved names either way, and behavior-claim checks against `skills/chart-issues/` judge by behavior rather than pre-rename skill phrasing (`design.md`).
- **Old docs untouched**: `README.md`, `docs/start/`, `docs/use/`, `docs/examples/`, and `docs/reference/` remain unchanged until `guide-chapters` retires or updates them.
- **Human operator validation**: Real operator comprehension and approval of Chapter 2 (with its pictures) happens after `charting-guide` and `charting-pictures` land, before the operator unparks `builder-docs-rest` (signposts 7a).
