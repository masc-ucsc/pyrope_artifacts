#!/bin/bash

for a in benchtest/large*;
do
  ./node_modules/tree-sitter-cli/tree-sitter parse -q -t $a;
done

#benchtest/large1.prp	4606 ms
#benchtest/large2.prp	785 ms
#benchtest/large3.prp	378 ms
#benchtest/large4.prp	3028 ms
#benchtest/large5.prp	3652 ms
