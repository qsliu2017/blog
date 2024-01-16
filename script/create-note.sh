#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <note-title>"
  exit 1
fi

filename=$(date +%Y-%m-%d)-$(echo $1 | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr '_' '-').md
note_dir=$(dirname $0)/../src/content/notes

if [ -e $note_dir/$filename ]; then
  echo "Note $filename already exists"
  exit 1
fi

mkdir -p $note_dir
cat > $note_dir/$filename <<EOF
---
id: "$1"
date: $(date +%Y-%m-%d)
---
EOF
