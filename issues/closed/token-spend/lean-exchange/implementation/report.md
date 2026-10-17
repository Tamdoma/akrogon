# Implementation report: lean-exchange

Commits: f0664b56 (unit 1, skill text), ef9654a2 (unit 2, session receipts), 78c5ed38 (planned expectation corrections), on a0d9a194 (planned red). Typecheck clean; 54/54 peer tests green (`bun test tests/peer-wait.test.ts tests/peer-ask.test.ts tests/peer-restart.test.ts --timeout 30000`; per-file runs: check-peer-{wait,ask,restart}-green-*.log).

## Wave summary

| unit | scope | commit | result |
|---|---|---|---|
| U1 (Gimli) | reading rule, chained waits, seat-record rule, chart.md sync | f0664b56 | pass; 2 guide contradictions fixed (omitted `agent list` read) |
| U2 (Gandalf) | `session` on outcome and restarted lines | ef9654a2 | pass after A-fixed expectations (brief criterion 6: post-exchange session, not carried seed) |
| U3 (this agent) | two live runs, timeout probe, evidence | — | see below |

## Live runs

Two autopilot door runs against scratch repos, identical pane layout (A claude left, B codex + C pi right), same style of handed item, fresh sessions. Base: installed release copy of chart-issues at merge-base (17d61171); branch: worktree copy with this leaf's edits. Setup: `runs/{base,branch}/` (config, scratch repo, GitHub destination, transcripts in `runs/logs/`).

### Base run (old skill), chart scratch-notes + scratch-owners + scratch-readme

- Transcript (base-A.jsonl): `peer-ask` called with no preceding wait; seat records updated via a standalone `herdr agent list | grep` helper (`sess(){...}`) after exchanges; restart then separate wait/list reads.
- USAGE: seat A calls 13 (scratch-notes, includes operator-blocked turns), 2 (owners, 2 exchanges), 3 (readme, 2 exchanges); 4 charts never ran fork/rebuttal rounds.
- Consultant C (pi): full `cat` of briefs, `sed -n '114,307p'` on shapes.md, no batching discipline.

### Branch run (new skill), charts scratch-notes (single-slot) + owners-file (single-slot) + readme-file (2 peers, 4 exchanges)

- First chart went single slot by the shared drop rules: `peer-restart` printed B `stopped` (codex cold `agent start` timeout, >30s on first codex launch) so B dropped; C printed `untouched` and dropped. Same rule exists in the base skill, so behavior is identical, but the exchange path went unexercised. A second chart stayed single slot because drops persist for the session.
- Third chart named fresh peers (B wA:p11W codex, C wA:p11X pi) and ran the full exchange: restart, map, fork notes, rebuttal, leaf review.

Wire evidence (branch-A.jsonl, readme turn, one operator prompt, 6 A calls per USAGE):
- Every `peer-ask` preceded by `herdr agent wait <B> --timeout 30 >/dev/null && herdr agent wait <C> --timeout 30 >/dev/null &&` in the same bash call — all 4 exchange steps, one call each. No separate `agent list` anywhere in the turn.
- Restart lines: `{"seat":"B","pane":"wA:p11W","kind":"codex","state":"restarted","session":"none"}` and C `restarted` with its pi session path — matching the tests.
- Outcome lines carry `"session"`: `{"outcome":"done","pane":"wA:p11W","status":"done","signal":"proven",...,"session":"01a14b2b-..."}` and C's pi path; `seats.yaml` got both post-exchange entries (C at start, B after first exchange) with no list read.
- USAGE: A calls 6 in a 4-exchange + restart + leaf-write turn (base ran 3 A calls for a 2-exchange turn without leaf review).
- `akrogon status` exit 0; `issues/open/readme-file/add-readme` handed off.

### Consultant read tallies (branch readme session)

