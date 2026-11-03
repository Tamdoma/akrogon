// Tasks board view model: envelope + context in, row tree out. Pure: no host
// imports, so akrogon's bun tests exercise it directly (main.js owns herdr).

const STAGE_SLOTS = { plan: "ansi4", implement: "ansi6", check: "ansi5", merge: "ansi2", failed: "ansi1" };

// The stage word's ANSI slot. Merged rows carry no pill; everything outside a
// live stage (parked/stopped/paused and unknown phases) is grey.
export function pill(phase) {
  const stage = phase.split(".")[0];
  if (stage === "merged") return null;
  return { slot: STAGE_SLOTS[stage] ?? "muted" };
}

export function clock(ms) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function since(ms) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  return minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`;
}

// The seat's program tile: a knownAgents Program whose key is the harness or
// whose first run word is the seat command's first word, else null (the row
// then shows the letter alone).
function seatProgram(seat, agents) {
  const word = seat.command.split(" ")[0];
  return agents.find((p) => p.key === seat.harness) ?? agents.find((p) => (p.run ?? [])[0] === word) ?? null;
}

// Where the leaf's worktree store is inferred: the parent of a worktree dir.
function worktreeRoot(leaf) {
  const i = leaf.worktree.lastIndexOf("/");
  return i > 0 ? leaf.worktree.slice(0, i) : null;
}

// The repo the active space belongs to: its name when it names a repo, else
// the repo whose root or leaf-worktree store holds the space's folder.
function currentRepoName(ctx, repos) {
  if (repos.some((r) => r.name === ctx.spaceName)) return ctx.spaceName;
  const folder = ctx.spaceFolder;
  if (folder) {
    const inside = folder.endsWith("/") ? folder : folder + "/";
    for (const repo of repos) {
      if (repo.root === folder || inside.startsWith(repo.root + "/")) return repo.name;
      const store = repo.leaves.map(worktreeRoot).find((root) => root !== null);
      if (store && (store === folder || inside.startsWith(store + "/"))) return repo.name;
    }
  }
  return null;
}

function tags(leaf) {
  const out = [];
  for (const dep of leaf.blocked_by) out.push(`blocked-by ${dep.slug} (${dep.label})`);
  if (leaf.stopped) out.push("stopped");
  if (leaf.broadcast_pending) out.push("broadcast pending");
  if (leaf.land) out.push(`land ${leaf.land.alive ? "alive" : "dead"}`);
  for (const seat of ["a", "b"]) {
    const err = leaf.delivery_errors[seat];
    if (err !== null) out.push(`${seat} prompt ${err.code ?? "error"}`);
  }
  if (leaf.failure) out.push(`failed ${leaf.failure.cause} ${leaf.failure.reason}`);
  for (const gap of leaf.missing) out.push(`missing ${gap.kind} ${gap.name}`);
  if (leaf.fix_rounds > 0) out.push(`fix rounds ${leaf.fix_rounds}`);
  return out;
}

function leafRow(repo, leaf, ctx) {
  const programOf = (seat) => seatProgram(seat, ctx.agents);
  const a = programOf(leaf.seats.a);
  const b = programOf(leaf.seats.b);
  return {
    repo: repo.name,
    slug: leaf.slug,
    phase: leaf.phase,
    groupPath: leaf.group.join("/"),
    depth: leaf.group.length,
    red: leaf.red,
    time: leaf.phase_since === null ? "-" : clock(ctx.now - leaf.phase_since),
    pill: leaf.phase === "merged" ? null : leaf.stopped || repo.paused ? { slot: "muted" } : pill(leaf.phase),
    seats: {
      a: { busy: leaf.busy_since.a !== null, logo: a?.icon ?? null, tint: a?.tint === true },
      b: { busy: leaf.busy_since.b !== null, logo: b?.icon ?? null, tint: b?.tint === true },
    },
    tags: tags(leaf),
    line2: [leaf.group.join("/"), ...leaf.history.slice(-1)].filter((part) => part !== "").join("  ·  "),
    detail: {
      history: leaf.history,
      seats: [
        `A ${leaf.seats.a.harness} ${leaf.seats.a.command} — ${leaf.seats.a.source}`,
        `B ${leaf.seats.b.harness} ${leaf.seats.b.command} — ${leaf.seats.b.source}`,
      ],
      plan: leaf.plan,
      worktree: leaf.worktree,
      kept: repo.kept,
      blockedBy: leaf.blocked_by.map((dep) => `${dep.slug} ${dep.label}`),
      done: leaf.done,
      attempts: `A:${leaf.attempts.A} B:${leaf.attempts.B}`,
      verdict: leaf.verdict,
      missing: leaf.missing.map((gap) => `${gap.kind} ${gap.name} in ${gap.holder}: ${gap.steps}`),
    },
  };
}

// Rows for one repo: group headings inserted where leaf.group changes, each
// leaf a two-line row carrying its expand detail.
function repoRows(repo, ctx) {
  const rows = [];
  let previous = [];
  for (const leaf of repo.leaves) {
    let shared = 0;
    while (shared < leaf.group.length && shared < previous.length && leaf.group[shared] === previous[shared]) shared++;
    for (let i = shared; i < leaf.group.length; i++)
      rows.push({ kind: "group", name: leaf.group[i], depth: i });
    previous = leaf.group;
    rows.push(leafRow(repo, leaf, ctx));
  }
  return rows;
}

function alerts(env) {
  const lines = [];
  if (env.run !== null) lines.push({ text: env.run, color: "ansi3" });
  if (env.deploy?.failed)
    lines.push({
      text: `deploy failed: attempted ${env.deploy.attempted?.slice(0, 12) ?? "unknown"}, step ${env.deploy.step ?? "unknown"}: ${env.deploy.error ?? ""}`,
      color: "ansi1",
    });
  for (const repo of env.repos) {
    for (const leaf of repo.leaves.filter((leaf) => leaf.phase === "failed"))
      lines.push({ text: `Failed: ${repo.name}/${leaf.slug}`, color: "ansi1" });
    for (const leaf of repo.leaves)
      for (const gap of leaf.missing)
        lines.push({ text: `Missing: ${repo.name}/${leaf.slug} ${gap.kind} ${gap.name} in ${gap.holder}: ${gap.steps}`, color: "ansi1" });
    for (const entry of repo.unreadable)
      lines.push({ text: `${repo.name}: ${entry.path} — ${entry.error}`, color: "ansi1" });
    if (repo.error !== null && repo.unreadable.length === 0)
      lines.push({ text: `${repo.name}: ${repo.error}`, color: "ansi1" });
    if (repo.slow !== null)
      lines.push({
        text: `Slow merge: ${repo.name} first seen at ${repo.slow.leaf} ${repo.slow.run}, last ${Math.round(repo.slow.ms / 60000)}m vs normal ${Math.round(repo.slow.normal_ms / 60000)}m`,
        color: "ansi3",
      });
    for (const entry of repo.unpacked)
      lines.push({ text: `Unpacked: ${repo.name} ${entry.path}: run ${entry.command}`, color: "muted" });
  }
  for (const kept of env.kept) lines.push({ text: `Kept: ${kept.path} — ${kept.reason}`, color: "muted" });
  return lines;
}

export function leafRows(board) {
  return board.repos.flatMap((repo) => repo.rows.filter((row) => row.slug !== undefined));
}

// The whole board: alert lines, ordered repo sections, folded merges.
export function board(env, ctx) {
  const first = currentRepoName(ctx, env.repos);
  const ordered = [...env.repos].sort((a, b) => {
    if (a.name === first) return -1;
    if (b.name === first) return 1;
    return a.name.localeCompare(b.name);
  });
  const repos = ordered.map((repo) => {
    const folded = repo.leaves.length === 0 && repo.error === null && repo.unreadable.length === 0;
    return {
      name: repo.name,
      paused: repo.paused,
      folded,
      foldedLine: `${repo.name}${repo.paused ? " (paused)" : ""} — no open leaves`,
      rows: folded ? [] : repoRows(repo, ctx),
      queue: repo.queue.map((entry) => `${entry.slug} ${entry.place === 1 ? "holder" : entry.place}${entry.no_record ? " no merge record" : ""}`),
      charts: repo.charts,
      parked: repo.parked,
      kept: repo.kept,
    };
  });
  const merges = env.merges.slice(0, 5).map((merge) => ({
    repo: merge.repo,
    slug: merge.slug,
    age: merge.merged === null ? "-" : since(ctx.now - merge.merged),
    total: merge.total_ms === null ? "-" : clock(merge.total_ms),
  }));
  return { alerts: alerts(env), repos, merges, mergesFolded: `Last merges (${merges.length})` };
}

// The Files/Changes button press: merge the space's pin into the pin map and
// emit the next panel.request. seq must exceed the last request's.
export function pinIntent(spaceId, leaf, view, existingPin, seq) {
  return {
    pin: { ...existingPin, [spaceId]: { machine: null, folder: leaf.worktree } },
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
