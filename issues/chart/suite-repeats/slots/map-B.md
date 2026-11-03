# Seat B territory map

Read-only audit. Only this return file was written. No other seat's map was read.

## 1. Measurements

M1. Source window: issues/timings.jsonl, 2026-10-12T23:41:49.795Z through 2026-10-29T08:22:28.152Z. This is not a measurement of October 30–November 1. Checkout HEAD and origin/main both resolve to f7ddb69378c47af5feb978380fe1956e0fbfa1e1, measured with:

    git rev-parse HEAD origin/main
    akrogon config
    akrogon timing session-reads
    akrogon timing --cohort --since 2026-10-13T00:00:00Z
    akrogon flaky

The Python command at the end reproduces the principal tables and the receipt comparison. Additional Python stdin queries grouped the same JSONL records by date, leaf and review seat.

M2. Recent leaf window: first recorded plan.synthesis visit on or after October 26 UTC, through the last recorded event on October 29. All 12 such leaves have a merged log record. They are abandoned-capture-stop, copyfile-installs, cost-rules, durable-check-capture, fewer-repeat-calls, known-red-filing, new-chart-proposal, one-test-run, peer-pane-anchor, plan-condition-cases, slow-merge-notice and verify-pass-service.

The table partitions each completed phase visit into non-overlapping minutes. Concurrent checks are unioned, not added. “Seat other” means time after the first delivered prompt excluding measured checks and waits. It includes model work, tool overhead, unwrapped commands and other unrecorded time. It is not measured inference time or CPU. “Unknown” covers time after an unmatched check start when no other measured check explains that interval. “Dispatch” is the remaining pre-prompt time, including command orchestration in seatless merge visits.

| Phase | Visits | Median visit, min | Seat other | Checks | Named wait | Admission wait | Dispatch | Unknown |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| plan.synthesis | 12 | 14.68 | 140.86 | 3.79 | 0 | 0.005 | 4.55 | 0 |
| implement | 12 | 13.99 | 212.89 | 59.81 | 0 | 0.018 | 1.08 | 0 |
| check.review | 19 | 3.77 | 82.89 | 1.03 | 0 | 0.021 | 2.03 | 0 |
| check.repair | 10 | 8.63 | 66.41 | 30.42 | 0 | 0.023 | 2.48 | 0 |
| check.fix | 7 | 4.63 | 22.91 | 179.29 | 0 | 0.006 | 2.26 | 18.43 |
| merge | 12 | 1.27 | 2.98 | 16.42 | 1.09 | 0.004 | 0.17 | 0 |
| Total | 77 | — | 528.93 | 290.76 | 1.09 | 0.076 | 12.56 | 18.43 |

Total recorded phase time is 851.85 leaf-minutes. These minutes overlap across leaves and are not elapsed host time. Median total per leaf is 53.06 minutes.

The distribution matters more than the mean: fewer-repeat-calls alone contributes 277.99 phase-minutes and 196.86 unioned check-minutes. Removing that leaf from the comparison leaves 573.85 phase-minutes, of which 468.74 are seat other and 93.90 measured checks. This is a sensitivity check, not a reason to discard the expensive leaf.

M3. Check-name totals below use all check_end events since October 26, including checkout/direct work outside those 12 lifecycle leaves. They sum executions, so nested or overlapping wrappers can count the same elapsed interval twice. Do not add this table to M2.

| Check name | Completed runs | Summed seconds | Median seconds | Nonzero exits |
|---|---:|---:|---:|---:|
| test | 54 | 4,236.77 | 67.26 | 11 |
| test-retry | 3 | 617.58 | 244.64 | 3 |
| c5r-pair-head-8 | 1 | 475.91 | 475.91 | 0 |
| c5r4-pair-base-3 | 1 | 291.93 | 291.93 | 0 |
| c6-head-3 | 1 | 270.36 | 270.36 | 1 |
| typecheck | 55 | 138.68 | 2.30 | 2 |
| format | 50 | 119.18 | 2.11 | 4 |
| setup | 52 | 3.80 | 0.065 | 0 |
| Other ad-hoc names | 773 | 11,546.67 | — | — |
| Total | 990 | 17,700.88 | — | — |

