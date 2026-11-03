// Tasks board: the akrogon status --json envelope as a read-only repo/leaf
// list. All host calls live here; model.js/schedule.js stay pure for tests.

import { View, div, svg, image } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import {
  exec, readTextFile, watchFolder, knownAgents, spaces, theme,
  shared, setShared, nextCommand, props, settings,
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

// Sizes follow the terminal text (settings().font_size; operator 2026-11-03:
// "Increase it to what we have by default here in normal terminals"): every
// size below is written at a 13 px base and scaled by S().
let K = 1;
const S = (n) => Math.round(n * K * 2) / 2;

const SEAT = 18;       // one seat icon, sized to the slug line
const SEATS_W = SEAT * 2 + 6; // two seat icons and their gap: the slug column starts here
const ROW_INSET = SEATS_W + 8;

// Both seats as herdr-app's own program icons, no letters; a working seat's
// icon is the Agents-list spinner; a seat with no matching program keeps its
// place empty (operator 2026-11-03: "the same ones that herdr-app is using ...
// Icons no letters, but here they need to be big to fit the design").
function seatIcon(cell, t) {
  const size = S(SEAT);
  if (cell.busy) return svg(SPINNER).size(size).flex_none().text_color(t.working).spin(900);
  if (cell.logo === null) return div().size(size).flex_none();
  return cell.tint ? svg(cell.logo).size(size).flex_none().text_color(t.foreground) : image(cell.logo).size(size).flex_none();
}

function seatIcons(seats, t) {
  return h_flex().w(S(SEATS_W)).flex_none().items_center().gap(S(6))
    .child(seatIcon(seats.a, t)).child(seatIcon(seats.b, t));
}

// A key/value line of the expanded row: dim label column, value beside it.
function field(label, value, t) {
  return h_flex().items_start().gap(8).min_w(0)
    .child(div().w(S(64)).flex_none().text_color(t.dim).child(label))
    .child(div().flex_1().min_w(0).truncate().child(value));
}

export default class Tasks extends View {
  init(_props, cx) {
    this.env = null;          // last parsed envelope
    this.model = null;        // last board() result
    this.error = null;        // exec/parse failure text, shown instead of env data
    this.expanded = new Set();
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
          this.toggle(`${repo}/${leaf.slug}`, cx);
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

  // A click redraws at once; the 30 s tick only refreshes times.
  toggle(slug, cx) {
    if (this.expanded.has(slug)) this.expanded.delete(slug);
    else this.expanded.add(slug);
    cx.notify();
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

  // An actionable line: a 6 px dot in its color, the text in the foreground.
  alertLine(line, i, t) {
    return h_flex().id(`alert-${i}`).px(8).py(4).gap(8).items_start().text_size(S(12))
      .child(div().mt(S(5)).size(S(6)).flex_none().rounded_full().bg(t[line.color]))
      .child(div().flex_1().min_w(0).text_color(t.foreground).child(line.text));
  }

  // The stage word as herdr-app's Agents list draws a status (mods/agents/main.js
  // status()): stage-colored semibold text on a ~12% stage tint, composited over
  // the pill's own opaque t.background so a hovered or selected row keeps its
  // color (look.md); merged rows carry no pill.
  pillFor(row, t) {
    if (row.pill === null) return null;
    const color = row.pill.slot === "muted" ? t.muted : t[row.pill.slot];
    return div().flex_none().rounded(5).overflow_hidden().bg(t.background).child(
      h_flex().px(6).h(S(18)).items_center().bg(withAlpha(color, 0.12))
        .child(div().text_size(S(10.5)).font_semibold().text_color(color).child(row.phase.split(".")[0]))
    );
  }

  row(row, t) {
    // props().fill "hover"|"selected" forces that row fill on every row and
    // props().expand expands all rows: screenshot proofs without a pointer.
    const fill = props()?.fill;
    const key = `${row.repo}/${row.slug}`;
    const open = props()?.expand === true || this.expanded.has(key);
    const second = [...row.tags, row.line2].filter((part) => part !== "").join("  ·  ");
    const head = v_flex().id(`task-${key}`).flex_none().w_full().px(8).py(4).gap(4)
      .rounded(6).cursor_pointer()
      .hover((s) => s.bg(t.hover))
      .when(open, (el) => el.bg(t.selected))
      .when(fill === "hover" && !open, (el) => el.bg(t.hover))
      .when(fill === "selected" && !open, (el) => el.bg(t.selected))
      .on_click((_e, cx) => this.toggle(key, cx))
      .child(
        h_flex().h(S(20)).items_center().gap(S(8)).min_w(0)
          .child(seatIcons(row.seats, t))
          .child(div().flex_1().min_w(0).truncate().text_size(S(13)).font_medium()
            .text_color(row.red ? t.ansi1 : row.pill === null ? t.muted : t.foreground).child(row.slug))
          .when(row.pill !== null, (el) => el.child(this.pillFor(row, t)))
          .child(div().w(S(44)).flex_none().text_right().text_size(S(11)).text_color(t.dim).child(row.time === "-" ? "" : row.time))
      )
      .when(second !== "", (el) => el.child(
        div().h(S(16)).pl(S(ROW_INSET)).min_w(0).truncate().text_size(S(11)).text_color(t.muted).child(second)
      ));
    if (!open) return head;
    const d = row.detail;
    const detail = v_flex().pl(S(ROW_INSET)).pt(4).pb(4).gap(4).text_size(S(11)).text_color(t.muted);
    if (d.failure !== null)
      detail.child(h_flex().items_start().gap(8).min_w(0)
        .child(div().w(S(64)).flex_none().text_color(t.dim).child("failed"))
        .child(div().flex_1().min_w(0).text_color(t.foreground).child(d.failure)));
    for (const [i, seat] of d.seats.entries()) detail.child(field(i === 0 ? "seats" : "", seat, t));
    detail.child(field("plan", d.plan, t));
    detail.child(field("worktree", d.worktree, t));
    if (d.blockedBy.length > 0) detail.child(field("blocked by", d.blockedBy.join(", "), t));
    for (const gap of d.missing)
      detail.child(h_flex().gap(8).min_w(0)
        .child(div().w(S(64)).flex_none().text_color(t.dim).child("missing"))
        .child(div().flex_1().min_w(0).truncate().text_color(t.ansi1).child(gap)));
    for (const [i, kept] of d.kept.entries()) detail.child(field(i === 0 ? "kept" : "", `${kept.path} — ${kept.reason}`, t));
    for (const [i, line] of d.history.slice(-10).entries()) detail.child(field(i === 0 ? "history" : "", line, t));
    detail.child(
      h_flex().gap(8).pt(4).children(
        ["files", "changes"].map((view) =>
          div().id(`task-${key}-${view}`).px(8).h(S(26)).rounded(6).cursor_pointer().flex().items_center()
            .bg(t.hover).hover((s) => s.text_color(t.foreground))
            .text_size(S(12)).text_color(t.muted)
            .on_click((e, cx) => { cx.stop_propagation(); this.pin(key, view); })
            .child(view === "files" ? "Files" : "Changes")
        )
      )
    );
    return head.child(detail);
  }

  repoSection(repo, t) {
    const out = v_flex().flex_none().w_full().pt(8)
      .child(
        h_flex().id(`repo-${repo.name}`).h(S(28)).px(8).items_center().gap(8)
          .child(div().text_size(S(13)).font_semibold().text_color(t.foreground).child(repo.name))
          .when(repo.paused, (el) => el.child(div().text_size(S(11)).text_color(t.muted).child("paused")))
      );
    for (const row of repo.rows) {
      if (row.kind === "group")
        out.child(div().h(S(24)).flex().items_center().pl(8 + row.depth * 12).pr(8)
          .text_size(S(11.5)).font_medium().text_color(t.dim).child(row.name));
      else out.child(this.row(row, t));
    }
    if (repo.queue.length > 0) out.child(this.note("merge queue", repo.queue.join("  "), t));
    if (repo.parked.length > 0) out.child(this.note("parked", repo.parked.join("  "), t));
    return out;
  }

  note(label, value, t) {
    return h_flex().h(S(24)).px(8).gap(8).items_center().text_size(S(11)).min_w(0)
      .child(div().flex_none().text_color(t.dim).child(label))
      .child(div().flex_1().min_w(0).truncate().text_color(t.muted).child(value));
  }

  render(cx) {
    // settings.json's font_size, else Herdr's terminal default of 14 (AGENTS.md, Fonts).
    const size = settings().font_size;
    K = (typeof size === "number" ? size : 14) / 13;
    const t = theme();
    const open = this.model === null ? 0 : this.model.repos.reduce((sum, repo) => sum + repo.rows.filter((row) => row.slug !== undefined && row.pill !== null).length, 0);
    const root = v_flex().id("tasks").size_full().min_h(0).bg(t.background).text_color(t.foreground).text_size(S(13))
      .child(h_flex().h(S(42)).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border)
        .child(div().font_semibold().child("Tasks"))
        .child(div().flex_1().min_w(0).truncate().text_right().text_size(S(12)).text_color(t.dim)
          .child(this.model === null ? "" : `${open} open`)));
    if (this.error !== null && this.env === null)
      return root.child(v_flex().p(8).gap(4)
        .child(div().px(8).text_size(S(12)).text_color(t.ansi1).child(this.error))
        .child(div().px(8).text_size(S(12)).text_color(t.dim).child("Board unavailable; retrying on the next tick")));
    if (this.model === null)
      return root.child(div().p(16).text_size(S(12)).text_color(t.dim).child("Loading tasks…"));
    // At full width the rows stop at a readable measure so the pill and time
    // stay near the slug instead of at the far window edge.
    const list = v_flex().w_full().max_w(S(880));
    if (this.error !== null)
      list.child(this.alertLine({ text: this.error, color: "ansi1" }, "scan", t));
    for (const [i, line] of this.model.alerts.entries()) list.child(this.alertLine(line, i, t));
    for (const repo of this.model.repos) list.child(this.repoSection(repo, t));
    const tail = v_flex().flex_none().w_full().pt(8);
    if (this.model.quiet.length === 0 && this.model.repos.length === 0)
      tail.child(div().px(8).py(4).text_size(S(12)).text_color(t.dim).child("No registered repos"));
    return root.child(v_flex().id("tasks-list").flex_1().min_h(0).w_full().overflow_y_scrollbar().p(8).child(list.child(tail)));
  }
}
