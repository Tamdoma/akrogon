# Example: one thought through the loop

## The operator says, in chat

"I want to depend on autocompaction. I don't want herdr or anything else clearing the agent's context. I don't think any one leaf will compact more than five or ten times."

## The check

Fetch the harness docs on prompt caching and context windows. Find what compaction does to the cache, what survives it, and what the docs recommend instead of outside clearing. Note which harnesses were checked.

## What lands in the file

Under the section where cost lives, as one paragraph on one line:

I am afraid of cache reading and cache writing, and I do not want another layer where herdr or anything else has to clear the agent's context at the right moments. I want to depend on autocompaction. I do not think any one leaf will be a problem for compaction a few times over, even five to ten times, not with the current models. Sanity check, tier 2, Claude Code prompt caching and context window docs (code.claude.com/docs/en/prompt-caching, /context-window): compaction throws away the conversation cache once by design, the summarising request reads the old history from the warm cache, and the next turn caches only the short summary, so a mid-session compaction costs a fraction of what the context size suggests. The docs recommend compaction instructions in the project file and durable state on disk, and nothing in them asks for an outside process to clear or compact. So the cost side of my premise holds. The risk is what the summary drops, and the plan file and state file are the answer to that. Checked for Claude Code only.

## What goes to chat, not the file

"Folded under Cost, quality, speed as a new subsection. One thing worth knowing for the skill rewrite: after compaction the harness re-injects skill bodies capped at 5,000 tokens each, keeping the start of the file, so whatever must survive goes at the top of SKILL.md. Want that in the file?"

## What does not happen

The paragraph does not say "we will depend on autocompaction". No bullet list of compaction facts. No decision code. No rewrite of the operator's first three sentences.
