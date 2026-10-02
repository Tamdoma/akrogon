# Review A: readiness-contract

- Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72`
- Reviewed head: `fb10e25` (`git diff b2c15ec..fb10e25`: 7 files, +670/-6)
- Debate: off (`debate: "no"`); no positions exist, review is direct against plan/design.

## Verification

- `bun test --timeout=30000`: 380 pass, 0 fail, 17 files (post-format head `fb10e25`).
- `bun run typecheck`: clean. `bun run format`: applied and committed.
- AREA.md check: all 9 paths named in `src/AREA.md` exist (`src/readiness.ts` line accurate). No doc page makes a claim this diff falsifies — README `next` "Dispatch eligible work" and `docs/guide/next.md` "finds eligible work" remain true; readiness is a new eligibility condition, not a contradiction.

## Criteria walk

- C1/C2 (schema, holderRoot): `readinessSchema` is verbatim from design.md; tests cover accept-complete and all five refusals plus holderRoot's four outcomes.
- C3: gate sits exactly at the required point (after `blocked-by`, before `seats`/`checkBase`/`allocate`); test asserts exit non-zero naming `FOO` across all four `.env` states plus no worktree/branch/tab/pane, and dispatch on `FOO=x`.
- C4: unregistered absolute-dir holder tested against that dir's `.env`.
- C5: `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` printed after `Failed:` in overview, after state YAML in detail; `secretvalue123` never appears. `Gap` structurally cannot carry a value.
- C6: malformed and schema-invalid `readiness.yaml` → exit non-zero, stderr names the file path, leaf undispatched. Accepted deviation: `ReadinessError` subclass + `scanRepo` whitelist converts the plain `Error` to the unreadable-leaf diagnostic; message (with path) preserved.

## Nits

- N1: `status <slug>` on a merged leaf suppresses `Missing:` lines (`leafGaps` returns `[]` when `phase === 'merged'`, shared by overview and detail). Design text says `status <slug>` prints "the same lines for that leaf" — ambiguous whether merged-exclusion applies to detail. Deferred: a merged leaf needs no inputs, so suppression is the coherent reading; promote to a Fix only if door-readiness expects merged-leaf gaps to surface in detail.
- N2: `file` input `name` may be absolute, escaping `<holder root>` (schema documents a relative path but does not constrain). Deferred: contracts are operator-authored via the door; the escape only reads existence/size. Promote if contracts become agent-writable.
- N3: a syntactically malformed `.env` makes `parseEnv` throw, rendering the leaf unreadable rather than reporting its inputs as missing. Deferred: brief defines missing as absent/lacks-name/blank-value only; a garbage `.env` being loud is defensible.

No Fixes. No operator actions. No missing test for any done-criterion; assertion style checks components (kind/name/holder/steps), not prose wording.

## Verdict

`nits` — merge-ready; two spec-reading notes and one edge behavior recorded.
