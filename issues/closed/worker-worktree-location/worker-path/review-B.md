# Review B: worker-path

Base `f984c8ae83156b31aaa5502abab4b02a0c96f360`, reviewed head `87fa8e4edf6786005bb20c5d962b9f156bb86bec`. Lane clean, head ahead of base, diff holds only the 4 owned files, no leftover `worker-path-u*` worktrees. Blind review; peer review not read. `debate: no`, so no debate artifacts expected.

## Criterion evidence

1. Live `bun src/akrogon.ts config` from this lane prints `worktree_store: /home/ivan/Work/infra/akrogon/issues/worktrees` with `worktree_root: issues/worktrees` unchanged. One `worktreeStore` in `src/config.ts:126` feeds both `effectiveConfig` (`:148`, gated on repo only, unlike `AKROGON_BASE`) and the two `src/next.ts` sites; `resolve(a,b,c) === resolve(resolve(a,b),c)` keeps behavior byte-identical. Sibling sweep: remaining `worktree_root` consumers are the schema default, the resolver, and design-excluded `init.ts`/`sync.ts` only. Absent-key case covered by test and log.
2. New test in `tests/config.test.ts:181` drives the real CLI on real temp repos across default, custom relative, and absolute roots, root and linked-worktree callers (identity via `toBe`), and unregistered cwd (`not.toHaveProperty`). No mocks; assertions target the machine-consumed path contract, not wording. Reran: `bun test tests/config.test.ts` → 7 pass, 0 fail.
3. Protocol `:11` names `<worktree_store>/<slug>-u<N>` from `akrogon config`, `git worktree add --detach` at the leaf's committed HEAD, and one absolute path for sub-brief path, spawn cwd, inspection, and remove. `grep "<lane>/\|parent root\|gitignored"` on the file is empty.
4. Retained-nested resume added in `:11`, `:17` and `:25` intact, occupied path reported to operator and never deleted/forced/reused, standalone sentence verbatim.
5. `/tmp/worker-path-verify-20260928.log` read in full: config from leaf, worker created as sibling at leaf HEAD (`HEADS MATCH`, `SIBLINGS UNDER worktree_store`, worker `05d9449` distinct from main `106caa8`), same store from root, no key with `repo: none`. Report cites the path; file is outside tracked `issues/`.

Design exclusions hold: no script, verb, env var, or state field; `sync.ts`/`init.ts` untouched. Ponytail: minimal 4-file diff, only the requested resolver added.

Docs: no `AREA.md` in the diff, so no path listing applies. `src/AREA.md:6` ("prints effective settings and the worktree base") stays accurate. Live sweep finds only generic `worktree_root` mentions in `README.md`, `docs/guide/setup.md`, and `skills/init-akrogon/SKILL.md`; no other documented behavior changed. No lesson claim in the report to check.

Checks: report records format/typecheck/full-suite green (307 pass); I reran the targeted suite green plus live config and greps. No code change or specific concern remains, so no full rerun.

## Findings

- N1 (Nit): the real-run log annotates its unregistered-cwd check as `grep exit: 0 (1 = key absent)`, but exit 0 came from matching `repo: none`; the absent-key evidence is the missing `worktree_store` line, not the exit code. Cosmetic only, in `/tmp` evidence; the conclusion it supports is correct.

## Verdict

`nits`
