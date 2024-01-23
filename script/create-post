#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <post-title>"
  exit 1
fi

title=$1
post_dir=$(dirname $0)/../src/content/posts

if [ -d $post_dir/$title ]; then
  echo "Post $title already exists"
  exit 1
fi

mkdir $post_dir/"$title"
cat > $post_dir/"$title"/index.md <<EOF
---
title: "$title"
description: ""
date: $(date +%Y-%m-%d)
tags: []
---
EOF
