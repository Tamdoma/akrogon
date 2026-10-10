# Main health: independent territory map, slot B, 2026-10-10

## Position

**D1: Give baseline health one owner, with shared evidence, explicit freshness and a recoverable wait for affected leaves.** This is the strongest leverage point for repeated base discovery and failed recovery. It removes the duplicate-work path in #76 and the stale-evidence path in #77. It does not repair the two consumer defects, enforce host capacity or make elapsed-time notices run during event silence. One mechanism does **not** remove most of these six seeds. A periodic observation pass could host both health reconciliation and busy-seat observation, but those remain different sensors and decisions.

**D2: Do not start by running another full framework:verify after every merge and root install.** The merge already tests its top before pushing it (`akrogon/skills/merge-issue/SKILL.md:41-45,51`). Repeating an equivalent green run increases heavy-run inflow. Carry applicable tested-top evidence to the pushed baseline, and run missing or invalidated checks once. A root-checkout result is not automatically equivalent to a leaf result: the supplied C8 evidence varies by ancestor visibility (`issues/open/merge-gate/cheap-checks/review-B.md:51`; worktree-isolation/forks/boundary.md:30). After the isolation locks land, an unrelated root install should cease being an input to leaf health, rather than remain a permanent trigger.

**D3: Preserve a route for fixing the baseline.** Hold affected verification and normal merge admission, not every planning or repair activity. Keep human pause separate from automatic health holds. Today pause is a repo boolean (`akrogon/src/pause.ts:48-53`), automatic dispatch returns before busy observation when paused (`akrogon/src/next.ts:659-667`), and failed leaves require phase recovery (`:674-676`). Reusing pause as the entire health mechanism would neither preserve the failed leaf's recovery contract nor guarantee observations continue.

Paths prefixed `akrogon/` below refer to `/home/ivan/Work/infra/akrogon/`. Framework paths are relative to this repository. This is read-only research and proposed decisions, not implementation or a claim that main was tested here.

## Evidence and current limits