- C (pi): read calls = brief files, INTAKE.md, prior CHART.md files, map/merged/leaf drafts. `questions.md` read only via `awk` named-section extraction (`/^## Blind peer exchange/`, `## Research`, heading `grep`), never full-file. One rule miss: INTAKE.md read twice.
- B (codex): batched independent reads via parallel `Promise.allSettled` exec calls, named-section `awk` on fork file. Two rule misses: full `cat` of the installed SKILL.md (installed copy predates the rule; branch rule binds what it received via briefs), and INTAKE.md read twice.
- Base contrast (C-owners): full-file `cat` for every artifact plus a line-range `sed` on shapes.md.

## Criterion results

| # | criterion | evidence | verdict |
|---|---|---|---|
| 1 | locate + batched bounded section reads, no repeated held content | branch transcripts above: named-section extraction, parallel batched reads, no line ranges; exceptions = one duplicate INTAKE.md read per consultant (rule is normative guidance; no mechanism can enforce at most-once) | pass with noted deviations |
| 2 | A waits are pre-prompt only, chained, one A call per exchange | 4/4 exchange calls show `wait && wait && peer-ask` in one bash call | pass |
| 3 | consultant read/call tallies vs base | base C: 9 sequential exec calls incl. full cat + sed ranges; branch C: section-targeted awk + batched reads; branch B: parallel batched reads | pass |
| 4 | timeout exchange: wait exits non-zero, no prompt, rerun once per peer | live probe: `herdr agent wait w8:pTD --timeout 5` on a working pane → `{"error":{"code":"timeout"}}`, exit 1 in 5s; chain short-circuit means no prompt sent; rerun semantics unchanged | pass |
| 5 | `session` on peer-wait lines → seats.yaml receipt | outcome lines carry session; seats.yaml appended B post-exchange and C post-start | pass |
| 6 | post-exchange session value | outcome lines show post-exchange ids (B codex session only exists post-start; pi path is post-restart); test 'pi session change ignored' proves live-read | pass |
| 7 | all lines carry session, `'none'` otherwise | restart lines: codex `none`, pi path; stopped/untouched tests print none; worker conflict resolved by accepting `'none'` | pass |
| 8 | one call per restart + exchange, no separate list read | branch readme turn: 0 `herdr agent list` calls; base readme turn: standalone `sess()` list greps; A calls 6/4-exchanges vs 3/2-exchanges | pass |
| 9 | restart appends receipt entry only | seats.yaml has one entry per seat (C restart session, B post-exchange), no nulls | pass |
| 10 | peer-ask unchanged path | peer-ask.ts untouched in diff; outcome lines pass through from peer-wait stdout | pass |
| 11 | naming/type unchanged | outcome/restart lines use the documented names + `session`; chart.md/SKILL.md sentences updated to describe receipt, no shape change elsewhere | pass |
| 12 | no new env var, no test added for purely normative prose | env_names empty; prose rule only in skill text | pass |

## Friction observed (run artifacts, not leaf defects)

- `peer-ask` reports `failure`/`budget` if a brief gives a templated return path (base run hit this; A repaired by renaming). Out of scope.
- `akrogon pull` prints a stack trace for a missing remote; both doors logged it as friction.
- Chart file commits varied between runs (branch committed chart writes progressively, base left `issues/` untracked) — run-level variance, not caused by this diff.
- First-run codex cold `agent start` timed out inside peer-restart once (30s cap); warm starts succeeded.

## Logs and artifacts

- `implementation/runs/{base,branch}/` — scratch repos with chart + leaf output, per-run AKROGON_HOME config, `runs/logs/` (door + consultant transcripts, screen captures).
- Temporary resources: test tab lx-setup removed; throwaway GitHub repos lx-chart-base/lx-chart-branch may be deleted (scratch only).

## check.fix pass (2026-10-17)

Reviewed head was 30a1c37d; handed-off head is the commits below on it. B repaired F1 (0b3ec55 reproduction, fc76391 fix) and F5 (30a1c37d) before this pass.

### F6 repair — carried exchange kept unchanged

