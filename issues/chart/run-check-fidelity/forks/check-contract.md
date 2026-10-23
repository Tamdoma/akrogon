# Check contract

## Question

Q1. How should `akrogon run-check` stop systemd-run from rewriting `${…}` and `$NAME` in the checked command's arguments (#112)? (a) add `--expand-environment=no` to `runUnitArgv` and state systemd >= 254 in install docs; (b) escape every argument; (c) document the trap.

Q2. Which locale does a checked command get (#111)? (a) a fixed `LANG=C.UTF-8` in constructedEnv, overridable by a repo's env/pass_env; (b) copy the caller's LANG/LC_*; (c) docs only.

Q3. How do checks that call `gh` on private repos authenticate while the session bus is cut (#110)? (a) no code: docs state the bus cut hides keyring credentials, gh keeps its token in its own file, and a repo may declare GH_TOKEN in env/pass_env; (b) restore or proxy the bus.

Q4. One leaf with three criteria, or three leaves?

### Carries

- Lock 2026-10-13, issues/closed/host-test-load/leaf-stop/design.md "Addendum after proof T1": gh stores its token in its own file (`gh auth login -h github.com -p https -w --insecure-storage`); foreclosed: a D-Bus filter proxy, akrogon copying GH_TOKEN into seat env.
- docs/guide/setup.md:63: every check runs with the session bus cut so test browsers stay in akrogon's cgroup; DBUS_SESSION_BUS_ADDRESS is reserved.
- issues/closed/worktree-isolation/worktree-store/design.md: credentials and toolchains are declared inputs (constructedEnv is an allowlist on purpose).

## Findings

Maps: [A](../slots/map-A.md), [B](../slots/map-B.md), [C](../slots/map-C.md). Merged: [slots/check-contract-merged.md](../slots/check-contract-merged.md). Rebuttals: [B](../slots/check-contract-rebuttal-B.md) (agrees), [C](../slots/check-contract-rebuttal-C.md).

- (A,B,C) Q1a. better-than-training · installed `man systemd-run` (systemd 262.1-1-arch), option `--expand-environment=BOOL`, added in 254, read 2026-10-22 · scope mode expands in systemd-run itself.
- Proof P1, 2026-10-22, identity ivan (local user manager): `systemd-run --user --scope --quiet -- printf '[%s]\n' 'a ${base} b' '${file.key}' '$HOME'` printed `[a  b]`, `[]`, `[/home/ivan]` with the two systemd warnings; with `--expand-environment=no` it printed `[a ${base} b]`, `[${file.key}]`, `[$HOME]`, exit 0. Cleanup: scope units are transient and collected on exit (none left). Limits: proves the flag on systemd 262 only; not older versions.
- (A,B,C) Q2a. Proof P2, 2026-10-22: `env -i PATH=$PATH sh -c 'printf "Č" | wc -m'` printed 2; with `LANG=C.UTF-8` printed 1. glibc 2.44, `locale -a` lists `C.utf8`. Limits: no JDK on this host; the JDK effect is intake evidence (#111).
- (A,B,C) Q3a. Proof P3, 2026-10-22, identity: gh 2.102.1 logged in as the operator's account: `env -i HOME=$HOME PATH=$PATH DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent gh api repos/<private repo> --jq .visibility` gave HTTP 404; the same with `GH_TOKEN=$(gh auth token)` printed `private`. No write, no cleanup needed. Limits: this host's gh did reach the token in its normal shell via keyring, so file storage was not re-proven here; the 2026-10-13 T1 proof covers file storage.
- (A,B,C) mise shim hang: Off route. The run guard stops the scope when the wrapper dies (src/scope.ts startRunGuard); a run deadline is a product change with no agreed limit.
- C rebuttal 1: C did not propose splitting argv from env; the split disagreement is A vs B only. Accepted.
- C rebuttal 2: the Q2a override holds only while LANG and LC_ALL stay out of the reserved names in src/config.ts. Accepted as a binding part of Q2a.
- C rebuttal 3: nested runs (`admission.kind === 'nested'`) bypass `runUnitArgv`; the argv criterion covers both the scope path and the nested path. Accepted.

- Leaf review 2026-10-22 ([B](../slots/leaf-review-B.md), [C](../slots/leaf-review-C.md)): #110 removed from leaf sources as a partial match (B F1, C); P2 linked in readiness (B F2); gh docs line placed in setup.md as 3a says (C 1); P1 extended: `$${x}` stays `$${x}` with the flag and becomes `${x}` without (C 2, probe 2026-10-22).

## Taken

A's pick under autopilot, 2026-10-22 (not operator words): `1a 2a 3a 4a`.

- 1a: `runUnitArgv` passes `--expand-environment=no` before `--`. docs/guide/install.md states systemd 254 or later. Reason: removes the rewrite for every caller with one argument. Rejected: 1b escaping (encoding layer, double-escape risk), 1c docs (trap stays). Binding: the proof runs through real systemd-run and also through a nested run.
- 2a: constructedEnv sets `LANG=C.UTF-8` before the env/pass_env names are copied; LANG and LC_ALL stay unreserved so a repo can override. Reason: same result from every caller; one line. Rejected: 2b caller variance in evidence; 2c trap stays.
- 3a: no code. docs/guide/setup.md says the cut bus hides keyring credentials: gh must keep its token in its own file, or the repo declares GH_TOKEN in env or pass_env. Reason: honors the 2026-10-13 lock and adds nothing. Rejected: 3b breaks browser containment and was foreclosed.
- 4a: one leaf. Reason: three edits of one or two lines each; separate leaves would serialize on the same files anyway. Rejected: 4b (B's original; B now agrees with 4a).
- Standing dissent: none.