- **E1, observed records:** `issues/log.jsonl:2318,2320,2323,2332` records four leaves stopping with blocked base failures. `:2327-2330` records manual recovery, and `:2333-2334` records cheap-checks/fail-fast stopping again. Failure notifications actually have `delivery=shown` in these records. The precise gap is no shared baseline incident/recovery, not literally no leaf notification. The notification implementation names the failed leaf (`akrogon/src/phase.ts:87-110`).
- **E2, code and skill:** Implement and review independently run detached-base comparisons and stop on actual base reds (`akrogon/skills/implement-issue/SKILL.md:43`; `check-issue/SKILL.md:63`). Review explicitly reuses existing artifacts/unchanged evidence (`check-issue/SKILL.md:25,61`). Fail-fast says it reused terminal saved logs (`issues/open/merge-gate/fail-fast/review-B.md:26-30`), and cheap-checks explicitly reused its prior verification after recovery (`cheap-checks/review-B.md:84-86`). This confirms #77 for both artifacts, beyond the seed's timing inference.
- **E3, existing actuator:** Merge has a repo-wide hold with SHA, command, attempt and evidence (`akrogon/src/hold.ts:10-18`). A merge base-red call creates it and notifies (`phase.ts:844-877`). The merge pass suppresses another attempt when main is equal outside record folders unless the nominated fix holds the turn (`next.ts:1044-1049,1062-1066`), and hold-fix currently requires a leaf already in the merge queue (`hold.ts:90-99`). This is a useful existing mechanism, not a complete pre-merge health owner.
- **E4, sensor limits:** Dispatch preflight validates remote/reference existence (`akrogon/src/preflight.ts:62-71`), not command health. Allocation counts active leaves associated with live panes, not running heavy commands (`next.ts:336-367`). Setup flock covers the install, then releases before the command (`config.ts:256-267`). Merge pressure snapshots are recorded (`attempts.ts:12-24,47-65`), but this inspected path does not use pressure to admit heavy checks.
- **E5, observer:** Busy notification starts from a recorded busy episode, checks a 60-minute threshold and fires once (`akrogon/src/next.ts:227-258`). Its dispatch call observes existing seats before dependency blocking (`:663-695`), so a dependency-blocked leaf is observable **if next is invoked**. The watch observer merely prints busy age and notified seats (`akrogon/skills/watch-issues/scripts/observe.ts:225-250,273-288`). It does not invoke the notification decision. An event-driven pass has no finite detection delay during total event silence.
- **E6, expensive work and partial coverage:** Framework's full verify runs fast then core with no-exit-on-error (`package.json:162-166`), while configured leaf checks are narrower than merge verify (`issues/config.yaml:8-18`). Spawn-deadlines records a 15.5-minute full run, whose sole failed stage was motion-probe, followed by the targeted base command (`issues/open/merge-gate/spawn-deadlines/implementation/report.md:45-52`). Do not turn every baseline report into another complete broad run or interpret a green selftest as a green framework:verify.
- **E7, newer repair evidence:** Page-measure-full-id now reports a motion-probe repair: tab activation plus polling, with hidden-tab IntersectionObserver delivery identified as the mechanism (`implementation/report.md:9-11,48-50`), and a green full verify at head 4584cf7cb (`:30-44`). This supersedes the intake's wholly undiagnosed cause for research purposes, but remains reported branch evidence. Read-only Git calls show current local HEAD and origin/main at 5cb74c3c6002f12a5d463e5728dd5763cd828188, with 4584cf7cb not its ancestor. No fetch or independent test ran here. The branch result used a different recorded Bun revision from the older failing run (`page-measure-full-id/implementation/report.md:43`; `spawn-deadlines/implementation/report.md:45`). Do not silently transfer it to another revision or declare it landed.
- **E8, locked/parallel ownership:** External worktrees and ancestor guards are Taken (`issues/chart/worktree-isolation/forks/boundary.md:28-30`), along with exact binary loading and fresh installing fixtures (`forks/binary-boundary.md:28-30`). Merge-gate is handed off, with merge-only lock/selected-seat checks and fail-fast already chosen (`issues/chart/merge-gate/CHART.md:10-14,29`). These are constraints and work in flight, not features to redesign in this chart.

Evidence tiers: operator notes and imported seeds are supplied intake, not independently verified incidents. E1/E2 are saved execution records and inspected contracts. E3-E6 are primary code/skill inspection. E7 mixes reported branch proof with actual read-only Git calls. Proposals and causal-loop interpretation below are judgment. All checked 2026-10-10. No external practitioner claim is needed to establish these local mechanisms.

## Stocks, inflows and outflows

| Stock | Inflow / change | Outflow | What is observed |
|---|---|---|---|
| **S1: Usable integrated code** | Accepted changes can improve behavior or introduce defects. Outside installed state can change observed behavior without changing code. | Fix-forward repairs restore required behavior. | Baseline execution under the applicable inputs, not merge count. C8's outside-state path and the reported motion repair show different causes (E2/E7/E8). No evidence here establishes that recent merges introduced both failures. |
| **S2: Applicable verification evidence** | Completed commands add evidence for a commit, scope and execution conditions. | Code, check definition or material-input changes invalidate applicability. Old logs remain history. | Current skills record base/head and terminal evidence, but artifact reuse let an earlier environment failure survive recovery (`check-issue/SKILL.md:49,63`; fail-fast/review-B.md:28; cheap-checks/review-B.md:86). |
| **S3: Waiting and failed leaf work** | Base reds move productive leaf work to failed. | Manual phase recovery currently returns it to review. | Four initial stops, recovery and repeat stops in E1. `next.ts:674-676` does not automatically recover failed leaves. |
| **S4: Verification work queued/running** | Leaf checks, independent base comparisons, review reruns and merge checks consume host capacity. | Completed or terminated processes release capacity. | Active leaf count is a weak proxy for this stock (`next.ts:336-367`). Pressure is recorded, not an inspected capacity admission rule (E4). |
| **S5: Operator attention and recovery backlog** | Per-leaf failures and repeated recovery attempts create action items. | One owned incident, an assigned repair and valid recovery can clear them. | Leaf failure notices exist (`phase.ts:87-110`), but base-red leaves share no incident identity in the cited flow. Busy notices depend on observation calls (`next.ts:230-258`). |