- `bdea694f` test expectation corrected first, red on the head before the product fix: `check fix-a-f6-red: 1 implementation/check-fix-a-f6-red-1792263885497-4018234.log`. Trailer cites criterion 6 (`exchange` unchanged).
- `530bfd33` product fix: `finish` no longer writes the final roster session into `exchange.session`; the receipt stays on the top-level `session` field; grace-path adoption in the wait loop unchanged. Green: `check fix-a-f6-green: 0 implementation/check-fix-a-f6-green-1792263915208-4020616.log` (45/45 peer-ask + peer-wait).

### F2/F3 — matched final-head live runs (runs2/)

Two fresh autopilot runs, sequential environment under `implementation/runs2/`: identical pane layout (A claude, B codex, C pi `meta/muse-wonder-full-1.0-contributor --thinking high` both runs), fresh sessions, identical handed item ("add an AUTHORS file… naming the author akrogon live-test"), GitHub destinations, per-run `AKROGON_HOME`. Base = skill at merge-base (17d61171); branch = this head's skill. First attempt went single-slot on both runs (codex trust prompt blocked `agent start` inside peer-restart — an environment fault, both runs logged it); after clearing trust, a second item ran full peer rounds on both.

| | base authors | branch authors-file |
|---|---|---|
| exchanges | restart + map + leaf review (2) | restart + map + fork round + rebuttal + leaf review (3) |
| A calls | 14 | 12 |
| A avg ctx | 121,224 | 118,924 |
| Σ calls × avg (all seats) | 2,211,236 | 2,110,149 |
| `agent list` reads in turn | 2 (open roster + post-restart seat collect) | 1 (open roster only) |
| per-exchange A bash calls | ~2–3/step (wait loop + peer-ask + list greps) | 1/step (chained `wait && wait && peer-ask`) |

Branch Σ is lower even with one more exchange round; the per-step structure is the durable win (a call saved per exchange plus the post-restart roster read). Records parity: both produced CHART.md/INTAKE.md/seats.yaml/USAGE.md/slots briefs+returns/leaf folders, `akrogon status` green, `Handed off` footers; branch recorded a C dissent + rebuttal, base's operator-supplied exact text needed no fork — both write the same record shapes. Outcome lines carried `session` in the branch run; seats.yaml got both post-exchange sessions with zero extra list reads.

Transcripts retained: `runs2/logs/{base,branch}-A.jsonl`, `runs2/logs/{base,branch}-B-codex.jsonl`, `runs2/logs/{base,branch}-C-pi.jsonl`; charts + USAGE under `runs2/{base,branch}/scratch/issues/chart/`.

### F3 — consultant read accounting (matched runs)

Complete per-path accounting (each `read`/`cat`/`sed`/`awk` on a file):

- BASE C (14 reads): 1× each of map-brief-C, standing-design.md, leaf-review-brief-C, leaf brief/design/readiness/state/ISSUE, INTAKE.md, CHART.md, shapes.md, 2 bash cats of prior leaf files, own return check.
- BRANCH C (15 reads): 1× each of map-brief-C, standing-design.md, prior chart fork/leaf files, rebuttal-brief-C, merged notes, leaf-review-brief-C, draft leaf files (5), prior leaf state/readiness.
- BASE B (4 reads): map-brief-B, standing-design.md, leaf-review-brief-B, leaf-review-B.
- BRANCH B (8 reads): map-brief-B, installed SKILL.md (1×), standing-design.md, map-B, rebuttal-brief-B, merged, leaf-review-brief-B, leaf-review-B.

