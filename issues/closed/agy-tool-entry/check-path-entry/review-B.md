# Review B (direct reviewer D)

Base `562611bd309252ddcbe7a18a04a88629d0e82c0e`. Reviewed head `42e487ea78b2ce3f532b5982aafb8f405ba56c0d`.

Verdict `fix`.

## F1. An explicit PATH declaration restores the agy wrapper

An agy seat prepends its wrapper directory to the shell's PATH in `src/seat.ts:322–325`. A repository can explicitly forward PATH through `pass_env` or `env` under the public config in `docs/reference/config.md:73–82` and the schema in `src/config.ts:104–131`. `constructedEnv` filters PATH at `src/run-check.ts:89–93`, then copies the raw caller PATH back at lines 95–98 for either setting. A checked command in that repository still resolves bare `bash` to the seat wrapper, leaving the original failure reachable and violating the brief's requirement to remove every matching entry and the design's shared boundary.

I ran the real `run-check` CLI with the same caller PATH under the default config and `pass_env: [PATH]`. The default dropped both the wrapper directory and its symlink alias and kept the order and empty segments. The explicit config restored both entries. See `check review-path-merge-order: 0` in [the comparison log](implementation/check-review-path-merge-order-1795775239888-1309670.log). Filter the final PATH after merging the declared environment and add a CLI regression for an explicit PATH declaration.

## Verification

- C1: The new test failed on the test-only commit `661b285fdbdfb3ba1baf6974b6580c2f609a9b63` because both entries survived. `check review-path-red: 1` is in [the red log](implementation/check-review-path-red-1795775272082-1356404.log). The test passes on the reviewed head in the full run and all five changed-file repetitions.
- C2: `constructedEnv` and `realBash` share `isToolEntryDir`. The CLI comparison above exercised both resolved-path and realpath matching on the default path.
- C3: I ran the planned worktree command with the agy PATH. All four cases passed. See `check review-agy-path: 0` in [the head log](implementation/check-review-agy-path-1795775242099-1309671.log). The recorded base release failed the unwired bash placement assertion under the same agy PATH. See [the base log](implementation/check-e2e-base-release-1795775016291-946365.log).
- C4: Verify receipt `12d67da1-8b2e-4578-b470-170a02f87bf7` records setup, format, typecheck and test exiting 0 on the reviewed head and handed-off base. [Test log](implementation/check-test-1795775145786-947497.log).
- The checks reference describes that checked commands receive PATH. The config reference documents forwarding and supports the F1 trace. No documented behavior changed.

## Test-Change trailers

`661b285f`: `Test-Change: tests/run-check.test.ts added one case for check-path-entry criterion 1; no existing expectation changed`. `src/test-files.ts` covers this path. The test maps to C1 and only adds a new case. The product commit touches no path covered by that rule.

## Re-check round 1

Base `562611bd309252ddcbe7a18a04a88629d0e82c0e`. Prior head `42e487ea78b2ce3f532b5982aafb8f405ba56c0d`. Reviewed head `5d425ea8381036e9ae0fa87ef91d7da9d0254a06`. Range-diff confirms the two repair commits follow the original pair on the same base.

Verdict `ready`. F1 is fixed. Both `env` and `pass_env` copy into the environment before the final PATH is filtered. `realBash` and `constructedEnv` still call the same matcher. The checks and config references describe the same documented behavior.

- C1 and F1: The extended CLI case preserves the default assertion and adds the same assertion with `pass_env: [PATH]`. The test-only commit `82aaf90a` failed at the newly added assertion because both wrapper entries survived. The same case passed on `5d425ea8`. [Red log](implementation/check-review-f1-red-1795775521152-1996977.log), [green log](implementation/check-review-f1-green-1795775521109-1996979.log).
- C3: The planned worktree command with the agy PATH passed all four cases on `5d425ea8`. [Agy PATH log](implementation/check-review-f1-agy-path-1795775523329-1996978.log).
- C4: Receipt `2e8ff89c-b366-487f-a711-972d2d6d1836` records green setup, format, typecheck and test on `5d425ea8`. The updated case passed in the full suite and all five changed-file repetitions. [Test log](implementation/check-test-1795775479149-1643730.log).

`82aaf90a`: `Test-Change: tests/run-check.test.ts extended the tool-entry PATH case with pass_env: [PATH], the case review-B.md F1 handed over for criterion 1; no existing expectation changed`. The trailer cites the reviewed F1 reproduction, and the diff adds the declared-PATH scenario while retaining the original assertion. `5d425ea8` touches only product code outside the trailer rule.
