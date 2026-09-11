# Passes inside each July 28 phase

Chart skill version: 4

Research dump, 2026-09-08, tier 2 (codebase read). Linked from # Turn Within Phase.

Read both files plus the adjacent contracts they delegate to (`authoring-reference.md`, `check-issue/SKILL.md`, `implement-issue/SKILL.md`, `merge-issue/SKILL.md`). Findings below.

---

# Preliminary: what actually exists on disk

Files are created **once, at scaffold time**, not progressively:

- `/home/ivan/Work/infra/akrogon-new/skills/consult-issue/SKILL.md:270` (Create Flow step 5) and `:276` (step 8) — the full canonical file set plus both consultant scaffolds are written at issue creation.
- `/home/ivan/Work/infra/akrogon-new/skills/consult-issue/authoring-reference.md:33-51` — `## Canonical File Model` = exactly `planning/{plan,a,b}.md` and `implementation/{plan,a,b}.md`. Nothing else is a phase-folder file.
- `/home/ivan/Work/infra/akrogon-new/skills/consult-issue/authoring-reference.md:296-305` — the locked `a.md`/`b.md` scaffold already contains `# Position`, `## Rebuttal Addendum`, `## Fidelity Audit`, `## Addendum Log` as empty/pending headings from creation.

Issue-root (not phase-folder) files: `state.yaml` (`lifecycle.ts:773-781`), `pair.yaml` (`SKILL.md:71`), `run-status.yaml` (`lifecycle.ts:291`, root resolved at `lifecycle.ts:968-989` — the **issue directory**, not the phase directory).

Status vocabulary: `lifecycle.ts:134-166` (28 tokens), `lifecycle.ts:222-247` (token→sentence), `lifecycle.ts:255-289` (`legalRunStatusSuccessors` per phase), `lifecycle.ts:299-308` (`allowedTransitions`).

---

# P-draft

| # | Pass | Slot | Writes (exact path) | Must not read | How the July 28 system knew it was done |
|---|---|---|---|---|---|
| 0 | Brief grill (optional, operator-triggered) | Issue-creating agent only (`SKILL.md:217`) | `issues/open/<slug>/planning/plan.md` — existing sections only, +1 line in `## Addendum Log`, **no new subheading** (`SKILL.md:223-227`) | Exits *without* writing `a.md` or `b.md` (`SKILL.md:233`) | Nothing durable. Self-attested termination (`SKILL.md:229`); operator short-circuit phrase (`SKILL.md:231`). While paused: `operator.answers.wait` (`SKILL.md:221`, token `lifecycle.ts:137`). Only trace = one neutral `## Addendum Log` line. |
| 1 | Slot A independent planning position (+ position-interview lane, mandatory) | A | `issues/open/<slug>/planning/a.md` `# Position`, incl. the five-surface `Interview scan:` block (`SKILL.md:239`) | `planning/b.md` (`SKILL.md:168`) | Token `planning.position.a` (`lifecycle.ts:138`), but ordering-only per `## Parallel Stage Token Rule` (`SKILL.md:149`). True completion = "substantive independent position" judged by content (`SKILL.md:125-135`). Missing `Interview scan:` block ⇒ incomplete pass (`SKILL.md:239`). |
| 2 | Slot B independent planning position (+ interview lane) | B | `issues/open/<slug>/planning/b.md` `# Position` | `planning/a.md` (`SKILL.md:173`) | Token `planning.position.b` (`lifecycle.ts:139`); same content test. |
| 3 | Slot A rebuttal round 1 | A | `planning/a.md` → `## Rebuttal Addendum` / `### Rebuttal Round 1` (`SKILL.md:128`, `:181`) | Slot B's `## Rebuttal Addendum` inside `b.md` (B's `# Position` *is* readable) (`SKILL.md:180`, `:371`) | Token `planning.rebuttal.round1.a` (`lifecycle.ts:140`); real test = substantive round-numbered subheading (`SKILL.md:128`). |
| 4 | Slot B rebuttal round 1 | B | `planning/b.md` → `## Rebuttal Addendum` / `### Rebuttal Round 1` | Slot A's `## Rebuttal Addendum` (`SKILL.md:187`) | Token `planning.rebuttal.round1.b` (`lifecycle.ts:141`). |
| 5 | Round-2 fork classification (fires only when `rebuttal_rounds: 2`, or `auto` + real fork) | Synthesizing slot = **A** for planning (`SKILL.md:143`, `:190`) | `planning/plan.md` → temporary `## Frozen Fork Brief - <fork-id>` (`SKILL.md:145`) | — (reads both files) | Token `planning.rebuttal.round2.classify` (`lifecycle.ts:142`). **Its sentence is "Run consult-issue to synthesize the planning phase."** (`lifecycle.ts:230`) — the token does not say "classify", so the token alone under-describes the pass. Label = `planning addendum update` (`authoring-reference.md:344`). Serial, strict-token step (`SKILL.md:149`). |
| 6 | Slot A rebuttal round 2 | A | `planning/a.md` → `### Rebuttal Round 2` under existing `## Rebuttal Addendum` (`SKILL.md:145`) | Peer's round-2 response (`SKILL.md:145`); reads only the frozen brief + own file | Token `planning.rebuttal.round2.a` (`lifecycle.ts:143`). |
| 7 | Slot B rebuttal round 2 | B | `planning/b.md` → `### Rebuttal Round 2` | Peer's round-2 response | Token `planning.rebuttal.round2.b` (`lifecycle.ts:144`). |

