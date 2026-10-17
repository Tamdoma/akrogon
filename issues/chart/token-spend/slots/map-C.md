# Map C: token-spend as a system

Slot C (pi, Muse Wonder), blind. Sources: INTAKE.md, slots/study-B.md, slots/study-C.md (evidence, cited as sB/sC), installed release 17d6117 skill text and scripts, harness configs, today's chart folders, A's transcript c954dd5e measured by script only (526 distinct API calls, 73.67M input context tokens, avg 140,063, at read time). Locks L1 (operator surface unchanged), L2 (blind takes and rebuttals keep purpose), L3 (spend = calls × avg context per seat) held throughout. c4 = chars/4.

One-line shape: spend is a stock problem, not a writing problem. Output is small (A 0.50M output vs 73.67M input today). What costs is how big each seat's context stock is when a call is made, multiplied by how many calls the process forces that seat to make.

## 1. Stocks and flows

### ST1. The three context stocks today

| Seat | Floor (fresh call) | Typical stock while charting | Drain | Per-chart spend (ctx tokens) |
|---|---|---|---|---|
| A (claude) | 58,096 first call; 64.7-70.0k after each of 7 compactions (sB F2/F5) | median 140k, max 217k, 410 of 526 calls over 100k (my count) | Compaction only. Same session c954dd5e in every seats.yaml today. autoCompactWindow 250,000 (`~/.claude/settings.json`) | base-red 15.2M, fresh-consultants 5.9M, usage-windows 4.5M, door-handover 24.0M (sB F1) |
| B (codex) | 20,676-20,715 (sC F1) | 62k early to 217k late in a shared session; 112-141k by last exchange even fresh-per-chart (sC F2/F3) | peer-restart.ts at chart entry and re-entry (SKILL.md:29) | 1.06-5.24M per chart (sC table) |
| C (pi) | 5,956 fresh (sC F1) | Started today at 212-247k leftover before clears (sC F2) | peer-restart.ts; pi compaction reserveTokens 68,000, keepRecentTokens 20,000 (`~/.pi/agent/settings.json`) | 0.85-3.30M per chart; still printed "usage unmeasured (unknown harness pi)" in 3 of 4 USAGE.md files on disk (sC F11) |

A is 51-87% of each chart's measured spend (base-red 15.2 of 23.3M; fresh-consultants 5.9 of 11.6M; door-handover 24.0 of 27.5M). Consultants already got their drain (fresh per chart: B avg context −46% and −57% vs base-red, sC F3). A has no per-chart drain in attended mode. The door-reset leaf (issues/open/door-handover/door-reset, handed off 2026-10-17) adds an A drain only between handed charts under autopilot. Its operator scope is explicit: "this is only in autopilot mode", "the manual mode still has to work the same".

### ST2. What flows in

1. Fixed start, paid on every call. A: 58k floor holding a 97-entry skill catalog (~7.5k c4), chart-issues SKILL.md (~6.5k c4 of 33,523B total), CLAUDE.md plus haiku rule (~3.6k c4), MCP and Chrome guidance with no browser call all day (sB F2). Codex: 21,420 chars base instructions plus 19,021 chars skills list (sC F9). Pi fresh: almost none, hence the 5,956 floor.
2. Process text read whole. SKILL.md 33,523B (~8.4k c4), questions.md 14,282B (~3.6k), shapes.md 22,366B (~5.6k), standing-design.md 5,725B (~1.4k). SKILL.md:19 stages these reads for A. No staging rule reaches consultants, who load all of it in exchange 1 (sC F6/F8). Sections a typical chart never uses: Direct route ~1.5k c4, epic and Direct-attempt templates, questions.md operator head (sC F10).
3. Tool output. A: 467 results, 1.21M chars, ~303k c4 to sB's cutoff, 90% through Bash. Largest buckets: process/reference reads 28.5%, consultant returns 27.4%, other file reads 27.3%, herdr and peer orchestration 10.3% (sB F3). Caps are loose: claude bashOutputMaxChars 128,000 (~32k c4 in one result); codex truncates near 41-43kB and 50-58% of its tool bytes ride in outputs over 30kB (sC F6). Truncated text is paid for and then re-read in slices.
4. A's own writing re-enters A's stock. 528,774 chars of tool arguments vs 108,353 chars of prose to sB's cutoff (sB F4). Every brief, merged file and record A writes stays in A's context until compaction, and each consultant return likewise stays in its writer's context (sC F7).
5. Restores after compaction. Per compaction the harness re-injects invoked skills and recent files: across 7 boundaries, 215,482 chars of skill attachments (seed-issue 69,546 of them, invoked only twice all day) and 183,286 chars of file attachments including closed-chart notes (sB F5/F7). The restore is why the post-compaction floor is 65-70k, not 58k, and it grows with session history, not with the current chart.
6. Orchestration calls. A does not only think and write. Classifying A's 526 calls by the Bash command each issued (upper bound, mixed commands count whole): herdr-other 97 calls, peer-ask/wait 43, peer-restart/create 40, chart-usage-mixed 32, total 212 calls and ~40% of A's context spend. INTAKE's cleaner window count: 27 of 113 calls, ~24%, in 08:17-09:05. Every one of these calls re-reads A's whole ~140k stock to move a few hundred chars of state. Only 34 of A's 526 calls batch more than one tool use.
7. Disk stock. Today's chart folders hold 55-144kB each. Slot returns are the largest category (base-red 72,758B of 144,248B), then merged files and rebuttals. Disk itself is free. It becomes spend only when a seat reads it, which the process does repeatedly (see R2).

