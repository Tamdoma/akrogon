// Tasks board: the akrogon status --json envelope as a read-only repo/leaf
// list. All host calls live here; model.js/schedule.js stay pure for tests.

import { View, div, svg, image } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import {
  exec, readTextFile, watchFolder, knownAgents, spaces, theme,
  shared, setShared, nextCommand, props,
} from "herdr";
import { board, pinIntent, filesChanged } from "./model.js";
import { next } from "./schedule.js";

const TICK_MS = 30000; // times re-render every 30 s; the command never reruns on it
const SPINNER = "mods/workspace-chrome/spinner.svg";

// tint a 6- or 8-digit hex with alpha, so the pill base carries the ~12%
// stage tint without element opacity reaching the word.
function withAlpha(color, frac) {
  const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(color ?? "");
  if (!m) return color;
  return `#${m[1]}${Math.round(frac * 255).toString(16).padStart(2, "0")}`;
}

function logo(cell, letter, t) {
  const icon = cell.busy
    ? svg(SPINNER).size(12).mx(2).flex_none().text_color(t.working).spin(900)
    : cell.logo ? cell.tint
      ? svg(cell.logo).size(16).flex_none().text_color(t.foreground)
      : image(cell.logo).size(16).flex_none() : null;
  return h_flex().flex_none().items_center().gap(2)
    .when(icon !== null, (el) => el.child(icon))
    .child(div().text_color(t.muted).child(letter));
}

function alertColor(t, name) {
  return name === "muted" ? t.muted : t[name];
}

export default class Tasks extends View {
  init(_props, cx) {
    this.env = null;          // last parsed envelope
    this.model = null;        // last board() result
    this.error = null;        // exec/parse failure text, shown instead of env data
    this.expanded = new Set();
    this.showMerges = false;
    this.seq = Date.now();
    this.scanning = false;
    this.wanted = false;
    this.watching = new Set();
    this.fileSnap = null;     // last watch.files contents
    this.agents = [];
    this.stamp = 0;
    cx.timer.every(TICK_MS, (cx) => { this.tick(cx); });
    cx.spawn(async (cx) => {
      for (;;) {
        const c = await nextCommand();
        const i = c.indexOf(":");

        const name = i === -1 ? c : c.slice(0, i);
        const arg = i === -1 ? "" : c.slice(i + 1);
        const [slug, view] = arg.split(" ");
        if (name === "expand") {
          const { repo, leaf } = this.findLeaf(arg);
          this.toggle(`${repo}/${leaf.slug}`);
          cx.notify();
        }
        else if (name === "pin") { this.pin(slug, view === "changes" ? "changes" : "files"); cx.notify(); }
      }
    });
    this.start(cx);
  }

  propsEnvelope() {
    const p = props()?.envelope;
    if (typeof p === "string" && p.trim().startsWith("{")) return JSON.parse(p);
    return null;
  }

  ctx() {
    const space = spaces().find((s) => s.active) ?? {};
    return { now: Date.now(), spaceName: space.name ?? "", spaceFolder: space.folder ?? "", agents: this.agents };
  }

  rebuild() {
    if (this.env === null) return;
    this.model = board(this.env, this.ctx());
  }

  requestScan(event, cx) {
    if (this.scanning) { this.wanted = true; return; }
    if (!next(event, false).rescan) return;
    this.start(cx);
  }

  async loadEnvelope() {
    const p = props()?.envelope;
    if (typeof p === "string" && !p.trim().startsWith("{")) {
      const text = await readTextFile(p);
      if (text !== null) return { env: JSON.parse(text), error: null };
      return { env: null, error: `envelope file unreadable: ${p}` };
    }
    const inline = this.propsEnvelope();
    if (inline !== null) return { env: inline, error: null };
    try {
      const r = await exec("akrogon", ["status", "--json"]);
      try {
        return { env: JSON.parse(r.stdout), error: null };
      } catch {
        return { env: null, error: `akrogon status --json: exit ${r.code} ${r.stderr.slice(0, 120)}` };
      }
    } catch (e) {
      return { env: null, error: `akrogon status --json: ${String(e)}` };
    }
  }

