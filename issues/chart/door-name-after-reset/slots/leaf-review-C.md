# Leaf review, slot C

Read: the four drafts, name-restore.md Taken, standing-design.md, shapes.md headings only (the "Leaf files" body did not print and I did not re-read it, so shape conformance is unchecked). Code already held: door-reset.ts, src/hc.ts, src/transcript.ts, tests/door-reset.test.ts, tests/door-agent.ts. Read now: the document helpers in tests/hc-fixture.ts, tests/fixtures/herdr-app-doc.json. Grepped the repo for other readers of the stage names: none outside the helper, its test and handover.md.

Four disagreements. The rest carries the Taken decisions correctly.

## D1. A thrown send must not be a skip that continues

Design Q3 lists "the name read or send failed" as a `skipped` reason, and a skip types the reset next. A send that throws leaves A's input box in an unknown state.

- Evidence: `hc()` in src/hc.ts kills every call at `HC_DEADLINE_MS = 60_000`. A's map notes `hc send` waits up to 60 s for an operator's unfinished draft. A send killed at the deadline may or may not have pasted `/rename <name>`.
- If it pasted without enter, the `/clear` keys append to it. Claude then runs `/rename <name>/clear`, no reset happens, and the start prompt lands in the old session.
- This is the same case Q3 already excepts for the open rename turn: "typing a reset into an open turn is the glue case".
- Change: a failed name read (transcript, document) stays `skipped` and continues. A thrown send logs the stop and exits non-zero, like the bound. Criterion 3 and criterion 6 then list read failure only.

## D2. The failure branch has no criterion, so it cannot have a test

Taken 3a binds "only failures of the name stage are caught, by their own types". Criterion 3 names four skip reasons and leaves out the read or send failure. Standing design allows a test only as proof of a done-criterion.

- As written, the implementer writes a catch that no test may cover.
- Change: add the read failure to criterion 3 with a provokable case, or state in the design that this branch ships unproven and why. One provokable case: the test core started with `doc: false` (tests/hc-fixture.ts `hcCore` option), so `docGet` finds no document.
- Check first what the helper does today with no document: `repoSpace` returns `no running session holds it` and the helper stops at `started`. If so, the document read cannot fail separately in a test, and the unproven statement is the honest option.

## D3. Criterion 1's "new transcript carries that same name" is proven only by the fixture the leaf writes

In the `kept` case the helper sends nothing. The carry in the test is the stand-in copying the title on `/clear`, which is code this leaf adds. That test cannot fail for a product reason, which the standing design calls a vanity test.

- What the leaf can prove for criterion 1: no rename input received, the log says `kept` with the last name, the reset and start prompt arrive as today.
- The carry itself is claude's behavior. readiness.yaml has no proof for it: proof 2 covers a name set by the helper's `/rename` on an unnamed session. The matching evidence exists (A's P1, INTAKE F2 with about ten real handovers) but is not listed.
- Change: reword criterion 1 to the three provable parts, and add P1 or F2 as a readiness proof for the carry of an operator-given name.
- Criterion 2's transcript check is different and should stay: it proves the exact text the helper sent.

## D4. The named tab must be built inside the test, and the design should say so

The "open for the plan" line asks whether tests/hc-fixture.ts places A in a named tab as it is. It does not.

- Evidence: tests/fixtures/herdr-app-doc.json gives the repo space `"tabs": []`. `adopt()` only creates tabs with `name: ''` and only for terminals labelled `akrogon=1` with `herdr.space` and `herdr.tab`. `startA` sets none of those labels.
- tests/hc-fixture.ts is not an owned surface. The test can still do it within ownership: `core.rpc('doc.get')` then `core.rpc('doc.set')` with a named tab whose root lists A's address. `HcCore.rpc` is exported.
- Change: replace the open question with that route, so the plan does not reach for hc-fixture.ts. The blank-name case of criterion 3 uses the same route with `name: ''`.

## Not a disagreement, one line for the plan

An empty `customTitle` string is not covered by Q1. The plan should say whether it counts as no name.
