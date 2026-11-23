# Brief: how akrogon should follow hc updates (independent view, no edits)

Event: today 07:42 herdr-core (hc) updated to 0.1.22 (binary ~/.local/bin/herdr-core, hc is a symlink; hc has its own `hc update [--version X|--from <file>]`). It added an optional `docs` filter to events.subscribe. akrogon's test "the parts of hc schema akrogon parses match the pinned copy" (tests/hc-identity.test.ts:195-205, pinnedSchema at tests/hc-fixture.ts:489-503, fixture tests/fixtures/hc-schema.json) failed on every run, main included, blocking all merges until A re-pinned (commit 0c677ab5). akrogon does not use the new option.

A's options so far:
- O1 keep as is: exact pin of the parsed parts; any hc change fails the suite; someone re-pins.
- O2 compare only what akrogon reads: additions pass, removed/changed fields akrogon uses fail.
- O3 akrogon installs/pins hc's version: an hc upgrade becomes an akrogon commit tested before going live.

Operator wants: the simplest option, most native to both apps, no unnatural tangling of the two, easy to maintain, leaning to defaults. Challenge assumptions fairly, including A's (A leaned O3, the operator suspects it tangles them).

Answer:
1. How hc updates itself today (hc update, any auto-update, release cadence: check hc --help, herdr skill docs in ~/.claude/skills/herdr, git/release notes if found) and what hc promises about schema compatibility (versioning, additive changes).
2. Where akrogon actually depends on hc's shape at runtime: does akrogon validate hc replies with schemas that would break on additions (strict objects) or only on removals? Cite file:line. What would actually break akrogon in production when hc changes, regardless of the test?
3. What the pinned test buys vs costs. Is a test suite the right place to detect drift in an external tool installed separately, or should a runtime check / the parsers themselves be the guard?
4. Your pick (O1, O2, O3, or another such as deleting the pin test and relying on runtime parsing, or making it non-blocking), with what it could break later. Simplest that a seasoned engineer would defend.
Short. Write slots/hc-drift-<your slot>.md in /home/ivan/Work/infra/akrogon/issues/chart/footprint/slots/, then hc send t126 "done <slot>: <path>".
