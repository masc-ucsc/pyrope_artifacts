#include "pyrope_utils.h"
#include <cassert>
#include <cstdlib>
#include <cstring>

#define ARG_VERBOSE "--verbose"
#define ARG_VERIFY "--verify"
#define ARG_ITERATIONS "--iterations="
#define ARG_ITERATIONS_LEN strlen("--iterations=")
#define ARG_SEED "--seed="
#define ARG_SEED_LEN strlen("--seed=")
#define VCD_CONV_FLAG "--vcd"
#define BENCHMARK_FLAG "--benchmark"

void Pyrope::parse_args(PyropeArgBundle *out, int argc, char **argv) {
  memset(out, 0, sizeof(PyropeArgBundle));

  for(int i = 0; i < argc; i++) {
    if(strcmp(argv[i], ARG_VERBOSE) == 0)
      out->verbose = true;

    else if(strcmp(argv[i], ARG_VERIFY) == 0)
      out->verify = true;

    else if(strncmp(argv[i], ARG_ITERATIONS, ARG_ITERATIONS_LEN) == 0)
      out->seed = atol(&argv[i][ARG_ITERATIONS_LEN]);

    else if(strncmp(argv[i], ARG_SEED, ARG_SEED_LEN) == 0)
      out->seed = atoi(&argv[i][ARG_SEED_LEN]);

    else if(strncmp(argv[i], ARG_SEED, ARG_SEED_LEN) == 0)
      out->seed = atoi(&argv[i][ARG_SEED_LEN]);

    else if(strcmp(argv[i], VCD_CONV_FLAG) == 0)
      out->vcd_conversion_format = true;

    else if(strcmp(argv[i], BENCHMARK_FLAG) == 0)
      out->benchmark = true;
  }
}