### ST3. What drains

Compaction (A at 250k window, pi at 68k reserve), consultant restart per chart, session end. Nothing else removes stock. There is no mid-chart drain for A, no per-exchange drain for consultants, and no drain keyed to the chart's own phases.

## 2. Loops

### Reinforcing (each link named)

R1. Warm-context tax. More material read → larger stock → every later call costs more → but the calls still must happen, so nothing pushes back inside the chart. Evidence: the same 4-call rebuttal cost 381k early and 860-870k late in one B session (sC F2); rebuttals read 3 small files yet are 22-33% of consultant spend (sC F4).

R2. Return multiplication. A consultant writes a return (pays output, keeps it in own stock) → A reads both returns whole (A stock grows) → A writes merged (A pays again, stock grows) → each consultant reads merged in a warm session (rebuttal at full stock price) → rebuttals flow back into A. One finding is paid for roughly 5 times before the operator round exists. The merged step is required by L2. The warm-session pricing of steps 4-5 is not.

R3. Orchestration recursion. Each exchange needs ask, wait, status checks, restarts, seat records → each is an A call at A's full stock → more exchanges per chart (map, per-fork notes, rebuttals, leaf review, final check) multiply A's call count → A's stock also grows from the returns those exchanges produce → later orchestration calls cost more than earlier ones. Door-handover: A 162 calls at avg 148k = 24.0M, against B's 40 calls at 88k.

R4. Fresh-session re-read (the counterweight that eats restart gains). Restart drains the stock → the fresh consultant must re-read process text and surfaces → stock rebuilds by 60-110k within one chart (sC F3) → pi re-reads files inside one session and makes 2-3x codex's calls per brief (sC F5) → part of the restart saving is spent re-buying orientation. This loop caps what session boundaries alone can save and is why C's fresh-per-chart gain measured only +4.8% and −21.8% (sC F3).

R5. Restore inflation. Longer A session → more invoked skills and files qualify for restore → higher post-compaction floor → less headroom before the next compaction → compactions come sooner → each restore re-injects the same inactive material (seed-issue at all 7 boundaries, sB F5). The drain partially refills itself with history the current chart does not need.

R6. Safety-read loop. A truncated or ranged read risks missing a rule → seats read whole files to be safe → stock grows → pressure to truncate grows. Whole-file reading is the locally safe choice and the globally expensive one. Any cut that makes reads feel unsafe will be routed around by the seats themselves.

### Balancing

BL1. Compaction caps A's stock near the 250k window. It is the only balancing loop on A, it acts late (median call already at 140k), and R5 weakens it.

BL2. Consultant restart per chart (built today) caps cross-chart growth for B and C. Measured −46% to −57% for B (sC F3). It does not act inside a chart.

BL3. SKILL.md:6 ("a file already read in this thread is not read again") and SKILL.md:19 staging. These bind A only, and sB F6 shows the restore path defeating the first (a restored 20,000-char prefix re-read whole, 19,831 chars duplicated).

BL4. Missing: a spend feedback loop inside the chart. chart-usage.ts runs once, right before the handoff review (SKILL.md:71). The delay between spending and seeing the spend is one whole chart, and until the usage-windows fix the pi seat was invisible in that report (sC F11). Under L3 the system is currently flying on a gauge that is read after landing. This missing loop is why the spend was discovered by the operator, not by the door.

