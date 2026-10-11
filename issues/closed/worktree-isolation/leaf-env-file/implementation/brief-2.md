# Brief 2: update batch-dispatch `.env` assertion

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/leaf-env-file-u2`
Lane base: `309d742605a0516067840863ffdf3be29b03fc0c` (`AKROGON_BASE`)

## 1. Goal

Update `tests/batch-dispatch.test.ts` `.env` assertions for the NEW dispatch behavior (plan D1/D3): the leaf worktree `.env` is a real file holding only declared `env:` names, not a symlink to the root `.env`. A later unit implements the behavior — this lands RED until then.

## 2. Acceptance criteria

- T1 In `empty untracked folders are removed before an applied merge prompt` (:905–943): the test writes root `.env` as `secret\n` (no `KEY=`) and the fixture repo declares no `env:` names, so the leaf `.env` is a regular empty file. Replace the three assertions `lstatSync(envLink).isSymbolicLink()`, `readlinkSync(envLink) === resolve(f.root,'.env')`, `readFileSync(envLink) === 'secret\n'` with: `lstatSync(envLink).isFile()` is true and `readFileSync(envLink, 'utf8')` is `''`. Rename the local `envLink` variable to `envFile` for accuracy. Cited source: locked design — dispatch writes declared `env:` subset only; `secret` is not a `KEY=` line and nothing is declared.
- T2 Scan the rest of the file for other `.env` link assertions; update any that assume a symlink (e.g. the sibling solo test near :950 if it asserts the link).

## 3. Read-first list

- `tests/batch-dispatch.test.ts` :900–990 (both empty-folder tests).
- `tests/helpers.ts` — fixture writes `issues/config.yaml` with no `env:` key.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Plan: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/leaf-env-file/plan.md` (D3 output format: declared names only, `env:` order).

## 4. Change list and needed interfaces

- Owned paths: `tests/batch-dispatch.test.ts` only. Shared test resource: none. Must land first: none. Wave-mate edits `tests/next.test.ts` and possibly `tests/helpers.ts` — no overlap.

## 5. Do-not, reasons and exceptions

- Do not edit `src/` or other test files — implementation and its tests belong to other units. Exception: none.
- Do not change the planted untracked/ignored fixture files in these tests — they prove the merge-clean behavior this test exists for. Exception: none.
- Do not keep `isSymbolicLink` assertions — they contradict the locked design (real file). Reason: design replaced the symlink with a written file.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief authorizing it.
- Restated: only the `.env` assertions change; everything else in the file stays identical.

## 6. Ordered steps

1. Read :900–990; confirm which lines assert symlink/link target.
2. Apply T1 (and T2 if needed).
3. Run `bun test tests/batch-dispatch.test.ts --timeout=30000`; expect red only where the new `.env` assertions run against old symlink code; everything else green.
4. Commit `test: expect dispatch-written leaf .env file in merge-clean test` with trailer `Test-Change: tests/batch-dispatch.test.ts updated .env assertions for real-file writes per plan D1/D3`.

Advisory size: 1 file, under 15 turns.

## 7. Commands

```
AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run in your worktree. Expect red on the changed assertions only; paste failing names.

## 8. Done-when, evidence and report

Commit exists on your worktree HEAD; changed-test output pasted showing only the expected `.env` failures; report filled below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