These are execution labels, not a taxonomy of product defects. Some nonzero exits are deliberate red proofs. The five highest-cost names in this window are the first five rows. All recorded admission waits together total 5.815 seconds. By comparison, the October 13 onward check-start records contain 31,228.7 admission-wait seconds. Changes to admission and workload make the old total unsuitable as today's queue estimate. Sources: timing JSONL; src/run-check.ts:264; src/admission.ts:229.

M4. Existing reader has a concrete attribution defect. src/timing-report.ts:84 retains the last wait reason through subsequent prompts. However, src/timing.ts:102 treats a prompt as ending the prior wait when deciding whether to emit another wait event. In session-reads, a prerequisite event occurs at 13:58:50.857 and delivered plan prompts at 18:47:40.663 and 18:47:43.883 on October 24, with no later wait event. The CLI consequently labels the entire later 1h59m23s implement visit as prerequisite wait even while listing checks inside it. M2 instead resets wait on a delivered prompt.

The reader also reports missing check_end when a wrapped phase command finishes just after its own phase transition: src/timing-report.ts:150 requires the end to precede the phase boundary. In the recent 12-leaf window, 16 such boundary-crossing pairs plus one genuinely unmatched start would otherwise appear as 17 gaps. M2 clips completed pairs at the boundary. The unmatched c5r-pair-base-9 leaves 18.43 minutes unclassified after accounting for overlapping completed checks.

M5. Receipt comparison: since October 26, 35 fresh command executions had an earlier completed, setup-green result for the same tree, name and command text in the other scope. They comprise 13 test, 11 format and 11 typecheck executions, costing 930.931 execution-seconds. Two test executions were red: slow-merge-notice and peer-pane-anchor. The October 24 onward comparison is 44 executions, 1,655.490 seconds and three reds.

This is observed repeated work, not a guaranteed future saving. It includes retries that might disappear if the first fresh run disappeared. It also shows the quality tradeoff: a repeated same-tree run sometimes detects nondeterminism. Current restriction: src/verify.ts:203. Explicit lock: issues/closed/verify-waste/member-receipts/design.md, “Shape,” reuse key.

M6. Initial review seat time was reconstructed from the first delivered seat prompt to seat_done, or the final mover's phase-close timestamp. For the 12 recent initial reviews, A totals 43.24 seat-minutes, median 2.49; B totals 51.55, median 4.70. A finishes last twice, adding 8.96 minutes after B across the cohort. This is concurrent turn time, not additive lifecycle time. B has a fix verdict on every leaf where A has a fix verdict, but verdict agreement does not establish duplicate findings. For example, abandoned-capture-stop's “2026-10-28 check.repair / Repaired findings” records both A's startup visibility finding and B's publication race finding.

## 2. The post's nine items mapped to akrogon

