# Headless test outputs freeze the operator's herdr-app window

## Case

Live checks for herdr-setup ran a throwaway herdr-app window on a Hyprland headless output (`hyprctl output create headless HERDRTEST` plus `hl.monitor(...)`). Creating the output at 20:48 and 22:56 flooded the operator's infra window with `GPU error during frame ... Surface::configure ... Requested format Bgra8Unorm is not in list of supported formats` (about 50 per second) until it froze and the operator restarted it. Removing the output at 23:29 produced `can't render at a zero size` errors in the same window, which froze again; the restart killed the consultant terminal t2s.

## Evidence

`~/.local/state/herdrapp/infra.log`: GPU error bursts at 19:48-19:50Z and 21:56-21:58Z, zero-size errors at 22:29Z, each matching an output change. Operator: "the session just froze, so I had to restart it".

## Learning

Adding or removing a Hyprland output while the operator's herdr-app window runs can freeze that window. A removal that caused no errors once did not make the next one safe.
