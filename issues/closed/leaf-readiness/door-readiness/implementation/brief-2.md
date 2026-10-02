# Brief 2: SKILL.md Take/Handoff readiness rules

## 1. Goal

Implement plan decisions D4, D5, D6 for `skills/chart-issues/SKILL.md`: replace the prose credential list with the five Taken rules in occurrence order, add the Handoff grant-confirmation and pre-write presence check, and link the Take operation-proof rule to `proofs`. Also run the criterion-4 docs sweep and record its hits.

## 2. Acceptance criteria

1. `SKILL.md` states once each, in the order they occur in the door's work:
   a. **key-sheet** — after forks settle and before the door's proof calls, the door shows one sheet listing every need across the proposed leaves: purpose, consuming leaves, exact permissions and resources, official source with date checked, destination (keys and values to the declared holder's env, files to their paths, approvals to authorization records) and what done looks like; the operator completes it at their pace, asynchronous approvals are waited for before the affected proofs; the door checks presence on each draft `readiness.yaml` (see 4b for the literal command) and runs the proofs; a failed proof yields a specific repair step; handoff stores the steps in `inputs[].steps` so `akrogon status` prints a still-missing need and `akrogon next` refuses dispatch.
   b. **key-creation** — the operator creates every missing outside-account key in one batch before handoff, from the door's list; a leaf that creates something with its own key stores that key itself, declared up front in `produces`, and dependents wait on it (`blocked-by`).
   c. **live-change-grant** — each leaf's `grants` records one scoped live-change grant during charting before the first mutating proof and confirmed at handoff review; it names approval provenance, verified principal and account with credential name and holding repo (never the value), targets by name or ID, leaf-created fixtures (account, purpose, ownership marker, naming rule, count, created IDs linked to the leaf before change or deletion), operations including transitive helpers, checks and cleanup, explicit destructive/public/billing/DNS/retention effects, repeat and recovery bounds, the stop line for what stays human, and lifetime; a different identity or account, a target outside the set, a new or different mutation, larger effects, or expiry needs new approval.
   d. **proof-fixtures** — proof fixtures are disposable by default; before creation the contract names the cleanup sequence (transitive resources, contents and config included), the identity for each step (the creating identity by default, another only when declared and proven before handoff) and the authenticated absence read-back with visibility shown first; the door proves a small create/use/delete cycle with the declared identities at charting; each pass records created IDs under the grant and runs cleanup on success and failure; leftover disposable resources are blockers recorded with IDs, error, owner and next step; a fixture stays after its proof only by agreement before creation, naming purpose, resources, an accepting owner, removal date, cost and exposure, cleanup identity and route, and why the proof needs it alive; a cleanup failure never becomes retention afterward; retention never satisfies a deletion criterion.
   e. **save-route** — a producer's contract names its save operation: entry point, inspected revision, non-secret arguments, key name, the holding repo's real file and the private value source; saving happens inside the producer process or a narrow save subprocess receiving the value privately, never returned to the agent to build a command; at charting the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints, inspects the real target's effective harness controls and records why the result transfers, and proves real revocation on a disposable provider-issued key; the operator's approval of that recorded, proven operation is the explicit permission; a control that denies the operation is reconciled at its source and re-proved; tool edits, shell redirects and dumping stay refused.
2. The prose credential list currently at SKILL.md:55 is replaced, not kept beside the new text (the sentence starting "Credentials are not such a prerequisite...").
3. Handoff: the review sentence in the first `## Handoff` paragraph gains confirming each leaf's recorded live-change grant, and a later Handoff paragraph (before the writing/`akrogon status` flow completes) states the door runs this verbatim check per draft leaf folder from the akrogon root resolved by `readlink -f $(command -v akrogon)`, printing names only, never values:

```bash
bun -e "import {readGlobal} from './src/config.ts'; import {readReadiness, gaps} from './src/readiness.ts'; console.log(JSON.stringify(gaps(readGlobal(), readReadiness('<draft folder>')!)))"
```

   and that `akrogon status` cannot see drafts without `state.yaml`, so this is the pre-handoff presence check; after valid writes `akrogon status` validates the emitted files.