| Ref | Post item | Applicability and measured cost now | Relevant surface |
|---|---|---|---|
| F1 | Default-runner queueing | Literal hosted runners do not apply. Local admission does. Recent recorded check waits total 5.815 seconds, not minutes per run. This excludes contention hidden inside commands. Do not buy runners from these figures. | src/admission.ts, awaitLineTurn and withAdmission; config full: [test] |
| F2 | Slow lint | Applies, but is small: format median 2.11 seconds, 119.18 seconds across 50 runs. No evidence that replacing Prettier is worthwhile. | issues/config.yaml checks.format; src/config.ts:402 |
| F3 | Slow typechecking | Applies, but is small: median 2.30 seconds, 138.68 seconds across 55 runs. | issues/config.yaml checks.typecheck |
| F4 | Unsharded tests / small machines | Test is the largest standard check: median 67.26 seconds, 4,236.77 seconds across 54 runs. Four-file parallel execution already exists. More parallelism conflicts with observed load failures. No CPU saturation or larger-machine comparison was measured here. | config checks.test; suite-time CHART “Forks taken”; host-run-load CHART “Landed” |
| F5 | Every test file reloads the application | Already partly addressed: configured Bun invocation uses --no-isolate. Test fixtures still spawn real CLI processes to prove lifecycle behavior. The separate startup/setup cost of those children is not recorded, so no seconds claim is justified. | config checks.test; tests/AREA.md “Non-obvious patterns”; fewer-repeat-calls report “Changes” |
| F6 | Slow setup, cache misses, clones, excess processes | Explicit verify setup is only 3.80 seconds across 52 runs. Printed standalone checks repeat setup, but verify sets up once and invokes raw check bodies. Copyfile installs already exist. Clone and child-start costs are not separately timed. Load remains relevant because custom proof names can launch raw full suites outside the full:[test] classification. | src/config.ts:396; src/verify.ts:496; src/run-check.ts:309; fewer-repeat-calls plan “Decisions,” C5 invocation |
| F7 | Jobs unnecessarily serial | Some apply, some are required. Plan/implement and review/repair have real dependencies. Independent implementation waves already run up to three workers. Verify's checks are sequential; parallelizing format and typecheck saves at most roughly the smaller ~2-second task per fresh pass. The larger avoidable candidate is a whole repeated scope pass, M5. | implement-issue “implement”; long-implement CHART “Forks taken”; src/verify.ts:543 |
| F8 | Full suite on every change | Strongest match. Before-review proof and merge proof can execute the identical standard test command on the identical tree because receipt reuse requires the same scope. M5 measures 13 recent test executions in that category. This is different from affected-test selection, whose framework chart remains held. | src/verify.ts:203; member-receipts design “Shape”; framework-test-scope CHART “Open forks” |
| F9 | No local checks before push | Already solved. Implementation and repair require verify receipts, and merge checks the rebased integration. Recent data has 52 verify runs with 156 command entries, eight reused entries. Adding pre-push hooks would duplicate an existing gate. | implement-issue “implement”; check-issue “check.repair”; merge-issue “Shared endings”; issues/verify-runs.jsonl |

The post's measurement principle transfers. Its listed fixes should not be imported as a package.

## 3. Material forks

D1. Should a configured check's green result carry from leaf scope into merge scope when the tree and command are identical?

- O1: Keep the scope distinction. It preserves a second opportunity to find flakes. Current observed price: M5.
- O2: Remove scope from green-command reuse eligibility while retaining scope on receipts and retaining merge's expected command set. A different integration tree or command still requires execution. This removes a restriction from an existing mechanism rather than adding a cache.
- Consequence: O2 accepts the existing “tree plus command determines result” assumption across scopes. It would have suppressed the two recent red test observations. Environment, time and AKROGON_BASE are already outside the documented command reuse key, so inspect the actual consumers before declaring scope immaterial in another repo.
- Lock reopened: member-receipts design “Shape,” explicit tree/scope/name/command key; check-reruns “Destination,” where proof is scheduled. The new evidence is M5's actual same-tree repetition. Recommend a narrowly scoped operator decision here first.

D2. Should ordinary call-reduction work also have to prove whole-suite comparative performance under concurrent load?

