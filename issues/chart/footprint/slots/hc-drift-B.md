# hc drift B: footprint

Code read on akrogon main at 33c11984. hc 0.1.22. (H) marks what I checked on this host on 2026-11-23.

## Short answer

- Pick: delete the pinned test and its fixture. This is O2 without new code, because the parsers akrogon already runs are the comparison.
- The pin has changed twice since it was written. Both times hc added an optional thing akrogon does not use. It has caught no real break.
- The pin cannot protect production. hc changes on the host the moment someone runs `hc update`. The suite runs later, when a leaf lands.
- O3 makes akrogon the owner of a tool it only calls. The sister repo already decided against that.

## 1. How hc updates and what it promises

- F1. Updates are explicit. `hc update` downloads the latest release and restarts the core. `--version X` means "at least X". `--from <file>` takes a build (`hc update --help`).
- F2. There is no auto-update. "Startup never downloads updates" (`hc --skill`:301). herdr-app runs the update as part of its own update (:300).
- F3. Cadence: 0.1.18 on 11-06, 0.1.22 on 11-23. About one release every four days.
- F4. Promise: the schema header says "Protocol generation 1. Errors carry a stable `data.kind`." `hc update` refuses "a release of another protocol generation" without `--force`. So hc itself guards the breaking step. Inside a generation nothing is written down about additions. Both changes seen were additive and optional.
- F5. hc is one binary for the whole host. herdr-app, herdr-setup, the operator's terminals and akrogon's seats all sit on the same core.

## 2. Where akrogon depends on hc's shape

- F6. Every hc reply goes through a zod schema in `src/hc.ts`. All are plain `z.object`, none strict (src/hc.ts:13-35, :111-114, :173-182, :326, :358-378). Added fields are dropped. Added event types fall through (`default: return t`, :445).
- F7. What breaks akrogon in production:
  - a field it reads is removed, renamed or changes type. The parse throws at the first hc call and names the field.
  - a third terminal state. `state` is `z.enum(['live', 'finished'])` (src/hc.ts:24).
  - a new kind of line on the event stream that is not `terminals`, `event` or `heartbeat`, or an event without `terminal` that is not `doc` (src/hc.ts:358-378, :400).
  - a changed CLI flag or method parameter on `get`, `send`, `events`, `terminal.list`, `doc.get`.
- F8. The pin does not see the second case. The schema describes `state` as a plain string.
- F9. The pin fails on things that cannot break akrogon. It compares whole JSON schema blocks with `toEqual`, so a new optional field, a new optional parameter or a reworded `description` all fail it (tests/hc-fixture.ts:489-503).

## 3. What the pinned test buys and costs

- Buys: notice that hc changed one of 6 components or 4 methods. Not notice that akrogon broke.
- Costs: every run on every leaf and on main goes red after an hc update, until a re-pin commit lands. Today that was one red merge run and 13 minutes (07:42 to 07:55).
  - The fixture's history is three commits: created 11-07, `first_message` added 11-08, `docs` added 11-23. Two re-pins, zero real breaks.
  - The fixture records one host's hc build in the repo. A second PC on another hc version fails the suite with no code change.
- The suite already tests against the installed hc. 22 of 88 test files start a real core (98 `hcCore(` calls) and push its replies through the production schemas (H). A removed or retyped field fails those tests, and should.
- So drift that matters is already detected in two places: the parsers at runtime, and the real-core tests in the suite. The pin adds only the drift that does not matter.

## 4. Pick

Delete the test at tests/hc-identity.test.ts:193-207, `pinnedSchema` at tests/hc-fixture.ts:489-503 and `tests/fixtures/hc-schema.json`. Nothing else refers to them (H).

Against the other options:

- O1 keeps a guaranteed red after every hc release, about every four days.
- O2 as a new comparator would restate in a test what `src/hc.ts` already states in code. Two lists to keep in step.
- O3 tangles the two. akrogon cannot own a host-wide binary that herdr-app updates on its own (F2, F5). The herdr-setup decision of 2026-11-07 for the same question was "no version pin", with one check the operator runs by hand after an update (`bin/herdr-update-check`, no automatic trigger).
- Non-blocking pin: a test nobody has to act on is noise. Same information as `hc --version`.

What it could break later:

- R1. hc changes a shape on a path no real-core test walks, for example a field only present on a rare terminal state. It reaches production unseen. It would have reached production under the pin too, since hc updates before any suite run.
- R2. A real break still turns main red for every leaf until an akrogon fix lands. That is correct: akrogon is broken on that host.
- R3. Nobody gets a diff of what hc changed. hc's release notes are the place for that.

If the operator wants a deliberate step after an hc update, the form already used next door fits: run `bun test tests/hc-*.test.ts` by hand after `hc update`. No pin, no trigger.

If akrogon ever needs a newer hc, the native tool is `hc update --version X.Y.Z` in the install doc (docs/start/install.md:26). Not needed now.