4. The Take operation-proof paragraph keeps its text and gains only a clause linking the recording to the leaf's `proofs` records in `readiness.yaml`.
5. Doc sweep (evidence for criterion 4): run `grep -rn` over `docs/` and `skills/` (excluding the file you edit) for `credentials`, `keys, logins`, `handoff batch`, `variable name`, `every brief lists`, `credential list`, and read the hits; record each hit path:line and a one-line verdict (changed or out of scope + why) in your report so A can fold it into the leaf report. Expected out-of-scope hits include `docs/guide/chart.md` "Required credentials are named", `docs/guide/limits.md` operator-credentials line, `skills/AREA.md` env-file rule, seat-skill `.env` presence rules, `standing-design.md` secret-in-.env rule.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — Take ends ~line 55; Handoff follows.
- `src/readiness.ts` — field names referenced by the rules (`inputs[].steps`, `produces`, `grants[].fixtures[]`, `proofs[].record`).
- `/home/ivan/Work/infra/akrogon/issues/open/leaf-readiness/door-readiness/design.md` — the binding decisions verbatim; your sentences carry these decisions and the report maps sentence→decision.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

Owned: `skills/chart-issues/SKILL.md` only, plus the sweep evidence in your return. Nothing must land first. Suggested layout, keeping the file's one-idea-per-paragraph style and minimal diff:

- Take, paragraph 3 (operation-proof): append the `proofs` link clause.
- Take, paragraph 4 (human prerequisite + old credential list): keep the human-prerequisite sentence (through "`hand_built` cannot replace completing known prerequisites."), replace the credential-list sentence with the key-sheet and key-creation rules (a, b).
- Take, new paragraph after it: live-change-grant rule (c).
- Take, new paragraph: proof-fixtures rule (d).
- Take, new paragraph: save-route rule (e).
- Handoff paragraph 1: add grant confirmation to the review list.
- Handoff: add or extend a paragraph with the pre-write presence check (3).

Occurrence order a→e must be literal reading order. Each rule stated once — do not restate a rule's mechanics in Handoff; Handoff references the grant's confirmation and the presence check only.

## 5. Do-not, reasons and exceptions

- Do not edit `shapes.md`, `src/`, tests, `questions.md`, `standing-design.md`, seat skills or `issues/` paths — excluded by design; other units or leaves own them.
- Do not weaken or drop the operation-proof paragraph or the human-prerequisite sentence — design says the former keeps its text and gains only the `proofs` link.
- Do not add commands, flags or scripts beyond the verbatim `bun -e` line — key-sheet Taken foreclosed a separate instructions command.
- Do not paste secret values or invent credential names — the example names stay placeholders.
- Do not keep the old credential-list wording anywhere in the file — criterion 3 requires replacement, not coexistence.
- If the required text cannot fit the file's style or a criterion is unreachable, return a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. Read SKILL.md fully; locate the operation-proof paragraph, the credential-list sentence, Handoff paragraph 1, and the write-order/`akrogon status` prose in Handoff.
2. Apply edits in order: `proofs` link → credential replacement (a, b) → grant (c) → fixtures (d) → save-route (e) → Handoff grant confirmation → Handoff presence check.
3. Self-check: `grep -n 'keys, logins\|handoff batch' skills/chart-issues/SKILL.md` returns nothing; read the Take section top to bottom and confirm a→e order with no restated mechanics.
4. Run the criterion-4 sweep from criterion 5 and record hits with verdicts.
5. Run the changed-test command from section 7.

Advisory size: 1 file plus sweep greps, under ~12 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`

with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408` exported. (Doc-only diff: no changed tests is a fine result; the greps in steps 3–4 are the evidence.)

## 8. Done-when, evidence and report

- Edits land, ordering self-check clean, sweep results recorded with verdicts.
- Commit your chunk (`git add` the file, one commit, conventional message like `docs: replace credential list with readiness contract rules in chart-issues`), report the commit ID.
- Report must map each new/changed sentence to its binding decision name (key-sheet, key-creation, live-change-grant, proof-fixtures, save-route) so A can satisfy criterion 4.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
