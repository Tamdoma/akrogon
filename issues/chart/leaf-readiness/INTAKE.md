# Intake: leaf-readiness

## Scope
Destination akrogon: leaves learn every external input they need before dispatch, seats see the same env as the registered checkout, live-change approval is given once, and blockers are recorded without tripping deny rules. Framework emdash inputs are operator steps, not leaves.

## Provenance
- GitHub: Tamdoma/akrogon#52
- Operator: 2026-10-02 chart-issues open

## Source: Tamdoma/akrogon#52
# Leaves repeatedly fail mid-run on missing credentials, token scopes and external inputs (emdash-cms epic)

Source: Tamdoma/akrogon#52
URL: https://github.com/Tamdoma/akrogon/issues/52

Unverified intake.

## Observation

The operator reports that, across the `emdash-cms` epic and its prerequisite epic `landing-multi-offer` (consumer repo `Tamdoma/tamdoma-framework`), leaves keep stopping on Cloudflare API access, missing API keys and other external inputs. The operator then adds the key and the leaf moves on, but the next leaf hits the same class of problem. Their intent: these blockers should no longer arise in the middle of a leaf, especially around creating and providing API keys.

A read of every leaf's `report.md`, `plan.md`, reviews and evidence, plus `issues/log.jsonl`, found:

- Credential, permission and config gaps caused 15 of the 22 `failed` transitions, about 4.5 h of failed-state time (~72% of all failed-state time).
- About 8 h more went to waiting for approval of a live run.
- `emdash-offer-join` was blocked at the time of writing until the operator added inputs by hand.
- Each leaf found its gap on its own, mostly during live steps, review or merge, not at plan or dispatch time.

### Incidents (UTC)

| # | Leaf | Phase | Missing thing / error | Found at | Failed time |
|---|---|---|---|---|---|
| I0 | epic chart probe | before leaves | Cloudflare 403 on billing, alerting and observability reads. KV create returned `10000` (no KV Storage Edit) | chart probe | not logged |
| I1 | offer-join-deploy | implement | No test hub inputs: `deploy.yaml`, `offers.yaml`, `form-access-key.txt`, `deploy-accounts.yaml` | live run | 85 min |
| I2 | offer-join-deploy | implement | `GET /zones/{id}/dns_records` returned `10000 Authentication error`. Token lacked Zone DNS and SSL Read | go-live | 4 min |
| I3, I4, I5 | emdash-kit, emdash-conversion, emdash-launch | review / fix / implement | `.env.example` vs secret-env index drift (`verify-secret-env-index`) | verify | 17 + 66 min, plus one rerun |
| I6 | emdash-launch | check.review / check.fix (4 failed transitions) | Cloudflare, R2, GitHub and domain changes not authorized | review | ~8 h until approval |
| I7 | emdash-launch | cleanup | R2 bucket 409 "not empty" with 0 objects. `gh` lacked the `delete_repo` scope (HTTP 403). The registry token could not see a personal-account repo | cleanup | 2 rounds |
| I8 | emdash-fleet-backup | plan.synthesis | Presence check ran against the worktree, which has no `.env`, so every name read "absent". Two names really were missing. User linger was off | plan | 67 min |
| I9 | emdash-fleet-backup | check.review | `requireClean` rejected an uncommitted operator edit to `.claude/settings.json` | review | 1 min |
| I10 | emdash-fleet-backup | check.fix (3 failed transitions) | Claude Code deny rule on `.env` command text blocked the documented `bun --env-file=.env` pattern | live re-proof | 8 min |
| I11 | emdash-fleet-backup | merge | merge-issue forbids reading `.env.*`, but the repo's verify reads `.env.example` | merge | 15 min |
| I12 | emdash-fleet-backup | check.fix | Fixture repo `.env` lacked the required names, and the seat cannot write `.env`. Cleanup blocked by the missing `delete_repo` scope and a 30-day R2 lock | live repair | still open |
| I13 | emdash-offer-join | check.fix | `TAMDOMA_EMDASH_HUB_HOSTNAME` absent and no real `deploy-accounts.yaml`. The plan deferred it ("The design gives no variable name"). The seat tried four times to run `akrogon phase … failed --reason "… absent from .env …"`. Each was denied because the user deny rule `Bash(* .env*)` matched the reason text, so the seat sat idle and kept re-asking | plan deferred, found at live step | still open |

### Repeated patterns

- **P1. `.env.example` / secret-env index drift: 4 leaves.** Main was fixed only after two leaves had failed on it.
- **P2. `.env` deny rules: 3 incidents.** The rules blocked the documented `bun --env-file` check, and the failure reason text itself. They were narrowed twice, separately, on two branches.
- **P3. No `.env` in worktrees: 5 leaves.** Akrogon creates worktrees with plain `git worktree add` (`src/next.ts:264-269`) and seats start inside the worktree (`src/next.ts:343-353`). No `.env` is copied or linked. Seats' by-name checks report false "absent" unless they target the registered checkout's file.
- **P4. No canonical `deploy-accounts.yaml`, test hub or hostname: 2 leaves.** Two days apart. Each found it at its live step.
- **P5. Token scope found only when called: 2 times.** Billing and KV at chart time, Zone DNS in offer-join-deploy.
- **P6. Live changes needed approval mid-leaf: 2 leaves.**
- **P7. Cleanup could not finish: 4 cases.** `gh` lacked `delete_repo` twice, R2 409 once, R2 30-day lock twice.

