# Quick-fix contracts, slot B

Blind picks: **1a, 2a, 3a**. Keep the CLI fix and the already-settled survival-test fix here. Drop transcript optimization on the measured cost, and let shared-rules own its opening read instruction once.

All measurements below were run/read 2026-11-10. No agents, paid calls, product changes or full test suite. I read Question/Carries and split Question/Taken, not either Findings section.

## Measurement basis

- EV1: Recent operational cohort: 2026-11-08T00:00Z through 2026-11-10T09:35Z. Searched the permitted Claude, Codex and pi transcript trees, using file modification time to select candidates and record timestamps to select events. Excluded the current factory-wins A session `1160556f-c628-4449-8d45-fa8fb6899642` and its subagents. Counted actual tool calls/results, not prose mentions or the survey's reproductions. The simple Bash/bash command census is a lower bound, not an exhaustive count of dynamically constructed commands or Codex script execution.
- EV2: In that cohort, **23 distinct tool results contain 25 explicit failed `--help` diagnostics**. Two results contain two failures. The results split into 15 on November 8 and 8 on November 9. The error paragraphs alone total 4,811 characters, excluding code frames and stacks. No time or dollar saving is inferred from that character count.
- EV3: Found **13 distinct actual reset boundary records**, deduplicated by their recorded timestamp, transcript and boundary, totaling **31,223,780 boundary bytes**. Also found 13 distinct turn-end records and 13 input-check records. A separate simple-command census found 14 reset launch attempts; attempts and confirmed boundary reads are different counts.
- EV4: `issues/timings.jsonl` has **27 implement/check.fix prompt events** in the same cohort, referencing 9 distinct non-null session paths, 8 available. In those available sessions I found four explicit cat/sed reference-read tool calls. One is demonstrably unnecessary: watcher-on-hc read worker-protocol.md despite its plan explicitly being serial-solo. Do not multiply every prompt by every reference's size and call the result observed waste.

## Q1: CLI help and input errors

### Pick and cost

Pick **1a**. The same declared option data should answer help requests and explain an unknown flag. It fixes a repeatedly observed discovery failure without adding a second handwritten interface description.

EV2 establishes actual recurrence outside this survey. One concrete call, at 2026-11-08T14:26:16.033Z, produced its tool result at 14:26:16.064Z: **31 ms observed command/result interval**, with 14 lines and 746 characters in the returned result. This is a single case, not a latency average or an estimate of operator attention. Help still requires a command after the fix, so the full interval is not saved time.

### Rejected options

- **1b:** A verb-list-only answer does not tell a caller the flags for `run-check`, `seat` or `verify`, which recur in the observed failures. It also leaves the same parser boundary throwing stacks for other unknown flags.
- **1c:** A handwritten usage line per verb creates another maintained copy. Reuse existing usage lines and declared flags instead. Do not add descriptions, examples or a new CLI framework in this fix.

### Evidence and research

**Better-than-training, checked:** `src/akrogon.ts` declares per-verb options and uses strict `parseArgs`. Root `--help` currently becomes the verb, then reaches the default usage error. Verb `--help` instead fails as an undeclared option. The measured example is in `/home/ivan/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-framework-withdrawn-link-halt--/2026-11-08T14-20-15-996Z_410892d1-6a27-41f9-b527-b4a89414a283.jsonl`, tool call `bash:0#249e1eeee69b432287ef4d212f9000f8`. Another result in the swap-candidate-reshare session `005a6ecb-4409-4170-8b7b-ffcdf0ffdb40` contains two help failures in one call.

**Operator contract, checked:** `issues/closed/issue-flow/issue-flow-report/brief.md`, What and Done-criteria, explicitly distinguishes `--flow --since <YYYY-MM-DD>` from `--cohort --since <iso>`. Keep both input types. One operational flow invocation found in the cohort used the valid date form. I found no non-survey bad-flow-date occurrence in this bounded census, so I claim no recurring cost for that subcase.

