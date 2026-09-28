# Brief: create-peer-panes

## What
When the operator asks for chart peers without naming panes, the chart-issues door creates them inside herdr: A stays left, B takes the right half, and C, when asked for, takes the bottom of the right half. The door asks once which harness and model each created peer runs. Supplied panes keep working unchanged and are never moved.

## Why
Nothing creates peer panes today (`skills/chart-issues/SKILL.md:23`, `assets/questions.md:44`), so the operator arranges them by hand on every chart session, and herdr refuses same-tab moves (Tamdoma/akrogon#34).

## Credentials
None.

## Done-criteria
1. The Open section and the blind peer exchange say: when the operator asks for B (and optionally C) without naming panes, and the door's own environment has `HERDR_ENV=1`, the door asks once for each created peer's harness kind and arguments.
2. They name the creation sequence: `herdr pane split <A pane> --direction right --ratio 0.5 --cwd <root> --no-focus` for B, then, only when C is asked for, `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading each new ID from `.result.pane.pane_id`, then `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer. Peers are then addressed by pane ID.
3. Supplied panes are used as given and never moved or resized. The door moves no pane it did not create. The requested halves are guaranteed only when A's pane fills its tab. Otherwise only A's area is split.
4. Outside herdr the door says so and continues single slot or with supplied panes.
5. A verification in a tab it creates with `herdr tab create --no-focus` runs only the two split commands against `.result.root_pane`, saves `herdr pane layout --pane <root pane>` output showing the root pane left, B top right and C bottom right to a file under the OS temp dir, then closes only that tab with `herdr tab close <tab_id>`. It starts no agent. The implementation report records the path.
6. `src/`, other skills and every other chart-issues rule are unchanged.
7. The configured `checks` commands from `issues/config.yaml` pass.
