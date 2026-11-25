# tool-cgroup final-shape check 2 — slot B

Checked the [R] lines only. The universal population test is the right
shape — it deletes the caller-identity question rather than answering it,
and I verified the cross-committer scenario from my first check is closed:
B's lock-waiting `akrogon` keeps `akrogon/<t-B>` populated, so A's sweep
defers instead of killing B's shell mid-wait.

## Defect

**"At most one helper waits per `t-`" cannot be built as written, because
the relocation rule is ambiguous about the helper itself, and one reading
violates the invariant.** The chain:

- Q1 [R]: every akrogon process relocates "after the inherited `t-` env
  marker when it starts in an `akrogon/` dir (an akrogon started by
  akrogon)."
- The helper is explicitly "an akrogon subcommand," spawned by an akrogon
  process, starting inside `akrogon/<t-name>/helper/` — an `akrogon/` dir
  by any prefix reading — and inheriting the committing process's
  environment unless deliberately scrubbed. The committing akrogon
  carries the `t-` marker in its env (the entry exported it into the
  shell it came from), so default inheritance hands it to the helper.
- If relocation fires on the helper, it moves out of `helper/` into
  `akrogon/<t-name>/`. Then `helper/` reads empty at every later sweep,
  the "unless that directory is already populated" dedup never engages,
  and each advance spawns another helper for the same shell — directly
  violating the "at most one helper" line. When the shell finally exits,
  all of them fire: duplicate kills, duplicate timing rows, and warn-noise
  from rmdir/kill on already-removed cgroups. Nothing corrupts — the
  outcome is benign either way — but which behavior the system exhibits
  depends on how the implementer resolves the ambiguity, and the
  invariant line only holds under one resolution.

One sentence fixes it: state that the relocation step does not apply to
the helper subcommand (it is spawned already placed), or equivalently
that the helper is spawned with the marker env scrubbed. Given the never-
fail entry philosophy elsewhere in this contract, the explicit exemption
is the better line — it survives a future change in how the helper is
spawned.

## Missing obligation

**Empty `akrogon/<t-name>/` dirs are never removed.** The Taken cleans up
`tools/t-*` best effort but says nothing about the relocation targets.
Every akrogon invocation from a tool shell mints one (plus `helper/` for
swept ones), none is ever rmdir'd — you cannot rmdir the cgroup you sit
in, so the exiting akrogon cannot do it itself — and they accumulate for
the scope's lifetime. Hundreds to thousands of empty cgroups per leaf,
kernel memory pinned, and `cgroup.max.descendants` headroom consumed if
anyone ever sets it. Bounded at leaf close, so this is not corruption —
but the contract is silent, which means the leaf either ships the clutter
or each review round re-litigates it. The cheap line: at sweep time,
rmdir any `akrogon/<t-name>/` (and its `helper/`) that reads unpopulated,
best effort, same as the `t-` cleanup. The sweeper is already enumerating
exactly these directories, so the cost is one rmdir in a loop that already
exists.

## Checked and cleared (for the record)

- No deadlock in the helper's timing-row append: the helper fires only
  after the shell exits, and the shell exits only after the phase command
  (and its lock) end; a helper firing mid-lock because the shell was
  killed externally blocks at worst until the lock frees, and no lock
  holder ever waits on a helper.
- The descendant-inclusive `populated` flag pollution (a waiting helper
  keeps `akrogon/<t-name>` reading populated) is semantically harmless:
  deferral while a helper waits is correct anyway, since the helper
  itself fires the kill at shell exit, and helper death unpopulates the
  dir so the next sweep kills the `t-` now. Self-correcting either way.
- Zombie-state handling (`Z`/`X` as ended) is needed and correct: a
  harness reading stdout to EOF before reaping leaves the shell a zombie,
  and a zombie's leftover children still need the kill.
- The `akrogon-verify`-in-flight case is conservative and correct: a long
  non-phase akrogon call defers its `t-` across multiple advances, the
  shell outlives them all legitimately, and the helper fires when the
  shell finally exits.
