# tree-sitter-pyrope (under development)
A tree-sitter grammer and parser for pyrope


This repo is a tree-sitter Pyrope grammar. 

## Usage:

You will need to install tree-sitter-cli in order to use parser.

Yarn usage:
```
yarnpkg install
yarnpkg run generate
```

./node_modules/tree-sitter-cli/tree-sitter parse -q -t ./benchtest/large1.prp


Or download/install manually from:

https://github.com/tree-sitter/tree-sitter/tree/master/cli

Once you install tree-sitter-cli then you can use

`tree-sitter parse -q source_file.prp`

Arguments
- -t outputs elapsed time
- -q doesnt printout constructed tree
- -D debug mode printsout constructed tree