Phase moves `P-draft -> P-synth` only when both files carry substantive positions **plus every owed round** (`SKILL.md:379`; transition allowed `lifecycle.ts:300`). Note `planning.synthesize` and `planning.approve` are *legal successors while still in P-draft* (`lifecycle.ts:265-266`), so the token can already point past the phase.

Also legal in P-draft: `park.hold` / `park.release` (`lifecycle.ts:256-257`), written by the scaffold-park gate (`SKILL.md:282`, `:329`) and released only by the exact phrase `release park and continue` (`SKILL.md:346`).

---

# P-synth

| # | Pass | Slot | Writes | Must not read | How known done |
|---|---|---|---|---|---|
| 1 | Planning synthesis | **A** (strategist), fixed per phase (`SKILL.md:190`) | Rewrites `issues/open/<slug>/planning/plan.md` in place — decision prose, `D1..Dn` IDs (`SKILL.md:153`), replaces the `## Frozen Fork Brief` section with a structured `## Addendum Log` entry (`SKILL.md:145`) | No blindness rule — reads `plan.md`, `a.md`, `b.md` (`SKILL.md:191`) | Token `planning.synthesize` (`lifecycle.ts:145`). **Explicitly not a phase move**: "This state value means the next durable step, not whether synthesis prose already exists on disk" (`SKILL.md:97`, `:388`). |
| 2 | Operator planning approval | Operator (never automated — `authoring-reference.md:277`) | Nothing on disk in the phase folder; only `state.yaml` via `transition` | — | Exact-match phrase `approved, move the issue` (`authoring-reference.md:273`); near misses do not authorize (`authoring-reference.md:270`). Token `planning.approve` (`lifecycle.ts:146`, sentence `:234`). |

Legal successors in P-synth are only four: `operator.answers.wait`, `planning.approve`, `implementation.position.a`, `implementation.position.b` (`lifecycle.ts:270`). `planning.synthesize` is *not* legal in P-synth — so the synthesis pass must be tokened while the phase is still `P-draft`.

---

# I-draft

