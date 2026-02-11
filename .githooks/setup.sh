#!/bin/sh

# This will configure git to lookup hooks within the directory this script is
# contained in. You can find a list of available hooks here:
# https://git-scm.com/docs/githooks

echo "Setting up git hooks …"

BASEDIR=$(dirname "$0")

if command -v git &> /dev/null
then
  echo "Setting 'core.hooksPath' to '$BASEDIR'."
  exec git config core.hooksPath $BASEDIR
else
  echo "Could not set 'core.hooksPath', git not found!"
fi
