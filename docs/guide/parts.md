# Parts

Akrogon separates the work you want done from the agents doing it. Start with these terms.

## The words

| Term | Meaning |
| --- | --- |
| Repository | A project registered with Akrogon, such as widgets. |
| Issue | A folder containing related work. |
| Leaf | One piece of work that can be planned, built and reviewed. |
| Brief | The leaf's requirements, boundaries and completion criteria. |
| Phase | The leaf's current step, such as implementation or review. |
| Seat | One of the two agent roles, A or B. |
| Harness | The program running an agent, such as pi, Codex or Claude Code. |
| Worktree | A separate checkout where the leaf's code changes happen. |
| Chart | A place to resolve open decisions before writing leaf contracts. |
| Seed | An imported, unverified report. It is not ready to execute. |

## Folders, because this is where everyone trips

An issue contains leaves. Even an issue with one leaf needs both folders:

```text
~/Work/widgets/
  issues/
    open/
      export-csv/              # issue
        ISSUE.md
        export-csv/            # leaf
          brief.md
          state.yaml
```

The two folders may share a name. The inner folder is the leaf. Its name is the slug used by commands.

Larger work can use an epic above its issues. Akrogon discovers leaves two or three levels below the open directory.

```text
~/Work/widgets/issues/open/
+-- data-exports/                  epic
    +-- EPIC.md
    +-- csv/                       issue
        +-- ISSUE.md
        +-- export-csv/            leaf
        |   +-- brief.md
        |   +-- design.md
        |   +-- state.yaml
        +-- download-button/       another leaf
            +-- brief.md
            +-- design.md
            +-- state.yaml
```

In this larger example, export-csv is one leaf inside the csv issue and data-exports epic. Only the leaves have lifecycle state.

The main stores are:

```text
issues/seeds/   # imported reports
issues/chart/   # decisions still being worked out
issues/open/    # work available to the lifecycle
issues/parked/  # work set aside
issues/closed/  # completed work
```

## A concrete use

You might split a larger export issue into two leaves: CSV formatting and a download button. Each leaf gets its own brief and state.

If the button needs the formatter first, record that dependency in the button leaf. Akrogon waits for the prerequisite to merge.

For a small command-line export, one leaf is enough. Do not split work just to fill both seats. The seats already work on the same leaf.

## Skills, commands and Herdr

A skill is a set of instructions for an agent. It reads code, makes judgments and writes evidence. A command handles mechanical work such as validating state, moving a phase or dispatching a prompt.

Herdr holds the running seats. Its plugin events give Akrogon opportunities to dispatch the next pass.

This split matters when something stops. Read the leaf's artifacts for the agent's reasoning. Read its state and command errors for the lifecycle result. A printed claim that work is done is not a substitute for a successful phase move.

Previous: [The idea](idea.md) · Next: [State](state.md) · [Home](../../README.md)