| # | Pass | Slot | Writes | Must not read | How known done |
|---|---|---|---|---|---|
| 1 | Slot A independent implementation position | A | `issues/open/<slug>/implementation/a.md` `# Position` | `implementation/b.md` (`SKILL.md:168`). Reads sibling `planning/plan.md` as inherited context (`SKILL.md:167`). **No interview lane** — it "never runs for implementation positions" (`SKILL.md:245`), so no `Interview scan:` block here | Token `implementation.position.a` (`lifecycle.ts:147`); parallel-stage, ordering-only (`SKILL.md:149`). |
| 2 | Slot B independent implementation position | B | `implementation/b.md` `# Position` | `implementation/a.md` | Token `implementation.position.b` (`lifecycle.ts:148`). |
| 3 | Slot A implementation rebuttal round 1 | A | `implementation/a.md` `## Rebuttal Addendum` / `### Rebuttal Round 1` | Slot B's `## Rebuttal Addendum` (`SKILL.md:180`) | Token `implementation.rebuttal.round1.a` (`lifecycle.ts:149`). |
| 4 | Slot B implementation rebuttal round 1 | B | `implementation/b.md` same | Slot A's `## Rebuttal Addendum` | Token `implementation.rebuttal.round1.b` (`lifecycle.ts:150`). |
| 5 | Round-2 fork classification | Synthesizing slot = **B** for implementation (`SKILL.md:190`) | `implementation/plan.md` → `## Frozen Fork Brief - <fork-id>` | — | Token `implementation.rebuttal.round2.classify` (`lifecycle.ts:151`); its sentence is again "synthesize the implementation phase" (`lifecycle.ts:239`). |
| 6 | Slot A implementation rebuttal round 2 | A | `implementation/a.md` `### Rebuttal Round 2` | Peer's round-2 (`SKILL.md:145`) | Token `implementation.rebuttal.round2.a` (`lifecycle.ts:152`). |
| 7 | Slot B implementation rebuttal round 2 | B | `implementation/b.md` `### Rebuttal Round 2` | Peer's round-2 | Token `implementation.rebuttal.round2.b` (`lifecycle.ts:153`). |

`I-draft` also legally holds `implementation.synthesize`, `implementation.approve`, and `fidelity.audit` (`lifecycle.ts:280-282`), i.e. three passes belonging to the *next* phase.

---

# I-synth

| # | Pass | Slot | Writes | Must not read | How known done |
|---|---|---|---|---|---|
| 1 | Implementation synthesis | **B** (implementer — "the slot that will execute the plan is the one that writes it", `SKILL.md:190`) | Rewrites `issues/open/<slug>/implementation/plan.md`; must fold in `advisory-quality-standards.md` as named execution constraints (`SKILL.md:195`) | None; reads `implementation/plan.md`, `a.md`, `b.md`, plus `planning/plan.md` (`SKILL.md:191-192`) | Token `implementation.synthesize` (`lifecycle.ts:154`). Does not move phase (`SKILL.md:388`). |
| 2 | Implementation fidelity audit | **A** — the non-synthesizing peer and author of the planning decisions (`SKILL.md:190`, `:200`) | `issues/open/<slug>/implementation/a.md` → `## Fidelity Audit` (`SKILL.md:200`; heading pre-scaffolded at `authoring-reference.md:303`) | **Hard blindness: reads *only* `planning/plan.md`, `implementation/plan.md`, and `advisory-quality-standards.md`; "the peer's implementation position is excluded and is not audit evidence"** (`SKILL.md:201`; restated `SKILL.md:365`, `check-issue/SKILL.md:120`, `implement-issue/SKILL.md:87`) | Token `fidelity.audit` (`lifecycle.ts:156`). Real evidence = a `faithful`/`drift` verdict plus audited plan revision and mismatch list recorded in the section (`SKILL.md:202-203`). |
| 3 | Fidelity repair (only on 1st `drift`) | Synthesizing slot **B** (`SKILL.md:383`) | Rewrites `implementation/plan.md` again; then pass 2 reruns fresh | Same audit blindness applies to the re-audit | Token `fidelity.repair` (`lifecycle.ts:157`), whose sentence is "Run consult-issue to synthesize the implementation phase." (`lifecycle.ts:245`); label `implementation synthesis walkthrough` (`authoring-reference.md:345`). Phase stays `I-synth`. |
| 4 | Operator direction (2nd consecutive `drift`) | Operator | Nothing | — | Token `fidelity.operator-direction` (`lifecycle.ts:158`), sentence `Next step: None.` (`lifecycle.ts:246`). Operator cannot waive fidelity (`SKILL.md:384`). |
| 5 | Implementation-synthesis approval | Operator **or** automated actor (only approval that may be automated — `authoring-reference.md:277`) | `state.yaml` only | — | Exact phrase `Authorize faithful implementation synthesis for execution.` (`authoring-reference.md:274`); or `orchestrator.gates.implementation_synth: auto` (`authoring-reference.md:286`). **Neither replaces the fresh `faithful` verdict** (`SKILL.md:382`). Token `implementation.approve` (`lifecycle.ts:155`). |

A planning amendment during `I-synth` invalidates the join and every earlier verdict (`SKILL.md:385`).

