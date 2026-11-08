No disagreement on the picks (Q1 `1a`, Q2 `2a`, Q3 `3a` via `doc.get` + `doc.set` CAS, Q4 `4a` with `--chart --seat`).

One sequencing detail on Q3 ("Restart of one consultant: swap the terminal in its existing node"):
- Because restarting a consultant under the same `--name` (`<prefix>-slot-<letter>`) requires `hc kill` before `hc run --name`, and killing the old terminal causes `herdr-app` to auto-remove its `block` node from `column.children`, the helper cannot look for `tOld` in `doc.get` *after* `hc kill`.
- Either snapshot the right-column node (or the seat's index/weights) via `doc.get` **before** `hc kill`, or order the right-column children deterministically by consultant seat (`B`, `C`, `D`, `E` via terminal labels/names) when writing `column.children` and `weights` in `doc.set`.