## 3. Leverage points, highest first

Order per the brief: goals > rules > loop structure > flows > parameters. Savings are per chart unless stated, are not additive (several tax the same stock), and use L3 tokens, not dollars.

### LP1 (goals). Foreclosed by the locks, stated so nobody reaches for it later.

Changing the goal (fewer models, no rebuttal round, no blind map, summaries instead of returns) is the highest-leverage move in the abstract and is exactly what L1 and L2 remove. The record supports the locks: 78 of 81 past fork rebuttals carried a disagreement (issues/chart/chart-cost/CHART.md, Off route). No saving claimed here. Every point below keeps all rounds, briefs, returns, merged files, rebuttals and records.

### LP2 (rules). Give every exchange type a session-boundary rule, not only chart entry.

Change: in questions.md Blind peer exchange, rebuttals (and, if the trial holds, leaf reviews) run in a restarted consultant session. The brief adds the consultant's own return file to its read list. Same brief text otherwise, same disagreement-only return.
Saving: a rebuttal drops from the warm mean (codex 575k, pi 364k per exchange, sC F4) to floor plus 3 small files (~100k codex, ~45k pi). ~0.6-0.9M per chart with one B+C rebuttal pair, ~20% of a median chart's consultant spend; less where LP-order matters and the session was already fresh (sC C2 arithmetic, which I re-checked against its F4 means).
L1/L2: the operator sees the same rounds. The rebuttal still comes from the same model checking merged against its own written notes. Both inputs are files by design.
Breaks: a disagreement held only in the consultant's memory, where its return cites evidence by file:line, may be missed or cost a re-read. With a 78/81 disagreement base rate, a weaker rebuttal is a real quality risk, not a paperwork risk.
Proof: one fork run both ways, disagreement lists compared line by line (the chart-cost map-size replay is the in-repo precedent for rejecting a rule this way). Then rebuttal calls × avg context per exchange in chart-usage output across the next charts.

### LP3 (rules). Extend A's staged-reading rule to consultants, carried by the brief.

Change: questions.md states consultants load process text by stage and section, as SKILL.md:19 already states for A. Briefs name the section or line range (Blind peer exchange is questions.md:44-53, ~2.0k c4 of the 3.6k file). Shapes and standing-design load only at leaf review.
Saving: 7-10k c4 not loaded up front, taxed over the session's remaining 20-40 calls: ~0.3-0.6M per chart across both consultants, 8-16% of consultant spend (sC C3). It also weakens R4, which raises the value of LP2 and of the existing per-chart restart.
L1/L2: identical text, read at its stage. Blindness is untouched.
Breaks: line ranges rot when the file is edited. A stale range silently hides a rule (R6 then pushes seats back to whole-file reads, quietly erasing the saving). When the skill text is itself the live surface, as in most of today's charts, ranges must cover the studied sections or the map is blind in the wrong way.
Proof: grep new consultant logs for whole-file reads of SKILL.md, shapes.md, questions.md; avg context per call falls while returns keep citing the same sections. Prefer section names over raw line numbers where the harness can resolve them, to slow the rot.

### LP4 (rules, A-side). One script call per exchange step for A.

Change: extend the bundling peer-ask.ts already does (prompt plus wait in one call, questions.md:44) to the steps A still performs as separate calls around it: idle-wait plus ask, and restart-then-ask at chart entry. Scripts already print one outcome line per seat; A reads the same lines.
Saving: orchestration is 24% of A's calls in INTAKE's clean window and up to ~40% by my upper-bound classification. Removing 1-2 A calls per exchange across ~6-10 exchanges per chart at A's ~140k stock is worth roughly 0.8-2.8M per chart, 5-15% of A's share. Basis is a range because the true orchestration-only call count sits between the two measurements.
L1/L2: no operator-visible change. Peer prompts, waits, drop rules and records are the scripts' existing behavior, sequenced inside one process instead of across A calls.
Breaks: the drop and reporting rules in questions.md:44 are stateful (budget plus unproven is reported before rerun in attended mode; under autopilot it gets one more wait). Bundling must preserve exactly where A stops and reports. A bundle that swallows a `blocked` outcome to save a call breaks L1. Longer single calls also hit the harness command timeout sooner, which is why budgets are sized below it today.
Proof: same chart shape before and after (one fork, B+C, one rebuttal pair). A calls per exchange counted from the transcript, outcome lines and drop behavior diffed against the unbundled run, including a forced `blocked` and a forced prompt failure.