---

# I-ready

| # | Pass | Slot | Writes | Must not read | How known done |
|---|---|---|---|---|---|
| 1 | Worktree creation | implement-issue runner (no slot; "next_step-only writer, acquires no slot identity", `authoring-reference.md:291`) | `issues/worktrees/<worktree-name>` via `bun issues/.scripts/create-worktree.ts` (`implement-issue/SKILL.md:74`) | — | Script exit; path/branch mismatch halts. |
| 2 | Execution pass | implement-issue | Repo code **inside the worktree**; `## Addendum Log` + checklist + one active prose-only `### Quality Self-Check` block in control-root `implementation/plan.md` (`implement-issue/SKILL.md:150`) | Must not use the peer's implementation position as fidelity evidence (`implement-issue/SKILL.md:87`) | Token `implementation.execute` (`lifecycle.ts:159`). |
| 3 | QA reviewer sub-pass (always, before sign-off) | A spawned sub-agent, not a lifecycle slot (`implement-issue/SKILL.md:122`, `:162-178`) | Updates both the active `## Review Addendum` checklist and the main implementation checklist in `implementation/plan.md` (`implement-issue/SKILL.md:177`) | — | **No token of its own.** Only gate: "Do not finalize until the QA pass returns" (`implement-issue/SKILL.md:178`). |
| 4 | Finalize | implement-issue | Commit in worktree via `bun issues/.scripts/auto-commit-if-dirty.ts` (`implement-issue/SKILL.md:127`) | — | Script exit code, then `transition I-ready -> C-ready` (`implement-issue/SKILL.md:131`; `lifecycle.ts:304`). |

Legal tokens in `I-ready`: only `operator.answers.wait`, `implementation.execute`, `check.review` (`lifecycle.ts:285`).

---

# C-ready

| # | Pass | Slot | Writes | Must not read / must not touch | How known done |
|---|---|---|---|---|---|
| 1 | Slot A review | A (`check-issue/SKILL.md:69` — "Slot A owns `### Review - A`") | Control-root `issues/open/<slug>/implementation/plan.md` → `## Review Addendum` / `### Review - A`, plus own `## Addendum Log` lines (`check-issue/SKILL.md:108-109`, format at `:207-228`) | Must never rewrite or reorder `### Review - B` (`check-issue/SKILL.md:109`, `:166`); must not read the implementation surface from `main` while a worktree exists, nor write into the worktree's issue-folder snapshot (`check-issue/SKILL.md:110`) | Token `check.review` (`lifecycle.ts:160`) — **one token for both slots**. Per-slot completion is recorded separately as `merge_verdicts.a` via `status-verdict` (`lifecycle.ts:1115-1131`). |
| 2 | Slot B review (concurrent with 1) | B | same file → `### Review - B` (`check-issue/SKILL.md:229-248`) | must not touch `### Review - A` | `merge_verdicts.b`. |
| 3 | Verdict recording | each slot | `issues/open/<slug>/run-status.yaml` `merge_verdicts` | — | `status-verdict` is legal only in `C-ready`/`C-fix` (`lifecycle.ts:1122-1124`). When both = `merge-ready`, the CLI itself sets `next_step: merge.execute` **and advances `state.yaml` to `D-merge`** (`lifecycle.ts:1099-1112`, `:1126-1136`; described `check-issue/SKILL.md:73`, `:163`). |
| 4 | Repair routing (fixes found) | check-issue | `transition C-ready -> C-fix` (`check-issue/SKILL.md:159`; `lifecycle.ts:305`) | — | Token `repair.execute` (`lifecycle.ts:161`), sentence = "Run implement-issue…" (`lifecycle.ts:247`). |
| 5 | Operator-forced merge release (only without dual merge-ready) | Operator | `auto-commit-if-dirty.ts` commit, then `state.yaml` | — | Exact phrase `Authorize reviewed issue release into the merge workflow.` (`check-issue/SKILL.md:75`, `:87`); token `merge.approve`, sentence `Next step: None.` (`lifecycle.ts:243` region / `:162`). |

---

# C-fix

