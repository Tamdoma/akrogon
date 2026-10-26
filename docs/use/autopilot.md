# Autopilot

Autopilot lets a chart door work through a fixed list of charts without asking you each question. Use it for incoming work you are happy to let seat A decide, such as a batch of bug reports. Autopilot charts and hands off. It starts no execution.

It is one of the ways to run work shown in [Plan work](plan-work.md). The full mode rules are in [chart-issues](../../skills/chart-issues/SKILL.md).

## Switch it on

Autopilot needs Herdr. Outside Herdr the door says it cannot start.

In the chart door's own pane, say it in plain words. Name autopilot, the work you are handing it, and the chart consultants to use, or none:

```text
/chart-issues run autopilot on these two bug reports, consultants B
```

You can also switch it on later in the same door, naming a chart. Answers you already gave in that chart stay yours.

The door's first reply repeats the mode, the handed work and the consultants. After it reads the work, it shows a best-guess list of things to supply, such as logins, API keys or files. Each item says what it is for and where it goes.

## What the door does

The door runs every normal charting step. Where it would ask you, seat A writes the full question in its pane and answers it itself. It picks by your standing values: simplicity, function over form, removing over adding, systems thinking, speed and price. Each pick is recorded as A's, with its reason and the rejected options, never as your words.

Chart consultants are the helper panes (B, C, D and so on) that give A a second view while it charts. They are not the seats A and B that later work on a leaf. A consultant that fails or stops answering is dropped for the rest of the session.

Every handed chart takes the lifecycle route. The direct route is not offered. The door works only on the list you handed it and imports nothing new. It skips work another door's open chart already covers.

## What still waits for you

These make a chart wait while the door moves on to the next chart on the list:

- Every approval, such as a live-account grant, fixture retention or saving a secret.
- A needed new chart: when the chart finds work it cannot hand off without and that work needs its own destination, the door writes a `proposal:` line asking "chart <X> on its own (yes) or bring it into <waiting chart> (no)?". Yes adds that chart to the list you handed it; no brings the work into the waiting chart.
- A proof call that changes something or costs money.
- A missing need, such as a key.
- A step only a person can do.

Your next message in that door, such as a supplied key, resumes it.

## When it ends

The mode ends on its own when every handed chart is handed off or closed. Only your words in the door pane turn it off early. Supplying a key or changing the handed list keeps it on.

Handed-off leaves do not start by themselves. They start when you run `akrogon next`. See [Run work](run-work.md). Optional: to keep them moving while you are away, see [Watch while away](watch-while-away.md).

On a long run, the door can hand itself to a fresh conversation in the same pane after a chart, so its context stays small. This works for claude, codex and pi. Other agents stay in the same conversation.

## Read the record

Each chart's `CHART.md` has an `## Autopilot` section. It lists boundary breaches first, then the switch-on words, consultants and any losses, the route, handed-off leaves, waits, new-chart proposals, and picks that went against the recommendation. The door also prints one line per chart at the end of each pass.

Read the record before you run the handed-off leaves. A wrong pick can reach main once those leaves run and merge. Do not hand the same work to two doors at the same moment.

The full command list is in [commands.md](../reference/commands.md).

Next: [Write issues by hand](write-issues-by-hand.md)
