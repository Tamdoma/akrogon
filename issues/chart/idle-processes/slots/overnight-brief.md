# Overnight brief: why nothing moved (B and C, independent)

Write your answer to `issues/chart/idle-processes/slots/overnight-<your slot letter>.md`. Do not read the other slot's file. Do not change code, state, processes or files outside your answer file.

## Operator's statement (verbatim)

"Figure out what is blocking the memory and why everything failed overnight and hasnt moved like it should have. Everything worked 2 days ago before we started blocking, adding buses etc. The only thing we shouldve focused on is getting the tests not to waste so much CPU and optimizing them. Thisis a huge regression, setting up so many limitations, serial testing, etc."

## Window

2026-10-14 00:00 to 07:15 local (+02:00). Compare with how leaves moved on 2026-10-11 and 10-12.

## Questions

1. What held akrogon.slice memory above the 48 GiB admission limit (`src/admission.ts:42`, anon+shmem) for most of the night? Split it into real working memory and leftovers. Say where the shmem lived.
2. For each framework leaf that failed or stalled overnight, give the cause class: an akrogon limit (permit, admission, spacing, bus cut, scope, slice, serial-solo), host load, leaked leftovers, a seat behavior, or a real code or review finding. Use evidence.
3. Which changes since 2026-10-11 caused the regression the operator describes? Check at least: `2c3a0af` (leaf TMPDIR in /tmp/akr-<uid>), the run permit (`6968997`, `67c905f`, 10-13 12:46-12:52), the slice and scopes (`63ad6ea`, `f0c7f88`), the bus cut (`ebe23a7`), `df88689` serial-solo, and memory admission (`e1da855`, merged 23:50 10-13). Note that `/tmp` is tmpfs (RAM).
4. What should be removed or changed to get back to the 10-12 throughput while keeping the test-cost work (framework `issues/open/test-cost/`)? Name the smallest set of changes. Challenge my view below if the evidence says otherwise.

## A's working view (challenge it)

Memory admission counts tmpfs files in /tmp as memory pressure. Since 2c3a0af, every leaf's TMPDIR sits in /tmp, and framework tests leave temp folders there that only go when the seat ends. So shmem grew to 30-42 GiB of leftovers, admission stayed closed, foreground run-checks died at the seat's 600 s tool timeout, seats started bare runs around admission, and leaves failed on "admission never granted" or "host overloaded". The permit and admission are the regression. The slice and scopes cost nothing by themselves.

## Sources

- akrogon: `issues/timings.jsonl`, `issues/log.jsonl`, `issues/merge-attempts.jsonl`, `src/admission.ts`, `src/config.ts` (leafTemp), `git log --since=2026-10-11`.
- framework (`/home/ivan/Work/infra/tamdoma/framework`): the same three jsonl files, each leaf's `state.yaml` failure block and `review-*.md`, `akrogon status`.
- Live: `/sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service/akrogon.slice/` memory.stat and memory.events, `df /tmp`, `du /tmp/akr-1000`.

## Output format

Sections Q1-Q4. Each claim cites file:line, a jsonl line (timestamp plus field) or a command and its output. Mark low-confidence claims. End with a short list of what you disagree with in A's view.
