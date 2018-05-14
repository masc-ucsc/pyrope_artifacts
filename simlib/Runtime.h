#ifndef RUNTIME_H_
#define RUNTIME_H_

#include "Pipe.h"
#include "Stage.h"

#include <unordered_map>
#include <string>

namespace Pyrope
{
  /////////////////////////////////////////////////////////////////////////
  // convenient methods, operate on default context

  void load_pipe(const std::string &name, const std::string &libfile);
  Pipe *create_pipe(const std::string &name);

  void load_stage(const std::string &name, const std::string &libfile);
  Stage *create_stage(const std::string &name);

  void load_testbench(const std::string &name, const std::string &libfile);
  void run_testbench(const std::string &name, Pipe *uut);
  void run_testbench(const std::string &name, Pipe *uut, int argc, char **argv);

  void empty_database();

  void set_working_directory(const std::string &);
  const std::string &working_directory();

  /////////////////////////////////////////////////////////////////////////
  // .so library stuff

  struct LibraryHandle {
    std::string name;
    void *handle;
  };

  typedef Pipe *create_pipe_t();
  struct PipeHandle : LibraryHandle {
    create_pipe_t *create_func;
  };

  typedef Stage *create_stage_t();
  struct StageHandle : LibraryHandle {
    create_stage_t *create_func;
  };

  typedef void tb_main(Pipe *, int, char **);
  struct TestbenchHandle : LibraryHandle {
    tb_main *main;
  };

  typedef const char *metadata_func();
  const char METADATA_HANDLE[] = "metadata";

  /////////////////////////////////////////////////////////////////////////
  // global Context

  class SimulationContext
  {
    public:
      ~SimulationContext();

      void add_pipe(const std::string &name, const PipeHandle &ph) { pipes[name] = ph; }
      void add_stage(const std::string &name, const StageHandle &sh) { stages[name] = sh; }
      void add_testbench(const std::string &name, const TestbenchHandle &th) { testbenches[name] = th; }

      const PipeHandle &get_pipe(const std::string &name) const { return pipes.at(name); }
      const StageHandle &get_stage(const std::string &name) const { return stages.at(name); }
      const TestbenchHandle &get_testbench(const std::string &name) const { return testbenches.at(name); }

      const std::string &directory() const { return working_dir; }
      void set_directory(const std::string &d) { working_dir = d; }

    private:
      std::unordered_map<std::string, PipeHandle> pipes;
      std::unordered_map<std::string, StageHandle> stages;
      std::unordered_map<std::string, TestbenchHandle> testbenches;
      std::string working_dir;
  };
}

#define PYROPE_TESTBENCH_MAIN(p)    extern "C" const char *metadata() {\
  static char md[] = "testbench tb";\
  return md;\
}\
extern "C" void tb_main(p, int argc, char **argv)

#define PYROPE_TESTBENCH_MAIN_3(p, c, v)    extern "C" const char *metadata() {\
  static char md[] = "testbench tb";\
  return md;\
}\
extern "C" void tb_main(p, c, v)

#define PYROPE_TESTBENCH_MAIN_4(n, p, c, v)    extern "C" const char *metadata() {\
  static char md[] = "testbench " n;\
  return md;\
}\
extern "C" void tb_main(p, c, v)

#endif
