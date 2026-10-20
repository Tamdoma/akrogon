# Review A: identical-ignored

Base `21422a68`, reviewed head `d818f81`. Verified `akrogon verify` green on `d818f81` (format/test/typecheck all 0, receipt in `issues/verify-runs.jsonl`); criterion proofs c1–c4 green per `implementation/report.md`.

## Doc-surface check

Only `docs/guide/install.md` changed (one line). The page describes the move refusals; the updated wording — differing ignored operator paths refuse, identical ones no longer named — is accurate against the diff. No other page documents the ignored-path rule. No `AREA.md` in the diff.

## Findings

### F1 (Fix): `ls-tree -z` parse truncates at the first tab inside the path

- Location: `src/sync.ts`, the `incomingEntries` map — `const [meta, path]: string[] = line.split('\t')` keeps only `line[1]`, the path segment before the first tab.
- Realistic source: a real upstream tree whose tracked path contains a literal tab. `git ls-tree -r -z` emits the tab verbatim inside the path field; verified live in a scratch repo (`git ls-tree -r -z HEAD | cat -A` shows `with^Itab`, `tab^Iname`). The repo's own odd-name matrix already exercises `\n` in paths, so exotic names are in scope.
- Consequence today, both directions:
  1. An ignored local file whose name contains a tab (e.g. `with\ttab`) is never found in `incomingEntries` — the key recorded is `with` — so `entry === undefined` and the candidate is exempted without any comparison. A differing ignored `with\ttab` colliding with incoming `with\ttab` is silently overwritten by the move: the data loss this guard exists to prevent, newly introduced versus `21422a68` where `--name-only` compared full names.
  2. An incoming `tab\tname` shadows a real incoming `tab` in the `Map` (last write wins), so an ignored local `tab` equal to `tab\tname`'s blob is exempted while incoming `tab` overwrites it.
- Criterion hit: criterion 2 (differing ignored path must refuse) for tabbed paths; plan D6 literal-path requirement.
- Fix shape: split on the first tab only — `const tab: number = line.indexOf('\t'); const meta: string = line.slice(0, tab); const path: string = line.slice(tab + 1);`

## Verdict

`fix` — one Fix (F1). No Nits.

All other aspects checked clean: replayed/directory/ancestor refusal semantics preserved, `120000`/`100755`/`100644` mode mapping correct, `hash-object --stdin` of readlink text matches the locked symlink rule, no-filters hashing matches D1, `moveCheckout` untouched per D3, errors propagate per D5, tests cover every criterion at the real CLI boundary, `Test-Change` trailers present.
