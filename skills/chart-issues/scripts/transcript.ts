#!/usr/bin/env bun
// Prints the transcript path of an hc terminal in this repo's session, or `-` when unknown
// (session-id Q3 3a): `bun transcript.ts <address>`. The door records it as seats.yaml `session`.
import { z } from 'zod';
import { readGlobal, requireRepo } from '../../../src/config';
import { repoSpace, type SpaceResolution } from '../../../src/hc';
import { transcriptFor } from '../../../src/transcript';

const [address]: [string] = z.tuple([z.string().min(1)]).parse(process.argv.slice(2));
const space: SpaceResolution = await repoSpace(await requireRepo(readGlobal(), process.cwd()));
if (!space.ok) throw new Error(space.reason);
process.stdout.write(`${(await transcriptFor({ session: space.session, address })) ?? '-'}\n`);