Time and compute are consumed flows, not reusable inventories of green results. Failed verification does not by itself destroy code. It consumes capacity and moves work into an unusable state. Count unique baseline incidents, duplicate verification minutes, affected waiting leaves and time to valid recovery rather than counting every red leaf as a new defect.

## Reinforcing loops

- **L1: Repeated discovery increases wasted work.** One base defect causes multiple independent leaf/base comparisons, each stops its leaf, and later recovery can produce another stop without new evidence. The repeated stops and saved-evidence reuse are observed, not hypothetical (E1/E2). A shared applicable baseline result cuts this inflow at its source.
- **L2: Host contention can multiply verification.** More overlapping heavy commands can cause timing/resource failures, which cause comparisons or repairs, which add commands. Command fan-out and leaf-count admission are inspected (E4/E6). The causal link from peak load to each reported flake is still partly inferred: selected-check records load averages and rerun outcomes (`implementation/report.md:26,31-33`), but a green standalone rerun is not proof that every earlier failure was load-caused. A health monitor that adds broad runs can strengthen this loop.
- **L3: Evidence reuse can make recovery ineffective.** Old red evidence blocks a recovered leaf, the operator retries phase recovery, and the reviewer reuses that same evidence because the code is unchanged. E1/E2 establish this cycle. Include execution-input freshness and recovery intent, not only a code diff, in reuse decisions.
- **L4: Delay lets unnoticed work continue.** A busy seat continues consuming time while no observation invokes the notification rule. More commits or log activity need not mean progress toward a criterion. Busy status and threshold logic measure an episode, not criterion completion (`next.ts:220-258`), and observation prints that state without evaluating the rule (`observe.ts:236-288`). #78's exact four-hour cost remains supplied intake rather than a newly measured run.

## Balancing loops, sensors and delays

| Loop | Sensor and corrective action today | Does it measure the target? | Delay |
|---|---|---|---|
| **B1: Leaf verification** | Required check exits block a leaf. Base comparison attributes an unexplained red (`check-issue/SKILL.md:59,63`; implement-issue/SKILL.md:43). | Measures that run's configured scope and conditions. It does not continuously measure main or all merge checks. | Until a leaf reaches checks, then check plus base-run duration. E6 shows 15.5 minutes for one broad run, not a universal delay. |
| **B2: Merge hold** | Completed base-red comparison holds the repo's merge attempts and allows a nominated fix (`merge-issue/SKILL.md:73`; hold.ts:85-99). | Good evidence for that baseline command. SHA/content movement releases eligibility, but does not itself prove health; unchanged code cannot reveal an outside-state repair. | Until a merge attempt detects it, with no guaranteed periodic observation. |
| **B3: Seat allocation** | Active leaf count refuses new tabs at max_active (`next.ts:336-367`). | Measures active leaves, not simultaneous heavy check cost or available memory/CPU. | At allocation only. Existing seats may all start checks later. |
| **B4: Failure announcement** | A failed phase emits a leaf notice and records delivery (`phase.ts:87-110`). | Measures a phase failure. It does not consolidate one underlying baseline incident across leaves. | On failure handling. Main can already have been unhealthy for multiple leaf runs. |
| **B5: Busy notice** | Busy episode over 60 minutes emits one notice (`next.ts:227-258`). | Measures continuous observed busy time, not phase age or lack of progress. Phase changes retain busy timestamps except failed/merged (`phase.ts:152-153`). | 60 minutes plus time until the next observation. Unbounded during event silence. |

