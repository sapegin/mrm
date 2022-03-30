#!/usr/bin/env bash

set -e

mkdir -p $HOME/.mrm
find $(pwd) -maxdepth 2 -type d -name 'mrm-task*' | while read DIR; do
	BASENAME=$(basename $DIR)
	TASK=$HOME/.mrm/${BASENAME/mrm-task-/}
	if [ -f $TASK -o -L $TASK ]; then
		echo "$TASK already exists, skipping"
	else
		echo "Linking $DIR to your local $TASK"
		ln -s $DIR $TASK
	fi
done