- O1: Keep those broader performance claims and pay for direct whole-suite evidence.
- O2: Specify the requested local outcome, such as fewer redundant external reads with unchanged freshness boundaries, and omit unrelated whole-suite comparative claims. Existing regression tests and configured checks remain. If whole-suite CPU or concurrency is itself the requested outcome, it still needs direct evidence.
- Removal: O2 deletes a demanded outcome and its repeated benchmark loop. It cannot retain the same assurance while silently reducing samples.
- Evidence: fewer-repeat-calls has 197.24 summed check-minutes and 277.99 phase-minutes. Its report “check.fix, 2026-10-26 — refresh, proof corrections and measurements” records repeated C5 batches, an operator amendment, and corrected CPU measurement. Its B review “Fixes” documents real missing/wrong evidence, not merely excessive reviewer demands.
- Locks: that leaf's brief “Done-criteria,” C5/C6, were explicit and must not be retroactively treated as unnecessary work. proof-cost “Forks taken” and paid-proof-bounds “Forks taken” already constrain proof expense. Apply this decision to the next brief, not by relitigating the closed leaf.
- Confidence: high that the cost exists; low on how much can be removed without dropping an operator-valued outcome.

D3. Should a re-check with only A-owned proof/test corrections skip an empty B repair turn?

- O1: Keep current routing and ownership.
- O2: Allow B's re-check to hand the already classified correction straight to A, retaining B re-review afterward.
- Evidence: fewer-repeat-calls second check.repair and abandoned-capture-stop second check.repair explicitly made no code, test, plan or commit changes and reused existing receipts. Their visit times were 92.180 and 91.544 seconds. No full-suite CPU was wasted in those two turns.
- Removal: O2 removes an agent turn but requires routing/transition changes in src/routing.ts:33 and src/phase.ts:458. Mixed product repairs must still remain with B, and fix-round accounting must not change accidentally.
- Lock: system-speed “Decisions taken overnight,” D3, rejects repair bouncing that changes test authorship. This narrower route does not give B test ownership, but reopens the surrounding lifecycle decision and requires explicit review.
- Recommendation: defer. 183.724 seconds across this cohort does not justify a new routing branch before D1 is settled.

## 4. Removal candidates and what still catches the failure

C1. Conditional, strongest: delete the scope-equality restriction from green-command reuse. M5 supplies the cost. Tree equality, exact command/name equality, completed setup-green evidence and the final merge receipt already catch changed code and missing configured checks. No existing deterministic check substitutes for the extra chance to see a flake. D1 must explicitly accept that loss. This is the only measured code removal I would advance now.

C2. Conditional: stop recreating broad concurrent-suite benchmark criteria for local call-count work. The existing boundary tests catch wrong outputs, missing fresh reads and stale identity reuse; configured test still catches regressions. They do not prove a whole-suite performance improvement. D2 removes that broader claim as well as its proof cost. It is a future brief simplification, not dead code currently available to delete.

C3. Low priority: remove pure handoff repair turns where the current reviewer has already established that every remaining Fix belongs to A. Evidence and residual checks are in D3. Existing A correction plus B re-check still catch the defect, but safe ownership selection is judgment, not text parsing.

Do not remove setup wrapping based on this audit: measured explicit setup cost is negligible, and the wrapper provides dependency readiness. Do not remove initial A review based on matching verdicts: M6 does not establish duplicate defect detection. Do not add a second timing store, an automatic slow-phase governor, an affected-test selector or another concurrency limiter. Current records identify the first candidate without them.

## 5. Pitfalls over the work's lifetime

R1. Incorrect attribution can send optimization toward the wrong phase. The session-reads example proves this today. Fix the existing wait interpretation and clip paired cross-boundary checks before using the reader to judge a policy. Keep unmatched spans unknown rather than assigning them to agent reasoning. Sources: M4.

R2. Nearly empty admission queues can coexist with heavy suite contention. Admission classification uses the supplied check name. The C5 plan runs raw configured test bodies inside custom-named pair commands, and those names are absent from full:[test]. Source: src/run-check.ts:309; src/admission.ts:93; fewer-repeat-calls plan “Decisions,” C5. The load proof intentionally asks for concurrent suites. Do not solve that contradiction with another universal permit. Remove the extra load claim when it is unnecessary, or acknowledge it as a distinct intentional experiment.

