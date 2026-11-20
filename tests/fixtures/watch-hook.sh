#!/bin/sh
# stand-in hook playing the watcher model's per-task steps for watch-timer tests:
# runs the skill script the task names (as this stand-in's descendant, so the pid rule
# holds), then the check steps a real model runs: akrogon status at the root and, when
# not paused, akrogon next --all. Calls go through the recording `akrogon` on PATH.
# A flag file $STANDIN_DIR/noreceipt makes a tick skip the script entirely (unreceipted due).
terminal=$1
task=$2
skilldir=${WATCH_SKILLDIR:?}
root=${WATCH_ROOT:?}
hooks="${STANDIN_DIR:?}/${terminal}.hooks"
case "$task" in
"watch-issues tick "*)
	if [ -f "$STANDIN_DIR/noreceipt" ]; then
		printf 'tick skipped noreceipt\n' >> "$hooks"
		exit 0
	fi
	out=$(bun "$skilldir/scripts/tick.ts" ${task#watch-issues tick } 2>&1)
	code=$?
	printf 'tick exit=%s %s\n' "$code" "$out" >> "$hooks"
	[ "$code" = 0 ] || exit 0
	timer=$(printf '%s' "$task" | sed -n 's/.*timer=\([^ ]*\).*/\1/p')
	due=$(hc get --json "$timer" 2>/dev/null | grep -o '"akrogon.watch-due":"[0-9]*"' | cut -d'"' -f4)
	printf 'receipt=%s\n' "$due" >> "$hooks"
	;;
"watch-issues stop "*)
	out=$(bun "$skilldir/scripts/stop.ts" ${task#watch-issues stop } 2>&1)
	code=$?
	printf 'stop exit=%s %s\n' "$code" "$out" >> "$hooks"
	exit 0
	;;
"watch-issues "*)
	out=$(bun "$skilldir/scripts/start.ts" ${task#watch-issues } 2>&1)
	code=$?
	printf 'start exit=%s %s\n' "$code" "$out" >> "$hooks"
	case "$out" in
	started* | running*) ;;
	*) exit 0 ;;
	esac
	;;
*)
	printf 'ignored %s\n' "$task" >> "$hooks"
	exit 0
	;;
esac
# check steps (what the model does after an accepted start or tick); paused anywhere in the
# status output acts on nothing, matching the skill's Observe paused rule.
st=$(cd "$root" && akrogon status 2>&1)
printf 'status %s\n' "$(printf '%s' "$st" | head -1)" >> "$hooks"
case "$st" in
*paused*) ;;
*) (cd "$root" && akrogon next --all >> "$hooks" 2>&1) || true ;;
esac
