#!/bin/sh
# stand-in hook playing the watcher model's per-task steps for watch-timer tests:
# runs the skill script the task names (as this stand-in's descendant, so the pid rule
# holds), then reads observe once. Calls go through the fixture's recording wrappers.
# A flag file $STANDIN_DIR/noreceipt makes a tick skip the script entirely (unreceipted due).
terminal=$1
task=$2
skilldir=${WATCH_SKILLDIR:?}
root=${WATCH_ROOT:?}
hooks="${STANDIN_DIR:?}/${terminal}.hooks"
turn=$(hc get --json "$terminal" 2>/dev/null | grep -o '"turn":[0-9]*' | head -1 | cut -d: -f2)
case "$task" in
watch-check)
	export WATCH_IMMEDIATE_CHECK=1
	hooks="${STANDIN_DIR}/${terminal}.tasks"
	;;
"watch-issues tick "*)
	if [ -f "$STANDIN_DIR/noreceipt" ]; then
		printf 'tick skipped noreceipt\n' >> "$hooks"
		exit 0
	fi
	out=$(bun "$skilldir/scripts/tick.ts" ${task#watch-issues tick } 2>&1)
	code=$?
	printf 'tick exit=%s %s t=%s\n' "$code" "$out" "${turn:-?}" >> "$hooks"
	# Only `accept` runs a check: `stopped` (pid mismatch) and `no-watch` run none, matching
	# the skill's tick rule.
	[ "$code" = 0 ] && [ "$out" = "accept" ] || exit 0
	timer=$(printf '%s' "$task" | sed -n 's/.*timer=\([^ ]*\).*/\1/p')
	due=$(hc get --json "$timer" 2>/dev/null | grep -o '"akrogon.watch-due":"[0-9]*"' | cut -d'"' -f4)
	printf 'receipt=%s\n' "$due" >> "$hooks"
	;;
"watch-issues stop "*)
	out=$(bun "$skilldir/scripts/stop.ts" "${task#watch-issues stop }" 2>&1)
	code=$?
	printf 'stop exit=%s %s t=%s\n' "$code" "$out" "${turn:-?}" >> "$hooks"
	exit 0
	;;
"watch-issues "*)
	out=$(bun "$skilldir/scripts/start.ts" "${task#watch-issues }" 2>&1)
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
seen=$(timeout 30s bun "$skilldir/scripts/observe.ts" "$root")
code=$?
paused=$(printf '%s\n' "$seen" | sed -n '2p')
printf 'observe exit=%s line2=%s t=%s\n' "$code" "$paused" "${turn:-?}" >> "$hooks"
if [ "$code" != 0 ]; then
	verdict=failed
elif [ "$paused" = paused=true ]; then
	verdict=paused
elif [ "$paused" != paused=false ]; then
	verdict=failed
elif printf '%s\n' "$seen" | tail -n +3 | grep -q '^slug='; then
	(cd "$root" && akrogon next --all >> "$hooks" 2>&1) || true
	verdict=acting
else
	verdict=empty
fi
printf 'check %s t=%s\n' "$verdict" "${turn:-?}" >> "$hooks"
