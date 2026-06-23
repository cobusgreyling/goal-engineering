#!/usr/bin/env bash
# Optional pre-commit hook — install: ln -s ../../scripts/pre-commit-goal-audit.sh .git/hooks/pre-commit
set -euo pipefail
npx --yes @cobusgreyling/goal-audit@latest . --min-level G1