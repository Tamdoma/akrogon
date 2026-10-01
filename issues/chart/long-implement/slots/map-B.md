# Slot B: independent territory map

Read 2026-10-01. No peer map read. No repo or live-seat mutation performed.
Paths: `K` = /home/ivan/Work/infra/akrogon, `F` = /home/ivan/Work/infra/tamdoma/framework, `L` = F/issues/open/emdash-cms/emdash-build/emdash-launch.

## Root cause and measurements

**F1. The intake numbers reproduce, but they measure phase residence, not active execution.**
From F/issues/log.jsonl:1243 records, pair each record with the next record for the same slug, charge the interval to the prior `to` phase. Completed intervals: implement 247, median 26.8m, p90 174.7m, 48 >120m (19.4%). check.fix 122, median 7.9m, p90 52.0m, 2 >120m. check.review 361, median 5.1m, p90 16.8m. The live launch repair is not in the completed check.fix sample. Repeated review-slot records count as separate intervals, so these are not unique phase entries or leaves.

**F2. A historical seven-hour repair is demonstrably parked, not seven hours of repair.**
blueprint-phase-split check.fix lasted 442.6m (F/issues/log.jsonl:105,236). Its named pi session has an assistant event at 2026-09-12 21:09:41Z, then no event until a user event at 2026-09-13 04:32:21Z, a 442.7m gap (session lines 213–214). This is an inactive session interval, with a user-triggered continuation. It does not prove that no detached process existed. A phase deadline would charge this residence too.
Session: /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-blueprint-phase-split--/2026-09-12T20-46-22-560Z_01a0975f-0760-71b3-8313-93b532a8b9a7.jsonl.

**F3. Another nine-hour implement is largely worker waiting.**
satellite-review implement lasted 567.7m (F/issues/log.jsonl:862,867). Seven gaps over 30m total 456.3m, each starts with `subagent_wait` and ends with its tool result. Those gaps are parent waits, not evidence the children were idle. The largest is 115m (session lines 119–120). Worker transcripts must be inspected before classifying that work as blocked or waste.
Session: /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-satellite-review--/2026-09-27T08-34-26-306Z_01a0e200-4f82-75a4-8712-ad752478f71d.jsonl:107–297.

**F4. Launch is active implementation plus expensive repeated integration proof.**
Implement: 10:44:31–14:21:20 UTC = 216.8m (F/issues/log.jsonl:1234,1242). In its pi session, 820 events between 10:44 and 14:21. Approximate adjacent call-to-next-event attribution: 54.0m worker waits, 103.8m shell calls containing `sleep`, 12.3m other tools. The rest is reasoning, command preparation and other events. These are mutually grouped parent intervals, not CPU time. Sleeps include background deployment and verification, not just idle time.
L/implementation/report.md:52–58 records static bringup ~10m, conversion ~15m, seven launch attempts ~8m each, first boot ~6m each. Nine live-discovered fixes landed (report.md:29–33). Final battery required three runs (report.md:98–103). No provider failures were reported (report.md:95).
Session: /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-launch--/2026-10-01T10-40-07-084Z_01a0f70c-cfac-7437-a9a0-f4ec47260613.jsonl:99–868.

**F5. Launch repair has not been parked during the alleged commit drought.**
Repair starts 14:32:27 UTC (F/issues/log.jsonl:1243). Sample through 17:02: about 150m, 313 session events, about 47.1m worker waits, 58.3m shell calls containing sleep, 22.3m other tools. Worker commits at 15:07–15:24 UTC, A commits at 15:30 and 15:31 UTC. Subsequent shell calls continue throughout the commit gap: bringup polling at session:1089, launch polling :1113, cron inspection :1149–1155 and :1189, first-boot polling :1187 and :1199. Commit absence is not absence of work.
The initial review found ten blockers, including missing CLI execution, stale revisions, wrong fixture expectations, incorrect media selection and incomplete live/spine proof (L/review-B.md:21–99). Passing unit tests missed real routes. Initial report admits C8 partial and C9 absent (report.md:76–86). Operator interruption explains the incomplete handoff, so do not infer intentional skill violation from it.

