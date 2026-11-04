# Fork notes C: sections

## 1. Pick

Five sections in this order, empty ones hidden, plus a machine block above them that is drawn only when it has a red line.

- S1 Needs you. A row is here only on a fact the producer records: phase failed; a missing gap; a delivery error on a seat that is not busy (these three are `leafRed` today); a blocked-by dependency the producer labels parked, missing or unreadable; a merge whose land unit is dead. Second line is the fact as one phrase.
- S2 Working. A seat with `busy_since` set in a live phase, or a merge whose land unit is alive. Time column is the busy duration.
- S3 Waiting. Blocked by a live leaf (phrase: the blocker and its phase); in the merge queue behind the holder (phrase: "queue 2"); between seats, that is a live phase, no blocker, no seat busy (phrase: "next: B", the seat the phase requires). Time is the phase age.
- S4 Held. Stopped leaves, leaves of a paused repo, parked slugs. Grey pill, phrase "stopped", "paused" or "parked".
- S5 Done. One dim line per owner folder that holds merged leaves still under `issues/open`: "framework / right-panel · 3 merged, 2 open". Not expandable.
- Machine block: scan error, deploy failed, repo unreadable or error, as short label-and-value lines in red. Slow merge and the run line stay off the board until the producer emits them as fields.

Header count: the envelope's `red`, drawn red when above zero, absent when zero. The panel-bar dot is `red > 0` already, so the count and the dot cannot disagree. The two additions to S1 (blocked on parked/missing/unreadable, land dead) are made in the producer's `leafRed`, not in the mod, so the CLI, the dot and the board move together.

Reason: every section is decided by a recorded field, the order is the operator's reading order (act, watch, wait, ignore), and the count has one definition owned by the producer. Cost: `model.js` gains a `section(row)` function and loses group rows; `status.ts` `leafRed` widens by two clauses and gains a `waits_on` seat per leaf; tests for board order, tags, group headings and red flags change with Test-Change citations; one akrogon src leaf and one mod leaf.

## 2. Rejected

- Between seats in S1. No recorded fact says the operator must act; the carry from list-shape 1a forbids it. With a watch running every leaf would flash red between prompts.
- Between seats as its own "Queued" section. A fifth word for a transient state; akrogon's own watch rule calls it Waiting.
- Stopped in S1. It is an operator-set hold that dispatch skips, not a problem. Withdrawn in content-rebuttal-C.
- Stopped in S3. Nothing will come for it; it waits for the operator's `start` the same way a paused repo waits for `unpause`. Same semantics, same section.
- Merged-under-open rows hidden. They are drawn today and the tests lock them; hiding them removes the only view of an epic's progress, and the operator asked for removals by name (quiet line, charts, merges, housekeeping), not this one.
- Merged-under-open as one dim row per leaf. A large epic fills the list with grey rows nobody acts on.
- Header counts tasks only. The dot counts deploy and unreadable repos too; a header "0" beside a red dot is a contradiction.
- Header counts every live row ("N open" as now). It counts blocked and stopped rows; the operator's question is how many need them.
- S1 widened in the mod instead of the producer. The dot and the board diverge the day one is edited.

## 3. Evidence

- Producer `leafRed` is failed, missing or undelivered prompt; `red` is leaf reds plus unreadable repos plus a failed deploy (`src/status.ts` leafRed, undelivered, envelope section; code, read 2026-11-03). `blockedBy` labels a dependency parked, unreadable or missing (`status.ts` blockedBy; code). Land alive is a systemd `is-active` check (`src/land.ts` landAlive; code).
- Dispatch skips stopped leaves and paused repos (`src/next.ts` isStopped at the launch guard and holder check, isPaused before a pass; code). Stop and start are operator commands (`src/akrogon.ts` verbs; code).
- The dot is `envelope.red > 0` (`herdr-setup/mods/panel-bar/routine.js` redDot; code).
- Required seats by phase and the Waiting definition "at least one required unfinished seat is idle or absent" (`skills/watch-issues/SKILL.md` Judge; primary docs).
- Merged rows under open are rendered with no pill and tests lock it (`model.js` leafRow; `tests/tasks-mod.test.ts` 'pill maps stage words to ANSI slots and merged to none', 'paused repository rows use grey pills and merged rows retain no pill'; code).
- The Agents list beside Tasks sections as Needs you, Working, Done, Idle and moves rows on status change (`~/.config/herdr-app/mods/agents/main.js` SECTION, status(); code).
- A delivery-error row can also have its other seat busy: `undelivered` requires only the errored seat idle (`status.ts`; code). Failed and merged clear `busy_since` (`src/phase.ts` move record; code), so failed rows are never also working.
- Operator: list-shape 1a, 2026-11-04 ("sections by what each task needs ... needs attention only on a recorded fact").
- Practitioner: a status board orders sections by what the reader does with them, act first; model knowledge, no stronger source searched.

## 4. Pitfalls

- A row matches two sections (delivery error plus the other seat busy). Removed by one `section(row)` function that returns the first match in S1 to S5 order; the spinner still shows inside the S1 row.
- The required-seat table copied into the mod drifts from akrogon's phase rules. Removed by the producer emitting `waits_on: "A" | "B" | null` per leaf and the mod never naming a phase.
- Two words for one thing beside each other ("Needs attention" on Tasks, "Needs you" on the Agents list). Removed by using the Agents list's word.
- Machine problems have no row and would vanish from a sections-only list. Removed by the fixed block above S1, counted in `red`.
- Parked slugs are strings, not leaves (`repo.parked`), so they have no phase, seats or worktree. Removed by one row shape with optional seats, or a single S4 line "parked: a, b" per repo.
- A board with nothing open is blank: every section hidden, the "No open tasks" line locked removed, no count. Accepted consequence of the lock; the header still says "Tasks".
- Row expand and pin keyed by repo/slug survive a section move (list-shape carry); nothing to add.

## 5. Questions the fork does not ask

- Q1 Does a watch cron run during the day? If not, a leaf between seats waits for the operator's `next`, and S3's phase age is the only hint. If the answer is "often not", add the producer's last-pass time and turn S3 rows red past a threshold.
- Q2 Section word: "Needs you" (the Agents list's word) or "Needs attention"?
