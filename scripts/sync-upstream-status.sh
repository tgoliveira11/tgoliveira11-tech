#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

git fetch --quiet origin 2>/dev/null || true
git fetch --quiet upstream 2>/dev/null || {
  echo "upstream remote not found. Run: npm run sync:upstream:configure"
  exit 1
}

current_branch="$(git branch --show-current)"
echo "Current branch: ${current_branch:-"(detached)"}"
echo ""

print_range() {
  local label="$1"
  local from_ref="$2"
  local to_ref="$3"

  echo "=== ${label} ==="
  if git rev-parse --verify "$from_ref" >/dev/null 2>&1 && git rev-parse --verify "$to_ref" >/dev/null 2>&1; then
    local ahead behind
    ahead="$(git rev-list --count "${from_ref}..${to_ref}" 2>/dev/null || echo 0)"
    behind="$(git rev-list --count "${to_ref}..${from_ref}" 2>/dev/null || echo 0)"
    echo "${to_ref} is ${ahead} commit(s) ahead of ${from_ref}, ${behind} commit(s) behind."
    if [ "$ahead" -gt 0 ]; then
      echo "Commits on ${to_ref} not in ${from_ref}:"
      git log --oneline "${from_ref}..${to_ref}" | head -20
      if [ "$ahead" -gt 20 ]; then
        echo "... and $((ahead - 20)) more"
      fi
    fi
  else
    echo "Missing ref(s): ${from_ref} and/or ${to_ref}"
  fi
  echo ""
}

print_range "main vs origin/main" "main" "origin/main"
print_range "main vs upstream/main" "main" "upstream/main"

if git merge-base --is-ancestor upstream/main main 2>/dev/null; then
  echo "main already contains all commits from upstream/main."
else
  echo "upstream/main has commits not yet in main — sync recommended."
fi
