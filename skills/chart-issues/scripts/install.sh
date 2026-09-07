#!/usr/bin/env bash
set -euo pipefail

die() {
  printf 'chart-issues installer: error: %s\n' "$1" >&2
  exit 1
}

remove_tree() {
  local root="$1"
  local entry

  [[ -e "$root" || -L "$root" ]] || return 0
  if [[ ! -d "$root" || -L "$root" ]]; then
    rm -f -- "$root"
    return 0
  fi

  while IFS= read -r -d '' entry; do
    if [[ -d "$entry" && ! -L "$entry" ]]; then
      rmdir -- "$entry"
    else
      rm -f -- "$entry"
    fi
  done < <(find "$root" -depth -mindepth 1 -print0)
  rmdir -- "$root"
}

script_path="${BASH_SOURCE[0]}"
script_dir="$(cd -- "$(dirname -- "$script_path")" && pwd -P)" || die 'cannot resolve the installer directory'
source_dir="$(cd -- "$script_dir/.." && pwd -P)" || die 'cannot resolve the canonical chart skill directory'
install_home="${HOME:?HOME is required}"

(( $# == 0 )) || die 'usage: bash skills/chart-issues/scripts/install.sh'
[[ -d "$install_home" ]] || die "HOME is not a directory: $install_home"
[[ -d "$source_dir" ]] || die "canonical source is missing: $source_dir"
[[ -f "$source_dir/SKILL.md" ]] || die "canonical source is missing SKILL.md: $source_dir"
[[ -d "$source_dir/assets" ]] || die "canonical source is missing assets/: $source_dir"
[[ -d "$source_dir/fixtures" ]] || die "canonical source is missing fixtures/: $source_dir"
[[ -f "$source_dir/scripts/install.sh" ]] || die "canonical source is missing scripts/install.sh: $source_dir"
[[ -f "$source_dir/tests/verify-install.sh" ]] || die "canonical source is missing tests/verify-install.sh: $source_dir"

source_links="$(find "$source_dir" -type l -print -quit)"
[[ -z "$source_links" ]] || die "canonical source contains a symlink: $source_links"

stamp_lines="$(grep -E '^Chart skill version: [0-9]+$' "$source_dir/SKILL.md" || true)"
stamp_count=0
if [[ -n "$stamp_lines" ]]; then
  stamp_count="$(printf '%s\n' "$stamp_lines" | wc -l)"
fi
(( stamp_count == 1 )) || die 'canonical SKILL.md must contain exactly one numeric chart skill stamp'
canonical_stamp="$stamp_lines"
canonical_version="${canonical_stamp#Chart skill version: }"

target_dirs=(
  "$install_home/.claude/skills/chart-issues"
  "$install_home/.codex/skills/chart-issues"
  "$install_home/.pi/agent/skills/chart-issues"
)
target_parents=(
  "$install_home/.claude/skills"
  "$install_home/.codex/skills"
  "$install_home/.pi/agent/skills"
)
config_roots=(.claude .codex .pi)

validate_parent() {
  local parent="$1"
  local root="$2"
  local config_dir="$install_home/$root"

  for path in "$config_dir" "$parent"; do
    if [[ -L "$path" || ( -e "$path" && ! -d "$path" ) ]]; then
      die "destination path is not a real directory: $path"
    fi
  done
}

validate_target() {
  local target="$1"
  local entries
  local links

  if [[ -L "$target" || ( -e "$target" && ! -d "$target" ) ]]; then
    die "destination is not a real directory: $target"
  fi
  [[ -d "$target" ]] || return 0

  links="$(find "$target" -type l -print -quit)"
  [[ -z "$links" ]] || die "destination contains a symlink: $links"

  if [[ -f "$target/SKILL.md" ]]; then
    grep -Fqx 'name: chart-issues' "$target/SKILL.md" || die "destination is not the chart-issues skill: $target"
  else
    entries="$(find "$target" -mindepth 1 -maxdepth 1 -print -quit)"
    [[ -z "$entries" ]] || die "destination is not an identifiable chart-issues skill: $target"
  fi
}

for index in "${!target_dirs[@]}"; do
  validate_parent "${target_parents[$index]}" "${config_roots[$index]}"
  validate_target "${target_dirs[$index]}"
  if [[ "${target_dirs[$index]}" == "$source_dir" ]]; then
    die "canonical source and destination are the same directory: $source_dir"
  fi
done

for parent in "${target_parents[@]}"; do
  mkdir -p -- "$parent"
done

stages=()
cleanup_stages() {
  local stage
  for stage in "${stages[@]-}"; do
    [[ -n "$stage" ]] && remove_tree "$stage" || true
  done
}
trap cleanup_stages EXIT

for index in "${!target_dirs[@]}"; do
  target="${target_dirs[$index]}"
  parent="${target_parents[$index]}"
  if [[ -d "$target" && -f "$target/SKILL.md" ]]; then
    installed_lines="$(grep -E '^Chart skill version: [0-9]+$' "$target/SKILL.md" || true)"
    installed_count=0
    if [[ -n "$installed_lines" ]]; then
      installed_count="$(printf '%s\n' "$installed_lines" | wc -l)"
    fi
    if (( installed_count == 0 )); then
      printf 'warning: %s has no chart skill stamp; updating it to %s\n' "$target" "$canonical_stamp" >&2
    elif (( installed_count != 1 )); then
      die "installed SKILL.md has an invalid chart skill stamp: $target"
    else
      installed_version="${installed_lines#Chart skill version: }"
      if (( 10#$installed_version < 10#$canonical_version )); then
        printf 'warning: %s is older than canonical chart skill version %s\n' "$target" "$canonical_version" >&2
      fi
    fi
  fi

  stage="$(mktemp -d "$parent/.chart-issues-install.XXXXXX")"
  stages+=("$stage")
  cp -a -- "$source_dir/." "$stage/"
  diff -r --no-dereference "$source_dir" "$stage" >/dev/null || die "staged copy differs from canonical source: $target"
done

for index in "${!target_dirs[@]}"; do
  target="${target_dirs[$index]}"
  stage="${stages[$index]}"
  backup=''

  if [[ -e "$target" ]]; then
    backup="$target.install-backup.$$.$index"
    [[ ! -e "$backup" && ! -L "$backup" ]] || die "temporary backup already exists: $backup"
    mv -- "$target" "$backup"
  fi

  if ! mv -- "$stage" "$target"; then
    if [[ -n "$backup" ]]; then
      mv -- "$backup" "$target" || die "cannot restore destination after failed update: $target"
    fi
    die "cannot install staged copy: $target"
  fi
  stages[$index]=''

  if [[ -n "$backup" ]]; then
    remove_tree "$backup" || die "cannot remove the previous chart skill copy: $backup"
  fi
done

printf 'Installed chart-issues skill version %s to:\n' "$canonical_version"
for target in "${target_dirs[@]}"; do
  printf '%s\n' "$target"
done
