#!/bin/bash

DATE=$(date +"%Y_%m_%d")
FILENAME="${DATE}_meeting_minutes.md"

if [ ! -f $FILENAME ]; then
   echo "Creating file $FILENAME"
   cat 2026_mm_dd_meeting_minutes_template.md > "$FILENAME"
else
   echo "File $FILENAME already exists"
fi