### LP5 (loop structure). Close the missing feedback loop inside the chart.

Change: A runs chart-usage.ts at each fork close (spans already delimit the windows), not only before handoff. USAGE.md updates in place. The handoff review then shows a per-fork series instead of one number.
Saving: none direct. This is the loop that makes LP2-LP4 and LP6-LP8 provable per fork instead of per chart, and it catches the next pi-style invisible seat in days, not months. Cost is small: chart-usage output was ~1.6% of A's tool-result text (sB F8), and the script's own A calls are the price of the gauge.
L1/L2: USAGE.md and the handoff usage lines already exist. Nothing new is shown mid-chart to the operator.
Breaks: measurement calls are themselves A calls at full stock (my upper-bound count already attributes 32 calls to chart-usage-mixed commands). Run it at fork boundaries only, never per exchange.
Proof: USAGE.md shows all seats including pi with calls and avg context mid-chart on the next chart; the handoff numbers match the sum of the fork-boundary readings.

### LP6 (flows). Project tool output before it enters any stock.

Change: herdr JSON is filtered to the chart's panes and the fields the seat record needs (peer-ask.ts and peer-wait.ts already parse `herdr agent list` internally and print one line; the waste is A running herdr directly). Broad searches return filenames and short excerpts first, whole paragraphs on demand.
Saving: sB's two measured roster dumps carry 169k and 132k of replay exposure each, ~0.9-1.5% of a chart apiece (sB C1); one 31,598-char reference dump trimmed to its relevant 8,000 chars is ~206k, 0.86% of door-handover (sB C5). Small per event, but these are pure waste with no quality counterpart.
L1/L2: same peers found, same statuses acted on.
Breaks: filtering by guessed pane ids can hide a replacement peer. Discover the tab roster first, then project. Preserve non-zero exits and error text verbatim.
Proof: projected output selects the same peers, sessions and status transitions as the raw output on a recorded roster, including a missing peer and a changed session.

### LP7 (flows). Stop paying twice at the compaction boundary.

Change: two parts. (a) When a restored skill prefix matches the current file, read only the missing tail (restores cap at 20,000 chars; SKILL.md is 33,523B, so the tail is real content). (b) Restores carry the active chart's dependency set, not every skill ever invoked or closed-chart notes; an inactive skill re-loads when invoked.
Saving: (a) 347k on door-handover's shape, 1.45% of A (sB C2). (b) Inactive seed-issue restore alone: 86-418k per chart, 1.5-2.0% of A; two named stale notes add ~1% on their charts at medium confidence (sB C3). Together they lower the post-compaction floor from 65-70k toward the 58k fresh floor, which taxes every subsequent call in the segment.
L1/L2: A ends up holding the same operative text once. Records on disk are untouched.
Breaks: skills changed mid-session today, so prefix matching must compare content, not filenames. Whether the claude harness lets the door choose restored attachments at all is unverified (sB C3). If it does not, (b) is not buildable from the skill side and becomes a harness-config question (FK3).
Proof: resume a chart from a compacted context built both ways and diff the outstanding locks, decisions and next steps A can state; native first-call context after compaction measured before and after.

### LP8 (flows). Consultant call discipline in the brief.

Change: standing brief lines — batch independent reads into one tool call, locate with search before reading, no whole-file read over ~15kB without a range, no re-read of a file already read this session unless it changed (the consultant form of SKILL.md:6).
Saving: pi made 39-41 calls per chart against codex's 18-30 on the same briefs, and re-read files in-session (sC F5). Halving pi's map calls is worth ~0.5-0.9M on a fresh-consultants-shaped chart (sC C4). Map intake discipline adds ~0.2-0.4M at low confidence (sC C5). Caveat: those pi numbers are the old C model. C's model was swapped today by operator correction, so this saving must be re-measured on Muse Wonder before it is sized into a leaf (FK5).
L1/L2: same files available, fewer round trips.
Breaks: batching tempts one oversized combined output that truncates (sC F6 shows exactly this). Per-command caps must travel with the batching line.
Proof: calls per exchange and tool-output bytes per map in chart-usage and the session logs, against today's 39-41 pi calls, with merged-map fork coverage held constant.

### LP9 (parameters). Caps and windows. Lowest leverage, listed to be deliberately not-first.

bashOutputMaxChars 128,000, autoCompactWindow 250,000, pi reserveTokens 68,000. Tightening any of them trades stock size against call count, and one extra A call costs ~140k of context, which erases most single-output trims (sB C5). An earlier compaction also fires R5 more often. These are global harness settings: changing them reaches every session on the machine, not only charting, which puts them outside a chart-issues leaf unless FK3 decides otherwise. No saving claimed without a same-shape trial.

