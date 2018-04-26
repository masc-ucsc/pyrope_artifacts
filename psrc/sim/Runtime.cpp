#include "Runtime.h"

#include <dlfcn.h>
#include <cassert>
#include <unordered_map>
#include <string>
using std::string;

Pyrope::Context *singleton = NULL;

// helper function to resolve *.so paths
string so_path(const std::string &libfile);

// open *.so file and return a pointer to the SO handle, and the toplevel function
void so_load(void **handle_out, void **tlfunc_out, string *id_out, const std::string &libfile, const std::string &func_name);

// database object must be dynamic.  using just a file-level global (non-pointer) variable has caused double-free
// errors when using map/unordered_map
Pyrope::Context *context()
{
  if (singleton == NULL)
    singleton = new Pyrope::Context();
  
  return singleton;
}

//
// pipes
//

void Pyrope::load_pipe(const std::string &name, const std::string &libfile)
{
  void *handle, *create;
  string id;

  so_load(&handle, &create, &id, libfile, "create");

  PipeHandle hobj;
  hobj.name = id;
  hobj.handle = handle;
  hobj.create_func = (Pyrope::create_pipe_t *) create;
  context()->add_pipe(name, hobj);
}

Pyrope::Pipe *Pyrope::create_pipe(const std::string &name) { return context()->get_pipe(name).create_func(); }

//
// stages
//

void Pyrope::load_stage(const std::string &name, const std::string &libfile)
{
  void *handle, *create;
  string id;

  so_load(&handle, &create, &id, libfile, "create");

  StageHandle hobj;
  hobj.name = id;
  hobj.handle = handle;
  hobj.create_func = (Pyrope::create_stage_t *) create;
  context()->add_stage(name, hobj);
}

Pyrope::Stage *Pyrope::create_stage(const std::string &name) { return context()->get_stage(name).create_func(); }

//
// testbenches
//

void Pyrope::load_testbench(const std::string &name, const std::string &libfile) {
  void *handle, *tlfunc;
  string id;

  so_load(&handle, (void **) &tlfunc, &id, libfile, "tb_main");

  TestbenchHandle hobj;
  hobj.name = id;
  hobj.handle = handle;
  hobj.main = (Pyrope::tb_main *) tlfunc;
  context()->add_testbench(name, hobj);
}

void Pyrope::run_testbench(const std::string &name, Pipe *uut) { context()->get_testbench(name).main(uut, 0, NULL); }
void Pyrope::run_testbench(const std::string &name, Pipe *uut, int argc, char **argv) {
  context()->get_testbench(name).main(uut, argc, argv);
}

void Pyrope::empty_database() { if (singleton) delete singleton; }

//
// utilities
//

void Pyrope::set_working_directory(const std::string &dir) { context()->set_directory(dir); }
const string &Pyrope::working_directory() { return context()->directory(); }

void so_load(void **handle_out, void **tlfunc_out, string *id_out, const std::string &libfile, const std::string &func_name)
{
  const string &wdir = context()->directory();
  const string libfile_fullpath = (wdir.length() > 0) ? wdir + "/" + libfile : libfile;

  *handle_out = dlopen(libfile_fullpath.c_str(), RTLD_LAZY);
  if (*handle_out == NULL) {
    std::cerr << "DL-ERROR: " << dlerror() << std::endl;
    assert(false);
  }

  *tlfunc_out = dlsym(*handle_out, func_name.c_str());
  if (*tlfunc_out == NULL) {
    std::cerr << "DL-ERROR: " << dlerror() << std::endl;
    assert(false);
  }

  Pyrope::metadata_func *mdfunc = (Pyrope::metadata_func *) dlsym(*handle_out, Pyrope::METADATA_HANDLE);
  if (mdfunc == NULL) {
    std::cerr << "DL-ERROR: " << dlerror() << std::endl;
    assert(false);
  }

  const string metadata = (*mdfunc)();
  size_t space = metadata.find(" ");
  if (space == string::npos) {
    std::cerr << "Il-formed metadata: " << metadata << std::endl;
    assert(false);
  }

  *id_out = metadata.substr(space+1);
}

//
// Pyrope Context
//

Pyrope::Context::~Context()
{
  while (pipes.size() > 0) {
    auto itr = pipes.begin();
    dlclose(itr->second.handle);
    pipes.erase(itr);
  }

  while (stages.size() > 0) {
    auto itr = stages.begin();
    dlclose(itr->second.handle);
    stages.erase(itr);
  }

  while (testbenches.size() > 0) {
    auto itr = testbenches.begin();
    dlclose(itr->second.handle);
    testbenches.erase(itr);
  }
}
