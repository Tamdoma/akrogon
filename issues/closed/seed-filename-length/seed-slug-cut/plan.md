# Plan: seed-slug-cut

Direct slot B synthesis. The leaf sets `debate: "no"`; no positions or rebuttals are required. The brief and design lock the scope.

## Decisions

- D1. Change only `slug(title: string): string` in `src/pull.ts` and scenarios in `tests/pull.test.ts`. Keep the function private and retain its signature, normalization, number-first filenames and `issue` fallback. No dependencies or execution prerequisites are needed.
- D2. Normalize the title into `h` using the existing lowercase, replacement and edge-hyphen removal. Return it unchanged when its length is at most 40. Otherwise take the first 40 characters. When `h[40]` is not a hyphen and the slice contains a hyphen, cut before the slice's last hyphen. Remove a trailing hyphen and retain the existing empty-result fallback. When there is no hyphen in the slice, keep the hard cut. Use typed local strings and numbers without exporting a helper or adding configuration.
- D3. Verify through the existing CLI/fixture boundary. Extend filename coverage with literal expected results, keep the current filename regex assertion and existing failure/reconciliation scenarios, and preserve a separate CLI-generated seed artifact. No browser or auth changes apply.

D2 resolves the brief's potentially ambiguous “position 40” using the design's explicit zero-based `h[40]` rule. A complete 40-character prefix followed by a hyphen stays intact. A first word longer than 40 is hard cut even when later words follow, as specified by the design's no-hyphen-in-slice rule.

## Read first

Paths are relative to the worktree unless absolute.

- `REFERENCE.md` and `learnings/LESSONS.md` for the repository map and recorded lessons.
- `/home/ivan/Work/infra/akrogon/issues/open/seed-filename-length/seed-slug-cut/brief.md` and `design.md` for scope and the binding algorithm.
- `docs/create.html`, the open-GitHub-issues workflow row, for the user-visible pull flow.
- `src/pull.ts`, specifically `slug()` and desired seed filenames, for implementation and reconciliation behavior.
- `tests/pull.test.ts`, `tests/helpers.ts`, and `tests/fake-gh.ts` for CLI scenarios and fixture interfaces. Helpers and fake gh are read-only.
- `package.json` for required verification commands.

No required grounding resource is missing. Lesson history is unnecessary because this plan relies on live code rather than treating historical claims as current facts.

## Acceptance criteria

- C1. Every generated slug is at most 40 characters and has no trailing hyphen. Normalization, fallback and numeric prefix remain unchanged.
- C2. The existing 150-character `X` title produces exactly 40 lowercase `x` characters instead of 100.
- C3. `alpha bravo charlie delta echo foxtrot golf hotel` produces `alpha-bravo-charlie-delta-echo-foxtrot` (38 characters). The attempted 40-character prefix ends inside `golf`, so the whole last word is removed.
- C4. A single 41-character `X` word produces exactly 40 lowercase `x` characters. A 41-character first word followed by another word also uses the no-hyphen hard cut.
- C5. A normalized 40-character value remains intact. In particular, `alpha ` followed by 34 `x` characters and ` tail` retains the full 40-character `alpha-` plus 34 `x` prefix, because the next character is a hyphen. A title of 39 `x` characters followed by ` tail` produces 39 `x` characters without a trailing hyphen.
- C6. Existing punctuation-only fallback, safe filename regex, repeat-pull idempotence, stale-file removal, body preservation and invalid-listing failure scenarios remain green.
- C7. The CLI artifact verification below and `bun test`, `bun run typecheck`, and `bun run format` exit successfully. The final diff contains only the two owned code/test surfaces.

## Ordered implementation checklist

1. A1. In `tests/pull.test.ts`, update the existing long-title expectation for C2 and add focused CLI cases for C3–C5 using existing helpers. Assert exact filenames, with the numeric prefix, and the length/no-trailing-hyphen properties. Preserve existing regex coverage. Run `bun test tests/pull.test.ts` and confirm the new expectations fail on the old implementation.
2. A2. Replace only the truncation logic inside `src/pull.ts`'s `slug()` with D2. Keep normalization and fallback behavior. Run `bun test tests/pull.test.ts` to verify C1–C6. No changes to pull reconciliation or existing seed files are required.
3. A3. Run the artifact-producing command below, then `bun run format`, `bun test`, and `bun run typecheck`. Inspect `git --no-pager diff -- src/pull.ts tests/pull.test.ts` and `git status --short` for scope. If formatting touches unrelated files, remove only that run's unrelated edits without reverting pre-existing work. Record exit codes and the artifact path in implementation evidence.

## CLI verification and retained artifact

Run from the worktree. This invokes the real CLI against the existing fake GitHub listing fixture, checks its exit code and exact resulting filename, and copies the generated seed into the authoritative leaf before fixture cleanup. It creates no persistent helper script and does not change authentication.

```bash
bun --eval '
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fixture, fakeGh, cli } from "./tests/helpers.ts";
import { command } from "./src/shell.ts";
const f = await fixture();
try {
  const gh = fakeGh(f);
  await command(["git", "remote", "add", "origin", "https://github.com/acme/project.git"], f.root);
  writeFileSync(gh.db, JSON.stringify([{ stdout: JSON.stringify([[{
    number: 104,
    title: "alpha bravo charlie delta echo foxtrot golf hotel",
    body: "slug boundary verification",
    html_url: "https://github.com/acme/project/issues/104"
  }]]) }]));
  const result = await cli(f, ["pull"], f.root, gh.env);
  if (result.code !== 0) throw new Error(JSON.stringify(result));
  const seeds = resolve(f.root, "issues/seeds");
  const expected = "104-alpha-bravo-charlie-delta-echo-foxtrot.md";
  const names = readdirSync(seeds);
  if (names.length !== 1 || names[0] !== expected) throw new Error(JSON.stringify({ expected, names }));
  const evidence = "/home/ivan/Work/infra/akrogon/issues/open/seed-filename-length/seed-slug-cut/evidence";
  mkdirSync(evidence, { recursive: true });
  copyFileSync(resolve(seeds, expected), resolve(evidence, expected));
  console.log(resolve(evidence, expected));
} finally {
  f.clean();
}
'
```

## Known limitations

R1. Verification exercises the real CLI and filesystem with fixture-provided GitHub responses. It does not establish live GitHub connectivity or authentication, which this filename change does not touch.

R2. Existing long seed names remain until the next successful pull. Existing reconciliation then replaces them. There is no separate migration or rename operation.