No path read more than once in any session. Process-source reads are `standing-design.md` (full read — the source is the subject of the leaf-review step, permitted by the rule's full-source clause) and briefs. `questions.md` was not opened by either side (steps did not need its sections). Branch B's single installed-copy `~/.codex/skills/chart-issues/SKILL.md` read is the same provenance gap as run 1 — the copy it holds is pre-rule; the rule binds what the skill supplies via briefs, and no duplicate held-content reread occurred.

### F4 — live timeout exchange (criterion 5)

- `check fix-a-chain-timeout2: 0 implementation/check-fix-a-chain-timeout2-1792264869211-420930.log`: with wA:p12F busy (sleep 90), the chained `agent wait p12F && agent wait p12H && peer-ask` hit `{"error":{"code":"timeout"}}` on the first wait, `chain_exit=1`, zero outcome lines, no `/tmp/lx2-probe-*.md` created — no prompt sent.
- `check fix-a-chain-rerun: 0 implementation/check-fix-a-chain-rerun-1792264967451-444791.log`: identical chain after the busy peer went idle prompted each peer exactly once (one outcome line each); the first probe's vague prompt produced `failure` outcomes (peers answered in chat, not the file).
- `check fix-a-chain-rerun2: 0 implementation/check-fix-a-chain-rerun2-1792264985971-458651.log`: same chain with an explicit file-write prompt → `done` outcome lines for both peers, return files written, `chain_exit=0`.

Run-journal cleanup: probe files removed; lx2 panes and tabs kept under `implementation/runs2/`.

### Refresh

No rebase needed: `origin/main` tip equals AKROGON_BASE `17d61171`; the branch was already on current main.

## check.fix pass 2 (2026-10-17, F2/F3 re-check findings)

B's re-check held F2/F3 open: the runs2 comparison started on warm A sessions and the read accounting undercounted multi-path calls. New matched pair under `implementation/runs3/`, both items the first work of completely fresh seats.

### F2 — matched fresh-session runs

Both doors: fresh claude sessions (base `51ec8037`, branch `fb40a761`), fresh codex/pi peer panes, identical prompt wording (NOTES.md item, skill path the only difference), identical layout, `lx3-chart-{base,branch}` GitHub destinations, per-run `AKROGON_HOME`. Harness records (`runs3/versions.txt`): claude 2.1.302, codex 0.163.0, pi 1.3.0, herdr 0.9.1. Seat argv: B bare `codex`, C `pi --model meta/muse-wonder-full-1.0-contributor --thinking high`, A bare `claude` — identical on both runs. Codex trust prompts were cleared manually before prompting the doors.

Exchanges: identical set both sides — peer-restart, opening map, leaf review (base chart `notes`, branch chart `scratch-notes`; one fork file each, no rebuttal on either). All branch exchanges used one `wait && wait && peer-ask` call.

| | base | branch |
|---|---|---|
| A calls / avg ctx | 15 / 97,342 | 14 / 98,160 |
| B calls / avg ctx | 9 / 25,477 | 9 / 25,925 |
| C calls / avg ctx | 10 / 14,021 | 11 / 15,001 (USAGE `calls unavailable`; counted from assistant usage entries) |
| Σ calls × avg ctx | 1,829,633 | 1,772,576 |
| `agent list` reads by A | 2 (open roster + post-restart seat collect) | 1 (open roster) |
| machinery calls per exchange | 1–2 + 1 post-restart roster read | 1 chained call per step |

Branch Σ is lower on the locked whole-window comparison, and the structural delta is visible: the branch door skipped the post-restart roster read (seat records came from the `session` fields on restart/outcome lines — seats.yaml got C's restart session and B's post-exchange session) and fused each step's waits into the prompt call.

Records parity: identical shapes (CHART/INTAKE/seats/spans/USAGE/slots/fork files/leaf folders/`Handed off` footer, `akrogon status` green). Branch chart logged one friction line (A discarded outcome lines via a `>/dev/null` redirect but read the return files) — operator-facing records complete.

### F3 — complete per-path read accounting (every path in every batched call)

Counted every `.md/.yaml` path token in every `read`/`cat`/`sed`/`awk`/`grep`-line of all four consultant transcripts (method: per-line path-token scan, transcript copies in `runs3/logs/`).

- BASE C — 14 path reads, 0 duplicates: map-brief-C, standing-design.md, leaf-review-brief-C, leaf drafts (5), CHART.md, fork file, shapes.md, config + 2 self-written files.
- BRANCH C — 14 path reads, 0 duplicates: map-brief-C, questions.md, leaf-review-brief-C, leaf drafts (5), CHART.md, INTAKE.md, fork file, +3 config probes.
- BASE B — 6 path reads, 0 duplicates: map-brief-B, standing-design.md, leaf-review-brief-B, map-B, leaf-review-B, config.
- BRANCH B — 10 path reads, 0 duplicates: map-brief-B, questions.md, INTAKE.md, CHART.md, fork file, map-B, leaf-review-brief-B, leaf-review-B, NOTES.md probe, config.

Process-text reads on the branch run: both consultants read `questions.md` exactly once, directed by the brief's `## Research` named-section pointer, but via unbounded `cat`/`read` of the 15KB file rather than a bounded section read — one deviation from the rule's section-boundary on each consultant (no line ranges, no re-reads). No consultant read any process file outside its run's own skill copy (branch B's earlier installed-SKILL.md read is absent this run). Base consultants read process files the old way where needed (`standing-design.md`, `shapes.md` full reads; `shapes.md` is the leaf-review subject, allowed by the full-source clause on both rules).

