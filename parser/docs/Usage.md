
1st install required packages

   # Yarn for javascript package management
   sudo pacman -S yarn   # arch linux

   # AVA for unit testing
   sudo yarn global add ava

   # Packages needed for pyrope parser
   yarn install

2nd test trivial formatting/parsing sample

   ./bin/prpfmt ./fmt/inputs/test1.prp
   cat fmt/inputs/test1.prp

3rd make sure bin is in your path. E.g:

   export PATH=${PATH}:${HOME}/projs/live/LivePyrope/bin/



prplearn usage:

1) Create an input .prp file with a error block(as shown below)

#foo.prp
a = 1
error lhs of an expression cannot be a constant
  22 = a + b
a = 1+2

2) Run ./bin/prplearn add foo.prp  ("add" supports more than one input file)
              or
       ./bin/prplearn rm foo.prp  ("rm" supports more than one input file)
              or
       ./bin/prplearn publish
              or
       ./bin/prplearn clean

