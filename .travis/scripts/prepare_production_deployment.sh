#!/bin/bash

set -ev

# Only:
# - Tagged commits
# - Security env variables are available.
if [ -n "$TRAVIS_TAG" ] && [ -n "$PROD_DEPLOYMENT_HOOK_TOKEN" ] && [ -n "$PROD_DEPLOYMENT_HOOK_URL_DOMAIN" ]
then
  curl -X POST \
     -F token="$PROD_DEPLOYMENT_HOOK_TOKEN" \
     -F ref=master \
     -F "variables[TRIGGER_RELEASE_COMMIT_TAG]=$TRAVIS_TAG" \
      https://"$PROD_DEPLOYMENT_HOOK_URL_DOMAIN"/api/v4/projects/39/trigger/pipeline
else
  echo "[ERROR] Production deployment could not be prepared"
fi