| # | Pass | Slot | Writes | Must not read / touch | How known done |
|---|---|---|---|---|---|
| 1 | Repair execution | implement-issue (no slot) | Worktree code; ticks verified fix boxes **inside** reviewer subsections without altering that subsection's verdict prose or the peer subsection (`check-issue/SKILL.md:168`, `:204`); refreshes `### Quality Self-Check` | Must read **every** `### Review - <slot>` subsection, "never only the latest or the one that triggered this pass"; must not use the peer's implementation position as fidelity evidence (`implement-issue/SKILL.md:87-88`) | Token `repair.execute` (`lifecycle.ts:161`). |
| 2 | QA reviewer sub-pass | spawned sub-agent | same as I-ready pass 3 | — | no token |
| 3 | Slot A re-check | A | refreshes `### Review - A` in place | peer subsection | Token `check.review`. Writing `check.review` over a prior `repair.execute`/`implementation.execute` is detected as a **fresh check cycle** and *clears* both recorded `merge_verdicts` (`lifecycle.ts:1089-1095`). |
| 4 | Slot B re-check | B | refreshes `### Review - B` | peer subsection | as above |
| 5 | Exit | check-issue | `transition C-fix -> C-ready` (`check-issue/SKILL.md:160`), or CLI auto-advance to `D-merge` on dual merge-ready | — | `C-fix -> C-fix` is a **no-write hold**, because the transition machine rejects self-loops (`check-issue/SKILL.md:161`; `lifecycle.ts:306`). Loop bound `orchestrator.c_fix_loop_cap`, default `3` (`lifecycle.ts:131`, `:1358`). |

---

# D-merge

| # | Pass | Slot | Writes | Must not read / touch | How known done |
|---|---|---|---|---|---|
| 1 | merge-issue NORMALIZE → MERGE → FINALIZE → SWEEP | merge-issue runner, no slot (`authoring-reference.md:291`) | `main` checkout (path-scoped writes only; `git add -A` and `git commit -a` banned), then deletes `issues/open/<slug>/` with `chore(<slug>): remove merged issue folder`, updates `SERIES.md` (`merge-issue/SKILL.md:76`) | Must run from the primary checkout on `main`, never inside the feature worktree (`merge-issue/SKILL.md:76`); path-disjoint foreign dirt must be left untouched | Token `merge.execute` (`lifecycle.ts:163`). **Successful terminal merge is one of the four `status-write` exclusions** (`merge-issue/SKILL.md:99`) — the completed pass writes no final token. |
| 2 | SHARED-LOGIC propose-and-hold | merge-issue | `Status: Blocked` / `Blocked by: SHARED-LOGIC conflict in <paths>` / `Unblocks when:` into the active `implementation/plan.md`; every semantic hunk left uncommitted (`merge-issue/SKILL.md:81`; block shape `consult-issue/SKILL.md:101-103`) | must not stage/resolve/commit any semantic hunk | Token `merge.shared-logic-hold` (`lifecycle.ts:164`), sentence `Next step: None.` |
| 3 | Broadcast handoff | broadcast-issue | Discord, no repo file | — | Not lifecycle-tracked. |

`D-merge` has no outgoing transitions (`lifecycle.ts:307`); legal tokens are only `operator.answers.wait`, `merge.execute`, `merge.shared-logic-hold` (`lifecycle.ts:288`).

---

# File-existence analysis

**Answer: no. In no phase can file existence alone identify the next pass.** The set of files in a phase folder is invariant from scaffold to merge.

The structural reason is a single line pair: Create Flow step 5 writes the whole canonical file model (`SKILL.md:270`) and step 8 seeds *both* consultant files with the full locked heading scaffold — `# Position`, `## Rebuttal Addendum`, `## Fidelity Audit`, `## Addendum Log` — "leaving the independent position and rebuttal sections explicitly pending" (`SKILL.md:276`; `authoring-reference.md:296-305`). So from minute one, `ls issues/open/<slug>/planning/` returns `plan.md a.md b.md` and `ls .../implementation/` returns `plan.md a.md b.md`, and it returns exactly that at `D-merge` too. `## Fidelity Audit` — a section that only slot A may ever fill, and only in `implementation/` — physically exists inside `planning/b.md` as an empty heading from creation.

Every distinguishing signal is *inside* a file, or outside the phase folder entirely:

