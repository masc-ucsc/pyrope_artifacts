#!/bin/bash

for a in benchtest/large*;
do
  ./node_modules/tree-sitter-cli/tree-sitter parse -q -t $a;
done
