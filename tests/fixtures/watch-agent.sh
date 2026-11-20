#!/bin/sh
# Watcher program for watch-timer tests: plays the harness in the terminal's foreground.
# First it runs the skill's start step as its own descendant (the foreground-pid ancestor
# rule), logs the outcome, runs the immediate check a model would run on started|running
# (paused anywhere in the status output acts on nothing, as the skill's Observe rule reads it),
# then execs stand-in.sh keeping this pid so stdin ticks reach the hook.
# argv: <skilldir> <root>; env: STANDIN_DIR, WATCHER_MODE (stand-in --model value),
# WATCH_AGENT_CLAUDE (a dir; writes a claude-shaped session record for this pid so the
# transcript resolver latches a path the test can flip).
skilldir=$1
root=$2
log="${STANDIN_DIR:?}/${HC_TERMINAL_ID:-unknown}.tasks"
if [ -n "${WATCH_AGENT_CLAUDE:-}" ]; then
	mkdir -p "$WATCH_AGENT_CLAUDE/sessions" "$WATCH_AGENT_CLAUDE/projects/p"
	st=$(sed 's/.*) //' /proc/$$/stat | awk '{print $20}')
	sid="aaaaaaaa-0000-0000-0000-000000000001"
	printf '{"sessionId":"%s","procStart":"%s"}' "$sid" "$st" > "$WATCH_AGENT_CLAUDE/sessions/$$.json"
	: > "$WATCH_AGENT_CLAUDE/projects/p/$sid.jsonl"
	export CLAUDE_CONFIG_DIR="$WATCH_AGENT_CLAUDE"
fi
out=$(bun "$skilldir/scripts/start.ts" "$root" 2>&1)
code=$?
printf 'start exit=%s %s\n' "$code" "$out" >> "$log"
case "$out" in
started* | running*)
	st=$(cd "$root" && akrogon status 2>&1)
	printf 'status %s\n' "$(printf '%s' "$st" | head -1)" >> "$log"
	case "$st" in
	*paused*) ;;
	*) (cd "$root" && akrogon next --all >> "$log" 2>&1) || true ;;
	esac
	;;
esac
exec "$(dirname "$0")/../stand-in.sh" --model "${WATCHER_MODE:-work}"