The proposed main-health loop must observe a completed check against the target baseline and declared inputs, hold only affected work, notify once per incident, route a repair, remeasure after repair, invalidate superseded evidence, and release its own waiters. A notification alone closes none of those steps. A running, crashed or incomplete check is unknown, not a demonstrated base defect.

## Material forks, in useful order

### F1: What is health evidence about, and who owns it?

**O1a, recommended:** One repo-owned baseline evidence record and one active validation per applicable baseline/check/input identity. Include completed exit/terminal result, logs, actual baseline, command/scope, runtime and declared material inputs. Separate unknown, running, green and proven red. Publish from implement/review/merge after attribution, rather than reparsing free-text reasons as machine truth. A leaf still needs its own head/diff judgment. Reuse is limited to equivalent conditions, including recovered execution state.

**O1b:** Commit-only green/red flag. Simpler but repeats #77 when the same SHA's environment changes and mistakes partial checks for whole-main health (E2/E6).

**O1c:** Keep independent leaf discovery with a better notice. Small change but retains the repeated full-run inflow and failed-leaf stock (E1/E2).

Practitioner question: which conditions are declared and reproducible enough to permit reuse? Avoid either hashing arbitrary machine state or assuming a lockfile captures every runtime input. Respect worktree-isolation's Taken boundary (E8).

### F2: Where does a base-blocked leaf wait, and how does it return?

**O2a, recommended:** Preserve its work, phase/head and incident dependency in a recoverable health wait. Release only waiters for a freshly applicable green result. On return, rerun the previously red leaf check as needed and preserve its normal review/merge requirements. Old results remain history. Unrelated failures never auto-resume.

**O2b:** Keep failed, automatically phase-move every blocked leaf when main changes. Risks reviving credential/operator failures and using commit movement as health proof. Today's failed reasons include general blockers (`check-issue/SKILL.md:27`), while recovery clears failure metadata (`phase.ts:151`). Recovery needs a specific recorded cause, not the string “blocked.”

**O2c:** Use repo pause. It blocks automatic dispatch before observation and conflates operator intent with health (`next.ts:659-667`; pause.ts:48-53). It can also prevent the repair that would reopen work.

Practitioner question: can the existing merge hold be extended without losing its nominated-fix path, or does pre-merge waiting need a distinct record? Current hold-fix admits only merge-queued leaves (hold.ts:97-99). Select this before choosing scheduler details.

### F3: What keeps the balancing loops running without adding broad work?

**O3a, recommended direction:** Events update known results promptly, plus a lightweight periodic reconciliation independent of dispatch eligibility. At most one applicable baseline validation runs, with an explicit owner and cleanup. Reuse exact pushed-top proof when applicable (merge-issue/SKILL.md:43-47). The periodic pass observes deadlines/unknown ownership, not an unconditional suite run. It could invoke busy observation for #78, but that is an explicit additional outcome.

**O3b:** Full verify after each merge and root install. Adds execution cost, can compete with existing work, and still misses silent external changes. Post-merge duplicate cost is especially hard to defend given pre-push verification (E6; merge-issue/SKILL.md:41-45).

**O3c:** Only existing next hooks or an operator watch. Lowest infrastructure cost, but cannot guarantee a detection delay during total silence (E5).

Practitioner questions: what detection delay is acceptable, what owns restart after the observer crashes, and how does unknown state progress instead of permanently freezing normal work? Do not start a new service before establishing that existing scheduling can own the small pass.

### F4: Is heavy-check admission in this scope?

**O4a:** Host-wide admission for actual heavy commands, including baseline validation, with bounded queues and crash release. This directly addresses #69's mechanism. It needs coverage of the invoked commands, not only seat dispatch.

**O4b:** Retain merge-only serialization and reduce duplicate baseline runs first. Smaller health change, but explicitly leaves #69 partially open. The merge-only lock/selected-seat approach is already Taken in merge-gate (CHART.md:14).

