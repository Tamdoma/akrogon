import { fixture, leaf, holding, fakeHerdr, cli } from "/home/ivan/.akrogon/worktrees/akrogon/shared-inventory/tests/helpers.ts";
import { repoInventory } from "/home/ivan/.akrogon/worktrees/akrogon/shared-inventory/src/state.ts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
for (const mode of ["foreign", "duplicate"]) {
 const f = await fixture();
 try {
  const h = fakeHerdr(f);
  leaf(f, "healthy", "merge", { ...holding(f), merge_stamp: "2026-10-19T00:00:00Z" }, "owner");
  if (mode === "foreign") leaf(f,"other", "merged", {repo:"wrong-repo"}, "owner");
  else {leaf(f,"dupe", "merged", {}, "owner/one"); leaf(f,"dupe", "merged", {}, "owner/two");}
  const inv = repoInventory({root:f.root,name:"repo"});
  const result = await cli(f,["phase","healthy","merged"],f.root,h.env);
  console.log(JSON.stringify({mode, unreadable:inv.unreadable, foreign:inv.foreign, code:result.code, stdout:result.stdout,stderr:result.stderr, closed:existsSync(resolve(f.root,"issues/closed/owner"))}));
 } finally {f.clean();}
}
