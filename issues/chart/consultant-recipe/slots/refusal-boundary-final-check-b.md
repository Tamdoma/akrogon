# Final-shape check B: refusal-boundary, round 1

None. The six items are buildable and correct as written. Verified the points most likely to hide a defect:

- Item 2: after deleting the dead throw, `recipe`'s type is non-optional under the required schema, so no typecheck straggler remains in `src/akrogon.ts` case 'seat'; the `superRefine` `named` loop (`src/config.ts`) already iterates a possibly-undefined consultant and degrades correctly either way, so simplifying it is optional cleanup the item permits but does not require.
- Item 4: the new refusal test is genuinely red on base — the current optional schema parses a keyless config and the command exits 0 — and green after; the fixture-side cost is as scoped (central `fixture()` first, stragglers by test/typecheck fallout).
- Item 6: the gate is correctly specified against the failure mode that matters: `bun src/akrogon.ts config` from the implementation worktree runs the *new* schema against the live `~/.akrogon`, so it can only exit 0 and print `consultant:` when N1 is actually done; the explicit exclusion of the installed binary is right because the installed old schema would pass either way. One sequencing note, not a defect: the gate must run before the push that triggers deploy, which is what the item says.
- Item 3's deletion leaves the generic failed-start rule governing, and no script change is needed since `consults.ts` never special-cased the missing key.
