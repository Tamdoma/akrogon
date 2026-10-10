# Brief 3: hold-fix tests

## 1. Goal

Implement plan.md wave 2: tests proving `akrogon hold-fix <slug>` and the fix-leaf merge-turn override, plus the command-reference contract entry. Leaf: hold-fix-leaf; plan at `/home/ivan/Work/infra/akrogon/issues/open/merge-throughput/hold-fix-leaf/plan.md`. The implementation is on the worktree HEAD you start from.

## 2. Acceptance criteria

Every scenario in `tests/hold.test.ts` uses `test.serial`, the existing `fixture`/`cli`/`fakeHerdr`/`leaf`/`yaml` helpers, and asserts observable contracts (exit codes, state files, `held.yaml`, herdr prompt records), never wording beyond exact command output strings.

1. **Solo attempt:** hold on `repo` via `holdAt` with `fix` support; merge leaves `hold` (earlier `merge_stamp`, queue head) and `fix` (later stamp, behind). `cli(f, ['hold-fix', 'fix'])` → code 0, stdout `held repo fix fix`, `held.yaml` now carries `fix: 'fix'`, and `readState` of `fix` shows `merge_stamp` unchanged. `cli(f, ['next'])` → `fix` state gains a `batch` record with `members: []` and `applied: true`; `hold` gains no record; the fake-herdr prompt targets `fix` with `attempt=<id> solo`.
2. **Authorization:** continuing scenario 1's state, `phase fix merged --slot B --attempt <record.attempt>` exits 0 (drives `finishPush` against the fixture remote — the existing `phase merged` tests show the pattern); `phase hold merged` exits nonzero naming `fix` as holder. `check.fix` on `fix` with the same attempt is also authorized (exit 0 or a different downstream error, but not the `Merge turn refused` text — assert by absence of that refusal).
3. **Hold clears, order returns:** after scenario 2's landed merge (origin main moved outside record folders), `cli(f, ['next'])` builds an attempt for the remaining merge leaf and `held.yaml` has no `repo` entry.
4. **Refusals:** `hold-fix fix` with no hold → nonzero, message contains `repo`; `hold-fix bogus` during a hold → nonzero, `held.yaml` byte-identical to before; `hold-fix <a leaf not in merge queue>` → nonzero, record unchanged. Leaf state files unchanged throughout.
5. **Mid-attempt clear (criterion 6):** hold-fix `fix`, `next` creates its record, then `unhold`; `phase fix merged --attempt <record.attempt>` exits 0 — authorization comes from the batch record, not the hold.
6. **Status:** `cli(f, ['status'])` output contains `held fix fix`; `cli(f, ['status', 'fix'])` prints `held: <sha> bun test fix fix`. With `fix` absent the old `held:` and `(held)` formats are unchanged (one assertion each against an unfixed hold).
7. **Contract:** `tests/command-reference.test.ts` gains `holdFix: '<slug>'` — check the contract map: keys are verb strings like `unhold`; use the exact dispatcher verb (`hold-fix`) as the key, matching how multiword verbs appear there if any do.

## 3. Read-first

- `tests/hold.test.ts` — `holdAt`, `heldRecords`, `heldMergeLeaf`, `branchAt`, `advanceRemote`, `mutating`, `database`; copy its `test.serial` style. Extend `holdAt` with an optional `fix` param and add a two-leaf variant of `heldMergeLeaf` (slugs `hold` + `fix`, `hold` stamped earlier).
- `tests/pause-status.test.ts:121-140` — status heading assertions.
- `tests/phase.test.ts` or hold.test.ts `phase ... merged` calls — how accepted merges are driven (find the `merged` CLI call that succeeds against `f`'s remote; `cli` runs the real command so `git push` works on the fixture remote).
- `src/hold.ts` — read `mergeHolder`/`holdFixCommand` as implemented on your HEAD for exact error text.
- `tests/command-reference.test.ts:11-27` — contract map shape.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

Owns: `tests/hold.test.ts` (new scenarios + `holdAt`/helper extension) and `tests/command-reference.test.ts` (one map entry). Prerequisite: wave-1 code already landed on your HEAD (mergeHolder, holdFixCommand, status suffixes). Shared resource: none — fixture repos are per-test temp dirs.

## 5. Do-not

- Do not edit `src/` — if a scenario fails because the implementation differs from this brief's assumed text, read the real error/output and assert what the implementation actually does only where the brief's contract is still satisfied; otherwise return a mismatch.
- Do not weaken any assertion to make a run pass; report the failure instead.
- Do not add new fixture files or refactor existing helpers beyond `holdAt` (optional `fix` param) and a two-leaf helper.
- Keep `holdAt`'s existing callers working (default arg).

Reasons and exceptions as stated: tests prove the plan's contracts; a real implementation mismatch returns to A with evidence.

## 6. Ordered steps

1. Read `src/hold.ts` (implemented) and tests/hold.test.ts fully; extend `holdAt` and build the two-leaf helper.
2. Write scenarios 1-4 in that order, running `bun test tests/hold.test.ts` after each.
3. Write scenarios 5-6, rerun the file.
4. Add the contract-map entry, run `bun test tests/command-reference.test.ts`.
5. Run the section-7 command.

Commit each scenario batch as it goes green is not needed — one commit at the end is fine. Commit message MUST end with the trailer line:
`Test-Change: tests/hold.test.ts added hold-fix scenarios, no existing expectation changed`
(changing an existing helper signature for a default param does not count as an expectation change; state so in the trailer.)

Size: 2 files, ~30 turns.

## 7. Commands

```sh
export AKROGON_BASE=3fde73f7197f35ea17ba2ff06c0705c535f9f75e
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/hold.test.ts tests/command-reference.test.ts
```

## 8. Done-when, evidence, report

All 6 scenario criteria pass and the contract test passes, one commit with the Test-Change trailer, outputs pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