R3. Optimizing already closed work creates overlapping mechanisms. check-reruns owns scheduling, verify-waste owns receipt reuse, suite-time owns the current runner shape, leaf-speed owns timing and serial-solo work, and long-implement owns waves and wait-on-exit. Their “Destination” and “Forks taken” sections were read. Repair or narrow the existing owner instead of creating another optimization layer.

R4. Removing repeats also removes accidental nondeterminism detection. The two red cross-scope executions are direct evidence. Decide whether the lifecycle is meant to prove a deterministic tree or to sample flaky behavior. Do not preserve expensive repetition without naming that purpose, or claim equal quality after deleting it.

R5. A faster suite can hide a slower process. In the 11-leaf sensitivity set excluding the performance benchmark, measured checks occupy 93.90 of 573.85 phase-minutes. The residual is not proven waste. Sample actual session activity and review corrections before cutting a seat or rule. M6's A review costs and the distinct race findings are a concrete reason not to equate “two reviews” with “duplicate reviews.”

R6. Cohort results can be applied outside their contract. The local akrogon timing cohort command prints pass, but leaf-speed's “measure-and-revisit / Taken” locks a framework cohort and a specific operator decision. This local pass does not authorize leaves-as-chunks, and M4 can distort reported fixed cost.

## 6. Practitioner questions still missing

Q1. Is the objective shorter leaf latency, lower seat cost, lower host CPU, or fewer failed leaves? M2, M3 and M6 measure different things.

Q2. Is a same-tree second execution intended flake detection, or incidental repetition? D1 needs that quality decision.

Q3. How many rework minutes come from product defects versus proof-command corrections, absent recordings and wrong initial acceptance criteria? The fewer-repeat-calls review distinguishes them, but timing events do not.

Q4. Before accepting a performance criterion, how often will the optimized operation run, and what recurring saving would repay the proposed proof cost? Record a bounded estimate using existing plan proof sizing, not a new gate.

Q5. Which review findings would have escaped without each seat? Compare findings and consequences, not matching verdict words.

Q6. Is the operator asking to reconsider framework's held affected-test policy? This map does not reopen it by implication.

## Measurement command

Executed from /home/ivan/Work/infra/akrogon. This reconstructs M2/M3 and the October 26 M5 comparison without writing files. The earlier-window comparisons used the same grouping with the date marker changed.

