#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-notes-organizer-39757-39768/notes_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

