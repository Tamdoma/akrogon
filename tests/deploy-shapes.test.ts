import { test, expect } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { repoSchema, type Repo } from '../src/config';
import { selfUpdate } from '../src/self-update';
import { deployFixture, deployRecord, head, pushSeed, releases, type DeployFixture } from './deploy-fixture';
import { herdrCalls, herdrStub } from './helpers';

// systemctl's calls, in the order they ran.
function callsPath(d: DeployFixture): string {
  return resolve(d.home, 'systemctl-calls.log');
}

// A recording herdr in the fixture's bin, ahead of every other herdr on PATH.
function stubHerdr(d: DeployFixture): () => string[] {
  const bin: string = resolve(d.home, 'bin');
  herdrStub(bin);
  return () => herdrCalls(bin);
}

function calls(d: DeployFixture): string[] {
  return readFileSync(callsPath(d), 'utf8').trim().split('\n');
}

// Runs one self-update in-process.
async function deploy(d: DeployFixture, env: NodeJS.ProcessEnv = {}): Promise<string[]> {
  const saved: NodeJS.ProcessEnv = { ...process.env };
  const lines: string[] = [];
  const original: typeof console.log = console.log;
  Object.assign(
    process.env,
    d.env,
    {
      AKROGON_HOME: d.home,
      FAKE_SYSTEMCTL_LOG: callsPath(d),
      FAKE_DEPLOY_RECORD: resolve(d.home, 'deploy.yaml'),
    },
    env,
  );
  console.log = (...args: unknown[]) => {
    lines.push(args.join(' '));
  };
  try {
    const repo: Repo = { name: 'akrogon', root: d.f.root, config: repoSchema.parse({ grounding: 'none' }) };
    await selfUpdate(repo, d.home);
  } finally {
    console.log = original;
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
  return lines;
}

async function pushListenerRelease(d: DeployFixture): Promise<string> {
  return await pushSeed(d, () => {
    rmSync(resolve(d.seed, 'plugin'), { recursive: true, force: true });
    writeFileSync(resolve(d.seed, 'systemd/akrogon-listener.service'), '[Service]\n');
  });
}

const reload: string = '--user daemon-reload linked=yes record=no';
const enable: string = '--user enable akrogon-listener.service linked=yes record=no';
const restart: string = '--user restart --no-block akrogon-listener.service linked=yes record=yes';
test.serial('a release holding plugin/ deploys with only the reload call and no herdr call', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const herdr: () => string[] = stubHerdr(d);
    const sha: string = await head(d);
    const lines: string[] = await deploy(d);
    expect(lines.join('\n')).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(deployRecord(d)).toMatchObject({ commit: sha, ok: true });
    expect(calls(d)).toEqual([reload]);
    expect(herdr()).toEqual([]);
  } finally {
    d.f.clean();
  }
});

test.serial('a listener release links and enables the unit, records, restarts it and calls no herdr', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const herdr: () => string[] = stubHerdr(d);
    expect((await deploy(d)).join('\n')).toContain('deployed');
    const sha: string = await pushListenerRelease(d);
    rmSync(callsPath(d));
    rmSync(resolve(d.home, 'deploy.yaml'));
    const lines: string[] = await deploy(d);
    expect(lines.join('\n')).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(deployRecord(d)).toMatchObject({ commit: sha, ok: true });
    const unit: string = resolve(d.home, '.config/systemd/user/akrogon-listener.service');
    expect(readlinkSync(unit)).toBe(resolve(d.home, 'current', 'systemd/akrogon-listener.service'));
    expect(realpathSync(unit)).toBe(resolve(releases(d), sha, 'systemd/akrogon-listener.service'));
    expect(calls(d)).toEqual([reload, enable, restart]);
    expect(herdr()).toEqual([]);
  } finally {
    d.f.clean();
  }
});

// The first release still holds herdr-app/tasks and gets no mod link. The link earlier releases made
// (through current, as on this machine) is removed by the next deploy, which keeps real folders and
// links into other trees.
test.serial('a deploy links no herdr-app mod, calls no herdr, and removes the old mods/tasks link', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const herdr: () => string[] = stubHerdr(d);
    const mods: string = resolve(d.home, '.config/herdr-app/mods');
    const first: string = await pushSeed(d, () => {
      mkdirSync(resolve(d.seed, 'herdr-app/tasks'), { recursive: true });
      writeFileSync(resolve(d.seed, 'herdr-app/tasks/main.js'), 'export default {}\n');
    });
    expect((await deploy(d)).join('\n')).toContain(`deployed ${first.slice(0, 12)}`);
    expect(existsSync(resolve(d.home, '.config/herdr-app'))).toBe(false);
    mkdirSync(resolve(mods, 'agents'), { recursive: true });
    const foreign: string = resolve(d.home, 'herdr-setup/mods/board');
    mkdirSync(foreign, { recursive: true });
    symlinkSync(foreign, resolve(mods, 'board'));
    symlinkSync(resolve(d.home, 'current/herdr-app/tasks'), resolve(mods, 'tasks'));
    const second: string = await pushSeed(d, () =>
      rmSync(resolve(d.seed, 'herdr-app'), { recursive: true, force: true }),
    );
    expect((await deploy(d)).join('\n')).toContain(`deployed ${second.slice(0, 12)}`);
    expect(lstatSync(resolve(mods, 'tasks'), { throwIfNoEntry: false })).toBeUndefined();
    expect(readdirSync(mods).sort()).toEqual(['agents', 'board']);
    expect(readlinkSync(resolve(mods, 'board'))).toBe(foreign);
    expect(herdr()).toEqual([]);
  } finally {
    d.f.clean();
  }
});
