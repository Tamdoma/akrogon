set -u
FIX=/tmp/akrogon-1000/merge-covers-key-855d887fe3d0/proof/fixture
rm -rf "$FIX"; mkdir -p "$FIX"; cd "$FIX"
git init -b main -q . && git config user.email t@t.invalid && git config user.name t
echo v1 > file && git add . && git commit -qm init
clean() { rm -f keep.marker drop.marker merge.marker; }
show() { echo "markers: $(ls *.marker 2>/dev/null | tr '\n' ' ')"; test ! -e drop.marker && echo "drop.marker absent: yes" || echo "drop.marker absent: NO"; }
merge_run() { clean; sh -c 'touch keep.marker' && sh -c 'touch merge.marker'; show; }
merge_run_red() { clean; if sh -c 'false'; then sh -c 'touch merge.marker'; fi; echo "keep failed, run red"; show; }
echo '--- C2 stack-green (run on HEAD as-is) ---'; merge_run
echo '--- C2 stack-red (keep fails) ---'; merge_run_red
echo '--- C2 stack-rerun (main advances, rerun filtered set) ---'
echo v2 > advance1 && git add . && git commit -qm advance; merge_run
echo '--- C2 solo-green (leaf branch rebased, then run) ---'
git checkout -qb leaf && echo leaf > leafwork && git add . && git commit -qm leafwork && git rebase main -q && echo "rebase clean"; merge_run
echo '--- C2 solo-red (rebased, keep fails) ---'; merge_run_red
echo '--- C2 solo-rerun (rebase onto advanced main, rerun) ---'
git checkout -q main && echo v3 > advance2 && git add . && git commit -qm advance2 && git checkout -q leaf && git rebase main -q && echo "rebase clean"; merge_run
echo '--- C4 check/implement side (full checks set, no filter) ---'
clean; sh -c 'touch keep.marker' && sh -c 'touch drop.marker'; echo "markers: $(ls *.marker 2>/dev/null | tr '\n' ' ')"
