#include "Context.hpp"
#include "Type.hpp"
using Pyrope::Type;
using Pyrope::VarID;

#include <cassert>

const Pyrope::pyrsize WORD_WIDTH = 2;

int main(int argc, char **argv)
{
  Pyrope::Context context;
  VarID a = "a";
  VarID b = "b";

  context.add(a, Type::create_unsigned(WORD_WIDTH));
  context.add(b, Type());

  assert(context.get(a) == Type::create_unsigned(WORD_WIDTH));

  printf("...done\n");
  return 0;
}