Residual deviation noted for review: section-directed but unbounded single read of questions.md by B and C.

### Evidence index

- `runs3/logs/{base,branch}-{A,B-codex,C-pi}.jsonl` — full door + consultant transcripts.
- `runs3/{base,branch}/scratch/issues/chart/{notes,scratch-notes}/` — chart records, USAGE, seats.
- `runs3/versions.txt`, `runs3/panes.txt` — harness versions, seat layout.
- lx3 panes/tabs retained under the run folders; `lx3-chart-{base,branch}` repos exist as scratch destinations.

## check.fix pass 3 (2026-10-17, F3 bounded-read case)

B held F3 open: naming a section in the brief did not produce bounded reads — both consultants read all of `questions.md`. The repair is the missing case on the same live sessions, not a skill change: a new focused-check exchange over the production `peer-ask` path whose brief names the sections to read and states the consultant rule ("locate the section before reading it, read only it, hold at most once"). `## Research` was already held by both consultants, so the re-read cap applies and the new section (`SKILL.md ## Drain`) is the section-read case.

- Briefs: `runs3/branch/scratch/issues/chart/scratch-notes/slots/section-check-brief-{B,C}.md` — name `questions.md ## Research` and `SKILL.md ## Drain`, each "with output bounded to that section", plus the locate-then-read instruction.
- Exchange: one chained call — `herdr agent wait wA:p12P && herdr agent wait wA:p12Q && bun scripts/peer-ask.ts …` — outcome lines `done/proven` with `session` fields (production path unchanged at head `530bfd33`).
- B (codex, `branch-B-codex.jsonl` after byte 220513): read the brief, then `rg -n '^## Drain$' SKILL.md` to locate the section, then `awk` printing only `## Drain`; did not re-read `questions.md` (held from its earlier read — once-per-session honored).
- C (pi, `branch-C-pi.jsonl`): read the brief, then `grep -n '^## Drain'` then `awk` printing from `## Drain` to the next `##`; did not re-read `questions.md` (held).
- Returns: `slots/section-check-{B,C}.md`, both citing the sections' contents correctly.

Section-bound read of a named section, on the branch skill copy, inside the same chart session, with a second section proven held-not-reread — the F3 missing case now stands, alongside the earlier zero-duplicate per-path accounting. The earlier whole-`questions.md` reads remain recorded above as what they were; this run's evidence is additive.

This case does not by itself show that briefs like the original map brief will routinely yield bounded reads: the new brief stated the rule explicitly. Whether the rule text should travel in every brief is a product question for B's disposition, not a defect claim.

Transcript checks: `check fix-a-f3-transcripts4: 0 implementation/check-fix-a-f3-transcripts4-1792266406667-3050728.log` (B: exactly 2 SKILL.md exec calls post-exchange — locate + section print — and 0 questions.md reads) and `check fix-a-f3-transcripts-pi: 0 implementation/check-fix-a-f3-transcripts-pi-1792266406755-3050872.log` (C: 2 SKILL.md calls, 0 questions.md reads post-brief). Earlier transcript-check labels `fix-a-f3-transcripts`/`2`/`3` are failed draft assertions (too-loose string matches caught the apply_patch write); kept as logs.

