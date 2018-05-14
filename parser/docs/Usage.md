
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