**Practitioner:** [Command Line Interface Guidelines, Help and The Basics](https://clig.dev/#help), by the Docker Compose co-creators and other CLI practitioners, recommends subcommand help, meaningful exit codes and separate output/error streams. This supports 1a's discovery behavior. It does not justify adopting the guide's additional `-h` or help-subcommand features here. [Node's parseArgs documentation](https://nodejs.org/api/util.html#utilparseargsconfig) confirms strict parsing already owns unknown/type-invalid option rejection.

### Pitfalls and what removes them

Keep help on stdout with exit 0 and the specified input errors on stderr with exit 1. Format only the known argument-validation errors at that boundary. Unexpected command/runtime errors still propagate. Do not catch the entire command dispatcher and turn product failures into usage messages.

Preserve `--` ownership: in `akrogon run-check --name proof -- tool --help`, the final flag belongs to the child command. Generate flags from the parser's declaration, retain existing public verb membership, and add no hand-maintained help registry.

### Practitioner question the fork does not ask

Does requesting help execute startup migration or command work? `migrateStateHome()` currently precedes argument handling. I would make the help/input-validation path finish before that work, and verify its non-mutating behavior through the existing CLI fixture. Help should not require a registered repo or a usable live session. Also settle mixed `--help` plus an unknown option explicitly rather than accidentally weakening strict rejection.

## Q2: Transcript reads

### Pick and cost

Pick **2a: drop it from this chart**. The additional frequency and latency evidence changes my earlier size-based recommendation. This is not a demonstrated source of meaningful delay, while suffix reading adds handling at the operator-input safety boundary.

EV3 gives confirmed frequency and actual boundary volume, not an estimate from the number of charts. A 200-iteration read-only warm-file benchmark on an actual reset transcript measured:

| Operation | Median | 95th percentile |
| --- | ---: | ---: |
| Current `transcriptEnd` on 4,328,919 bytes | 0.163 ms | 1.050 ms |
| `statSync(path).size` | 0.00045 ms | 0.00129 ms |
| Current `transcriptRecords` at recorded boundary 4,304,437 | 0.211 ms | 0.578 ms |

These are warm local measurements, not cold-I/O measurements or end-to-end reset time. I do not extrapolate them into a claimed project-time saving.

### Rejected options

- **2b:** It is the preferable implementation if this change ever earns scope: one existing metadata call can replace the full size read. But the measured cost does not currently justify another lifecycle change in this quick chart.
- **2c:** It adds positioned-read/short-read/handle-lifetime concerns to save another fraction of a millisecond in the measured sample. The operator-input refusal matters more than this unestablished performance benefit.

### Evidence and research

**Better-than-training, checked:** `src/transcript.ts` `transcriptEnd` and `transcriptRecords`; `skills/chart-issues/scripts/door-reset.ts`. Search command: `rg -n 'transcriptEnd|transcriptRecords' src tests skills --glob '*.ts'`. Door-reset is their only production consumer found. It takes one boundary before waiting, then performs one suffix check after turn end. It does not repeatedly reread the file while waiting.

Actual reset example: queued 2026-11-09T09:17:28.477Z, boundary 4,304,437, transcript `/home/ivan/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/bce7cb5d-3813-4e3a-9f53-83de348f8f34.jsonl`. Its recorded reset stages are visible in successor transcript `7fe29346-11d4-4350-9ece-79ad3d13e605.jsonl` in the same project folder. Benchmarks called the actual exported functions and `statSync` 200 times, timing each call with `performance.now()`, sorting samples and reporting the middle and 95th-percentile samples. A second 1,380,587-byte factory transcript measured 0.031 ms for size and 0.039 ms for an empty suffix.

**Operator source:** The field manual's chapter 15 calls for observing actual behavior and improving the whole system. **Practitioner:** [Google SRE, Simplicity](https://sre.google/sre-book/simplicity/) favors avoiding accidental complexity. My application here is restraint after measuring a small cost, not a claim that its authors prescribe these timings or this choice.

### Pitfalls and what removes them

The benchmark excludes filesystem-cache misses and may not represent every transcript. Preserve that limitation rather than upgrading a maximum file size into a bottleneck claim. Leaving the current reader keeps the already-established late-input semantics and agy step-index behavior intact.

### Practitioner question the fork does not ask

Has a real reset suffered observable latency, memory pressure or a read failure because of transcript size? None was established here. If one is recorded later, revisit the measured failure, with metadata-only 2b considered before a suffix-reader change.

## Q3: Owner of the reference-read correction

### Pick and cost

Pick **3a: shared-rules owns it**. That chart already owns the opening re-read rule. Fixing that same instruction here and rewriting it there creates unnecessary sequential edits and review.

There is a measured cost, but it is smaller than the historical word-stock estimate implied. EV4 identifies one confirmed serial-solo read of the **1,104-word worker protocol**. The combined two-reference size remains 2,035 words, but I did not observe both being unnecessarily read on that pass. Token and dollar cost were not measured.

### Rejected option

- **3b:** It can remove that unnecessary read earlier, but adds a separate contract edit for text the selected next owner will rewrite. The measured single occurrence does not establish urgency that outweighs keeping one owner.

### Evidence and research

**Better-than-training, checked:** At 2026-11-08T02:23:18.960Z, watcher-on-hc tool call `toolu_01EdZ1i4L9nwgLFm2pSv18LW` executes `cat ponytail.md worker-protocol.md`. It is in `/home/ivan/.claude/projects/-home-ivan--akrogon-worktrees-akrogon-watcher-on-hc/ef1784f4-8e0b-44b2-b66c-6713278ed1aa.jsonl`. `issues/closed/herdr-app/hc-doors/watcher-on-hc/plan.md`, Units and waves, explicitly requires serial-solo implementation with no workers. Other observed reference reads include delegated runs, so I did not classify them as waste.

**Operator contract, checked:** Split Taken assigns W7/W8 and the re-read rule to shared-rules. **Practitioner:** [Fowler's explanation of Beck's simple-design rules](https://martinfowler.com/bliki/BeckDesignRules.html) supports one maintained expression of a rule. Assigning this correction to that rule's existing destination is my application of it.

### Pitfalls and what removes them

Moving ownership must not lose the correction. Shared-rules must carry the actual contradiction: the opening blanket instruction versus Shared context's conditional reference reads. Preserve the delegation-point read, including repairs that delegate. Do not infer that serial-solo must read no implementation guidance, or claim that all historical serial plans incurred the full 2,035-word cost.

### Practitioner question the fork does not ask

What precisely transfers? The opening-reference contradiction and its conditional delegation contract, not a broad exemption from fresh phase reads. Name that bounded transfer in contracts Taken and the receiving chart so the same line has one implementation owner.