**F6. This is concentrated in consumer work, not a universal command-phase tax.**
Same completed implement measurement across other registered logs: akrogon 0/83 >2h, pi-extensions 0/21, data-pulls 0/7, boulevard 2/15, clinique 9/97, lens 0/3, Himne 0/4. lingua-relay and blepsis have no log file. These repos differ in scope and history. This comparison does not identify a causal model effect.

**F7. The remaining structural gap is unbounded work inside a counted repair pass.**
K/src/phase.ts:237–248 caps review-to-repair rounds. It sees neither worker retries nor repeated live proof before A returns. K/skills/implement-issue/worker-protocol.md:13–15 permits worker completion/mismatch reruns, :27 reruns red proof/checks after another repair brief. No explicit bound covers repeated owned-surface repairs. K/skills/implement-issue/SKILL.md:36 stops a criterion that cannot pass within owned surfaces, but launch's defects are mostly owned and repairable. A sequence of fresh owned defects can therefore keep one pass running indefinitely.
K/skills/watch-issues/SKILL.md:40 already reads every busy seat and acts on repeated identical failures or scope drift. A progressing sequence of different integration defects passes that rule. K/src/next.ts:193–224 is a notification, not a duration ceiling, and runs only on next paths (:393,451,495,560). Status age is phase residence (K/src/status.ts:123–130), not active work accounting.

## What the merged leaf-run-stalls work does and does not solve

**D1. Already addressed:** protected blocking checks and failed exit for unmeetable criteria, provider backoff and one dead-worker rerun, failed-state seat guard, dependency-consumption split audit. Sources: K/issues/chart/leaf-run-stalls/forks/red-criterion.md:35–38, provider-death.md:49–60, K/src/phase.ts:184–187, K/skills/implement-issue/worker-protocol.md:17–21, K/skills/chart-issues/SKILL.md handoff audit. emdash-conversion report at F/issues/open/emdash-cms/emdash-build/emdash-conversion/implementation/report.md:108–129 shows base-red stop then a green 901s full run.

**D2. Not addressed:** repeated live integration repairs inside one pass, parent waits on a slow but live child, expensive legitimate full proof, parked phase residence, unknown silent hangs. Launch explicitly had no provider failures. Applying the provider fix to this case would solve the wrong cause. Split audits help only when a dependent can consume a separately proven output. They cannot make a required full launch fixture optional.

## Material forks and recommendations

**Q1. Is two hours a guaranteed ceiling or a complaint about avoidable work?** Recommend reduce avoidable proof/repair loops first. Evidence does not establish that every valid leaf can implement, integrate, prove and merge inside two hours. A hard ceiling necessarily stops some correct ongoing work. If the operator means a literal guarantee, say so and challenge the no-clock lock explicitly. No non-clock mechanism can guarantee elapsed duration.

**Q2. Should the no-clock lock be lifted?** Recommend keep it for this first mechanism, but present its unavoidable consequence to the operator. For lifting: the unknown-hang exception is explicit (K/issues/chart/stuck-seat-recovery/forks/restart-hung-seat.md:20,29), and new intake complains about elapsed duration itself. Against: blueprint's parked interval and launch's active waits show why residence is a poor kill signal, a notifier does not shorten execution, and stopping/resuming can redo costly external effects. The notifier-retention correction remains binding (K/issues/chart/stall-notifier-removal/forks/delete-notifier.md:24–29). Neither a new alarm nor a watchdog is authorized by this map.

**Q3. Where should attempts stop?** Recommend one complete owned-defect repair pass per failed proof, followed by one rerun. A still-red proof ends `failed` with preserved evidence, without reset through a newly named remainder brief. Count against the logical proof/criterion, not command text, error spelling or worker identity. Reason: the current round cap misses this exact nested loop. The count is an attempt bound, not a size or elapsed gate, but its acceptability under existing locks needs an operator answer.

**Q4. May automatic recovery restart an exhausted proof?** Recommend exhaustion be terminal for watch recovery until the recorded cause is resolved. Otherwise K/skills/watch-issues/SKILL.md:39 can restart the same expensive pass twice before its unproductive-cycle bound, defeating Q3. Existing `failed` carries phase/reason. Prefer reusing it over adding another lifecycle phase. A skill-only instruction is probabilistic, so do not promise command-enforced attempt accounting without a separate contract.

