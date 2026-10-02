# Brief 1: shapes.md readiness contract

## 1. Goal

Implement plan decisions D1, D2, D3 for `skills/chart-issues/assets/shapes.md`: give the door a `readiness.yaml` example that parses against the real `readinessSchema`, list the file in the handoff tree, and state the write-order and `akrogon status` rules.

## 2. Acceptance criteria

1. `shapes.md` has a `readiness.yaml` heading inside `## Leaf files` (placed after the Design block and its prose, before the `state.yaml` ` ```yaml ` block) whose fenced ` ```yaml ` example parses with `readinessSchema` from `src/readiness.ts`.
2. The example has at least one entry in each top-level array: `inputs` (one `kind: env` and one `kind: file`), `produces` (with `save.entry|revision|args|value_source`), `grants` (with one nested `fixtures` entry), `retained`, `proofs`. Placeholder names only, never real values.
3. Both leaf listings in `## Handoff tree` show `readiness.yaml` alongside `brief.md`, `design.md`, `state.yaml`.
4. `## Preflight and validation` states `readiness.yaml` is written with `brief.md` and `design.md` before `state.yaml`, and that `akrogon status` must parse it.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` — the file you are editing; `## Leaf files` starts ~line 120, `## Preflight and validation` ~line 160.
- `src/readiness.ts` — authoritative schema field names.
- `tests/readiness.test.ts` — the `complete` object is a schema-valid example; model placeholder text on it.
- `tests/helpers.ts`, `skills/implement-issue/ponytail.md` (at `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`).

## 4. Change list and interfaces

Owned: `skills/chart-issues/assets/shapes.md` only. Nothing must land first; a later unit's test extracts your ` ```yaml ` block, so keep exactly one ` ```yaml ` fence in the `readiness.yaml` section and keep the `state.yaml` sample's own ` ```yaml ` fence distinct (the test reads the block after the `readiness.yaml` label).

Schema (strict objects, every field `trim().min(1)` text unless noted):

```ts
inputs[]:    kind: 'env'|'file', name, holder, purpose, consumers[] (min 1), steps, source, done
produces[]:  name, holder, consumers[], save{entry, revision, args[], value_source}
grants[]:    approved{by,date,answer}, principal, account, credential{name,holder},
             targets[], fixtures[]: {account, purpose, marker, naming, count (int > 0),
               cleanup[]: {step, identity} (min 1), absence_check},
             operations[] (min 1), effects, bounds, stop_line, expires? (optional)
retained[]:  resources[] (min 1), purpose, owner, remove_by, cost, exposure,
             cleanup{identity, route}, reason
proofs[]:    operation, command, identity, target, version, date, result, cleanup,
             limits, record   // record = chart fork path holding the full proof
```

Concrete edits:

- `## Handoff tree`: add `      readiness.yaml` under both leaf file listings (same indent style as the neighbors).
- `## Leaf files`: after the "Each design is self-contained..." paragraph and before the ` ```yaml ` state.yaml block, add a `readiness.yaml` heading with one line saying the door writes it per leaf (`<leaf>/readiness.yaml`, every section the leaf needs; omit empty arrays is allowed — pick one consistent phrasing) followed by the fenced example. Write it before the existing `Replace sample values...` paragraph's ` ```yaml ` block? No — the state.yaml block keeps its position; the readiness example goes before it.
- The example uses `holder: repo` (matching the `repo: registered-key` convention), names like `EXAMPLE_API_TOKEN`/`ca-chain.pem`, `consumers: [dependent-leaf-slug]`, `record: issues/chart/<chart>/forks/<fork>.md`.
- `## Preflight and validation`, final paragraph: change `Write brief.md and design.md before state.yaml` to include `readiness.yaml` with brief and design, and extend the `akrogon status` sentence so it states the command parses each leaf's `readiness.yaml` and a contract that does not parse fails validation.

## 5. Do-not, reasons and exceptions

- Do not edit `src/readiness.ts`, tests, SKILL.md, or any other file — other units own them.
- Do not invent schema fields or add a top-level `fixtures` array — `grants[].fixtures[]` is nested; `readinessSchema` is strict and will reject extras.
- Do not put real-looking secrets or real hostnames in the example — placeholder names only.
- Do not restructure existing prose beyond the listed edits — minimal diff keeps the file's style.
- If the schema or file shape makes an acceptance criterion impossible, return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. Read `src/readiness.ts` and `tests/readiness.test.ts` `complete` fixture; draft the YAML example.
2. Verify the draft parses before editing: `bun -e 'import {readinessSchema} from "./src/readiness.ts"; import {readFileSync} from "node:fs"; readinessSchema.parse(Bun.YAML.parse(readFileSync("<scratch>.yaml","utf8"))); console.log("ok")'` writing the draft to a file under `$TMPDIR`.
3. Apply the three edits (tree, leaf-files example, preflight sentences).
4. Extract the block and re-parse it to prove criterion 1: `bun -e` reading `shapes.md`, slicing the ` ```yaml ` block after the `readiness.yaml` heading, `readinessSchema.parse`, print `ok`.
5. Run the changed-test command from section 7.

Advisory size: 1 file, under ~8 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`

with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408` exported. (Doc-only diff: the runner may report no changed tests; that result is fine. The parse probes in step 6 are the real evidence.)

## 8. Done-when, evidence and report

- The three edits land, the extracted ` ```yaml ` block parses `readinessSchema`, and the probe output is pasted.
- Commit your chunk on the worktree (`git add` the file, one commit, conventional message like `docs: add readiness.yaml example to chart handoff shapes`), report the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
