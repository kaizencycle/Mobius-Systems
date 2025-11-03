#!/usr/bin/env bash
# Kaizen OS Lab Promotion Script
# Promotes a concept lab to a proof lab by:
#   1. Splitting lab history into dedicated repo
#   2. Creating remote and pushing to dedicated repo
#   3. Importing back as subtree at labs/<lab>-proof/
#
# Usage: ./scripts/promote_lab.sh <lab-name> <remote-repo-url>
# Example: ./scripts/promote_lab.sh lab7 git@github.com:kaizencycle/lab7-proof.git

set -euo pipefail

LAB="${1:?Usage: $0 <lab-name> <remote-repo-url>}"
REMOTE_REPO="${2:?Usage: $0 <lab-name> <remote-repo-url>}"
PROOF="${LAB}-proof"

echo "🚀 Promoting ${LAB} → ${PROOF}"
echo "   Source path: labs/${LAB}"
echo "   Target repo: ${REMOTE_REPO}"
echo "   Target path: labs/${PROOF}"
echo ""

# Validate source lab exists
if [ ! -d "labs/${LAB}" ]; then
  echo "❌ Error: labs/${LAB} does not exist"
  exit 1
fi

# Check if proof path already exists
if [ -d "labs/${PROOF}" ]; then
  echo "⚠️  Warning: labs/${PROOF} already exists"
  read -p "   Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Step 1: Split lab history into its own branch
echo "📦 Step 1: Splitting lab history..."
git subtree split --prefix="labs/${LAB}" -b "promote/${PROOF}" || {
  echo "❌ Failed to split subtree"
  exit 1
}

# Step 2: Create remote and push
echo "📤 Step 2: Pushing to dedicated repo..."
git remote add "${PROOF}" "${REMOTE_REPO}" 2>/dev/null || {
  echo "   Remote '${PROOF}' already exists, using existing"
}

# Force push to dedicated repo main branch
git push "${PROOF}" "promote/${PROOF}:main" --force || {
  echo "❌ Failed to push to remote repo"
  echo "   Ensure the remote repo exists and you have push access"
  exit 1
}

# Step 3: Clean up old proof path if exists
echo "🧹 Step 3: Preparing monorepo path..."
git checkout main || {
  echo "❌ Failed to checkout main branch"
  exit 1
}

if [ -d "labs/${PROOF}" ]; then
  echo "   Removing existing labs/${PROOF}..."
  git rm -r "labs/${PROOF}" || true
  git commit -m "chore: prepare path for ${PROOF}" || true
fi

# Step 4: Import as subtree
echo "📥 Step 4: Importing as subtree..."
git subtree add --prefix="labs/${PROOF}" "${PROOF}" main --squash || {
  echo "❌ Failed to add subtree"
  exit 1
}

# Step 5: Cleanup
echo "🧹 Step 5: Cleaning up..."
git branch -D "promote/${PROOF}" || true

echo ""
echo "✅ Successfully promoted ${LAB} → ${PROOF}"
echo "   📦 Dedicated repo: ${REMOTE_REPO}"
echo "   📂 Monorepo path: labs/${PROOF}"
echo ""
echo "📝 Next steps:"
echo "   1. Update configs/anchors/labs/${PROOF}.yaml with proof lab config"
echo "   2. Verify CI workflow triggers for labs/${PROOF}"
echo "   3. Test attestation generation"
echo ""
echo "🔄 To sync updates from dedicated repo:"
echo "   git subtree pull --prefix=labs/${PROOF} ${PROOF} main --squash"
echo ""
echo "🔄 To push updates to dedicated repo:"
echo "   git subtree push --prefix=labs/${PROOF} ${PROOF} main"