#include "sparsehash/dense_hash_map"
#include "Context.hpp"
#include <string>
using Pyrope::Context;
using Pyrope::Type;

typedef std::string key;
const key empty = "<empty>";
const key deltd = "<deleted>";

int main(int argc, char **argv)
{
  google::dense_hash_map<key, Type> dhm;
  dhm.set_empty_key(empty);
  dhm.set_deleted_key(deltd);

  Context c;

  dhm["1"] = Type::create_unsigned(1);
  printf("1: %d\n", dhm["1"].to_string());

  return 0;
}