**Q5. Must production cron waiting remain part of each fresh proof?** Recommend preserve any explicit deployed proof, but fix the verifier so its evidence target and termination are defined once. Cloudflare supports local scheduled-handler testing and says trigger changes can propagate for up to 15m. Local handler success does not prove deployed trigger delivery. Choosing it instead would change L/brief.md:71–82, so it is not a free optimization. Investigate why repeated live polling outlasted ordinary propagation before proposing a criterion change.

## Single proposed mechanism

**D3. Make criterion proof a finite repair operation.** Initial proof → one repair using the recorded failures → one rerun → success or existing `failed`, with artifacts and external state preserved. Apply the same boundary in implement and check.fix. A criterion gets no fresh allowance by spawning a new worker, changing a command or receiving another error. This closes nested reruns while preserving the existing review-round cap and failed lifecycle. Start with the criterion-proof/checks route, where the measured cost occurs, rather than inventing a general scheduler.

Cost: more failed leaves, some defects that would eventually be repaired must wait for a separate resolved cause, and watch recovery must respect exhaustion. It does not guarantee a two-hour merge, catch unknown hangs, bound one slow invocation or shorten genuinely large implementation. Those stronger promises require a clock or a smaller accepted scope. Do not turn this recommendation into an implementation contract until Q1–Q4 are settled.

## Practitioner questions and pitfalls

**R1. Does final-commit proof force repeated complete deploys?** L/review-B.md:23 and brief.md:82 require final-code evidence. Record which stages changed and reuse only valid unchanged proof, as K/skills/implement-issue/SKILL.md:54,56 already permits. Do not weaken same-code evidence silently.

**R2. Does a split reduce proof or duplicate it?** Launch C8 needs the full phase chain and C9 consumes C8 recordings (L/brief.md:71–83). Splitting arbitrary files or criteria may add cycles without freeing dependents. Ask which concrete output each dependent needs.

**R3. Who owns the defect, and has the proof been tested through its actual entry point?** Five exported functions passed unit tests but documented CLI invocations did nothing (L/review-B.md:37–43). Use the registered invocation as the proof boundary. Do not add another prose checklist when a functional test can catch that class.

**R4. Can stopping leave an open gate or fixture residue?** L/implementation/evidence/c8/C8-SUMMARY.md:13–21 records stranded-gate recovery, failed cleanup and home deletion. A forced stop needs external-state handling. The current watch forbids killing and phase-failing seats (K/skills/watch-issues/SKILL.md:47–55). A deadline is not a harmless wrapper.

**R5. Are we measuring post-fix performance?** Historical intervals precede today's merged changes. No before/after effect estimate is justified yet. Baseline metrics are exact residence counts, sampled activity attribution is approximate, and detached child work remains unclassified.

## Research tiers and limits

**S1. Operator:** brief-B.md's verbatim note and named intake, plus the three inspected lock charts/forks. These establish intent and authorization limits. Prior chart findings are historical evidence, not fresh proof that today's run has the same cause.

**S2. Primary code / measured result:** cited K command/skill lines, F log line pairs, L artifacts, local git commit times and session line references above. Consumer repo measurements are outside K but are explicitly named operator surfaces. No peer maps were read.

**S3. Primary external docs, read 2026-10-01:** [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) says changes may take up to 15m to propagate. [Setting Cron Triggers](https://developers.cloudflare.com/workers/examples/cron-trigger/) documents `wrangler dev --test-scheduled`. These separate handler proof from deployed scheduling proof. No remote probe was performed and no alternative proof is claimed equivalent.

**S4. Practitioner, read 2026-10-01:** David Challoner and coauthors, Google SRE, [Eliminating Toil](https://sre.google/workbook/eliminating-toil/), describe repetitive operational work and its automation cost. This supports eliminating repeated proof work rather than adding another manual operator alarm. It does not supply a two-hour agent limit or the proposed attempt count.

Searches run independently: `site.cloudflare.com scheduled workers cron triggers changes propagate 15 minutes wrangler dev test scheduled`; `site.sre.google workbook eliminating toil repetitive work bounded retries`. Q3's one-repair count is B's proposed policy, not a practitioner-proven optimum. No external claim rests on model recollection alone.