Not proposed, already in flight: door-reset (A drain between handed autopilot charts) is handed off as its own leaf. This map claims no saving for it and no leaf below should duplicate it. Its arrival will also change A's baseline, so before/after proofs for LP4-LP7 should name whether the door session was reset between the compared charts.

## 4. Material forks for A under autopilot

FK1. A's session boundary in attended mode.
O1: Keep today. Compaction is A's only drain in attended charts; door-reset stays autopilot-only per the door-handover operator scope.
O2: Extend door-reset to attended chart switches once the autopilot leaf lands.
O2 contradicts a recorded operator answer ("only in autopilot mode", "manual mode still has to work the same"), so under autopilot A cannot take it. O1 by default; O2 is an operator question at the next attended round, not an autopilot call. Expected value if ever taken: the largest single A saving available, since a fresh A starts at 58k against a 122-164k running average (sB P3), minus re-orientation.

FK2. Rebuttal session (LP2).
O1: Trial first. One fork, both ways, disagreement lists diffed; adopt only on a clean diff.
O2: Adopt on the file-based reasoning alone.
O3: Keep warm rebuttals.
O1 fits the chart-cost precedent (a plausible rule failed its replay there and was dropped) and the 78/81 base rate. O2 risks the one mechanism L2 exists to protect.

FK3. Where the cuts live.
O1: Skill text only (questions.md, SKILL.md staging and brief rules). Smallest blast radius, weakest enforcement; seats can drift.
O2: Scripts (peer-ask bundling, output projection). Enforced every run, but touches the drop and reporting semantics in questions.md:44.
O3: Harness config (`~/.claude/settings.json`, `~/.codex/config.toml`, `~/.pi/agent/settings.json`, catalog and restore behavior). Reaches non-chart work; LP7b and any catalog trim (sB C4, low confidence, runtime support unverified) may only be buildable here.
A leaf needs one owner per cut. My read: LP2, LP3, LP8 in O1; LP4, LP6 in O2; LP7a in O1, LP7b gated on an O3 probe (FK4); LP9 stays out.

FK4. Unverified-runtime cuts (catalog trim, restore selection).
O1: A small measurement leaf first: can the harness defer catalog entries, drop unused integration guidance, or select restored attachments, and what is the native-token delta on a fresh start and a post-compaction start?
O2: Skip both until the measured cuts land.
sB prices a confirmed 6,000-token fixed-start cut at 3.7-4.9% per chart, which is larger than LP6 and LP7a combined, but at low confidence. O1 is cheap and removes the guess.

FK5. Pi behavior after today's model swap.
O1: Re-measure calls per exchange for the new C model on this chart's own exchanges before sizing LP8.
O2: Build LP8 on the old model's numbers.
O1. The token-spend chart itself generates the new baseline at no extra cost.

FK6. Proof standard for every leaf in this chart.
O1: Same-shape replay where the exchange is repeatable (rebuttal, map), next-N-charts comparison where it is not (A orchestration), with door-reset state recorded.
O2: Before/after on whatever charts happen next.
O2 is how the morning's shared-session charts produced overlapping, double-counted windows (sC F11). O1 costs one replay and buys a number A can defend.

## 5. Practitioner questions and lifetime pitfalls

PQ1. Where in the leverage order does a locked-goal system still have room?
Research: practitioner · Donella Meadows, "Leverage Points: Places to Intervene in a System", donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/, read 2026-10-17 · her 12-point order puts constants and parameters last and information flows, rules and goals near the top · with goals locked by L1/L2, this map spends its effort on rules and information flow (LP2-LP5) and treats caps as last (LP9).

PQ2. Is a smaller stock only cheaper, or also better?
Research: practitioner · Anthropic engineering, "Effective context engineering for AI agents", anthropic.com/engineering/effective-context-engineering-for-ai-agents, read 2026-10-17 · aim for "the smallest possible set of high-signal tokens"; recall degrades as context grows (context rot); compaction, structured note-taking and just-in-time retrieval are their named tools · this supports LP3 and LP7 on quality grounds as well as cost, and warns that today's 140k median A stock is likely already taxing decision quality, not only spend.

