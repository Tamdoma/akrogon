# k.sh <keys...>: each arg is "MODS:key" or a plain word typed letter by letter, sent to the test window
# (address 0x55696bb789a0) with Hyprland's send_shortcut: the operator's keyboard focus never moves.
set -eu
A=0x55696bb789a0
send() { r=$(hyprctl eval "hl.dispatch(hl.dsp.send_shortcut({ mods = '$1', key = '$2', window = 'address:$A' }))"); [ "$r" = ok ] || { echo "send_shortcut failed: $r" >&2; exit 1; }; }
for arg in "$@"; do
  case "$arg" in
    *:*) send "${arg%%:*}" "${arg#*:}" ;;
    *) for c in $(printf '%s' "$arg" | fold -w1); do send "" "$c"; done ;;
  esac
done
sleep "${WAIT:-1}"