  async snapFiles(files) {
    const snap = {};
    for (const path of files)
      // current is a symlinked directory and a removed file is null: neither
      // counts as content, but a flip still shows through deploy.yaml.
      try { snap[path] = await readTextFile(path); } catch { snap[path] = null; }
    return snap;
  }

  async diffFiles(cx) {
    if (this.env === null || this.fileSnap === null) return;
    const now = await this.snapFiles(this.env.watch.files);
    if (filesChanged(this.fileSnap, now)) { this.fileSnap = now; this.requestScan("files-changed", cx); }
  }

  start(cx) {
    if (this.scanning) return;
    this.scanning = true;
    cx.spawn(async (cx) => {
      const { env, error } = await this.loadEnvelope();
      try { this.agents = await knownAgents(); } catch { this.agents = []; }
      this.scanning = false;
      if (env !== null) {
        this.env = env;
        this.error = null;
        this.stamp = Date.now();
        this.rebuild();
        this.watchAll(env, cx);
        this.fileSnap = await this.snapFiles(env.watch.files);
      } else {
        this.error = error;
        if (this.env === null) this.model = null;
        else this.rebuild();
      }
      cx.notify();
      if (this.wanted) { this.wanted = false; this.start(cx); }
    });
  }

  watchAll(env, cx) {
    for (const dir of env.watch.folders) {
      if (this.watching.has(dir)) continue;
      this.watching.add(dir);
      cx.spawn(async (cx) => {
        try {
          while (this.watching.has(dir)) {
            await watchFolder(dir);
            if (this.watching.has(dir)) this.requestScan("folder-hit", cx);
          }
        } catch { this.watching.delete(dir); }
      });
    }
  }

  tick(cx) {
    if (this.env === null) { this.start(cx); cx.notify(); return; }
    this.rebuild();
    cx.notify();
    cx.spawn(async (cx) => { await this.diffFiles(cx); cx.notify(); });
  }

  toggle(slug) {
    if (this.expanded.has(slug)) this.expanded.delete(slug);
    else this.expanded.add(slug);
  }

  pin(slug, view) {
    if (this.env === null || (view !== "files" && view !== "changes")) return;
    const { leaf } = this.findLeaf(slug);
    const space = spaces().find((s) => s.active);
    if (space === undefined) return;
    const pin = shared("worktree.pin") ?? {};
    const intents = pinIntent(space.id, leaf, view, pin, Math.max(this.seq, shared("panel.request")?.seq ?? 0));
    this.seq = intents.request.seq;
    setShared("worktree.pin", intents.pin);
    setShared("panel.request", intents.request);
  }

  findLeaf(key) {
    if (this.env === null) throw new Error("Tasks board has not loaded");
    const matches = this.env.repos.flatMap((repo) => repo.leaves
      .filter((leaf) => leaf.slug === key || `${repo.name}/${leaf.slug}` === key)
      .map((leaf) => ({ repo: repo.name, leaf })));
    if (matches.length !== 1)
      throw new Error(`Expected one Tasks leaf for ${key}, found ${matches.length}; use repo/slug`);
    return matches[0];
  }

  alertLine(line, i, t) {
    return div().id(`alert-${i}`).px(10).py(1).text_size(11).text_color(alertColor(t, line.color)).child(line.text);
  }

  // The stage word in t.foreground on its own t.background base with a ~12%
  // stage tint and a 6 px stage-colored dot (look.md recipe); merged rows
  // carry no pill.
  pillFor(row, t) {
    if (row.pill === null) return null;
    const color = row.pill.slot === "muted" ? t.muted : t[row.pill.slot];
    return div().flex_none().rounded(4).overflow_hidden().bg(t.background).child(
      h_flex().px(5).h(16).items_center().gap(4).bg(withAlpha(color, 0.12))
        .child(div().w(6).h(6).rounded_full().bg(color).flex_none())
        .child(div().text_size(10).text_color(t.foreground).child(row.phase.split(".")[0]))
    );
  }