## check.fix pass 4 (2026-10-17, F3 measured-run repair at final head)

B held F3 open: bounded section reads must occur inside the measured run, and the earlier post-handoff case sat outside the spend window. Root cause confirmed by runs3: the consultant's rule lives in `questions.md`, the file it was told to limit itself to, so a bare section citation gave no reason to bound the read.

### Code change

`04e75416` adds one sentence to the consultant-reading rule in `questions.md`: a brief that cites process text must name each section, require bounded reads of only those sections, and prohibit re-reading held content. No script or test change; the rule's meaning is unchanged — this carries it to where the consultant can see it.

### runs4 — the F3 measured case (head `04e75416`)

Fresh matched pair, identical NOTES.md item, fresh A sessions (base `69b28f7d`, branch `d223f025`), `lx4-chart-{base,branch}` destinations, same argv/models/versions. Branch consultants received a `note-content` fork-notes brief — under the new rule it names `questions.md ## Blind peer exchange`, paragraph beginning "For the opening map", and says "Read nothing else from that file and do not re-read content you already hold."

Inside the measured window (`seats.yaml` span, USAGE window):

- Branch B (codex): `awk` printing only the named paragraph, `max_output_tokens: 4000`, in `branch-B-codex.jsonl` — locate-then-bounded-read of exactly the brief's section. One questions.md touch total.
- Branch C (pi): `grep -n "For the opening map" questions.md` (locate), no other questions.md read — 0 whole-file reads.
- Zero duplicate reads per path across both consultant transcripts; both returns delivered; fork file, merged notes and rebuttals all present with agreeing-slot tags.

The branch run also exercised more of the door than any prior run: a material fork (note content/proof), blind notes, merged file, disagreement-only rebuttals, fork Findings/Taken, leaf review, handoff — the full blind multi-model pipeline on the new text.

### runs5 — the clean matched-workload spend pair (head `04e75416`)

Because runs4's workloads diverged legitimately (branch found a fork; base did not), one more identical pair was run. Both runs5 charts: restart + opening map + leaf review, no fork rounds, both `Handed off`, both `akrogon status` green. Fresh A sessions (base `180c00ff`, branch `f9c16ddd`), identical item text, `lx5-chart-{base,branch}`, same argv/versions (`runs5/versions.txt`).

| | base | branch |
|---|---|---|
| A calls / avg ctx | 18 / 102,101 | 15 / 103,546 |
| B calls / avg ctx | 10 / 30,347 | 9 / 27,725 |
| C calls / avg ctx | 15 / 19,472 | 10 / 11,385 (assistant usage entries; USAGE `calls unavailable` again from the pre-restart seats entry) |
| Σ calls × avg ctx | 2,433,368 | 1,916,565 (−21.2%) |
| `agent list` reads | 3 | 1 |
| exchange machinery | `peer-ask` calls with no chained waits (waits inlined) | 1 `wait && wait && peer-ask` call per step, 2 steps |

Records parity: identical file sets (CHART/INTAKE/seats/spans/USAGE/slots/fork docs/leaf folders/footers). One form difference: base A kept the merged map in `slots/map-merged.md`, branch A inlined the same merged map (with `(A,B,C)` attribution) in CHART.md's body — same record, different envelope. No process text was cited by runs5 briefs, so F3 is not exercised there; zero questions.md reads by any runs5 consultant confirms it was not needed. Per-path accounting: 11/10/5/7 reads across B/C, zero duplicates (exhaustive path-token scan as before). Both runs5 B consultants each read `INSTALLED/chart-issues/SKILL.md` once — the same codex auto-load provenance artifact noted in earlier passes.

### Cross-run summary for F3

- The defect case: runs3 whole-`questions.md` reads (recorded above).
- The post-handoff bounded read: runs3 section-check (recorded above).
- The measured-window bounded read at final head: runs4, this section — bounded, located-first, held-content not re-read, complete accounting.

### Evidence index