~~~bash
python3 - <<'PY'
import json, collections as c, datetime as dt, statistics as st
from pathlib import Path
T=[json.loads(x) for x in Path("issues/timings.jsonl").read_text().splitlines()]
L=[json.loads(x) for x in Path("issues/log.jsonl").read_text().splitlines()]
V=[json.loads(x) for x in Path("issues/verify-runs.jsonl").read_text().splitlines()]
def ms(s): return dt.datetime.fromisoformat(s.replace("Z","+00:00")).timestamp()*1000
for r in T+L: r["_t"]=ms(r["ts"])
E={r["run"]:r for r in T if r["kind"]=="check_end"}
P={r["slug"]:r for r in reversed(T) if r["kind"]=="visit_start" and r["phase"]=="plan.synthesis" and r["ts"]>="2026-10-26"}
S={s for s in P if any(r["slug"]==s and r["to"]=="merged" for r in L)}
B=c.defaultdict(c.Counter); N=c.Counter(); D=c.defaultdict(list); per=c.defaultdict(c.Counter)
for s in sorted(S):
 ev=[r for r in T if r.get("slug")==s]; moves=[r for r in L if r["slug"]==s]
 for v in ev:
  if v["kind"]!="visit_start" or v["phase"] in ["merged","failed"] or v["_t"]<P[s]["_t"]: continue
  end=next((r for r in moves if r["from"]==v["phase"] and r["_t"]>=v["_t"]),None)
  if end is None: continue
  a,b,p=v["_t"],end["_t"],v["phase"]; N[p]+=1; D[p].append((b-a)/60000)
  prompts=[r["_t"] for r in ev if r["kind"]=="prompt" and r["outcome"]=="delivered" and r["phase"]==p and r["visit"]==v["visit"] and a<=r["_t"]<=b]
  first=min(prompts,default=b)
  starts=[r for r in ev if r["kind"]=="check_start" and r.get("phase")==p and a<=r["_t"]<b]
  runs=[(r["_t"],min(b,E[r["run"]]["_t"])) for r in starts if r["run"] in E]
  un=[(r["_t"],b) for r in starts if r["run"] not in E]
  q=[(max(a,r["_t"]-r["wait_ms"]),r["_t"]) for r in starts if "wait_ms" in r]
  ws=[r for r in ev if r["kind"]=="wait" or (r["kind"]=="prompt" and r["outcome"]=="delivered")]
  pauses=[r for r in T if r["kind"]=="repo_pause"]
  cuts=sorted({a,b,first,*[x for span in runs+un+q for x in span],*[r["_t"] for r in ws+pauses if a<r["_t"]<b]})
  for x,y in zip(cuts,cuts[1:]):
   m=(x+y)/2; w=[r for r in ws if r["_t"]<=m]; z=[r for r in pauses if r["_t"]<=m]
   reason="repo_pause" if z and z[-1]["pause"]=="on" else w[-1]["reason"] if w and w[-1]["kind"]=="wait" else "none"
   k="checks" if any(i<=m<j for i,j in runs) else reason if reason!="none" else "unknown" if any(i<=m<j for i,j in un) else "admission" if any(i<=m<j for i,j in q) else "seat_other" if m>=first else "unprompted"
   B[p][k]+=(y-x)/60000; per[s][k]+=(y-x)/60000
print("LEAVES",sorted(S))
for p,counts in B.items(): print("PHASE",p,N[p],round(st.median(D[p]),3),{k:round(v,3) for k,v in counts.items()})
print("TOTAL",{k:round(v,3) for k,v in sum(B.values(),c.Counter()).items()})
print("EXCLUDING_BENCHMARK",{k:round(v,3) for k,v in sum((v for s,v in per.items() if s!="fewer-repeat-calls"),c.Counter()).items()})
R=[r for r in T if r["ts"]>="2026-10-26"]
names=["test","test-retry","c5r-pair-head-8","c5r4-pair-base-3","c6-head-3","format","typecheck","setup"]
for n in names:
 rows=[r for r in R if r["kind"]=="check_end" and r["name"]==n]; values=[r["duration_ms"]/1000 for r in rows]
 print("CHECK",n,len(rows),round(sum(values),3),round(st.median(values),3),sum(r["exit"]!=0 for r in rows))
print("ALL_CHECK_SECONDS",round(sum(r["duration_ms"]/1000 for r in R if r["kind"]=="check_end"),3))
print("ADMISSION_SECONDS",round(sum(r.get("wait_ms",0)/1000 for r in R if r["kind"]=="check_start"),3))
logs={r["log"]:r for r in T if r["kind"]=="check_end"}; seen=[]; dup=[]
for r in V:
 if r["start"]>="2026-10-26" and r.get("setup")==0:
  for x in r["commands"]:
   earlier=[p for p in seen if p.get("end","9999")<r["start"] and p["tree"]==r["tree"] and p["scope"]!=r["scope"] and p.get("setup")==0 and any(y["name"]==x["name"] and y["command"]==x["command"] and y["exit"]==0 for y in p["commands"])]
   if earlier and "reused" not in x and "blocked" not in x: dup.append((r["leaf"],x["name"],logs[x["log"]]["duration_ms"]/1000,x["exit"]))
 seen.append(r)
print("CROSS_SCOPE",len(dup),dict(c.Counter(x[1] for x in dup)),round(sum(x[2] for x in dup),3),"red",sum(x[3]!=0 for x in dup))

PY
~~~