| Phase | Passes indistinguishable by file existence | What is actually required to tell them apart |
|---|---|---|
| P-draft | grill / A-position / B-position / A-rebuttal-r1 / B-rebuttal-r1 / r2-classify / A-r2 / B-r2 — all 8 | Read `planning/a.md` and `planning/b.md` and apply the **prose-judgment** test in `SKILL.md:125-135` (is this substantive, or is it `Pending independent ... position` / `To be written from ...`?). Round depth needs `### Rebuttal Round N` subheadings; the r2 gate needs `## Frozen Fork Brief` presence in `plan.md`; the grill leaves only an `## Addendum Log` line. Or read `run-status.yaml` at the **issue root**. |
| P-synth | synthesis-written vs. awaiting-approval | Undecidable from files at all — `SKILL.md:97` states the phase "can stay in `P-synth` … after `plan.md` has been synthesized if approval is still pending." Approval lives in the operator's chat message (`authoring-reference.md:273`), never on disk. `plan.md` existed before synthesis and exists after. |
| I-draft | all 7 passes | Same as P-draft, on `implementation/`. Additionally the *absence* of an `Interview scan:` block is meaningful in `planning/a.md` but meaningless in `implementation/a.md` (`SKILL.md:245`), which file existence cannot express. |
| I-synth | synthesis vs. audit vs. repair vs. 2nd-drift-wait vs. approval | The audit writes into `implementation/a.md`, a file that already exists; its `## Fidelity Audit` heading already exists too. Distinguishing `faithful` from 1st `drift` from 2nd consecutive `drift` requires reading the verdict prose and counting prior verdicts — the *consecutive-drift count* is not stored in any file or token; `fidelity.operator-direction` (`lifecycle.ts:158`) is the only trace, and only after the fact. |
| I-ready | execute vs. QA sub-pass vs. finalize | The QA reviewer pass (`implement-issue/SKILL.md:122`) writes into the same `implementation/plan.md` as the execution pass and **has no token at all**. Worktree existence under `issues/worktrees/<name>` is the one genuine existence signal in the whole lifecycle — but it only says "execution started", not which of the three sub-passes is next. |
| C-ready | slot A review vs. slot B review vs. verdict-recording vs. repair-routing | Both reviews are subsections of one pre-existing `plan.md`; both slots run concurrently (`check-issue/SKILL.md:109`). Per-slot progress lives in `run-status.yaml` `merge_verdicts` (`lifecycle.ts:1115-1131`) — issue root, not phase folder — and `check.review` is a single shared token for two distinct passes. |
| C-fix | repair vs. QA vs. re-check A vs. re-check B; and which loop iteration | No file appears or disappears across an entire C-fix cycle. Iteration count against `c_fix_loop_cap` (`lifecycle.ts:1358`) is only inferable from `## Addendum Log` lines. The fresh-cycle verdict clear (`lifecycle.ts:1089-1095`) is a content mutation inside `run-status.yaml`. |
| D-merge | merge-executing vs. shared-logic-hold | The hold is three prose fields inside `implementation/plan.md` (`merge-issue/SKILL.md:81`). The only existence-based signal is terminal and destructive: after a successful merge the entire `issues/open/<slug>/` folder is deleted (`merge-issue/SKILL.md:76`) — so "folder gone" = merged, but every pre-terminal state looks identical. |

Secondary observations bearing on the same question:

- `run-status.yaml` is resolved to the **issue root**, not the phase folder (`lifecycle.ts:968-989`), so a reader scoped to `planning/` or `implementation/` sees no status file at all.
- `run-status.yaml` may legitimately be **absent**: `statusState: absent` is "the normal absent-tolerant legacy/manual path, not a park failure" (`SKILL.md:345`; `lifecycle.ts:1000-1006`). So even at the issue root, existence of the status file proves nothing.
- `pair.yaml` is the only file whose *content* grows incrementally (optional `a`/`b` keys enroll as passes run, `SKILL.md:71`), but it is created as a single file and records runtime/model/role provenance, not pass progress — and `SKILL.md:67` explicitly forbids inferring a slot from it.
- Phase folders are deliberately non-encoding: "issue paths are slug-only or marker-only and do not encode lifecycle phase" (`SKILL.md:84`).
- A worktree `state.yaml` copy exists but is "an inert snapshot, never the authority" (`SKILL.md:84`) — so its existence is actively misleading.