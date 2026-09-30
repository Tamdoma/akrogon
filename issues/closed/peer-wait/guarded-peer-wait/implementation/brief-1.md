# Brief-1: guarded peer-wait sentence (single unit)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/guarded-peer-wait-u1`
Base: `f71f559982c3d3159510f8bbd5a98d1aab391b94`

## 1. Goal

Replace the one peer-wait sentence in the Blind peer exchange paragraph with the locked taken wording verbatim. Plan decisions D1-D5.

## 2. Numbered acceptance criteria

- B1: Line 44 of `skills/chart-issues/assets/questions.md` contains the taken wording below verbatim, and the old sentence below is gone.
- B2: The readiness sentence below is byte-identical and still follows the new sentence.
- B3: `grep -rn "without a timeout" skills docs README.md` prints nothing.
- B4: The resolved changed-test command in section 7 passes.

No test file is added: trivial one-line prose edit, grep plus reading is the proof (plan D3).

Taken wording (insert verbatim):

> For each named peer, wait until its pane is idle, then prompt it with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`. Any non-zero exit (`agent_prompt_stalled`, `agent_blocked`, `timeout`) means the peer is not confirmed started: report herdr's error to the operator and never re-prompt it automatically. Every wait on a peer, before and after the prompt, is `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, run again whenever it fails with code `timeout`. A peer that reaches `blocked` goes to the operator. After the prompted turn finishes, read the specified return file and report a missing file as a peer failure.

Old sentence (remove exactly this):

> For each named peer, use the supported herdr interface to wait for that pane to be idle before prompting it, then `herdr agent wait` without a timeout after prompting and read the specified return file.

Readiness sentence (keep verbatim):

> Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md:42-44` (target paragraph; line 44 holds the sentence)
- `skills/chart-issues/assets/standing-design.md` (vanity-test rule behind B-criteria needing no test file)
- `src/next.ts:471-488` (existing pattern to copy: the guarded prompt arg shape the prose mirrors)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (lazy senior dev mode)
- Open `docs/reference-index.md` only if this list leaves a gap.

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/assets/questions.md` only. Chunks landing first: none; this is the single and only unit. Shared test resources: none. Consumed output from a preceding worker: none.
- Needed literal interfaces (prose only, no call): `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`; `herdr agent wait <pane> --timeout <T>`; codes `agent_prompt_stalled`, `agent_blocked`, `timeout`, `blocked`.

## 5. Do-not, reasons and exceptions

- Do not paraphrase the taken wording. Reason: verbatim wording avoids drift from the locked design. Exception: none.
- Do not touch any other file, including `src/next.ts`, `skills/watch-issues/SKILL.md`, or anything under `issues/`. Reason: locked scope (plan D4). Exception: none; return a mismatch if blocked.
- Do not add a test file. Reason: wording-asserting test is a vanity test (plan D3). Exception: none.
- Do not widen scope or change an interface; return a mismatch naming the conflict, the evidence, and the smallest brief correction instead. Reason: the plan is the contract. Exception: a revised brief from A authorizing that change.

Restated: verbatim wording because the design locks it, no exception; single-file scope because the plan locks it, mismatch if blocked; no test file because vanity tests are banned, no exception; no scope change without a revised brief from A.

## 6. Ordered steps

1. Read `skills/chart-issues/assets/questions.md:42-44` and confirm the old sentence is present (red evidence for B1).
2. Replace only the old sentence in `skills/chart-issues/assets/questions.md:44` with the taken wording (B1, B2).
3. Run `sed -n '44p' skills/chart-issues/assets/questions.md` and read it against section 2 (B1, B2).
4. Run `grep -rn "without a timeout" skills docs README.md` and confirm empty output (B3).
5. Run `grep -rn "supported herdr interface" skills docs README.md src` and confirm no remaining copy (B1 hygiene).
6. Install dependencies in the worktree, then run the section 7 command (B4).
7. Commit only `skills/chart-issues/assets/questions.md` and return the commit ID with the section 8 report.

Advisory size: 1 file, under 6 turns.

## 7. Commands

Run only this changed-test command (base supplied):

```sh
AKROGON_BASE=f71f559982c3d3159510f8bbd5a98d1aab391b94 bun test --changed="f71f559982c3d3159510f8bbd5a98d1aab391b94"
```

Do not run the full suite; A runs it on the lane.

## 8. Done-when, evidence and report

Done when B1-B4 hold, only the one file changed, and the change is committed. Paste the `sed`, both `grep`, and changed-test outputs in the return. No end-to-end artifact applies (prose-only leaf).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
