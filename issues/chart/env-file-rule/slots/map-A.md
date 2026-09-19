# Map A · Tamdoma/akrogon#22 env file read/write by an implement seat

## Evidence (session log, values not printed)
- Every env touch was the pi `bash` tool, never `read`/`write`/`edit`: appends `echo "VAR=..." >> .env` (log lines 171, 254); inspections grep/tail/cat/sed -n/awk substr/python open('.env') (250-268); retries `sleep 60/90/45 && ...` (226, 234, 260). All credentialed API calls used `bun --env-file=.env` (85-284).
- So a tool-name deny list cannot catch it; only command-shape or output-value logic can.

## Destinations
1. pi-extensions (registered, /home/ivan/.pi/agent/extensions): a new extension with two hooks (extensions.md:798-875, pi 0.85.1):
   - `tool_result`: scrub every value loaded from the env file(s) out of any tool result before it reaches the transcript, replacing with `<VAR redacted>`. Value-based, so it covers cat/tail/awk/python/anything. Load the values from `.env` under cwd and the git common dir root at hook time.
   - `tool_call`: block bash commands that name an env file other than as `--env-file=<path>`, and block write/edit with an env path; return `{block, reason}` naming the rule and `akrogon phase <slug> failed --reason` as the way out.
2. akrogon skills (this repo): one sentence rule in the four phase skills and AREA.md: the env file is operator-owned; a seat loads it only through `--env-file`, never reads or writes it, and a missing value ends the attempt as failed naming the variable. This is the same two lines the handed-off leaf skills-never-ask rewrites (implement-issue:39, plan-issue:55), so it must run after that leaf, not alongside.

## Forks
- Q1 Redaction: A value-based scrub on `tool_result` (recommended: removes the class, no pattern to bypass) vs B pattern block only (bypassable, python open did it at log 268).
- Q2 Read/write block: A `tool_call` block on env-file mentions outside `--env-file=` plus write/edit paths (recommended; the seat gets an immediate reason and the fail path) vs B skill prose only (already failed once: the repo rule existed in CHART.md/EPIC.md).
- Q3 Which env files: A `.env` and `.env.*` except `.env.example`, in cwd and the repo root vs B configured list. Recommend A; example files carry no values.
- Q4 Placement: new issue folder `env-file-guard` (owner #22) with leaves `env-guard-extension` (pi-extensions) and `skills-env-rule` (akrogon, blocked-by skills-never-ask). Not folded into noninteractive-leaf-execution: different completion owner (#22).

## Practitioner questions
- Does the pi `tool_result` hook see bash output before it is persisted to the session jsonl? Needs a measurement: run pi -p with a hook that rewrites content and read the jsonl.
- Are secrets short enough that value-scrubbing gives false positives (a 3-char value)? Set a minimum length or scrub only non-trivial values.
- Does the hook fire for tool calls made by tamdoma-subagents children? Children are separate pi processes; the extension is global so yes if loaded there.

## Pitfalls
- Blocking `.env.example` reads would break plan steps that document variables; exempt it.
- The write block must not block `bun --env-file=.env`.
- The existing leaked line is not fixed by any leaf: operator step, delete the log or rotate; record as out of scope.
- The value scrub must not log the values it loads.
- The rule sentence lands on lines skills-never-ask rewrites; dependency, not a merge conflict.
