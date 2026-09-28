# Brief-2: walkthrough evidence (owner-defect-stop unit 2 of 2)

## 1. Goal

Produce the plan D7 walkthrough: real observer output from fixture repos judged against the edited `skills/watch-issues/SKILL.md` rules, saved to one file under the OS temp dir. Prerequisite: unit 1 (SKILL.md edits) landed; this worktree starts at the lane head including that commit.

## 2. Numbered acceptance criteria

- B2.1: Three fixture cases built under OS temp dir, each run with `OBSERVE_AKROGON` and `OBSERVE_HERDR` stub binaries per `skills/watch-issues/scripts/observe.test.ts:32-38`: (a) owner-defect failure with blocked dependent, (b) same plus independent runnable leaf, (c) credential failure with blocked dependent.
- B2.2: Each case run twice: original `failure.delivery` shown and unshown (6 runs total); every run uses real `bun skills/watch-issues/scripts/observe.ts <root>` output pasted verbatim.
- B2.3: Each run judged against the edited rules with per-leaf action (notice/waiting/recover/stop) showing: one notice per newly recognized failure, no stop while independent work runs, no fix-leaf instruction for the credential case. (Plan C4, C5.)
- B2.4: One artifact file under OS temp dir holds all observer output plus decided actions; path recorded in the return report.

## 3. Read-first list

- `skills/watch-issues/SKILL.md` Judge and Stop as edited by unit 1 (the rules to judge against)
- `skills/watch-issues/scripts/observe.test.ts` lines 1-80 (stub + fixture pattern to copy)
- `skills/watch-issues/scripts/observe.ts` (invocation: `bun <path> <root>`; read-only, never edited)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (reuse the test-file stub pattern verbatim; no new helpers)
- Existing pattern to copy: `akrogonOk`/`herdrOk` stubs and `writeLeaf`+`baseState` fixtures in `observe.test.ts`.

Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- Owns: no repo paths; artifact lives under OS temp dir only (e.g. `$TMPDIR/owner-defect-stop-<stamp>.md`). Prerequisite chunk: unit 1 SKILL.md edits (already on lane head). No commit expected from this unit unless fixing a typo in its own artifact path handling; report carries the evidence.
- Fixture shape per leaf: `issues/open/<owner>/<slug>/state.yaml` with `slug`, `phase`, `repo`, `debate: no`, `blocked-by`, plus `failure: {cause, phase, slot, reason, delivery}` for failed leaves. Owner-defect reason must name a defect in another leaf's merged work and name the owner slug (e.g. `blocked: defect in merged leaf export-csv ... owning leaf export-csv must be fixed first`); owner leaf present with `phase: merged`. Credential reason names a credential with no defect/owner language.
- Observer line fields consumed: `slug= phase= blocked= A= B= notified= failed=<cause>@<phase> delivery=<value|-> reason="<reason>"`.
- Stub binaries: executable files printing `repo: <name>` (akrogon) and `{"result":{"agents":[]}}` (herdr) to stdout, per `observe.test.ts`.

## 5. Do-not, reasons and exceptions

- Do not edit any repo file including SKILL.md: this unit only reads the landed rules and judges output. Exception: revised brief from B.
- Do not invent observer output: every judged line comes from a real `observe.ts` run with stubs. Exception: none; a failing run is reported with stderr, not hand-written.
- Do not add persistent state or new scripts to the repo: the artifact is one temp-dir file. Exception: revised brief from B.
- Do not change scope or an interface on mismatch: return a mismatch naming the conflicting requirement, actual code/interface, and smallest brief correction. Exception: a revised brief from B authorizing that change.

Restated: read-only on the repo and real-output-only because the walkthrough is evidence, not code; the only way past an exclusion is a revised brief from B.

## 6. Ordered steps

1. Read the edited SKILL.md Judge/Stop and `observe.test.ts:1-80` stub pattern (B2.1 context).
2. Build case (a) fixture: merged owner leaf, failed leaf with owner-defect reason, dependent with `blocked-by: [failed-slug]`; stubs; run observer twice (delivery shown/unshown); paste output (B2.1, B2.2).
3. Build case (b): case (a) plus independent runnable leaf at `implement` with no blocked-by; run twice; paste output (B2.1, B2.2).
4. Build case (c): credential failure with blocked dependent; run twice; paste output (B2.1, B2.2).
5. Judge all six runs against the edited rules per-leaf and for stop/no-stop; write artifact file with output plus judgments (B2.3, B2.4).
6. Run the section 7 command from the worker worktree root.

Advisory size: 0 repo files plus 1 temp artifact, under 8 turns.

## 7. Commands

`AKROGON_BASE=d5b27353fd3ecd3fb59325fb94e6547c85e6893b bun test --changed="d5b27353fd3ecd3fb59325fb94e6547c85e6893b"` run from the worker worktree root. No full suite; B runs it after landing.

## 8. Done-when, evidence and report

Done when B2.1-B2.4 hold with the artifact path and all six observer outputs either pasted or contained in the artifact at the recorded path, plus the section 7 command result.

Changed files and reasons: <paths and why, or "none: temp-dir artifact only">
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