  row(row, t) {
    // props().fill "hover"|"selected" forces that row fill on every row and
    // props().expand expands all rows: screenshot proofs without a pointer.
    const fill = props()?.fill;
    const key = `${row.repo}/${row.slug}`;
    const open = props()?.expand === true || this.expanded.has(key);
    const head = v_flex().id(`task-${key}`).flex_none().w_full().px(6).py(4).gap(2)
      .rounded(6).cursor_pointer()
      .hover((s) => s.bg(t.hover))
      .when(open, (el) => el.bg(t.selected))
      .when(fill === "hover" && !open, (el) => el.bg(t.hover))
      .when(fill === "selected" && !open, (el) => el.bg(t.selected))
      .on_click(() => this.toggle(key))
      .child(
        h_flex().items_center().gap(6).min_w(0)
          .child(h_flex().flex_none().items_center()
            .child(logo(row.seats.a, "A", t))
            .child(logo(row.seats.b, "B", t)))
          .child(div().flex_none().text_size(12).font_semibold().text_color(row.red ? t.ansi1 : t.foreground).child(row.slug))
          .when(row.pill !== null, (el) => el.child(this.pillFor(row, t)))
          .child(div().flex_1().min_w(0))
          .child(div().flex_none().text_size(10).text_color(t.dim).child(row.time))
      )
      .child(
        h_flex().items_center().gap(6).pl(38).min_w(0)
          .child(div().flex_1().min_w(0).truncate().text_size(10).text_color(t.muted).child(row.line2))
      );
    if (row.tags.length > 0)
      head.child(
        div().pl(38).truncate().text_size(10).text_color(t.dim).child(row.tags.join("  ·  "))
      );
    if (!open) return head;
    const d = row.detail;
    const detail = v_flex().pl(38).pr(6).gap(1).text_size(10).text_color(t.muted);
    for (const seat of d.seats) detail.child(div().truncate().child(seat));
    detail.child(div().truncate().child(`plan ${d.plan}`));
    detail.child(div().truncate().child(`worktree ${d.worktree}`));
    for (const kept of d.kept)
      detail.child(div().truncate().child(`kept ${kept.path} — ${kept.reason}`));
    if (d.blockedBy.length > 0) detail.child(div().truncate().child(`blocked by ${d.blockedBy.join(", ")}`));
    for (const gap of d.missing) detail.child(div().truncate().text_color(t.ansi1).child(`Missing: ${gap}`));
    if (d.history.length > 0) {
      detail.child(div().pt(4).text_color(t.dim).child("history"));
      for (const line of d.history.slice(-10)) detail.child(div().truncate().child(line));
    }
    detail.child(
      h_flex().gap(6).pt(4).pb(2).children(
        ["files", "changes"].map((view) =>
          div().id(`task-${key}-${view}`).px(8).h(20).rounded(4).cursor_pointer().flex().items_center()
            .bg(t.raised).hover((s) => s.bg(t.hover))
            .text_size(10).text_color(t.foreground)
            .on_click((e, cx) => { cx.stop_propagation(); this.pin(key, view); })
            .child(view === "files" ? "Files" : "Changes")
        )
      )
    );
    return head.child(detail);
  }

