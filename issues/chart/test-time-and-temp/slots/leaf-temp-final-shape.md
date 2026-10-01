# Leaf-temp proposed final shape for focused check (2026-10-01)

Operator reply verbatim: "1 - leaning towards a, but why can't it all be inside of the repo where akrogon is doing work, why does it HAVE to be in /var/tmp/? I'm just asking I'm a noob. | 2a - How will that work exactly? I'm just afraid we are adding more complexity, but it's fine. I just need to understand. eli | 3a - Does it have to be after 30 days? I don't think it should be more than 7 days, honestly. What is the catch here? | 4a |"

Q2 2a shape: in `cleanupMerged` (src/next.ts:559), for a merged leaf: if its tab still has live panes, close the tab and return (existing closeMergedTab). If the tab has no live panes, `rmSync(leafTemp, {recursive, force})`, then `git worktree prune` at repo root, then the existing `issues/open` early return / worktree removal. So deletion happens on the first sweep after the tab is confirmed gone. Failed leaves are not merged and keep the folder. Errors go through existing report() and retry next sweep.

Q3 3a + 7 days, proposed: no akrogon code. Operator adds one loop to the existing user script ~/.local/bin/tmp-sweep (hourly user timer), which already deletes an entry only when the newest file anywhere inside it is older than the limit:
  for e in /var/tmp/akrogon-$(id -u)/*; do [ -O "$e" ] || continue; sweep "$e" 10080; done
Whole-folder rule: a folder with any file changed in 7 days is kept whole. The OS 30-day per-file aging of /var/tmp still exists underneath. Seat rule: temp is scratch; evidence (failing names, log tails) goes in the leaf folder.
Alternative: akrogon's own sweep deletes leaf temp folders whose newest file is older than 7 days (new akrogon code).
