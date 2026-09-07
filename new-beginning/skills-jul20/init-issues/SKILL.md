---
name: init-issues
description: Initialize a repository for the issue lifecycle by creating the local issues folder, active working-set home, confirmed config, managed worktree home, stamped lifecycle scripts, and gitignore rule. Use before consult-issue, implement-issue, check-issue, merge-issue, or explain-issue in a project that does not yet have issues/config.yaml, issues/.scripts/, and issues/worktrees/.
---

# Init Issues

Run this workflow directly through the LLM. Do not depend on helper scripts in the target repository; this skill exists for repositories where those scripts may not exist yet.

## Purpose

Create the self-contained issue lifecycle surface for the active repository:

- `issues/`
- `issues/open/`
- `issues/config.yaml`
- `issues/worktrees/`
- `issues/.scripts/`
- a `.gitignore` rule for `issues/worktrees/`

The workflow is idempotent and additive. It creates missing surfaces, leaves matching existing surfaces alone, and fails loudly instead of overwriting divergent lifecycle scripts.

## Activation

Use this skill when the repository should participate in the issue lifecycle and `issues/config.yaml` is absent.

Do not run this skill as a lazy fallback from another issue skill. The operator must intentionally initialize the repository.

If `issues/config.yaml` already exists, inspect the remaining expected surfaces and report one of these end states:

- `already-initialized-no-changes`
- `initialized`
- `drift-detected`

Never overwrite an existing `issues/config.yaml`.

## Config Builder

When `issues/config.yaml` is absent, build exactly one proposed config and show the full YAML to the operator before writing it.

Use these defaults:

```yaml
issues_root: issues
scripts_dir: issues/.scripts
worktree_root: issues/worktrees
branch_prefix: worktree-
broadcast:
  discord:
    webhook_env:
      - DISCORD_WEBHOOK_URL
```

The `broadcast.discord.webhook_env` block routes issue broadcasts (for example the merge handoff) to Discord. Each item is the name of an environment variable whose value is a webhook URL; secret values stay outside git in the broadcast skill's environment store. The operator may rename the variable, list several names to fan out to multiple channels, or remove the block entirely (the sender then falls back to `DISCORD_WEBHOOK_URL`).

Discover optional grounding surfaces in the target repository:

- Prefer a reference index (a file mapping the codebase's important files to one-line descriptions) for `grounding.index` when one exists.
- Prefer stable context or overview docs for `grounding.docs` when they exist.
- If no grounding surfaces are appropriate, propose `grounding: none`.

The proposal must be a single batched YAML block. The operator may confirm it or provide an edited YAML block. Do not conduct a sequential question flow.

Accepted shapes:

```yaml
grounding: none
```

or:

```yaml
grounding:
  index: <path to the repo's reference index>
  docs:
    - <path to a stable context doc>
    - <path to another stable context doc>
```

Write `issues/config.yaml` only after confirmation. Do not declare the config accepted until the script stamp is complete and `parseIssuesConfig` or `readConfig(execRoot)` from `issues/.scripts/lifecycle.ts` can re-read it. Treat a parse failure as initialization failure and report the parser error.

## Scaffold Workflow

1. Create `issues/` when absent.
2. Create `issues/open/` when absent; it is the active issue working-set home.
3. Build and confirm `issues/config.yaml` when absent.
4. Create `issues/worktrees/` when absent.
5. Stamp `issues/.scripts/` from this skill's bundled `payload/issues/.scripts/`.
6. Add `issues/worktrees/` to `.gitignore` when that exact rule is missing.
7. Run `bun issues/.scripts/lifecycle.ts --self-test`.
8. Report the final end state.

## Script Stamp Rules

The bundled payload is authoritative for initialization. Copy these files verbatim into `issues/.scripts/`:

- `lifecycle.ts`
- `resolve-worktree.ts`
- `merge-branch.ts`
- `auto-commit-if-dirty.ts`
- `create-worktree.ts`
- `prune-worktree.ts`
- `classify-merged-issue-roots.ts`
- `audit-reference-index-drift.ts`

For each target file:

- If the file is absent, copy it from the payload.
- If the file is byte-identical, leave it unchanged.
- If the file exists and differs, stop with `drift-detected`, name both paths, and do not overwrite it.

Do not edit these scripts while stamping them.

## Gitignore Rule

Ensure `.gitignore` contains this exact line:

```gitignore
issues/worktrees/
```

Create `.gitignore` when absent. Append the rule only when it is missing.

## Completion Output

Report one end state:

- `initialized`: at least one missing surface was created and all verification passed.
- `already-initialized-no-changes`: every expected surface already existed, payload files were byte-identical, and verification passed.
- `drift-detected`: a target payload file differed from the bundled payload and was not overwritten.

Include the config path, script path, worktree path, and verification command result.

## Maintainer Notes

The payload under `~/.claude/skills/init-issues/payload/issues/.scripts/` is the origin for the eight lifecycle scripts. Edit the scripts there, then propagate with:

```powershell
bun ~/.claude/skills/init-issues/scripts/sync-payload.ts [--into <repo-root> ...]
```

That maintainer command lives outside the stamped payload. It runs the origin self-tests, mirrors the origin payload into the `~/.codex` skill tree, copies it into each `--into` repository's `issues/.scripts/`, asserts byte identity, and reruns the payload self-tests in every target. Repositories with already-stamped scripts are consumers; bring one current by passing it as an `--into` target.