  repoSection(repo, t) {
    if (repo.folded) {
      const key = `fold-${repo.name}`;
      const open = this.expanded.has(key);
      const marks = [repo.paused ? "paused" : "", repo.charts.length > 0 ? `Charts (${repo.charts.length})` : ""].filter((m) => m !== "").join(" · ");
      const el = v_flex().flex_none().w_full().child(
        div().id(`repo-${repo.name}`).w_full().px(10).py(4).cursor_pointer()
          .hover((s) => s.bg(t.hover))
          .on_click(() => this.toggle(key))
          .text_size(11).text_color(t.foreground)
          .child(`${repo.name} — no open leaves${marks === "" ? "" : ` · ${marks}`}`)
      );
      if (open)
        for (const row of repo.charts)
          el.child(div().pl(20).pr(10).text_size(10).text_color(t.dim).truncate().child(row.join("  ")));
      return el;
    }
    const out = v_flex().flex_none().w_full()
      .child(
        h_flex().id(`repo-${repo.name}`).w_full().px(10).pt(8).pb(2).items_center().gap(6)
          .child(div().text_size(11).font_semibold().text_color(t.foreground).child(repo.name))
          .when(repo.paused, (el) => el.child(div().text_size(10).text_color(t.muted).child("paused")))
      );
    for (const row of repo.rows) {
      if (row.kind === "group")
        out.child(div().pl(10 + row.depth * 14).pt(4).pr(10).text_size(10).text_color(t.muted).child(row.name));
      else out.child(this.row(row, t));
    }
    if (repo.queue.length > 0)
      out.child(div().px(10).pt(2).text_size(10).text_color(t.dim).child(`merge queue: ${repo.queue.join("  ")}`));
    if (repo.charts.length > 0) out.child(this.charts(repo, t));
    if (repo.parked.length > 0)
      out.child(div().px(10).pt(2).text_size(10).text_color(t.dim).child(`parked: ${repo.parked.join("  ")}`));
    return out;
  }

  charts(repo, t) {
    const open = this.expanded.has(`charts-${repo.name}`);
    const el = v_flex().flex_none().child(
      h_flex().id(`charts-${repo.name}`).px(10).pt(4).gap(4).cursor_pointer().items_center()
        .on_click(() => this.toggle(`charts-${repo.name}`))
        .child(div().text_size(10).text_color(t.muted).child(`${open ? "▾" : "▸"} Charts (${repo.charts.length})`))
    );
    if (open)
      for (const row of repo.charts)
        el.child(div().pl(20).pr(10).text_size(10).text_color(t.dim).truncate().child(row.join("  ")));
    return el;
  }

  merges(t) {
    const open = this.showMerges;
    const el = v_flex().flex_none().w_full().border_t(1).border_color(t.border)
      .child(
        h_flex().id("merges").px(10).py(4).gap(4).cursor_pointer().items_center()
          .on_click(() => { this.showMerges = !this.showMerges; })
          .child(div().text_size(10).text_color(t.muted).child(`${open ? "▾" : "▸"} ${this.model.mergesFolded}`))
      );
    if (open)
      for (const m of this.model.merges)
        el.child(
          h_flex().px(10).gap(6).items_center().text_size(10)
            .child(div().text_color(t.foreground).child(`${m.repo}/${m.slug}`))
            .child(div().flex_1().min_w(0))
            .child(div().text_color(t.muted).child(`${m.age} · total ${m.total}`))
        );
    return el;
  }

  render(cx) {
    const t = theme();
    const root = v_flex().id("tasks").size_full().min_h(0).bg(t.background).text_color(t.foreground).text_size(12);
    if (this.error !== null && this.env === null)
      return root
        .child(div().p(10).text_color(t.ansi1).child(this.error))
        .child(div().px(10).text_color(t.muted).child("board unavailable"));
    if (this.model === null)
      return root.child(div().p(10).text_color(t.muted).child("loading…"));
    const list = v_flex().id("tasks-list").flex_1().min_h(0).w_full().overflow_y_scrollbar().py(4);
    if (this.error !== null)
      list.child(div().px(10).py(2).text_size(11).text_color(t.ansi1).child(this.error));
    for (const [i, line] of this.model.alerts.entries()) list.child(this.alertLine(line, i, t));
    for (const repo of this.model.repos) list.child(this.repoSection(repo, t));
    if (this.model.repos.length === 0)
      list.child(div().p(10).text_color(t.muted).child("no registered repos"));
    root.child(list);
    if (this.model.merges.length > 0) root.child(this.merges(t));
    return root;
  }
}
