# Slot B territory map

Read all seven intake files verbatim. Blind map against HEAD 92dddada. No other opening maps read. No repo writes or live consumer changes. Tests inspected, not run.
Evidence tiers: E = better-than-training, inspected code/local tool documentation. H = inspected historical decision/proof, useful context rather than proof of today's consumer. I = intake claim, not independently reproduced. Recommendations are judgments, not evidence.

## Consolidation
- C1 (#110): authenticated external commands work under containment. Keyring failure and mise stall are two observations, not a proved single cause.
- C2 (#111): checked commands support Unicode filenames. Same constructedEnv surface as C1, different mechanism and remedy.
- C3 (#112): caller argv reaches the command literally. Independent of missing environment variables.
- C4 (#113): fresh verification has an explicit, sufficient dependency setup.
- C5 (#114 + #115): configured worktree storage satisfies dependency isolation. These are duplicate reports across leaves, not two defects.
- C6 (#116): interrupted pane allocation converges without creating extra untracked panes.
Do not merge C4 and C5 just because both block verify: location refusal precedes setup, and repairing either leaves the other failure intact. C1/C2/C3 share implementation territory, so serialize edits touching run-check/scope rather than combine their outcomes.

## C1: authentication under containment
- F1: constructedEnv intentionally drops undeclared caller inputs; the bus cut is imposed after declared inputs, and config reserves its name. E: src/run-check.ts:24,34,56,67; src/config.ts:67,77,87.
- F2: this exact keyring problem was discovered and resolved for the operator's machine before. H: issues/closed/host-test-load/leaf-stop/design.md, “Addendum after proof T1, 2026-10-13”: operator chose gh file storage, explicitly rejected a D-Bus proxy and automatic GH_TOKEN copying.
- D1, auth fork: O1 retain containment and configure gh file credentials (pick, already chosen historically, no new akrogon mechanism). O2 explicitly declare GH_TOKEN in consumer pass_env (existing capability, requires a token supplied outside the checked command). O3 restore the bus or add a filtered proxy (reject for this report).
- R1: O1 persists a credential in gh's file and requires consumer/operator setup. O2 requires token provisioning and can leave a caller with no token. O3 reopens Chrome self-scoping or adds proxy lifecycle/policy complexity.
- D2, shim fork: O1 reproduce and repair the mise bootstrap outside akrogon (pick). O2 point the check at the installed gh binary (local workaround, installation-specific path). O3 impose a general run deadline (reject without an agreed limit, changes legitimate long checks).
- Q1: does real gh with file auth, or explicitly passed GH_TOKEN, succeed under this machine's cut environment? Does the shim still hang on --version with authentication removed from the scenario? Intake does not establish either.
- Pitfall: avoid extracting credentials through gh while already inside the cut environment. Do not treat gh's private-repo 404 alone as proof that the repo does not exist.

## C2: Unicode locale
- F3: the copied-name list contains no locale, and no default locale is set. E: src/run-check.ts:34,56. JDK 17's reported encoding change is I: #111, not independently reproduced here.
- D3, locale fork: O1 set LANG=C.UTF-8 in constructedEnv before declared overrides (pick, one predictable default, retains explicit consumer choice). O2 copy caller LANG and LC_* (matches caller behavior but makes check output depend on session settings). O3 require per-repo pass_env or command env (smallest code change: none, but repeats the same failure across Unicode consumers).
- R2: O1 needs C.UTF-8 on supported hosts and intentionally changes default locale-sensitive behavior. O2 can pass unavailable locale names and inconsistent LC_ALL/LC_CTYPE overrides. O3 leaves fresh consumers broken by default.
- Q2: is portable Unicode the desired contract or exact caller locale? Check locale availability on supported machines before declaring O1 portable. Explicit LC_ALL from env/pass_env must retain its ordinary precedence.
- Proof target: a child creates and reads a non-ASCII filename under top-level and nested run-check, plus a declared locale override. Avoid relying solely on Java property text.

## C3: literal argv
- F4: runUnitArgv inserts the caller argv after systemd-run without disabling expansion. Nested runs bypass this wrapper. E: src/scope.ts:43; src/run-check.ts:229.
- F5: installed systemd-run is 262.1-1-arch and advertises --expand-environment=BOOL. Its installed systemd-run(1), option “--expand-environment=BOOL”, says expansion defaults on, scopes expand in systemd-run itself, and the option was added in 254. E: local --version/--help and /usr/share/man/man1/systemd-run.1.gz.
- D4: O1 add --expand-environment=no to runUnitArgv (pick, removes the unwanted transformation). O2 dollar-escape each argv item (reject, introduces an encoding layer). O3 tell users to avoid templates (reject, abandons literal argv).
- R3: O1 requires systemd >=254; installation docs currently require only a systemd user manager. O2 risks double escaping and inconsistent nested behavior. O3 keeps scripts silently rewritten.
- Q3: are pre-254 hosts supported? Settle that support boundary rather than invent version probing/fallbacks.
- Proof target: real systemd scope preserves ${x}, $HOME, $$, spaces and empty arguments exactly, with matching nested behavior. A fake systemd argv assertion alone cannot show the reported transformation is gone.

## C4: fresh dependency setup
- F6: setupCommand without setup still invokes own-modules; guard requires node_modules only if root package.json exists. Verify always executes setup, even with checks: {}. E: src/config.ts:333; src/guard.ts:36; src/verify.ts:324,336.
- F7: setup failure cannot qualify as green or known-red. This is deliberate evidence integrity, not a receipt bug. E: src/verify.ts:75,97,111.
- D5: O1 configure the consumer's committed-lockfile install as setup (pick, uses the existing mechanism and removes the actual missing prerequisite). O2 infer install commands on every verify (reject, adds runtime package-manager policy). O3 remove own-modules or accept setup-red receipts (reject, permits ambient resolution/false acceptance).
- R4: O1 requires network/cache/tool credentials appropriate to the selected install. O2 can select the wrong manager or silently change behavior when files change. O3 weakens dependency independence and verification.
- Q4: is the requested destination simply unblocking Gljive, or also preventing config drift after a repo gains a manifest? Init's “Inspect and propose” section deliberately keys setup to lockfiles committed at initialization. No evidence supports automatic ongoing repair.
- Pitfall: package.json alone does not prove a particular installation command is correct. checks: {} is allowed and must not motivate adding invented test commands.
- Proof target: fresh checkout with actual committed package.json/lockfile installs and obtains its expected receipt. Keep setup failure disqualified.

## C5: compatible worktree storage
- F8: worktreeStore honors configured in-checkout paths unchanged. checkLocation walks canonical ancestors for package.json/node_modules. Verify and batch call it before the shared creation helper calls it again. E: src/config.ts:267; src/guard.ts:5,18; src/verify.ts:296,324; src/batch.ts:89,95; src/next.ts:225.
- D6, storage fork: O1 remove the consumer's in-checkout override, migrate its active worktrees to the existing external default, reconcile recorded paths (pick, removes the conflicting configuration without a new mechanism). O2 delete the location guard and support nested worktrees (reject without equivalent resolver isolation). O3 introduce a namespace/resolver barrier (reject as disproportionate).
- R5: O1 changes paths and requires coordinated Git/state migration, not merely a YAML edit. O2 permits parent dependency lookup and hides missing local dependencies. O3 adds a substantial Linux/toolchain mechanism.
- D7, feedback fork: O1 clearly present the external-store constraint in existing setup guidance (pick if framework prevention is in scope). O2 reject unsafe paths during config/init (earlier feedback but root contents can change later). O3 remove worktree_root configurability (simplifies policy but forces migration for all overrides, including valid external stores).
- F9: checkLocation remains needed under today's isolation contract. The older worktree-store design, “Boundary”, explicitly chose an external store to stop ancestor dependency resolution. A later guard-at-creation design, “Binding decisions, verbatim”, removed repeated per-check ancestor checks while retaining creation checks. Printed-check success under a dirty ancestor is therefore intentional, not an accidental discrepancy. E: tests/guard.test.ts:80; H: both named design sections.
- Q5: confirm Gljive's active paths and Git metadata before any migration. A seat cannot repair operator-owned root state merely by retrying verify. E: src/next.ts:250 rejects a recorded-path mismatch.
- Reduction opportunity: duplicate prechecks in verify/batch and createSparseWorktree exist, but the outer checks precede record/owner writes. Do not delete them as “redundant” without preserving that ordering or deliberately accepting changed failure records.

## C6: pane allocation converges after interruption
- F10: tab saved at src/next.ts:428 before boxing, pane A/B persisted together only at :508 after both boxes. A failed B adoption leaves the created tab/panes discoverable but no recorded seat IDs. Retry bootstrap chooses members[0] and unconditionally splits B if recordedB is absent (:430,434,499). E: inspected allocation code. Incident attribution remains I, no dispatch failure log.
- D8: O1 reconcile an incomplete recorded tab against its existing eligible panes before splitting (pick, makes retry reuse the external side effect and covers process death). O2 save pane IDs immediately after creation (narrows the window but cannot close the split/save crash gap and changes the recorded-only-after-boxing invariant). O3 close newly created panes in catch/finally (handles thrown failures but not process death). O4 rebuild unfinished tabs wholesale (simple but can destroy operator work).
- R6: O1 needs a defensible ownership rule and must not adopt a busy/user pane merely because cwd matches. O2 can leave unboxed IDs recorded; current preflight closes recorded outside panes. O3 can mask original failures or close a successfully adopted pane. O4 destroys any unrecorded manual work.
- Q6: may an incomplete leaf-owned tab contain manually added panes? What distinguishes a recoverable allocation shell from operator work? agent:null alone does not prove a shell is idle. Resolve this ownership fork before claiming O1 universally safe.
- Why save tab first: retries find the same allocation even if adoption fails. Removing that save loses the durable recovery anchor. Why box before seat save: recorded seats are intended to be safe for dispatch. Preserve containment, not necessarily the current persistence shape.
- Existing tests prove failed adoption starts/prompts no agents, but do not prove retry convergence after B alone fails. E: tests/seat-containment.test.ts:103. Proof target: fail B after successful A, retry repeatedly, interrupt after split/before save, preserve a surviving seat and operator panes, produce no extra allocation panes.

## Priority and gaps
- A1: settle C3 first for a small independent fix. C2 is similarly narrow once the locale contract is chosen.
- A2: C4/C5 need concrete consumer setup/storage changes to unblock verification. Framework-only edits cannot migrate Gljive's live state. C1's prior file-auth decision is a strong default, not proof it was applied on the reporting machine.
- A3: C6 is low urgency and needs ownership evidence before destructive cleanup. Keep the interruption hypothesis separate from the observed orphan.
- Limits: consumer machine, private auth, mise shim and dispatch logs were not inspected. No model-knowledge-only factual claims are needed. The unrelated pre-existing LESSONS.md modification and untracked TMPDIR lesson were left untouched.
