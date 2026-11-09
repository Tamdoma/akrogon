import { test, expect } from 'bun:test';
import { fixtureRepo } from './helpers';

test('fixture prefixes stay distinct when colliding homes share a config', () => {
  const one: { repo: string; prefix: string } = fixtureRepo(
    '/var/tmp/akr-1000/5d20/00d67c8d/run-oasBhf/akrogon-suite-1391444-BzWYvm/akrogon-lWr6QL',
  );
  const two: { repo: string; prefix: string } = fixtureRepo(
    '/var/tmp/akr-1000/5d20/00d67c8d/run-oasBhf/akrogon-suite-1391444-BzWYvm/akrogon-sWMMs8',
    one.prefix,
  );
  expect(two.prefix).not.toBe(one.prefix);
  expect(two.prefix).toMatch(/^[a-z]{2}$/);
});
