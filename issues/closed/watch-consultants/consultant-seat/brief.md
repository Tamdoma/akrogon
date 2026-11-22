# Brief: consultant-seat

## What

The machine config `~/.akrogon/config.yaml` accepts an optional consultant recipe `slots.consultant: {harness, model, effort}`, and `akrogon seat --watch-consultant --task <text>` starts that recipe as a child of the calling hc terminal named `<prefix>-watch-consult`. `akrogon config` shows the recipe. Repo `issues/config.yaml` slots and index `slots:` blocks still accept only `a` and `b`.

## Why

`/watch-issues` (leaf watch-consults) needs one command that starts its consultant from the operator's recipe, so the operator changes the consultant without editing the skill (Tamdoma/akrogon#146), and the name must not collide with chart doors' `<prefix>-slot-<x>` consultants, since hc refuses a second live terminal with one name.

## Done-criteria

1. A machine config holding `slots.consultant` with a harness named in `harnesses:` loads, and `akrogon config` prints the recipe; one whose harness is not in `harnesses:`, or with a missing or blank `model` or `effort`, is refused with the key named. Proof: own tests in `bun test`.
2. A repo `issues/config.yaml` or an `ISSUE.md`/`EPIC.md` `slots:` block holding `consultant` is still refused, as today for any key other than `a` and `b`. Proof: own tests in `bun test`.
3. `akrogon seat --watch-consultant --task <text>`, run inside an hc terminal of a registered repo with the recipe set, starts the recipe's harness command with the task through the existing start proof (the `agy` path included), named `<prefix>-watch-consult`, labelled `akrogon: 1`, `akrogon.repo=<repo>`, `akrogon.watch-consult=<repo>` and no `akrogon.leaf`, parented to the calling terminal with `outlive: false`, and prints the address and the start-proof result as `--slot` does today. Proof: own tests in `bun test` with the repo's existing stand-in harness.
4. Without the recipe, `akrogon seat --watch-consultant` exits non-zero naming `slots.consultant` in `~/.akrogon/config.yaml` and starts nothing; combined with `--slot`, `--harness`, `--model`, `--effort` or the positional `<slug> <A|B>` form, or outside an hc terminal, (C) it exits non-zero naming the conflict and starts nothing. Proof: own tests in `bun test`.
5. `akrogon seat --slot <x> --harness --model --effort` behaves as before. Proof: the existing seat tests in `bun test` stay green unchanged.
