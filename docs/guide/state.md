# State

`state.yaml` is the leaf's truth. You write the first lines when you create it. Akrogon writes the rest. And — small tangent, because I learned this the hard way — you can edit it by hand when nothing's running, but you move phases with the command, not the editor. The command resets bookkeeping; the editor doesn't.

## What it looks like

Here's `export-csv` in `widgets`, at `issues/open/export-csv/export-csv/state.yaml`. I trimmed the noisy bits so you can see the shape:

```yaml
slug: export-csv
phase: plan.synthesis
created: 2026-09-11
repo: widgets
debate: 'no'
blocked-by: []
hand_built: false
attempts: { A: 0, B: 1 }
done: []
fix_rounds: 0
verdict: {}
tab: w8:tE
worktree: /home/me/widgets/issues/worktrees/export-csv
pane: { A: w8:pN, B: w8:pP }
prompted: { B: session-id }
```

What it's: the leaf's memory. Why it exists: so dispatch, both seats, git, and you can all agree on what's next without anything running. How it works: `next` reads it before every dispatch, `phase` rewrites it on every move. The file that makes it so is the leaf's own `state.yaml`, validated against the schema in code.

## The fields you'll actually touch

- `slug`: unique across the repo. Lowercase and dashes. Becomes the branch name and the tab label. Ours is `export-csv`, shocking, I know.
- `phase`: where it's. One of the nine phases you'll meet in [Phases](phases.md). It's the main signal, not the only one. `done` says which seats reported, `prompted` says which session got the prompt, panes say what's alive, `hand_built` says skip me, `blocked-by` says wait. All of those steer `next`.
- `debate`: `yes` means both seats write a plan alone, reply once, then B synthesises. `no` means B just plans. Start phase is `plan.positions` for yes, `plan.synthesis` for no. For `export-csv` we use `no` — it's small, debate would be theatre.
- `blocked-by`: leaf slugs. The leaf can't start until every one is `merged`. This is the only ordering rule. It's checked before every dispatch, not just once at start, so editing it actually matters.
- `hand_built`: set `true` to drive it yourself. `next` skips it completely. Useful for the first leaf in a new repo, before you trust the loop there.

Old files sometimes have `priority` or `slot` lines. The command ignores them now. Priority never steers order; order is `blocked-by` plus folder scan. Don't add them to new leaves.

## The fields Akrogon owns

You can read these, don't hand-edit them mid-run:

- `attempts`: consecutive failed deliveries per seat. Reset to 0 when a prompt actually lands. A permission dialog waiting for you doesn't count. A prompt that doesn't take counts one. At 3 the leaf fails loudly. So `B: 1` above means one delivery missed, not one prompt sent.
- `done`: seats that reported this phase. When every required seat is in it, the phase moves. Until then `phase` prints `recorded` and waits.
- `fix_rounds`: how many review-to-fix loops so far. Capped by repo config. Past the cap goes to `failed`.
- `verdict`: what each reviewer said: `ready`, `nits`, or `fix`.
- `tab`, `pane`, `worktree`, `prompted`: which Herdr tab and panes belong to this leaf, where the branch is checked out, which session got which prompt. If these look stale after a crash, `next` reconciles them; don't clean them by hand unless the tab's really gone.

## One concrete use

You're staring at `export-csv` wondering why it won't start. You read `state.yaml`: `phase: plan.synthesis`, `blocked-by: [schema]`, `hand_built: false`. Then you check `schema`'s phase. If it's not `merged`, that's your answer — no seat, no logs, just the file. Or you run `akrogon next export-csv` and it prints the reason. Either way, the file told you first.

Previous: [Parts](parts.md) · Next: [Install](install.md) · [Home](../../README.md)
