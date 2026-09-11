# Plan: install-prune-links

Direct synthesis by slot B. The leaf has `debate: no`; no positions or rebuttals are required. The brief and design remain authoritative.

## Read first

- `REFERENCE.md` and `learnings/LESSONS.md`.
- This leaf's `brief.md` and `design.md` in the registered repository's authoritative `issues/open/install-prune-dead-links/install-prune-links/`.
- `docs/install.html`, install instructions and destination-conflict behavior.
- `src/install.ts`, `src/config.ts` (`toolRoot`, `readGlobal`) and `src/akrogon.ts` (install entrypoint).
- `tests/helpers.ts`, `tests/fake-herdr.ts`, and the fixture setup in `tests/park.test.ts`.
- `package.json` and `.gitignore` for checks and evidence output.

## Decisions

- D1: Use one local list of the four locked harness roots for both pruning and skill-link generation. Keep the executable link, configured integration installs, and plugin link behavior unchanged. Installation remains operator-invoked.
- D2: Before the existing conflict check, scan each existing harness root's immediate entries. Inspect entries with `lstatSync`; only symlinks qualify. Resolve `readlinkSync` against the entry's directory. Unlink only when that absolute target starts with `resolve(toolRoot, 'skills') + sep` and `existsSync(target)` is false. The separator excludes sibling prefixes such as `skills-old`. Use the locked lexical target rule, not realpath resolution of a missing target. Missing roots require no scan and are created by the existing linking loop.
- D3: Preserve the exact existing conflict semantics: a requested destination is acceptable only when absent or a symlink whose normalized target equals that destination's expected source. A link to a different existing skill remains a conflict even though it points into this repository. Conflicts print removal commands and exit nonzero before any new links or herdr calls. Pruning has already occurred and is not rolled back.
- D4: Exercise the real CLI using `fixture()` and `cli()`, with child-only `HOME`, fixture `AKROGON_HOME`, fake herdr on `PATH`, and `FAKE_HERDR`. Read the actual checkout's skill directories to derive expected links. Do not run install against the operator's HOME or mutate checkout skills to simulate deletion. Use nonexistent target names under the checkout's skills directory instead.
- D5: The existing fake herdr throws on both install command shapes. Add only exact, schema-validated handling for `herdr integration install <kind>` and `herdr plugin link <path>` in `tests/fake-herdr.ts`, using its existing call log and success result. This is necessary test-fixture support for the locked CLI verification, not a production-interface change. Keep all other unexpected commands failing.
- D6: Preserve a filesystem listing as end-to-end evidence under `.evidence/install-prune-links/`. The success scenario writes a listing of each temporary harness root and its entries, entry types, raw symlink targets, and resolution results before fixture cleanup, and prints the artifact path. Do not keep temporary HOME directories or introduce a production evidence flag.

## Acceptance criteria

- C1: With all harness roots initially absent, the CLI exits zero and every current skill directory has a resolving symlink to the expected checkout path in each of the four roots. The executable link still resolves correctly. A second install succeeds without changing existing link targets.
- C2: In each root, dangling links with absolute and relative targets under the checkout's `skills/` are removed. A surviving resolving repository link remains untouched. A missing target below a nested path under `skills/` follows the same locked prefix rule.
- C3: Each root preserves a real directory and its contents, an unrelated regular file, a resolving foreign symlink, a dangling foreign symlink, and a dangling link to a sibling prefix such as `skills-old/missing`. Use names that do not collide with current skills. Assert dangling-link presence with `lstatSync`, not `existsSync` alone.
- C4: At an actual requested skill destination, a real directory, a foreign symlink, and a symlink to a different resolving repository target each cause nonzero exit and a removal command naming the conflict. Cover the four harness roots. Preserve the conflicting entry and verify no new install links or herdr calls occur. Include a stale owned link to prove pruning happens before refusal. Retain executable-destination conflict coverage because that link shares the existing check.
- C5: Successful CLI calls invoke integration installation for the fixture's configured harnesses and plugin linking with the unchanged arguments. The fake herdr call log proves those commands were reached. The success scenario leaves the D6 artifact after temporary HOME cleanup.
- C6: The focused install suite, full tests, typecheck, and formatter succeed. The final diff contains only the production change and its necessary tests/fixture support.

## Ordered implementation checklist

- [ ] A1: Update `src/install.ts` using D1–D3. Add the required filesystem/path imports, reuse the root list, and insert the prune loop before conflict detection. No public function signature or configuration changes. Covers C1–C4.
- [ ] A2: Extend `tests/fake-herdr.ts` only as described in D5 so successful install invocations can finish. Existing call logging remains the observation interface. Covers C5 and enables A3's success cases.
- [ ] A3: Add `tests/install.test.ts` with local typed setup using the existing helpers, all C1–C5 scenarios, and the D6 artifact. Restore isolation through fixture cleanup even when assertions fail. Do not mutate process-wide HOME or PATH. Reuse the existing fake executable rather than creating another command simulator.
- [ ] A4: Run verification below, inspect saved evidence and the final diff, and record actual exit results and artifact paths in the implementation handoff. Keep lifecycle artifacts in the authoritative leaf rather than the worktree branch. Covers C6.

No prerequisite leaf or operator action is required. A2 must be available for A3's successful CLI invocations. All work is agent-owned.

## Verification

Run from the worktree:

```sh
bun test tests/install.test.ts
bun test
bun run typecheck
bun run format
git --no-pager diff --check
git --no-pager diff --stat
git status --short
```

The focused test command is the end-to-end invocation: it launches `bun src/akrogon.ts install` through `cli()` in temporary HOME and leaves `.evidence/install-prune-links/` filesystem evidence. Record the actual evidence filename after running it. Inspect the listing for all four roots and their resolving current-skill links. Check exit codes as well as assertions and artifact existence. Inspect formatter changes and keep unrelated files out of the final diff. If formatting materially changes behavior or a check fails, repair and rerun affected checks before handoff.

## Known limitations and grounding gaps

- R1: Pruning intentionally precedes conflicts and herdr calls. A later failure can leave stale owned links removed, matching the locked architecture; installation is not transactional.
- R2: Ownership is the normalized textual target-prefix rule. Links from other checkouts and paths outside that prefix remain untouched even if they eventually resolve through other symlinks into this checkout. No recursive harness-directory cleanup is introduced.
- R3: `docs/install.html` says updating needs no reinstall, although adding or removing skill folders requires install to reconcile links. Documentation changes are outside this leaf's owned behavior and tests; preserve this limitation in the handoff.
- R4: The locked design names two owned files but its required fake-herdr CLI test cannot succeed with the current fixture, which rejects integration/plugin install calls. D5 supplies only the necessary supporting fixture cases. No missing grounding document was encountered, and no new historical lesson is asserted from planning alone.