PQ3. Does the L3 token metric track dollars?
Research: better-than-training · Anthropic prompt caching docs, docs.anthropic.com/en/docs/build-with-claude/prompt-caching, read 2026-10-17 · cache reads cost 0.1x base input (0.05x on Opus 5.5), cache writes 1.25x (5-minute TTL) or 2x (1-hour) · 66.5M of A's 67.9M input to sB's cutoff was cache read, so L3 overstates the dollar value of shrinking a warm stock and understates the value of prefix stability. Pitfall: a cut that reorders or rewrites early context (a differently-ordered restore, a re-generated brief) can hold L3 flat while raising dollars through cache re-writes. Keep prefixes byte-stable; do not let the metric reward churn. The operator asked for token spend, so L3 stands, but no leaf should claim dollar savings from it (USAGE.md already says this).

PQ4. What has this repo already learned the hard way?
Research: better-than-training · issues/chart/chart-cost/CHART.md (handed off 2026-10-06) and issues/closed/usage-windows/usage-spans/implementation/report.md:37-51, read 2026-10-17 · a map-size rule failed its replay and was dropped; skipping rebuttals on agreement was foreclosed on a 78/81 disagreement rate; fresh consultants measured −46% and −57% (B) · every proposed rule here gets a replay or a same-shape trial (FK6), and rebuttal changes get the strictest one (FK2).

Lifetime pitfalls, in the order they will bite:

PF1. Range rot. Briefs that carry line ranges (LP3) break silently on the next edit to questions.md or shapes.md. Mitigation: name sections, and let LP5's fork-boundary readings expose a sudden return to whole-file reads.

PF2. Projection blindness. A filtered herdr roster (LP6) hides exactly the anomaly it was not built for: a replaced pane, a second door's seat. Mitigation: project after discovery, keep the raw output one flag away, never filter error text.

PF3. Rebuttal thinning. A fresh rebuttal (LP2) that misses one disagreement per chart looks like a saving and behaves like a quality cut. The miss is invisible unless the FK2 trial is repeated when models change. C's model changed today; it will change again.

PF4. Off-book spend. chart-usage states subagent usage is not counted. Any future cut that moves A's work into subagents improves the L3 number while spending the same tokens. Mitigation: leaves in this chart may not move work to uncounted seats and call it a saving.

PF5. Cap whack-a-mole. Lower output caps and earlier compaction (LP9) convert stock into calls. At A's stock, one extra call (~140k) erases roughly five 28k output trims. Anyone proposing a cap must bring the call-count delta with it.

PF6. Cache churn. See PQ3. Byte-stable prefixes are an asset; several attractive cuts (regenerated briefs, reordered restores, merged-file reshaping) spend it. Token-flat, dollar-up is the failure shape.

PF7. Baseline drift. Door-reset landing, the C model swap, and harness updates all move the baseline mid-chart. Any before/after claim that does not name session boundaries, model and harness version for both runs is not evidence.

## Inputs read, skipped, confidence

Read: map-brief-C.md, map-brief-common.md, INTAKE.md, study-B.md, study-C.md (whole); installed SKILL.md structure and key lines, questions.md Research and Blind peer exchange, shapes.md and standing-design.md section sizes; scripts directory listing plus output, timeout and herdr call sites in peer-ask/peer-wait/peer-restart/peer-create/chart-usage; `~/.akrogon/config.yaml` harnesses, `~/.claude/settings.json` (compaction window, output cap, caching flags), `~/.codex/config.toml` head, `~/.pi/agent/settings.json` (compaction settings); CHART.md, seats.yaml, USAGE.md and file inventories for base-red, fresh-consultants, usage-windows, door-handover, token-spend; door-reset leaf design head; chart-cost CHART.md; A's transcript by aggregation script only (distinct message ids, usage sums, per-call tool classification, context distribution), never printed.

Skipped: consultant session logs (sC measured them; re-measuring would spend the tokens this chart exists to save), return-file contents beyond sizes, full script bodies, SKILL.md sections that do not move tokens (Open layout, Direct route detail beyond size), live herdr state, dollar pricing beyond PQ3.

High confidence: the stock floors, A's call and context totals, A's share per chart, that A has no attended drain, that feedback arrives only at handoff, process-text sizes and staging asymmetry.
Lower confidence: my orchestration classification is an upper bound (mixed Bash commands count whole; INTAKE's 24% window figure is the cleaner lower anchor); LP4's saving range inherits that spread; LP2's quality equivalence is untested; LP8's pi numbers predate today's model swap; LP7b and the catalog trim depend on harness capabilities nobody has verified yet (FK4).
