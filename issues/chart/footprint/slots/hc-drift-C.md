# Slot C — Following `hc` Updates (`footprint`)

## 1. How `hc` updates today and what it promises

- **Update mechanism:** `~/.local/bin/hc -> herdr-core` has **no** systemd auto-update timer. It updates on demand via `hc update [--version X|--from <file>]` (operator or `herdr-app`). `hc update --help` enforces two invariants:
  - `--version X` is a floor (*"at least this release"*); downgrades require `--force` because **"saved state only moves forward"**.
  - Crossing a **protocol generation** also requires `--force`.
- **Cadence & history:** ~1–2 `0.1.x` releases per week (`0.1.17 -> 0.1.18` by Nov 8, `0.1.22` by Nov 23). Every break of `tests/fixtures/hc-schema.json` in `akrogon` history was an additive, optional change:
  - `47186f90` (Nov 8, `0.1.18`): added `Terminal.first_message`.
  - `0c677ab5` (Nov 23, `0.1.22`): added optional `events.subscribe.docs`.
- **Compatibility promise:** `hc schema` (`info.description` + `hello` method) declares **Protocol generation 1** with stable error `data.kind` (`unsupported_generation` on mismatch). Within generation 1, `hc` treats new fields/optional params as backwards-compatible additions.

## 2. Where `akrogon` depends on `hc`'s shape at runtime

`src/hc.ts` is the sole `hc` boundary, and **every Zod parser in it uses non-strict `z.object(...)`** (strips unknown keys; never breaks on additive fields):
- `statusSchema` (`src/hc.ts:13-17`), `foregroundSchema` (`:19`), `terminalSchema` (`:21-35` — `state: z.enum(['live', 'finished'])`, most other fields `.nullable().default(...)`), `hcErrorSchema` (`:60`), `rpcReplySchema` (`:116-121`), `docSchema` (`:173-193`, actually `herdr-app`'s doc), `terminals` (`:285`), `run` (`:308-309`), `sendSchema` (`:326`), `lineSchema`/`heartbeatSchema` (`:364-386`), and `merged` (`:434-453`, unknown event `type` falls through to `default: return t`).
- CLI/RPC surface called: `connect` (`doc.get`, `terminal.list`), `get --json`, `read`, `run --bg --json` (`--no-parent`/`--parent`/`--outlive-parent`/`--no-notify`/`--name`/`--cwd`/`--label`), `send --json [--if idle]`, `keys`, `label`, `kill`, `rm`, `events --json`.

**What actually breaks `akrogon` in production on an `hc` change:**
1. A removed/renamed field, changed type, or changed `state` enum value that `src/hc.ts` parses → `ZodError` at runtime.
2. A removed/renamed CLI flag or RPC method/param → `HcError` at runtime.
3. A **new event line shape without `terminal` and with `type !== 'doc'`** on `hc events --json` → `lineSchema.parse` at `src/hc.ts:364-406` throws `ZodError` (note: the pinned `hc-schema.json` does **not** cover `hc events` output variants anyway!).

## 3. What the pinned schema test buys vs costs

- **Buys:** almost nothing beyond what `akrogon`'s **existing real-core behavioral tests** (`tests/hc-*.test.ts` running against a throwaway core started from the installed `hc` binary) already catch on every run. Its only extra reach is catching a type/removal change in an unexercised field (e.g. `Terminal.signal`), or `DocSetResult` (which `src/hc.ts` never even calls).
- **Costs:**
  - **100% false positives so far** (2/2 breaks were additive optional changes), because `expect(pinnedSchema(reply.stdout)).toEqual(pinned)` (`tests/hc-identity.test.ts:202`) asserts exact JSON equality including new optional params, properties, defaults, and prose descriptions.
  - **Maximum blast radius:** upgrading an independent host tool immediately turns `main` and every open leaf red in `akrogon verify`, blocking all merges until someone commits a fixture re-pin.
- **Why O3 (akrogon installs/pins `hc`) is the wrong direction:** `hc` is a **machine-wide shared runtime** (used by `herdr-app`, the operator's tabs, `herdr-setup`, and every repo), and `hc`'s own saved state **only moves forward** (`hc update --help`). Making `akrogon` own/pin `hc`'s version tangles two independent apps, conflicts with `herdr-app` updates, and breaks rollback (`hc` won't downgrade without `--force`). We don't pin `git`, `bun`, or `herdr-app` inside `akrogon` either.
- **Why O2 (subset check on `hc schema`) is second-best:** walking `hc schema`'s JSON Schema AST still couples tests to Rust `schemars`/OpenRPC encoding choices (e.g. `type: ["string", "null"]` vs `anyOf`) and duplicates the field list already encoded in `src/hc.ts`'s Zod schemas — while still missing behavioral/CLI-flag/event-stream drift.

## 4. Recommendation: delete the schema pin test (rely on runtime Zod parsers + real-core tests)

- **Change:** Delete `tests/fixtures/hc-schema.json`, `pinnedSchema` (`tests/hc-fixture.ts:489-503`), and the pin test (`tests/hc-identity.test.ts:195-207`). Keep `src/hc.ts`'s non-strict Zod parsers and the existing real-core behavioral tests (`tests/hc-*.test.ts`) as the contract guard.
- **Why this is the simplest defensible choice:**
  - Zero tangling: `hc` upgrades natively via `hc update` on its own cadence; `akrogon` stays green across all additive generation-1 updates with zero fixture maintenance.
  - Every actual breaking change in the CLI flags, RPC calls, or fields `akrogon` uses already fails the real-core test suite immediately and throws loudly (`ZodError`/`HcError`) at runtime.
  - Matches how `akrogon` already treats `git`, `bun`, and `herdr-app` (and how `herdr-setup` handles updates via its operator-run `herdr-update-check`).
- **What it could miss later (and small optional hardening):**
  1. A breaking type change in a rarely-exercised optional field (`Terminal.signal`, `exit_code`, `keep`) wouldn't fail until a test or live run hits it — acceptable risk, or cover any critical field directly in a behavioral test.
  2. A new protocol generation jump on an unused path: if desired, a 5-line check against `hc schema`'s `info.description` / `hello` generation (never a full schema snapshot) guards generation 1 with zero additive churn.
  3. Unrelated to the pin test, `lineSchema` (`src/hc.ts:364-383`) is the one real additive-drift hazard in `src/hc.ts` if `hc` ever emits a new non-`terminal`, non-`doc` event on an unfiltered `follow()` (like `waitForDoc` at `:517`); letting `follow()` ignore unknown event shapes (or subscribing with `--doc herdr-app` once ready) hardens that at the actual runtime boundary.
