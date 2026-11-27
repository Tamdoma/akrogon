# Brief: territory map for #164 (slots B and C)

Work blind: do not read another slot's map in this folder.

Intake: /home/ivan/Work/infra/akrogon/issues/chart/agy-tool-entry/INTAKE.md (whole).
Live surfaces in /home/ivan/Work/infra/akrogon: src/seat.ts (startSeat), src/tool-cgroup.ts (refreshToolEntry, real-bash resolution), src/run-check.ts (constructedEnv), src/verify.ts (launchPass), tests/isolation.ts, tests/tool-entry.test.ts, tests/tool-entry-tracing.test.ts, and any other test that spawns bash with AKROGON_SEAT_CGROUP or inherits PATH.

Task: map where the fix belongs and what each option breaks or invites later. Candidate places: (a) the test's own env (reference run without the entry dir on PATH), (b) tests/isolation.ts for all tests, (c) run-check and verify stripping the entry dir from PATH for checked runs, (d) seat wiring (how agy gets the wrapper). For each: what removes the whole problem class (seat-only wrapper leaking into child checks), what it breaks (a check that legitimately needs the wrapper, claude seats, land runs), and the cheapest proof (a test that is red with the entry dir on PATH and green after). Name other tests with the same exposure. Recommend one shape with reason and cost. Ground claims in path and function names. Under 60 lines. Do not edit code.

Reading rule: read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges.

Write to /home/ivan/Work/infra/akrogon/issues/chart/agy-tool-entry/slots/map-<your slot letter lowercase>.md, then run `hc send t126 "done <your slot letter>: <return path>"`.
