#!/usr/bin/env bash

set -e

rm -rf $HOME/.mrm
mkdir -p $HOME/.mrm
find $(pwd) -maxdepth 2 -type d -name 'mrm-task*' | while read DIR; do
	BASENAME=$(basename $DIR)
	ln -sf $DIR $HOME/.mrm/${BASENAME/mrm-task-/}
done
