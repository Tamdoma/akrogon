# c.sh <x> <y> [shot-name]: click at a point read off a 2000-px-wide view of a window shot, then save a shot.
# Window: herdr-app right-panel-1 at Hyprland 20020,20035, scale 1.6, shot 2496 px wide.
set -eu
L=$(dirname "$0")
export HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/right-panel-1 HC_SESSION=right-panel-1; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE
X=$(python3 -c "print(round(20020 + $1 * 2496 / 2000 / 1.6))"); Y=$(python3 -c "print(round(20035 + $2 * 2496 / 2000 / 1.6))")
python3 -I "$L/input.py" click "$X" "$Y"
sleep "${WAIT:-1}"
[ -n "${3:-}" ] && herdr-app shot "$L/f4-$3.png" >/dev/null
true
