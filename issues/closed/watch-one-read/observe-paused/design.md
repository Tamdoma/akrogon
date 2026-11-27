# Design: observe-paused

## Binding decisions, verbatim

### Signposts (issues/chart/watch-one-read/forks/signposts.md, Taken)

A's picks under full autopilot, 2026-11-25T17:19Z, not operator words:

- S1 a: the intake's own fix direction and the operator's rule "what removes the whole problem class". A rule about reading status is a guard on a fragile part.
- S2 a: the operator's standing rule "Add no fallback unless requested". A silent "not paused" default could make the watch act on a paused repo.
- S3 a: the report's cause is the two-source tick. Other habits have no evidence here. Recorded under Off route.
- S4 a: a live watch (w-akrogon t346) runs on the installed release now, and a release link swaps scripts under a watcher that may still hold the old text.
- S5 a: false docs are a defect the change creates.
- S6 a: the script output is reachable by free tests on a real hc core. Whether a model honors the paused rule is model behavior, which only a live run shows, and paid runs sit under the standing grant 3b.

Account: the session puts removing the second source first and gives up keeping `akrogon status` in the tick at all.

### Observe carries the paused state (issues/chart/watch-one-read/forks/observe-paused.md, Taken)

A's pick under full autopilot, 2026-11-25T17:52Z, not operator words:

1. Q1: line 1 `session=<name>` unchanged; line 2 always exactly `paused=true` or `paused=false`; then the existing leaf and unreadable lines with formats unchanged. Reason: S4a keeps line 1 and row formats for watchers on old skill text, and the bit is read before the rows it governs. Rejected: final line (C; the bit comes after the rows it governs), line 1 suffix (breaks HC_SESSION parsing and observeReady), only-when-paused (absence as signal), non-zero exit for paused (paused is a normal state). Standing dissent: C preferred the final line.
2. Q2: paused prints only the two header lines, reads no inventory, seats or transcripts, and exits 0. Reason: S1a, a paused check has no rows to act on and makes no hc seat reads, matching today's "paused observes nothing". The pause rule in the skill is what forbids action (C's correction), and the short-circuit removes the rows that invite it. Rejected: full inventory while paused (C). Standing dissent: C preferred full inventory, and named the short-circuit as right if the no-seat-read rule binds, which it does.
3. Q3: observe.ts calls `isPaused(<repo key>)` from src/pause.ts before writing any stdout. A failed read exits non-zero with empty stdout and stderr naming the file. In the skill, a check is valid only when observe exits 0 and line 2 is exactly `paused=true` or `paused=false`; a non-zero exit or a missing or different line 2 is a failed check that reports the error and acts on nothing (C's correction). `paused=true` reports paused and acts on nothing. Every re-observation in `## Judge` and `## Consult` follows the same rules. Rejected: a default when the read fails (S2a), pause in `akrogon config` (a corrupt paused.yaml would break stop.ts), `status --json` or a new CLI verb (a second source).
4. Q4: free proof in tests/hc-observe.test.ts (paused, unpaused, unpause restores, malformed paused.yaml), the stand-ins switched to observe.ts and acting only on exit 0, `paused=false` and at least one eligible `slug=` row (B's correction), watch-timer and stand-in live cells counting and holding checks on an observe-only marker with zero `akrogon status` calls, a free case where a leaf staged after an empty check is acted on at the next due, the doc test flipped, `AKROGON_HOME` in both watcher envs. Paid proof: one live pi watcher cell (the incident harness) showing one observe check per accepted due with no `akrogon status`, no `next` at a paused due while a dispatchable leaf is on disk (B, C correction), and a watcher-attributed `next` for a leaf staged after an empty check. Docs: docs/use/watch-while-away.md, docs/pictures/watch-loop.svg, skills/AREA.md. Reason: S6a, scripts are free-testable, and the model's reading of the new check is model behavior. Rejected: free tests only (cannot show a model stops calling status).

Corrections from the rebuttals (C1 failed-check rule, B2 stand-in gating, B1/C3 dispatchable leaf at the paused due, B3/C4 intake wording) are adopted here. Their focused check is the leaf-review exchange, where B and C review the drafts as implementers.

/home/ivan/.akrogon/releases/4325f9ce566c5d8588f84b7a214422e1dffe62a0/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: criteria 1-3 are proven at the real boundary, the observe script run on a real hc core, each new case red on the base. Criterion 4 is a literal command contract (the skill names no `akrogon status`) plus the behavior proofs of criteria 5 and 6. Criterion 5 uses the existing stand-in watchers and timer tests, which are fixtures, not new machinery. Criterion 6 is the one live run: one pi watcher session in the existing watch-live e2e paid cell, because a model's reading of the new check text is model behavior no smaller test shows. It uses only existing machinery and one session, so no serial-order resource applies. False expectations (the doc test requiring `akrogon status`, status-based check markers) are deleted with their reason, not kept beside the new ones.

## Leaf architecture

Owned surfaces:
- `skills/watch-issues/scripts/observe.ts` `main`: after `resolveRepoKey` and `readRepo`, read `isPaused(repoKey)` from `src/pause.ts` and resolve `repoSpace` before any stdout line; print `session=<name>`, then `paused=true|false`; when paused return before `repoInventory`, `leafSeats` and `transcriptFor`. `formatLeaf` unchanged. A `PauseStateError` or other read error reaches the existing catch in the `import.meta.main` block (stderr, exit 1).
- `skills/watch-issues/SKILL.md`: `## Invocations` (start check), `## Observe` (line 2 contract, valid-check rule, paused and failed-check rules, empty output is two lines), `## Judge` and `## Consult` re-observations follow the same rules, and one sentence stating the snapshot limit: a pause landing after a check's observe read is seen at the next read. `## Never` unchanged.
- Tests: `tests/hc-observe.test.ts` (exact outputs, new paused, unpause and malformed cases), `tests/fixtures/watch-hook.sh` and `tests/fixtures/watch-agent.sh` (run observe.ts as the model's check; run `next --all` only on exit 0, line 2 exactly `paused=false` and at least one `slug=` row of any phase, replacing today's `*paused*` substring test) (A,B,C), `tests/watch-timer.test.ts` (check marker, busy hold, zero status calls, empty-then-staged case, doc test flipped to "does not contain `akrogon status`"; `watchUp` passes `AKROGON_HOME`), `tests/e2e/watch-live.e2e.ts` (markers and hold moved to observe in stand-in and paid cells; `launchEnvFor` passes the tier's `AKROGON_HOME`; the paid shell-shape cell adds, before its shell-branch return, a paused due with a dispatchable leaf on disk and an empty-then-staged step (A,C); every stand-in or paid assertion that must still prove a dispatch stages a fresh unseated leaf first, since earlier passes can fail the idle-seat leaf and `akrogon unpause` dispatches on its own (A,B,C)), `tests/e2e/watch-tier.ts` `observeReady` (also requires line 2 `paused=false` before any launch).
- Docs: `docs/use/watch-while-away.md` (What each check does, image alt text), `docs/pictures/watch-loop.svg` ("read status" node), `skills/AREA.md` (observe line), `tests/AREA.md` if a fixture description turns false.

Consumers of changed state:
- Old skill text on a new release (`src/release.ts` `flip`): it runs `akrogon status` first and stops when paused, then reads observe; an extra `paused=false` line 2 is not a `slug=` or `unreadable=` row. Line 1 and row formats stay byte-identical.
- `tests/e2e/watch-consults-body.ts` and `tests/e2e/watch-stop.e2e.ts` call `observeReady`, which uses the tier's `AKROGON_HOME`. watch-consults-body already passes `AKROGON_HOME` to its pi watcher; watch-stop launches no watcher (A,B).
- `skills/watch-issues/consultant-brief.md` carries leaf rows verbatim; row format unchanged, no edit.

Open for the plan: the observe-only check marker. Preferred: an `OBSERVE_AKROGON` recorder that logs `call observe t=<turn>` and honors a `hold-observe` flag, so `tick.ts`'s own `akrogon config` call (through `WATCH_AKROGON`/PATH) is never counted or held. The no-prompt preflight does not show whether pi passes `OBSERVE_AKROGON` into its tool subprocesses (A,B). The precedent is watch-consults-body, whose pi watcher's `consults.ts` reads `AKROGON_HOME` from the watcher env. If the paid run shows the variable stripped, the plan replaces the means (for example a parent-cmdline check in the recorded `akrogon` wrapper) under the locked-decisions means rule; the marker never counts tick.ts's call. Codex's `timeout 30s` wrapping in `logbin` keeps its early flag removal and TERM trap when the hold moves to observe.

Criterion 2's no-read claim is shown by comparing the hcCore shim log of the paused run with an empty-inventory run (both session discovery only), and by the reviewing seat reading that the paused return precedes `repoInventory`, since a log cannot see filesystem reads (A,C).

Open for the plan: in the paid cell, the dispatchable leaf at the paused due must not have been failed by earlier dispatch (`fake --model idle` silent stops); a fresh unseated `plan.synthesis` leaf staged right before the pause is one way. The later `next` is attributed to the watcher's turn, since `akrogon unpause` runs its own `unpausePass`.

Exclusions:
- Making `next` honor pause for manual calls: changes manual behavior pinned by tests/pause-next.test.ts (Off route).
- Other watch reading habits: signposts S3a (Off route).
- `src/status.ts` and every non-watch use of `akrogon status` stay unchanged.
