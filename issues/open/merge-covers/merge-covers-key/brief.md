# Brief: merge-covers-key

## What
A repo config gets an optional `merge_covers` list of `checks` names. At merge, akrogon runs every `checks` command not named in it, then every `merge_checks` command. Check and implement passes still run every `checks` command.

## Why
Merge runs all `checks`, then all `merge_checks` (`skills/merge-issue/SKILL.md:41,47,51`). In the framework repo, `merge_checks.verify` (`bun run framework:verify`) already runs `parity`, `contracts`, `test`, `test_changed` and `selftest` again, so each merge pays an extra 106 s (C). Only framework sets a non-empty `merge_checks` today, and blepsis sets `{}`. Repos without the key keep today's behaviour.

## Done-criteria
1. A repo without `merge_covers` merges exactly as today: every `checks` command, then every `merge_checks` command.
2. With `merge_covers` set, merge runs only the uncovered `checks` commands, then every `merge_checks` command, on the stack path, the solo path, and the red and rerun paths of both.
3. Config load refuses a `merge_covers` name that is not a `checks` key, and refuses a non-empty `merge_covers` when `merge_checks` is empty, naming the repo and the bad value.
4. A config with some checks covered and some not runs the uncovered ones at merge and all of them in check and implement passes.
5. `merge_covers` appears in `akrogon config` output, and `docs/guide/merge.md` and `docs/guide/setup.md` state which checks merge skips (C).