**O4c:** Lower max_active. Slows non-testing work and remains a proxy for heavy command concurrency (next.ts:336-367). Do not call it a complete capacity controller.

Practitioner questions: which measured resource constrains useful concurrency, and does a single health run consume the same admission budget as leaf/merge checks? Avoid an adjustable queue policy without measured need.

## Coverage and proposed destination split

| Intake seed | Shared baseline owner + freshness + health wait | Remaining owner/outcome |
|---|---|---|
| **C1: framework#220 motion mismatch** | Consolidates discovery and prevents repeated base runs. Does not repair it. | Framework. Inspect the already-reported page-measure-full-id repair before drafting duplicate work (E7). |
| **C2: framework#221 dependency lookup** | Can report an affected baseline condition, but a root result may miss a nested-leaf condition. | Existing worktree-isolation chart, whose structural locks remove the path (E8). |
| **C3: akrogon#69 heavy overlap** | Reduces redundant load. Does not enforce capacity. | Separate check-admission outcome if selected, respecting merge-gate's lock decision. |
| **C4: akrogon#76 repeated base stops** | Direct coverage through shared evidence, incident wait and automatic specific recovery. | Akrogon health/recovery implementation and consuming skills. |
| **C5: akrogon#77 stale recovery evidence** | Direct coverage only if input changes/recovery invalidate applicability and require new evidence. | Same akrogon contract as C4. A notification-only monitor does not cover it. |
| **C6: akrogon#78 silent busy duration** | No coverage from health results alone. A shared periodic wake can run its separate observation rule. | Small independently checkable akrogon observation outcome. Decide busy episode versus phase/progress notice before implementing. |

Resolve F1/F2 first together because evidence identity determines safe release. F3 supplies liveness for that contract. Capacity admission and busy observation can be separate leaves/outcomes in akrogon, not a general monitoring rewrite. Framework defect repair and already-charted isolation need no artificial dependency on a new monitor. If health reuse assumes the new isolation boundary, that assumption becomes an explicit rollout dependency. File overlap is not a reason to serialize independent outcomes.

## Lifetime pitfalls and removal

- **R1: A monitor certifies the wrong checkout or partial scope.** Validate in the same declared isolated execution conditions and retain per-command coverage. Never infer whole-main green from one passing selftest (E6/E8).
- **R2: Two reporters publish conflicting or obsolete health.** Make publication conditional on the identity actually tested. A result for an older tip/input epoch remains historical and cannot release current waiters. Preserve logs and completion status.
- **R3: Held work includes its own repair.** Keep an explicit fix route. Existing merge hold has one, but requires merge eligibility (hold.ts:85-99). Do not apply a blanket pause before designing recovery.
- **R4: Human pause is undone by an automatic green result.** Release only health-owned holds. Pause is independent stored operator state (pause.ts:48-53), and unpause does not erase merge hold (akrogon.ts:127-136).
- **R5: New monitoring increases load and creates more reds.** Reuse applicable merge proof, consolidate equivalent baseline checks, and use the selected host admission mechanism if F4 chooses one. Do not poll by repeatedly starting full verify.
- **R6: A crash leaves running/unknown health forever.** Require an owned validation attempt and a reconciliation rule for lost ownership. Preserve incomplete evidence without classifying it as a code defect. The current base-run rule already distinguishes incomplete termination (check-issue/SKILL.md:63).
- **R7: Progress notices become a second timeout policy.** Busy age is not criterion progress. A notice should name phase and elapsed basis, without killing live proofs or approving incomplete work. Current busy notice lacks phase in its text (next.ts:252).
- **R8: The intake becomes stale while forks drain.** E7 already shows a repair candidate that the seed did not know. Check its actual landing and tested runtime before deciding new framework work or claiming recovery. This map deliberately makes no current green/red claim from an old log.

No installs, phase moves, notifications or test runs were performed. The only persistent write is this return file.
