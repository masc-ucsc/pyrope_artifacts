#ifndef PYROPE_UTILS_H_
#define PYROPE_UTILS_H_

namespace Pyrope {
  struct PyropeArgBundle
  {
    int seed;
    long iterations;
    bool verbose;
    bool verify;
    bool vcd_conversion_format;
    bool benchmark;
  };

  void parse_args(PyropeArgBundle *, int argc, char **argv);
}

#ifdef PYR_NO_EARLY_EXIT
#define pyr_assert(c) if (!(c)) { printf("ERROR: " #c "\n"); }
#else
#define pyr_assert(c) assert(c)
#endif

#endif
