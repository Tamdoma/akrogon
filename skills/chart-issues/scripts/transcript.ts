#!/usr/bin/env bun
// Prints the transcript path of an hc terminal in this repo's session, or `-` when unknown
// (session-id Q3 3a): `bun transcript.ts <address>`. The door records it as seats.yaml `session`.
import { z } from 'zod';
import { readGlobal, requireRepo } from '../../../src/config';
import { label, repoSpace, type SpaceResolution } from '../../../src/hc';
import { transcriptFor } from '../../../src/transcript';

const [address]: [string] = z.tuple([z.string().min(1)]).parse(process.argv.slice(2));
const env = z
  .object({ HC_TERMINAL_ID: z.string().optional(), PI_SESSION_FILE: z.string().optional() })
  .parse(process.env);
const space: SpaceResolution = await repoSpace(await requireRepo(readGlobal(), process.cwd()));
if (!space.ok) throw new Error(space.reason);
// A pi seat asking about itself: pi sets PI_SESSION_FILE for each tool command to the conversation it
// writes now, which follows /new while its argv does not, so the seat publishes it as its label.
const own: string | undefined = address === env.HC_TERMINAL_ID ? env.PI_SESSION_FILE : undefined;
if (own !== undefined) await label(space.session, address, { 'akrogon.transcript': own });
process.stdout.write(`${own ?? (await transcriptFor({ session: space.session, address })) ?? '-'}\n`);
