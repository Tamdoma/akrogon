# Roll back a release

A deploy can land a release that breaks the installed `akrogon` command. This page shows how to go back to the previous release. For how releases, `current` and `deploy.yaml` fit together, see [Releases and updates](../reference/releases-and-updates.md#rollback).

## Roll back with the command

Run this from any folder:

```sh
akrogon rollback
```

It does four things:

1. It points `~/.akrogon/current` back at the previous release.
2. It writes `~/.akrogon/release-hold.yaml` with the commit you left. The next deploy skips that commit while it is still the tip of main and prints `deploy held`.
3. It restores the previous release's command, skill and plugin links.
4. It updates `~/.akrogon/deploy.yaml` so the restored release is active and the one you left is previous.

It prints `rolled back <old> -> <previous>`. When there is no previous release, it stops with `Cannot roll back: no previous release to roll back to` and changes nothing.

The hold ends on its own. Once main moves to a newer commit, that commit deploys normally and the hold record is removed.

Older releases require a `debate` field in each leaf's `state.yaml`. Leaf records created or saved without `debate` need `debate: 'no'` restored before the previous release can load them.

Source: [src/rollback.ts](../../src/rollback.ts), [src/release.ts](../../src/release.ts), [src/self-update.ts](../../src/self-update.ts) (`deployStage`).

## Roll back by hand

Use this when the current release cannot start, so `akrogon rollback` cannot run. None of these steps needs code from the current release.

First read two commits from `~/.akrogon/deploy.yaml`:

- `<previous>` is the `previous:` field. This is the release you go back to.
- `<rolled-away-commit>` is the `commit:` field. This is the broken release you leave.

Then run:

```sh
cd ~/.akrogon
ln -s releases/<previous> .next-current
mv -T .next-current current
printf 'commit: <rolled-away-commit>\n' > release-hold.yaml
bun releases/<previous>/src/akrogon.ts install
bun -e 'import { writeDeploySuccess } from "./releases/<previous>/src/release.ts"; writeDeploySuccess("<previous>", "<rolled-away-commit>")'
```

What each step does:

1. `ln -s` makes a temporary link to the previous release.
2. `mv -T` renames that link onto `current`, so `current` switches in one step.
3. `release-hold.yaml` names the commit that must not deploy again.
4. The previous release's own `install` rebuilds the command, skill and plugin links.
5. `writeDeploySuccess` from the previous release marks it active and the release you left as previous. This keeps both from being pruned and records the rollback time.

If `install` fails, it names the conflicting paths. Fix them and rerun `install` before you run the last step.

Next: [Learn from work](learn-from-work.md)
