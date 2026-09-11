---
name: init-issues
description: Inspect a repository, propose its issue lifecycle configuration and optional test toolkit, then initialize it through the installed akrogon command.
---

After compaction, reread this file and any applicable brief, plan and phase references before continuing.

# Init Issues

Dependency: the installed `akrogon` command, with machine setup already complete.

This operator-requested setup runs outside a leaf, without a phase transition or peer handoff.

## Inspect and propose

Run `akrogon config` once per setup pass to read effective global and repo choices, then inspect manifests, lockfiles, existing command definitions, tests, lint/typecheck configuration, reference indexes and local git remotes/default-branch metadata.

Preserve existing effective repo choices on repeat setup, prefer established commands verified against the installed tools, and batch only questions inspection cannot settle before showing one concrete proposal without another blanket approval when initialization is already authorized.

Propose every repo key below, using inspected values or these defaults, including only real check commands and placing only deliberately nonblocking commands in `advisory` because every `checks` command blocks:

```yaml
remote: origin
default_branch: main
worktree_root: issues/worktrees
rebuttal: true
fix_rounds: 3
implement: subagents
checks: {}
advisory: []
grounding:
  index: REFERENCE.md
broadcast:
  discord:
    webhook_env: [DISCORD_WEBHOOK_URL]
```

Use existing broadcast routing when present and propose environment-variable names, not secret values, keeping global-only and retired settings out of the repo proposal.

## Tests and grounding

For an existing suite, include its test command and a verified `checks.test_changed` using literal `$AKROGON_BASE`, the leaf's branch point on the configured default branch refreshed on rebase, rather than the previous worker commit.

If the installed runner lacks supported affected-test selection, explicitly propose the full existing test command with a required-base guard as conservative coverage, for example:

```yaml
checks:
  test: bun test
  test_changed: ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test'
```

With no tests, propose a language/runner toolkit from effective global `toolkits` or ask for the unresolved choice, pass it separately as `--toolkit <lang>=<runner>`, and leave unavailable test checks absent instead of inventing an empty-suite success command.

Toolkit selection records a choice without installing a framework, changing the consumer manifest or migrating an existing suite.

Reuse a valid configured or discovered top index, or, when no suitable index exists even if the configured path names a missing file, create a small top Markdown index at a suitable repo path with one line per area linking to a real existing entry point or document and set `grounding.index` to that path.

That top index is the only direct skill-authored repo write outside `issues/`, with no area documents or exhaustive inventory.

## Initialize and verify

Write the complete proposal to a temporary file outside the repo, preserving literal shell variables with a quoted heredoc, and run the command with the optional toolkit argument only for the no-tests choice:

```sh
proposal_file=$(mktemp)
cat > "$proposal_file" <<'YAML'
# Insert the complete inspected proposal here.
YAML
akrogon init --from "$proposal_file"
rm -- "$proposal_file"
```

The command owns both config files, repo registration, `issues/open`, the worktree/seeds/lock ignore entries and current `learnings/LESSONS.md` scaffolding, while the skill does not directly write configs, ignore rules, attributes, packages or scripts.

Read command results and generated files to verify the proposal, registration, index links and preserved consumer manifest, run proposed checks with a real fixture or leaf base for `test_changed`, and remove the temporary proposal also on failure without parsing config YAML or calling `akrogon config` again in this pass.

Report failing commands as failures, including unresolved setup choices or verification, and print the observed result in the final two lines:

```text
Last operation: <initialization and verification result>
Next: none
```
