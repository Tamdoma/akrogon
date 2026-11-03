// Tasks board view model: envelope + context in, machine lines and sectioned
// rows out. Pure: no host imports, so akrogon's bun tests exercise it directly
// (main.js owns herdr). Reads producer facts (attention, red, waits_on) and
// never re-derives them.

export function since(ms) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  return minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`;
}

const SECTIONS = ["Needs you", "Working", "Waiting", "Paused"];

// The seat's program tile: a knownAgents Program whose key is the harness or
// whose first run word is the seat command's first word, else null (the row
// then keeps the cell empty).
function seatProgram(seat, agents) {
  const word = seat.command.split(" ")[0];
  return agents.find((p) => p.key === seat.harness) ?? agents.find((p) => (p.run ?? [])[0] === word) ?? null;
}

// One section per row, first match wins: an attention fact beats a hold, a
// hold beats recorded activity (stop keeps busy_since), a merged leaf hides
// unless its broadcast is still pending.
function sectionFor(repo, leaf) {
  if (leaf.attention.length > 0) return "Needs you";
  if (leaf.phase === "merged") return leaf.broadcast_pending ? "Waiting" : null;
  if (leaf.stopped || repo.paused) return "Paused";
  if (leaf.busy_since.a !== null || leaf.busy_since.b !== null || leaf.land?.alive === true) return "Working";
  return "Waiting";
}

// The one short phrase on line 2, first match wins: broadcast pending, a live
// blocker, merge queue place, then the unstarted required seats.
function reason(repo, leaf, section) {
  if (section === "Needs you") return leaf.attention[0];
  if (section === "Paused") return leaf.stopped ? "stopped" : "paused";
  if (leaf.broadcast_pending) return "broadcast pending";
  const dep = leaf.blocked_by.find((d) => d.label !== "merged");
  if (dep !== undefined) return `waiting on ${repo.name}/${dep.slug}`;
  const entry = repo.queue.find((e) => e.slug === leaf.slug);
  if (entry !== undefined) return `merge queue #${entry.place}`;
  if (leaf.waits_on.length > 0) return `next: ${leaf.waits_on.join("+")}`;
  return "";
}

// Busy rows carry the busy duration (earliest busy seat), everything else the
// phase age — both in the short form.
function rowTime(leaf, now) {
  const busy = [leaf.busy_since.a, leaf.busy_since.b].filter((t) => t !== null);
  if (busy.length > 0) return since(now - Math.min(...busy));
  return leaf.phase_since === null ? "" : since(now - leaf.phase_since);
}

// Distinct unmerged leaves in the same repo whose blocked_by names this slug
// and does not record it merged.
function dependents(repo, slug) {
  return repo.leaves.filter(
    (dep) =>
      dep.phase !== "merged" &&
      dep.slug !== slug &&
      dep.blocked_by.some((b) => b.slug === slug && b.label !== "merged"),
  ).length;
}

// A history entry as a move: JSON log lines read "<from> → <to>", any other
// line shows as written.
function move(line) {
  if (!line.startsWith("{")) return line;
  const entry = JSON.parse(line);
  return `${entry.from} → ${entry.to}`;
}

// The expand view's history line: the move prefixed with how long ago it was.
function moveLine(line, now) {
  return line.startsWith("{") ? `${since(now - Date.parse(JSON.parse(line).ts))} ago  ${move(line)}` : line;
}

