import { test, expect } from 'bun:test';
import {
  mkdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { repoSchema, type Repo } from '../src/config';
import { selfUpdate } from '../src/self-update';
import { deployFixture, deployRecord, head, pushSeed, releases, type DeployFixture } from './deploy-fixture';

// systemctl and herdr append to one file, so the calls read back in the order they ran.
function callsPath(d: DeployFixture): string {
  return resolve(d.home, 'herdr.json.calls');
}

function calls(d: DeployFixture): string[] {
  return readFileSync(callsPath(d), 'utf8').trim().split('\n');
}

// Runs one self-update in-process, so PATH can leave out herdr while git still resolves.
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
const unlink: string = JSON.stringify(['plugin', 'unlink', 'akrogon']);

test.serial('a plugin release deploys with only the reload and plugin link calls, in that order', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await head(d);
    const lines: string[] = await deploy(d);
    expect(lines.join('\n')).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(deployRecord(d)).toMatchObject({ commit: sha, ok: true });
    expect(calls(d)).toEqual([reload, JSON.stringify(['plugin', 'link', resolve(d.home, 'current', 'plugin')])]);
  } finally {
    d.f.clean();
  }
});

test.serial(
  'a listener release links and enables the unit, records, restarts it, then unlinks the plugin',
  async () => {
    const d: DeployFixture = await deployFixture();
    try {
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
      expect(calls(d)).toEqual([reload, enable, restart, unlink]);
    } finally {
      d.f.clean();
    }
  },
);

test.serial('a listener release deploys with no herdr binary on PATH and skips the unlink', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await pushListenerRelease(d);
    const bin: string = resolve(d.home, 'bin');
    unlinkSync(resolve(bin, 'herdr'));
    const tools: string = resolve(d.home, 'tools');
    mkdirSync(tools);
    for (const name of ['git', 'tar']) symlinkSync(z.string().parse(Bun.which(name)), resolve(tools, name));
    const lines: string[] = await deploy(d, { PATH: `${bin}:${tools}` });
    expect(lines.join('\n')).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(deployRecord(d)).toMatchObject({ commit: sha, ok: true });
    expect(calls(d)).toEqual([reload, enable, restart]);
  } finally {
    d.f.clean();
  }
});
