import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, fakeAkrogon, cli, leaf, storeDir, leafTempRoot, entry } from '/home/ivan/.akrogon/worktrees/akrogon/verify-pass-service/tests/helpers.ts';
import { suiteRoot } from '/home/ivan/.akrogon/worktrees/akrogon/verify-pass-service/tests/isolation.ts';
import { command, quote, spawnCaptured } from '/home/ivan/.akrogon/worktrees/akrogon/verify-pass-service/src/shell.ts';
async function until(fn:()=>boolean):Promise<void> { const end:number=Date.now()+15000; while(!fn()) {if(Date.now()>end) throw new Error('proof timed out'); await Bun.sleep(50);} }
try {
 const f=await fixture();
 try {
  const worktree:string=resolve(storeDir(f),'cleanup');
  await command(['git','worktree','add',worktree,'-b','cleanup'],f.root);
  leaf(f,'cleanup','implement',{worktree});
  writeFileSync(resolve(f.root,'issues/config.yaml'),Bun.YAML.stringify({grounding:'none',setup:'mkdir -p node_modules',checks:{test:'true'}}));
  const env=fakeAkrogon(f).env;
  const shim:string=resolve(f.home,'git-shim'); mkdirSync(shim);
  const marker:string=resolve(f.home,'removing');
  writeFileSync(resolve(shim,'git'),`#!/bin/sh\nif [ "$1" = worktree ] && [ "$2" = remove ]; then touch ${quote(marker)}; sleep 3; echo cleanup-denied >&2; exit 1; fi\nexec /usr/bin/git "$@"\n`,{mode:0o755});
  const launchEnv={...env,PATH:`${shim}:${env.PATH}`};
  const first=cli(f,['verify'],worktree,launchEnv);
  await until(()=>existsSync(marker));
  const second=await cli(f,['verify'],worktree,launchEnv);
  const original=await first;
  console.log(JSON.stringify({scenario:'repeat-during-post-receipt-cleanup',starting_code:original.code,repeat_code:second.code,repeat_stdout:second.stdout}));
  if(original.code===0||second.code!==0||!second.stdout.includes('reuse receipt')) throw new Error('expected cleanup defect not reproduced');
 } finally {f.clean();}
 const g=await fixture();
 let passId:string|undefined;
 const slice:string=`akrogon-test-reviewB-${process.pid}.slice`;
 const realEnv={...process.env,AKROGON_HOME:g.home,HOME:g.home,AKROGON_RUN:'',AKROGON_RUN_SLICE:slice,AKROGON_LEAF_TEMP_ROOT:leafTempRoot(g),PATH:`${resolve(g.home,'bin')}:${process.env.PATH}`,XDG_RUNTIME_DIR:`/run/user/${process.getuid!()}`,DBUS_SESSION_BUS_ADDRESS:`unix:path=/run/user/${process.getuid!()}/bus`};
 const invoke=(args:string[],cwd:string)=>spawnCaptured([process.execPath,entry,...args],{cwd,env:realEnv});
 try {
  fakeAkrogon(g);
  const worktree:string=resolve(storeDir(g),'nested');
  await command(['git','worktree','add',worktree,'-b','nested'],g.root); leaf(g,'nested','implement',{worktree});
  const done:string=resolve(g.home,'inner-done');
  writeFileSync(resolve(g.root,'issues/config.yaml'),Bun.YAML.stringify({grounding:'none',setup:'mkdir -p node_modules',checks:{test:`touch ${quote(done)}`},full:['test']}));
  const outer=invoke(['run-check','--name','test','--',process.execPath,entry,'verify'],worktree);
  const records=():Record<string,string>[]=>existsSync(resolve(g.home,'runs'))?readdirSync(resolve(g.home,'runs')).filter(n=>n.endsWith('.yaml')).map(n=>Bun.YAML.parse(readFileSync(resolve(g.home,'runs',n),'utf8')) as Record<string,string>):[];
  await until(()=>records().some(r=>r.check==='test'&&r.state==='waiting'));
  const registry:string=resolve(g.home,'verify-passes'); passId=readdirSync(registry)[0];
  console.log(JSON.stringify({scenario:'verify-inside-full-run-check',records:records().map(r=>({check:r.check,state:r.state,run:r.run})),inner_completed:existsSync(done),pass:passId}));
  const stopped=await invoke(['stop-run',passId],worktree);
  const result=await outer;
  console.log(JSON.stringify({scenario:'nested-cleanup',stop_code:stopped.code,outer_code:result.code}));
  if(stopped.code!==0||result.code===0) throw new Error('nested proof cleanup failed');
 } finally {
  if(passId!==undefined) await spawnCaptured(['systemctl','--user','stop',`akrogon-verify-${passId}.service`],{env:realEnv});
  await spawnCaptured(['systemctl','--user','stop',slice],{env:realEnv});
  const active=await spawnCaptured(['systemctl','--user','is-active',slice],{env:realEnv});
  console.log(JSON.stringify({scenario:'unit-cleanup-readback',slice,active:active.code===0}));
  if(active.code===0) throw new Error('proof slice remains active');
  g.clean();
 }
} finally {rmSync(suiteRoot,{recursive:true,force:true});}

