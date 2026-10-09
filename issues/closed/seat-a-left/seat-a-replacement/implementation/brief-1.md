# Brief-1: fake herdr geometry, swap, layout, tab focus (U1)

## 1. Goal

Give `tests/fake-herdr.ts` the minimum parent-relative geometry and focus model so `akrogon next` allocation tests can assert pane positions and operator focus. Plan decisions D7, D9 (fake side).

## 2. Numbered acceptance criteria

1. Right split halves the parent pane width: original keeps `x`, new pane gets `x + floor(W/2)` with the remainder width, same `y`/`height`; all other panes keep IDs and rects.
2. `pane swap --source-pane X --target-pane Y` swaps the two rects, keeps pane IDs and agents, sets the leaf tab as focused tab with the source pane as its focused pane.
3. `pane layout --pane <id>` returns that tab's panes with `rect {x,y,width,height}`, `focused` flags, `focused_pane_id`, and `tab_id`.
4. Tabs carry `focused` and optional `workspace_id`; `tab focus <id>` moves focus to that tab; `tab create --no-focus` never steals focus; swap moves focus to the leaf tab like real herdr 0.9.3.
5. A scripted swap failure flag makes the next swap exit 1 with `{"error":{"code":"fixture_swap_failed","message":"fixture failure"}}`.
6. Existing fixtures without rects or focus still parse and existing `tests/next.test.ts` allocation tests pass unchanged.

## 3. Read-first list

- `tests/fake-herdr.ts` (only file to change; copy its `result`/`failure`/`flag`/`pane` pattern)
- `tests/helpers.ts` (`fakeHerdr` DB shape)
- `src/shell.ts` read-only for `paneSchema`/`tabSchema` (do not edit)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Live shapes copied here, not pointed at: layout result is `{layout:{tab_id,focused_pane_id,panes:[{pane_id,rect:{x,y,width,height},focused}]}}`; tab list result is `{tabs:[{tab_id,label,focused,workspace_id?}]}`; swap result is `{changed:true}`; tab focus result is `{tab:{tab_id}}`.

## 4. Change list and needed interfaces

- Owns: `tests/fake-herdr.ts` only.
- Needs first: none. Wave 1 with U2. Shared test resource: none.
- Define local `rectSchema` and extend fake-side only: `fakePane = paneSchema.extend({rect: rectSchema.optional(), focused: z.boolean().optional()})`, `fakeTab = tabSchema.extend({focused: z.boolean().optional(), workspace_id: z.string().optional()})`; keep all new fields optional so old DBs parse; default root rect on `tab create` to `{x:0,y:0,width:120,height:40}` and focused only when no tab is focused.
- Wire contract (binding, shared with U2): split args `['pane','split',<id>,'--direction','right',...]`; swap args `['pane','swap','--source-pane',B,'--target-pane',newA]`; layout args `['pane','layout','--pane',<id>]`; focus args `['tab','focus',<tabId>]`; swap failure flag `failSwapOnce: boolean` in DB.

## 5. Do-not, reasons and exceptions

- Do not touch `src/*` or `tests/next.test.ts`: U2 owns prod code, U3 owns tests; parallel edits would conflict on cherry-pick. Exception: none.
- Do not make `rect`/`focused` required: old fixtures omit them and must still parse. Exception: none.
- Do not change existing DB field semantics or call-log format: existing tests read them. Exception: none.
- Do not model vertical splits or full trees: only parent-relative `right` is needed (D7). Exception: a revised brief from A.
- On any conflict with this brief or the wire contract, return a mismatch with evidence instead of changing scope or the interface. Exception: a revised brief from A authorizing that change.
- Restated: stay in one file, keep new fields optional, keep old behavior, no extra geometry, mismatch over scope change.

## 6. Ordered steps

1. Read `tests/fake-herdr.ts` and `tests/helpers.ts` for criterion 6.
2. Add local rect/tab extensions and DB defaults for criteria 1, 4, 6.
3. Implement right-split halving for criterion 1.
4. Implement swap with rect swap plus focus move, and `failSwapOnce`, for criteria 2, 4, 5.
5. Implement `pane layout` and `tab focus` for criteria 3, 4.
6. Scratch-verify with a temp DB driving split, swap, layout, focus through the fake binary for criteria 1-5, then delete scratch files.
7. Run the section 7 command for criterion 6.
8. Commit only `tests/fake-herdr.ts` with a `Test-Change:` trailer naming the file and the added fake capability with no existing expectation changed.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Run only this, with the supplied base value (install deps first with `bun install` in this worktree if needed):

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Done when criteria 1-6 hold, the section 7 command passes, and the commit carries the trailer. Paste command results. Link each criterion to its fake behavior. Name limits and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
