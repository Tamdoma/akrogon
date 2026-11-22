# Intake: run-check-kept-evidence

## Scope

Destination: akrogon (registered key `akrogon`). Evidence a child process keeps under its `TMPDIR` must survive `akrogon run-check`'s exit, without breaking the other temp contracts. One chart, scope set by the map.

## Provenance

- GitHub: Tamdoma/akrogon#145
- Operator: door message 2026-11-20 (c-akrogon session)

## Source: Tamdoma/akrogon#145

# akrogon run-check deletes its per-run TMPDIR at exit, so a wrapped capture's "failure evidence kept" path under os.tmpdir() is gone after a paid failed run

Source: Tamdoma/akrogon#145
URL: https://github.com/Tamdoma/akrogon/issues/145

Origin repo: Tamdoma/tamdoma-framework
Lesson history: learnings/history/2026-11-20-run-check-tmpdir-drops-capture-evidence.md

Unverified intake.

## Observation

In framework leaf repeats-move-to-verify (2026-11-20), implement A ran `akrogon run-check --name capture-website-rewrite-1 -- bun .claude/hooks/tests/fixtures/client-voice-spine/scripts/capture-website.ts --case rewrite` with no `--evidence-root`. The paid capture failed in its first session and printed:

```
[capture-website] failure evidence kept at /var/tmp/akr-1000/6855/cf6ffba4/run-xbf9lE/selected-page-rewrite-b9kL1n/failure-rewrite-2026-11-20T08-26-50-471Z/rewrite
```

After run-check exited, `run-xbf9lE` no longer existed, so the prep session's return and transcript were lost. A second paid run with `--evidence-root <scratchpad>` kept them and showed the cause.

## Location

- `src/run-check.ts`: `runRoot` is created with `mkdtempSync(resolve(ensureLeafTemp(repo, slug), 'run-'))` (:315), set as the child's `TMPDIR` in `constructedEnv` (:68), and removed with `rmSync(runRoot, { recursive: true, force: true })` when the run was not refused (:450), whatever the child's exit status.
- Wrapped driver: framework `capture-website.ts`, whose default evidence root is `mkdtemp(os.tmpdir())` (:1242).

## Reproduction

Run any capture driver that keeps failure evidence under `os.tmpdir()` through `akrogon run-check`, and have it fail. The printed kept path does not exist after exit. Seen 1 of 1.

## Expected behavior

Not provided.

## Urgency

A failed paid diagnostic run leaves only the stderr line naming the deleted path, so finding the cause costs another paid run. Workaround: pass the driver an explicit evidence root outside the run TMPDIR.

## Suspected cause

Supported hypothesis (agent): run-check scopes TMPDIR per run and deletes the run root on every non-refused exit, including a red exit. A child's "kept" paths under `os.tmpdir()` therefore live inside a folder the wrapper deletes.

Files read: akrogon `src/run-check.ts` (:62-68, :315-327, :450), framework `capture-website.ts` (:1241-1242).

Not inspected: whether any run-check path keeps the run root on a red exit, or other drivers with the same default.

Related reports: none covering it. Tamdoma/akrogon#49 (closed) introduced per-leaf TMPDIR and cleanup, which is related but a different defect. Searched Tamdoma/akrogon, all states: "run-check TMPDIR" (limit 10) and own reports since 2026-11-18 (limit 30).

## Source: operator 2026-11-20 door message

Chart it. Consultants: fable 5.2 medium and agy neon high. Think about it from the system's perspective how we can resolve it without destroying the other parts or ruining them. I want the simplest, most elegant solution. Full autopilot mode, even the signposts.

## Agent findings

- The seed holds no `## Operator decision` heading; nothing is locked.
- `learnings/LESSONS.md` already carries the same mechanism as "run-check drops kept evidence (2026-11-15)" (history `learnings/history/2026-11-15-run-check-tmpdir-drops-kept-evidence.md`, case framework #617). The uncommitted line "run-check tmpdir drops capture evidence (2026-11-20)" is a second line for the same cause; under the lesson rule's Match clause it would be a second case in the 11-15 history. The door does not edit that uncommitted operator-side change. A leaf that stops the mechanism retires both lines.
- Related handed-off or closed charts, none open: temp-release (leaf temp one folder under /var/tmp, deleted when tab gone), test-time-and-temp, run-check-fidelity, framework-temp-owners, check-evidence.
