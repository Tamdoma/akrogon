# Brief 1: readiness schema, holder resolution and gap computation (U1)

## 1. Goal

Create `src/readiness.ts` owning the readiness contract schema and gap computation, plus `tests/readiness.test.ts`, plus one key-file line in `src/AREA.md`. Plan decisions D1–D6.

## 2. Acceptance criteria

1. `readinessSchema` accepts a complete example holding every section (`inputs`, `produces`, `grants`, `retained`, `proofs` all non-empty), and refuses: an unknown top-level key, a whitespace-only text field, a fixture without a cleanup step, a retained record without `exposure`, an unknown `kind`.
2. `holderRoot` returns the registered root for a repo key and the directory for an absolute path; it throws an error naming the holder for an unregistered key and for a relative path.
3. `readReadiness` returns `null` when `readiness.yaml` is absent; returns the parsed `Readiness` when valid; throws an `Error` whose message includes the file path when the YAML is malformed or fails the schema.
4. `gaps` reports an `env` input missing when the holder's `.env` is absent, when the name is absent, or when the value is empty or whitespace-only; reports a `file` input missing when `<holder root>/<name>` is absent or zero bytes; a present non-empty value or non-empty file produces no gap; `produces`/`grants`/`retained`/`proofs` never produce gaps.

## 3. Read-first list

- `src/config.ts` — `GlobalConfig` type, `expandPath`, `globalHome`, `readRepo` (`root` is `realpathSync(expandPath(path, globalHome()))`).
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`.
- `tests/state.test.ts` or any existing unit-style test for import/test style; `tests/config.test.ts` shows config-level tests.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — read before editing.
- zod 4 is installed (`zod@^4.1.5`); repo style uses `z.strictObject`, `z.enum`, `.trim().min(1)` for non-blank text.

## 4. Change list and needed interfaces

Owns: `src/readiness.ts` (new), `tests/readiness.test.ts` (new), `src/AREA.md` (one Key-files line).

Implement exactly:

```ts
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { z } from 'zod';
import { expandPath, globalHome, type GlobalConfig } from './config';

const text = z.string().trim().min(1);
export const inputSchema = z.strictObject({
  kind: z.enum(['env', 'file']),
  name: text,
  holder: text,
  purpose: text,
  consumers: z.array(text).min(1),
  steps: text,
  source: text,
  done: text,
});
export const produceSchema = z.strictObject({
  name: text, holder: text, consumers: z.array(text),
  save: z.strictObject({ entry: text, revision: text, args: z.array(text), value_source: text }),
});
export const fixtureSchema = z.strictObject({
  account: text, purpose: text, marker: text, naming: text, count: z.number().int().positive(),
  cleanup: z.array(z.strictObject({ step: text, identity: text })).min(1),
  absence_check: text,
});
export const grantSchema = z.strictObject({
  approved: z.strictObject({ by: text, date: text, answer: text }),
  principal: text, account: text,
  credential: z.strictObject({ name: text, holder: text }),
  targets: z.array(text), fixtures: z.array(fixtureSchema), operations: z.array(text).min(1),
  effects: text, bounds: text, stop_line: text, expires: text.optional(),
});
export const retainedSchema = z.strictObject({
  resources: z.array(text).min(1), purpose: text, owner: text, remove_by: text, cost: text, exposure: text,
  cleanup: z.strictObject({ identity: text, route: text }), reason: text,
});
export const proofSchema = z.strictObject({
  operation: text, command: text, identity: text, target: text, version: text, date: text,
  result: text, cleanup: text, limits: text, record: text,
});
export const readinessSchema = z.strictObject({
  inputs: z.array(inputSchema), produces: z.array(produceSchema), grants: z.array(grantSchema),
  retained: z.array(retainedSchema), proofs: z.array(proofSchema),
});
export type Readiness = z.infer<typeof readinessSchema>;
export type Gap = { kind: 'env' | 'file'; name: string; holder: string; steps: string };
export function readReadiness(leafPath: string): Readiness | null;
export function holderRoot(global: GlobalConfig, holder: string): string;
export function gaps(global: GlobalConfig, readiness: Readiness): Gap[];
```

- `holderRoot`: `holder` in `global.repos` → `realpathSync(expandPath(global.repos[holder], globalHome()))`; else `isAbsolute(holder)` → `holder`; else `throw new Error` naming the holder.
- `readReadiness`: `readFileSync(resolve(leafPath, 'readiness.yaml'), 'utf8')`, `Bun.YAML.parse`, `readinessSchema.parse`. Wrap the read+parse in a `try` that rethrows `new Error(\`<path>: <cause>\`)`; return `null` only when `existsSync` says the file is absent (or catch only ENOENT).
- `gaps`: for `kind === 'env'`: read `resolve(holderRoot(...), '.env')`; missing file → gap; else `parseEnv`; name absent or `value.trim() === ''` → gap. For `kind === 'file'`: `statSync(resolve(holderRoot(...), name), {throwIfNoEntry: false})`; `undefined` or `size === 0` → gap. Gap = `{kind, name, holder, steps}` from the input. Parsed env contents must not appear in any return value or error.

`env` parse verified on bun 1.4.2: `parseEnv('A=1\nB=\n# c\nexport D="x y"\nE="  "')` → `{A:"1",B:"",D:"x y",E:"  "}`.

## 5. Do-not, reasons and exceptions

- Do not add fields, sections or optional behavior beyond the schema above — field names are binding for sibling leaves door-readiness and seat-input-rules; exception: a revised brief from A.
- Do not touch `src/next.ts`, `src/status.ts` or any other file — owned by later units; exception: revised brief.
- Do not print, return or include env values anywhere — secrets never leave `gaps`; no exception.
- Do not write tests against `akrogon` CLI commands — command coverage is other units' scope; unit-test the exported functions directly with `fixture()` temp repos; exception: revised brief.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons restated: schema names are a sibling-leaf contract; env values are secrets; ownership bounds prevent worker conflicts. Exceptions: only a revised brief from A.

## 6. Ordered steps

1. Write `tests/readiness.test.ts` first (criteria 1–4): use `fixture()` for a temp registered repo (its `home` is `AKROGON_HOME`, so build a minimal `GlobalConfig` object literally in the test — `{...globalSchema fields}` or read via `readGlobal` is fine only inside a `cli` subprocess; in-process tests construct `GlobalConfig` objects directly, e.g. `{ max_active: 3, slots: {...}, harnesses: {...}, repos: { repo: f.root }, toolkits: {} }`). Write `.env` files with `writeFileSync` under `f.root` or a `mkdtemp` unregistered dir.
2. Write `src/readiness.ts` to turn the tests green.
3. Add the `src/AREA.md` Key-files line: `src/readiness.ts` owns the readiness contract schema and gap computation (one line, keep file under 40 lines).
4. Run the changed-tests command, paste output.

Advisory size: ~3 files, under 14 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/readiness-contract-u1
AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed="$AKROGON_BASE" --timeout=30000
```

If that runner misbehaves for a new file, fall back to `bun test tests/readiness.test.ts --timeout=30000` and record both outputs.

## 8. Done-when, evidence and report

All four acceptance criteria proven by the new tests, pasted command output, commit ID of your work returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