- `runs4/logs/*`, `runs5/logs/*` — transcripts; `runs4/`, `runs5/` scratch trees — records, USAGE, seats, briefs.
- `runs4/panes.txt`, `runs5/panes.txt`, `runs5/versions.txt`.
- Pane tabs `lx4-*`, `lx5-*` retained; `lx4-chart-*`, `lx5-chart-*` repos exist.

Pass-4 checks: `check fix-a-f3-peerwait: 0 implementation/check-fix-a-f3-peerwait-1792267763339-1539151.log` (peer-wait 37/37), `check fix-a-f3-rest: 0 implementation/check-fix-a-f3-rest-1792267767483-1628256.log` (peer-ask + peer-restart). Skill-text-only change; no test was touched.

## check.fix pass 5 (2026-10-17, F3 joint measured case at `7eff5e94`)

B repaired the delivery rule itself (`7eff5e94`: every peer brief carries the reading rule, even with no citation) and required the joint case: bounded reads and lower spend in the **same** measured run. Four attempts: runs6/7 landed bounded reads but branch found a notes fork while base did not (workload confounded); runs8 landed the matched workload.

### runs8 — the joint pass

Fresh pair at head `7eff5e94`, identical NOTES item and prompt text, fresh A sessions (base `aa30db53`, branch `396fc199`), `lx8-chart-{base,branch}` destinations, same argv/models (`runs8/versions.txt`), `lx8-*` panes.

**Workload parity (the missing piece before):** both doors found the same `notes-line` fork (line content/bytes) in the opening map, both settled it through the merged map without a separate blind-notes round, both ran restart + map + leaf review and handed off. Identical chart file sets except `slots/map-merged.md` exists on base while branch inlined the same merged-map record into CHART.md's "Forks taken" (same record, different envelope — same asymmetry accepted in runs5). Both `akrogon status` green, `Handed off 2026-10-17` footers.

| | base | branch |
|---|---|---|
| A calls / avg ctx | 18 / 116,340 | 11 / 116,566 |
| B calls / avg ctx | 8 / 31,077 | 10 / 23,003 |
| C calls / avg ctx | 11 / 13,545 | 10 / 11,368 |
| Σ calls × avg ctx | 2,491,731 | 1,625,936 (**−34.7%**) |
| `agent list` reads | 2 | 1 |
| exchange machinery | 2 chained + 1 standalone `peer-ask` | 1 `wait && wait && peer-ask` call per step |

**F3 inside the same window:** every branch brief carries the rule verbatim ("Read process text by named section only, locating a section before reading it…Name sections, never line ranges" — grep on `runs8/branch/…/slots/*brief*.md`). Within the measured span the branch consultants performed **zero** process-file reads: B read 15 paths (briefs, chart records, leaf drafts, repo probes), C read 12 — all non-process files, zero duplicates. Base C by contrast ran the old-behavior whole-file `cat shapes.md; cat standing-design.md` in one call. No process text was needed on this item, and under the delivered rule no consultant read a process file in full or re-read held content. The reading-rule outcome named in criterion 3 stands in the same run where spend is lower — jointly, as required.

Per-path accounting method unchanged (exhaustive path-token scan of all four transcripts). Runs6/7 remain on record as two intermediate attempts: both showed unconditional rule delivery in briefs and section-bounded reads by branch consultants (B's python section-slices, C's `awk`/`grep`), confounded on spend by an asymmetric notes fork; runs7 C also `cat`ed `standing-design.md` once — a whole-file deviation logged honestly alongside the passes.

### Evidence index

- `runs8/logs/*`, `runs8/{base,branch}/scratch/issues/chart/*/`, `runs8/versions.txt`, `runs8/panes.txt`
- `runs6/`, `runs7/` retained with logs for the divergence record
- `lx8-chart-{base,branch}` repos; lx8 panes retained

### Red/green framing

- Red (recorded): runs3 whole-`questions.md` reads; runs5 whole-`SKILL.md` read on the uncited path — the defect B's `7eff5e94` repair closed.
- Green (this pass): runs8 — rule delivered in every brief, zero process reads, zero re-reads, Σ −34.7% vs matched base, all-seat accounting complete.
