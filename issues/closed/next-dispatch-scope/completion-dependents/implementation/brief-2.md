# Brief-2: guide wording for dependent-only completion

## 1. Goal

State in the operator guide that a completion starts only same-repo dependents. Covers plan D6.

## 2. Numbered acceptance criteria

1. `docs/guide/limits.md` states a completion starts only its dependents in the same repo and other leaves start only through manual `akrogon next`. No line says later sweeps pick up other open leaves after a completion.
2. `docs/guide/next.md` states the same rule in the completion and Manual dispatch lines. The `Startup also runs a sweep` sentence is untouched.

## 3. Read-first list

- `docs/guide/limits.md` (Folder targeting line)
- `docs/guide/next.md` (Herdr events line, Manual dispatch section)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Copy pattern: existing short guide bullets in `limits.md`.

Open the grounding index only if this list leaves a gap.

## 4. Change list and needed interfaces

- `docs/guide/limits.md`: qualify Folder targeting and add or edit one bullet for the dependent-only completion rule.
- `docs/guide/next.md`: edit the completion-adjacent line and the Manual dispatch paragraph. Leave the startup sentence byte-identical.
- Preceding worker output: brief-1 changed `src/next.ts` and `tests/next.test.ts` only. No interface to consume.

## 5. Do-not, reasons and exceptions

- Do not edit the `Startup also runs a sweep` sentence in `next.md`. Reason: owned by startup-resume. Exception: revised brief from B.
- Do not edit `src/`, `tests/`, `plugin/`, or CLI flags. Reason: owned by brief-1 or out of scope. Exception: revised brief from B.
- Do not add new dispatch behavior in prose beyond the plan rule. Reason: docs must match code. Exception: revised brief from B.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.
- Restated: exclusions protect locked scope and peer ownership; each lifts only on a revised brief from B.

## 6. Ordered steps

1. Edit `docs/guide/limits.md` for criterion 1.
2. Edit `docs/guide/next.md` for criterion 2, verifying the startup sentence diff is empty.
3. Grep both files for `later sweeps` and `dependent` to confirm no line claims post-completion pickup of unrelated leaves.

Advisory size: about 2 files and under 8 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this changed-test command:

```sh
AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed="1a21e22e0056a7e9d6b5e35a5a395b867847a844"
```

B runs the full suite separately. Do not run `bun test`, `bun run format`, or `bun run typecheck`.

## 8. Done-when, evidence and report

Done when criteria 1-2 hold with grep output and changed-test output pasted. Doc tests need literal wording checks only for fixed references.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
