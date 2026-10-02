# Brief 2: capture pi fixture and pi incident excerpt (log-tail U2)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/log-tail-u2` (detached at `5bb552d`).

## 1. Goal

Produce two committed files under `skills/watch-issues/scripts/fixtures/`: `pi-session.jsonl` (verbatim fresh capture) and `pi-incident-excerpt.jsonl` (verbatim selected lines from a real incident log). Leaf done-criteria 1, 2 and 3 (pi parts). Plan D8, D9.

## 2. Numbered acceptance criteria

1. `pi-session.jsonl` is byte-identical (`cmp`) to a session log produced this run and contains `toolCall`/`toolResult` records: at least three `bash` calls with `arguments.command` `false` whose results end non-zero, one `echo done`, plus a `read` and an `edit` naming the scratch `note.txt`.
2. `pi-incident-excerpt.jsonl` contains, in order: source line 1 (the `{"type":"session",...}` header), then verbatim lines 8, 422, 461, 462, 485, 486, 487, 488, 684, 685, 686 of `~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-launch--/2026-10-01T10-40-07-084Z_01a0f70c-cfac-7437-a9a0-f4ec47260613.jsonl`. Proven by `cmp <(sed -n 'Np' SOURCE) <(sed -n 'Kp' excerpt)` per mapped line or an equivalent byte check.
3. Before commit, the `.env` absence check prints `clean` for the excerpt (command below). A hit blocks the commit: remove the offending line and recheck; never record or repeat the value.
4. The capture session (under `~/.pi/agent/sessions/--<scratch>--/`) and scratch cwd are deleted and confirmed absent.
5. Neither file is hand-edited.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Worktree `skills/watch-issues/scripts/observe.test.ts` — `mkdtemp` pattern reference.
- Incident excerpt source log (read-only): path above. Verified shapes: line 422/684/686 are `bash` `toolResult`s with `details.capture.termination {kind:"exit", exitCode}` and `isError` false; 461/485/487 are `edit` `toolCall`s with `arguments.edits[].oldText/newText`.

## 4. Change list and needed interfaces

Owns exactly `skills/watch-issues/scripts/fixtures/pi-session.jsonl` and `skills/watch-issues/scripts/fixtures/pi-incident-excerpt.jsonl` (both new). No code changes. Shared test resource: none. Land-first: nothing.

Pi log location: `~/.pi/agent/sessions/--<cwd>--/<ts>_<id>.jsonl` where `<cwd>` has `/` and other non-alphanumerics mapped to `-`. Record shape (verified live): top-level `{"type":"message", ...}`; calls are `message.content[].type === "toolCall"` with `id`, `name`, `arguments`; results are `role:"toolResult"` messages with `toolCallId`, `toolName`, `content[].text`, `details.capture.termination`, `isError`. First record is `{"type":"session"}`.

`.env` absence check (run exactly, it prints only `clean` or `hit <NAME>`):

```
bun --env-file=/home/ivan/Work/infra/tamdoma/framework/.env -e 'import {readFileSync} from "fs"; const f=process.argv[2]; const t=readFileSync(f,"utf8"); const hits=Object.values(process.env).filter(v=>typeof v==="string"&&v.length>=4&&t.includes(v)); console.log(hits.length?("hit in "+f):"clean")' skills/watch-issues/scripts/fixtures/pi-incident-excerpt.jsonl
```

(Note: `bun -e` shifts argv; pass the file path as shown — verify `process.argv[1]`/`[2]` once and use whichever holds the path.)

## 5. Do-not, reasons and exceptions

- Do not edit/patch either file post-capture: verbatim is the criterion. Exception: the `.env` hit case in criterion 3, which removes a whole line and rechecks.
- Do not open or print `.env` or `.env.*` with any tool; use only the `bun --env-file` check above. Exception: none.
- Do not copy lines beyond the listed set; keep the excerpt small. Exception: none.
- Do not commit under `issues/` or outside your owned paths. Exception: none.
- Return a mismatch with evidence rather than changing scope; exception is a revised brief from A.

These exclusions exist because verbatim provenance and secret hygiene are the acceptance bar; the only exception is a revised brief or the stated hit-removal case.

## 6. Ordered steps

1. `mktemp -d` scratch cwd; write `note.txt` with `hello`.
2. `cd` scratch; run `pi -p "Run the shell command \`false\` three times, one at a time, then run \`echo done\`. Then read the file note.txt and edit it to say bye. Reply with one word."`. Expect exit 0 and a new `~/.pi/agent/sessions/--<scratch>--/*.jsonl`. If no log appears or the run fails twice, return a mismatch with the output. If the session contains no `read`/`edit` calls, rerun once with a firmer prompt naming the tools before mismatching.
3. `mkdir -p` `skills/watch-issues/scripts/fixtures/`; `cp` the session log to `pi-session.jsonl`; `cmp` source vs copy. Delete the capture session file (and its session dir if empty) and the scratch cwd; confirm absent.
4. Build `pi-incident-excerpt.jsonl`: `{ sed -n '1p' SOURCE; sed -n '8p;422p;461,462p;485,488p;684,686p' SOURCE; } > fixture`. Verify each mapped line byte-identical and order preserved.
5. Run the `.env` check (section 4) on the excerpt; require `clean`.
6. `git add` both fixtures; commit `Add pi session fixture and incident excerpt for log-tail`. Return the commit ID.

Advisory size: 2 files, under 20 turns.

## 7. Commands

- `AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed="$AKROGON_BASE" --timeout=30000` at worktree root. No code changed; `nothing to run` is expected.

## 8. Done-when, evidence and report

Done when both files are committed, criteria 1-5 hold with pasted evidence (cmp lines, grep counts for `bash`/`false`/`echo done`/`note.txt`/`edit`, mapped-line byte checks, `clean` env output, ls-absence lines, capture command and `pi --version`). Note for the test file (return verbatim): pi version, capture date, exact capture command, and the excerpt's source path + line list.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
