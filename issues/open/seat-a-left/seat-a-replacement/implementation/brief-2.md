# Brief-2: allocate repair in prod code (U2)

## 1. Goal

Repair `allocate` in `src/next.ts` so a missing seat A beside a surviving seat B is split from B, recorded at once, swapped left of B, and the operator tab focus is restored. Plan decisions D1-D6, D8, D9.

## 2. Numbered acceptance criteria

1. Repair runs only when recorded A is absent, recorded B survives in the leaf tab, and not on bootstrap; every other path runs byte-identical behavior with no swap and no focus call.
2. Repair sequence is exactly: fresh `tab list` for prev focus, split B right with existing `placement` flags, intermediate `saveState` with the new A ID, one swap call, conditional `tab focus`, then the existing final save.
3. Swap is one call `['pane','swap','--source-pane',B,'--target-pane',newA]` with no retry helper and no second attempt (D4).
4. `tab focus <prev>` runs once when prev exists and differs from the leaf tab, on both swap success and swap failure; skipped when prev is the leaf tab; swap error still throws after a restore attempt with only a warning on restore failure; restore failure after a passed swap is reported.
5. Swap failure throws an error naming the slug plus herdr code and message, with no retry and no close; the recorded A ID stays so the next pass starts no second A.
6. Prod code never calls `pane layout`.

## 3. Read-first list

- `src/next.ts` ~337-438 (`allocate`; copy the existing `herdr([...], schema)` plus `saveState` pattern)
- `src/shell.ts` (`herdr`, `tabs`, `tabSchema`, `command` vs retry helper)
- `tests/fake-herdr.ts` read-only for wire shapes (U1 lands in parallel; this brief's section 4 shapes are binding on conflict)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owns: `src/next.ts`, `src/shell.ts` only.
- Needs first: none. Wave 1 with U1. Shared test resource: none. Consumes no worker output.
- Wire contract (binding, shared with U1): prev focus from `herdr(['tab','list'], z.object({tabs: z.array(tabSchema.extend({focused: z.boolean().optional(), workspace_id: z.string().optional()}))}))` picking `focused`; swap result `z.object({changed: z.boolean()}).passthrough()`; focus result `z.object({}).passthrough()`. Keep `tabSchema` itself backward compatible: add `focused` and `workspace_id` as optional fields only.
- In `allocate`, keep the `first`/`second` structure; compute a `repairA: boolean = !bootstrap && recordedA === undefined && recordedB !== undefined`; only that branch does the fresh tab list, intermediate save, swap, and conditional focus. Build the swap error as `new Error(\`...${slug}...${code}...${message}\`)` from the caught `CommandError` via `herdrError`, never `retryCommand`.

## 5. Do-not, reasons and exceptions

- Do not touch `tests/*`: U1 and U3 own them; parallel edits would conflict on cherry-pick. Exception: none.
- Do not use the retry helper or retry/close on swap failure: D4/D6 forbid it and a retry could reverse a lost-ack swap. Exception: none.
- Do not normalize other paths (bootstrap, B-only, present, reversed, extra panes): D1 locks them unchanged. Exception: none.
- Do not call `pane layout` from prod: it is a test-only assertion surface (D8). Exception: none.
- On any conflict with this brief or the wire contract, return a mismatch with evidence instead of changing scope or the interface. Exception: a revised brief from A authorizing that change.
- Restated: stay in two files, single swap attempt, locked paths untouched, no layout call, mismatch over scope change.

## 6. Ordered steps

1. Read `src/next.ts` allocate and `src/shell.ts` for criteria 1-6.
2. Extend `src/shell.ts` schemas per section 4 for criterion 4 (loose parse, optional fields).
3. Add the `repairA` branch with split, intermediate save, single swap, conditional focus, and error per criteria 1-5.
4. Verify by read that all other branches are untouched and no `pane layout` string exists under `src/` for criteria 1, 6.
5. Run `bun run typecheck` then the section 7 command for criteria 1-5.
6. Commit only `src/next.ts` and `src/shell.ts` with no `Test-Change:` trailer (no test file touched).

Advisory size: 2 files, under 10 turns.

## 7. Commands

Run only this, with the supplied base value (install deps first with `bun install` in this worktree if needed):

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
bun test --changed="$AKROGON_BASE" --timeout=30000
```

`bun run typecheck` in step 5 is the one extra allowed targeted check.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold, typecheck and the section 7 command pass, and the commit is limited to the two owned files. Paste command results. Link each criterion to its code lines. Name limits and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
