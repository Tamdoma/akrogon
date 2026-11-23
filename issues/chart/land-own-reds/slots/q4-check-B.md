# Q4 check B: land-own-reds

Line numbers are from the worktree at 8b97c7d8 and later (`/home/ivan/.akrogon/worktrees/akrogon/land-own-reds`). (H) marks what I ran or opened.

## Verdict

The mechanism in INTAKE F-temp is right. The Q4 pick does not hold as written. It fails in three concrete scenarios (F1-F3) and adds a residue the live home cleans today (F4). A smaller change removes the class with no key (last section).

## Is the mechanism right

Yes, by code read. The default root is one name per uid (src/config.ts:389). The stray sweep drops every entry under it that is not a repo hash of this home (src/reconcile.ts:1402-1415) (H). Any process of another home that reaches the default root deletes the live home's repo dir. The three launchers pass different lists: land passes HOME and AKROGON_HOME (src/land.ts:41-44), run-check copies the same two (src/run-check.ts:41-50), the verify pass also passes both temp roots and the run slice (src/verify.ts:905-913) (H).

## Where the pick fails

- F1. Under Bun, `os.userInfo().homedir` follows `$HOME`. It is not the passwd home.
  - Ran on this host, Bun 1.4.5: `HOME=/nonexistent-x bun -e '…os.userInfo().homedir, os.homedir()'` prints `/nonexistent-x /nonexistent-x` (H).
  - So a home set by HOME alone gets key `''`, the default names, and the live root. The design calls that case "intended non-default". It is not delivered.
  - That home exists in the suite: tests/state-home.test.ts:45-53 runs the CLI "with AKROGON_HOME absent and HOME pointed at the fixture" (H).
  - The same applies to the `leafSlice` change. It replaces `homedir()` with a call that returns the same value, so it changes nothing.
  - A real passwd read needs a `getent` spawn or a parse of `/etc/passwd`. The parse misses users from systemd-homed or LDAP. Both are new parts.

- F2. Four hex characters give 65,536 keys.
  - Two homes alive at once with the same key share a root, and each one's sweep deletes the other's repo dirs. That is the same ENOENT flake at a lower rate.
  - Chance per suite run is about n²/131072 for n homes alive together. 50 homes gives 2%. I did not measure n.
  - `leafSlice` uses 12 characters for the same job. The socket budget (tests/next.test.ts:2698) limits how many the temp path can take.

- F3. The env overrides stay unkeyed and unforwarded.
  - Shared: a shell that exports `AKROGON_LEAF_TEMP_ROOT` gives the live home and every test child that spreads `process.env` (tests/leaf-slices.test.ts:250) the same root. The sweep then deletes across homes as before.
  - Split: a home whose parent sets the override uses that root. Its land and its checks do not get the variable, so they use `/var/tmp/akr-<uid>-<key>`. One home then has two roots, and the parent's cleanup never sees the land's run roots.

- F4. Keyed roots outlive their home.
  - Today the live home's sweep removes test strays. `/var/tmp/akr-1000` holds only `5d20` and `6855` now (H), although INTAKE saw four test dirs appear during one verify.
  - After Q4 each test home that reaches the default leaves `/var/tmp/akr-<uid>-<key>`, and no home may remove it. That is at least four dirs per suite run with no end.

## Other shared host names

- G1. Worktree store. Same gap, low harm today.
  - The default store and its sweep use `homedir()`, not the home (src/config.ts:372, src/reconcile.ts:1382) (H). A home set by AKROGON_HOME alone lists the live store. It deletes every store dir not registered in it that has no worktree child. It also creates its own worktrees at the live home's `<repo>/<slug>` paths.
  - Tests are safe because every launcher passes HOME and AKROGON_HOME together. A hand-run `AKROGON_HOME=x akrogon …` is not.
- G2. Retired names. `/tmp/akr-<uid>` (src/reconcile.ts:1375) and the two retired locks (src/reconcile.ts:1451) are dropped by every home. Nothing writes them since the move on 2026-10-14 (H, git log on src/config.ts). Harmless unless a release older than that runs. They are residue for wake-cost.
- G3. Units hold. `akrogon-run-<uuid>`, `akrogon-land-<attempt>` and `akrogon-verify-<id>` carry random ids. After Q1 the only host-wide listing is `akrogon-l*.slice` (src/reconcile.ts:154) (H). I did not trace where the attempt id is made.
- G4. Run slice. Land does not pass `AKROGON_RUN_SLICE` (src/land.ts:41-44). A test home's land puts its check scopes in a leaf slice under the real `akrogon.slice`. After Q1 only that test home stops it, and the test home is gone. This is the leaked-slice residue of P12. It belongs to test-hygiene.
- G5. Locks and `runs/` hold. `admission.lock`, `reconcile/`, `runs/` and `verify-passes/` sit under `globalHome()`. The installed tool root has no `config.yaml` (H), so the fallback in src/config.ts:234-239 does not point a fresh home at the live one. The verify-runs lock is a git path inside the repo (src/verify.ts:629), which is the right owner.
- G6. Seat labels are `akrogon.repo` and `akrogon.leaf` with no home (src/seat.ts:271-275). Two homes on one hc session with the same repo name and slug read each other's seats as their own. Fixture repo names are unique, so this needs an operator's second home. Note only.

## Smallest change that removes the class

Apply the Q1 rule to temps: a home acts only on names it derives.

- S1. In the stray sweep, keep the dead-pid `.tmp` rule (a pid is a host-wide fact). For any other unknown entry, call `keep(...)` in place of `dropPath` (src/reconcile.ts:1415). It then shows in leftovers and nothing is deleted.
- S2. Do the same for an unregistered store dir with no worktree (G1).
- S3. No `homeKey`, no change to `leafTempRoot`, `retiredLeafTempRoot` or `leafSlice`, no passwd read, no forwarding.

Why this is enough: names under the root already carry an owner that is unique on the host. The repo dir is a hash of the repo root path and the leaf dir a hash of root plus slug (src/config.ts:400-404). The repo pass touches only its own repo dirs. The only cross-home act is the sweep deleting names it did not derive. With S1 it holds for F1, F2 and F3, because it does not depend on how a home is named or which root it reaches.

Cost, stated so it is not a surprise:
- C1. A repo that is unregistered or moved leaves its temp dir until the operator removes it. It is reported each pass. Chart run-scratch (K3) makes those dirs empty.
- C2. Test strays under the live root now show in the live home's leftovers. That is the signal for the real test defect: a test child that runs without its own temp root (tests/leaf-slices.test.ts:250). Fix it in the test helper, in this chart or in test-hygiene.
- C3. Slices keep Q1 as shipped in 8b97c7d8. After the branch deletion two homes collide only on the same repo name and slug, and fixture names are unique. A HOME-only home still reads as default, which is harmless for the same reason.

If A keeps the key anyway, it needs four repairs to hold: a real passwd source (F1), a longer key inside the socket budget (F2), the key appended to an override or the overrides forwarded by all three launchers from one list (F3), and fixture teardown removing its keyed root (F4).
