#!/bin/bash

for a in snippets/*.prp
do
  ./node_modules/tree-sitter-cli/tree-sitter parse -q $a
done