### Current akrogon behavior, as read from source

- Required external inputs (env var names, token scopes, registry files, hostnames, approvals) are not part of leaf state. `stateSchema` has no such field (`src/state.ts:35-58`), and neither does repo config (`src/config.ts:28-49`).
- Seats check them in prose (`skills/plan-issue/SKILL.md:63`, `skills/implement-issue/SKILL.md:55`, `skills/AREA.md:24`), by name only. Nothing checks scopes, files, hostnames or seat permission rules.
- `akrogon preflight` checks git state only (`src/preflight.ts:8-73`). It runs in `dispatchLeaf` after the `blocked-by` gate (`src/next.ts:574-582`). Nothing checks inputs before dispatch or before a phase starts.
- A human-prerequisite stop is a `failed --reason` written in free text (`src/phase.ts:188-207`). `issues/log.jsonl` does not record cause or reason (`src/log.ts:16-31`). All 32 `failed` records in the consumer log have no reason, so this analysis had to rebuild them from reports.
- The chart brief template has no Credentials section (`skills/chart-issues/assets/shapes.md:122-133`). Briefs add one by hand. One brief said the token was "Already set for today's deploys" with no scope list, and the leaf later failed on a missing DNS scope.
- The two leaves not started yet (`emdash-health-run`, `emdash-upgrade-route`) need the same registry file, backup bucket and per-client `EMDASH_TOKEN`. They match P3 and P4.

## Location

- akrogon: the leaf lifecycle (`chart-issues` handoff, `next`/`dispatchLeaf`, worktree creation, `plan-issue`, `implement-issue`, `check-issue`, `merge-issue`, `phase … failed`, `issues/log.jsonl`).
- Consumer: `Tamdoma/tamdoma-framework`.
  - Epic `issues/open/emdash-cms/`. Closed epic `issues/closed/landing-multi-offer/`.
  - Skills `dev-cf-workers-deploy`, `dev-cf-workers-setup` (doctor), `_shared/libraries/secret-env`.
  - Registry `.spec/shared/infrastructure/deploy-accounts.yaml`.
  - User and project Claude Code deny rules on `.env`.

## Reproduction

Seen on almost every leaf of the epic that makes live Cloudflare or GitHub calls (2026-09-30 to 2026-10-02):
1. Chart a leaf that needs live Cloudflare, R2 or GitHub access, or an operator-chosen value such as a hostname.
2. Dispatch it with `akrogon next`.
3. The leaf runs until a live step, review or merge. It then finds a missing env name, token scope, registry file, hostname or approval, or a deny rule blocks its check or its fail command. It stops and waits for the operator.

Evidence is in each leaf's `implementation/report.md`, `plan.md` and `review-*.md`. Transition times are in `issues/log.jsonl`.

## Expected behavior

Operator-provided inputs should never surface as surprises mid-leaf. Every external input a leaf needs should be known and confirmed before work starts, so the operator supplies everything once, up front, for the whole epic. This covers env var names, token scopes, registry files, hostnames, account access and approval for live changes, and it includes creating and providing API keys. The check should see the same environment the seats run in. A seat that hits a human prerequisite should be able to record it without being blocked by permission rules, and the reason should show up in the log.

## Urgency

High for live-deploy work.
- Impact: about 4.5 h of failed-state time plus about 8 h waiting on approvals in one epic, and repeated operator round trips. Two queued leaves will likely hit the same gaps.
- Workaround: the operator reads each blocked seat, adds the missing key, file or approval by hand, and re-prompts the seat. They also narrowed deny rules per branch and created `deploy-accounts.yaml` from the example file.

## Source: operator 2026-10-02
I just pulled an issue, we need to chart it. We need an elegant solution for this that will not jeopardize security, but still, we need to remove those blockers. use slot b consultant, it's active in the pane next to you.

## Agent findings
Full maps in slots/ (map-A.md, map-B.md, map-merged.md, map-rebuttal-B.md). Summary:
- F1 (A,B) Door credential listing and operation-proof rule landed a72fa61 (2026-09-28), before the emdash charts (2026-09-29/30). Prose alone failed.
- F2 (A,B) Worktrees get no env file (src/next.ts:264-269); seats start in the worktree (src/next.ts:343-353).
- F3 (A,B) `failure` already lives in state (src/state.ts:11-17, d058236); log.jsonl drops it (src/log.ts:18-31).
- F4 (A,B) User deny `Bash(* .env*)` is a command-text match; it blocks reason text, not reads. File-tool denies do not isolate secrets from subprocesses (B, code.claude.com/docs/en/permissions). It also blocked this door's own intake write on 2026-10-02.
- F5 (B) Standing design accepts agent reads of `.env`; phase skills forbid opening it (skills/AREA.md:24); nothing covers writing a new credential.
- F6 (B) The DNS scope miss came from a transitive fixture call; operation inventory must include transitive and cleanup calls.
- F7 (B) Presence checks test `undefined` only; empty must count as missing.
