# Review A: close-pack

Base: `38d7a95722540ea3da8a9de1913d8d88431b4091` (origin/main at review). Reviewed head: `b1d5464`.

## Evidence

- `akrogon verify` green on this head's tree: receipt `run 2b1a2598-a052-4b8b-928f-d044057cba62`, 879 tests, format, typecheck (head `b1d5464` amends `5d6e4dc`'s message only; same tree).
- AREA.md path listing: every `src/*.ts`/`tests/*.ts` path named in `src/AREA.md` and `tests/AREA.md` exists on this head (one shell pass, zero misses).
- Criterion tests re-read: `tests/close-pack.test.ts` (8 tests) exercised against the landed code during review of the diff; the earlier `check post-rebase-suites: 0` log covers all eight on `035c34f`, and `check close-pack-proof: 0` covers them on `330f37f`.
- Reproduction of F1: `check namesake-repro: 1` (`implementation/check-namesake-repro-1792101673363-3198410.log`) — scratch fixture, `mkdir issues/closed/issue`, leaf `fresh` under `issues/open/issue`, `run-check --leaf <open> -- echo ran` exits 1.
- Docs opened: `docs/guide/files.md`, `merge.md`, `setup.md` changed lines are accurate to behavior. README's `run-check` row unchanged and still correct.

## Findings

### F1 — Fix: `ownerRefusal` refuses on a `closed/<owner>` namesake, over-refusing live open leaves

`src/run-check.ts` `ownerRefusal` returns `owner closed` whenever `existsSync(closed)` for the target's owner name, in both the early and late checks. Criterion 5 licenses refusal only for a target under `issues/closed/` or under an owner holding `.closing`; `issues/open/issue/fresh/implementation` is neither.

Realistic source: the operator reuses an owner folder name. Owner names recur (`issue`, `epic`, real slugs): after `issues/open/issue` closes into `issues/closed/issue`, creating `issues/open/issue2`-style reuse means `issues/open/issue` later holds new leaves — creating that folder is legal today (completeOwner's own `existsSync(destination)` is a separate pre-existing wart), and every `run-check` and `verify` on those leaves is refused with `owner closed`, blocking the leaf's `checks` and its `check.review` receipt.

Consequence today: a live open leaf cannot run checks or verify; the leaf is unmergeable until someone removes the closed namesake. Proven: `check namesake-repro: 1` (exit 1, `owner closed: …/issues/open/issue/fresh/implementation`).

Criterion/gap: criterion 5's license is exceeded; also breaks `verify` for the same reason (shared `checkedRun`).

Direction (B owns the repair): the closed check belongs scoped to the target, not the owner name — `existsSync(resolve(closed, leafDir))` with `leafDir = found.member.split('/')[0]` (the u2 worker's original shape, which I widened past the criterion). `.closing` stays owner-scoped; `late && !existsSync(open)` stays (the owner actually vanished). A parked or reopened namesake then passes while `--leaf <closed leaf>` still refuses.

### N1 — Nit: `packFolder` resolver read-back picks the first existing `ownerDirs` entry

For a `folder` under `issues/parked/<owner>` or `issues/closed/<owner>` while `issues/open/<owner>` also exists (namesake), `readMember` reads the open owner's archive — failing retryably (`member`/`archive` LogError) rather than corrupting, so today a retry stalls on the same failure until the namesake is removed. Deferred: folder-pack's `akrogon pack` is the consumer that hits parked/closed folders; this leaf's completion path always packs the open owner. Promotion: a namesake pack run through `akrogon pack` on a parked owner.

### N2 — Nit: `verify` `mkdirSync(caller.target)` precedes the `checkedRun` refusal

A verify on a leaf under a `.closing` owner creates `implementation/` before `checkedRun` throws; the empty dir is folded into the pack — harmless, but inconsistent with run-check's create-nothing refusal. Deferred: verify on closing owners is not a done-criterion path.

### N3 — Nit: check→publish TOCTOU

`ownerRefusal` and `mkdirSync(target)` are not atomic; a completion landing in the gap could recreate an open folder. Window is nanoseconds and needs a concurrent completion mid-publish; no realistic trigger today.

## Test-Change trailers on this head

`bb1fcde`, `5b5f1ce`, `035c34f`, `f2bd0e7`, `b1d5464` each carry `Test-Change:` citations; judged against their sources (worker mismatch output, criterion 5's closed-target license, format check) — all legitimate.

## Verdict

`fix` — one Fix (F1) routed to B's check.repair; the rest is ready.