function leafRow(repo, leaf, section, ctx) {
  const programOf = (seat) => seatProgram(seat, ctx.agents);
  const a = programOf(leaf.seats.a);
  const b = programOf(leaf.seats.b);
  const folder = leaf.plan.slice(0, leaf.plan.lastIndexOf("/"));
  const why = reason(repo, leaf, section);
  return {
    repo: repo.name,
    slug: leaf.slug,
    phase: leaf.phase,
    section,
    time: rowTime(leaf, ctx.now),
    reason: why,
    reasonRed: section === "Needs you",
    blocks: dependents(repo, leaf.slug),
    seats: {
      a: { busy: leaf.busy_since.a !== null, logo: a?.icon ?? null, tint: a?.tint === true },
      b: { busy: leaf.busy_since.b !== null, logo: b?.icon ?? null, tint: b?.tint === true },
    },
    folder,
    worktree: leaf.worktree,
    parked: false,
    detail: {
      reasons: leaf.attention.length > 0 ? leaf.attention : why === "" ? [] : [why],
      blockedBy: leaf.blocked_by.map((dep) => `${dep.slug} ${dep.label}`),
      missing: leaf.missing.map((gap) => `${gap.kind} ${gap.name} in ${gap.holder}: ${gap.steps}`),
      moves: leaf.history.slice(-3).map((line) => moveLine(line, ctx.now)),
      kept: repo.kept,
    },
  };
}

// A parked entry: a folder name with no seats, no click target and no expand.
function parkedRow(repo, name) {
  return {
    repo: repo.name,
    slug: name,
    phase: "",
    section: "Paused",
    time: "",
    reason: "parked",
    reasonRed: false,
    blocks: dependents(repo, name),
    seats: { a: { busy: false, logo: null, tint: false }, b: { busy: false, logo: null, tint: false } },
    folder: null,
    worktree: null,
    parked: true,
    detail: { reasons: [], blockedBy: [], missing: [], moves: [], kept: [] },
  };
}

// Non-task problems in one block above Needs you: deploy, unreadable repos,
// repo errors and the dim run-waiting line whose full text opens on a click.
function machine(env) {
  const lines = [];
  if (env.deploy?.failed)
    lines.push({ text: `deploy failed at ${env.deploy.step ?? "unknown"}: ${env.deploy.error ?? ""}`, tone: "red", detail: null });
  for (const repo of env.repos) {
    for (const entry of repo.unreadable)
      lines.push({ text: `${repo.name} · ${entry.path} unreadable: ${entry.error}`, tone: "red", detail: null });
    if (repo.error !== null && repo.unreadable.length === 0)
      lines.push({ text: `${repo.name} · ${repo.error}`, tone: "red", detail: null });
  }
  if (env.run !== null) lines.push({ text: "run waiting", tone: "dim", detail: env.run });
  return lines;
}

export function leafRows(board) {
  return board.sections.flatMap((section) => section.rows).filter((row) => !row.parked);
}

// The whole board: machine lines and rows grouped into Needs you, Working,
// Waiting, Paused across repos — merged leaves and empty sections hidden,
// rows sorted by how many unmerged same-repo leaves wait on them.
export function board(env, ctx) {
  const buckets = SECTIONS.map((name) => ({ name, rows: [] }));
  for (const repo of env.repos) {
    for (const leaf of repo.leaves) {
      const section = sectionFor(repo, leaf);
      if (section !== null)
        buckets
          .find((s) => s.name === section)
          .rows.push({ row: leafRow(repo, leaf, section, ctx), age: leaf.phase_since ?? Infinity });
    }
    for (const name of repo.parked)
      buckets.find((s) => s.name === "Paused").rows.push({ row: parkedRow(repo, name), age: Infinity });
  }
  const sections = buckets
    .map((s) => ({
      name: s.name,
      rows: s.rows.sort((a, b) => b.row.blocks - a.row.blocks || a.age - b.age).map((entry) => entry.row),
    }))
    .filter((s) => s.rows.length > 0);
  return { problems: env.red, machine: machine(env), sections };
}

// The Files/Changes button press and the row-body pin: merge the space's pin
// into the pin map and emit the next panel.request. seq must exceed the last
// request's.
export function pinIntent(spaceId, folder, view, existingPin, seq) {
  return {
    pin: { ...existingPin, [spaceId]: { machine: null, folder } },
    request: { op: "open", view, seq: seq + 1 },
  };
}

// watch.files contents then vs now: any changed, removed or new file asks for
// a rescan (folders are covered by watchFolder).
export function filesChanged(before, now) {
  for (const path of Object.keys(before)) if (before[path] !== now[path]) return true;
  for (const path of Object.keys(now)) if (!(path in before)) return true;
  return false;
}
