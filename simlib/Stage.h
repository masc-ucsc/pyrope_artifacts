#ifndef PYROPE_STAGE_H
#define PYROPE_STAGE_H

#include "Connection.h"
#include "Integer.hpp"
#include "InternalRegister.h"

#include <list>
#include <string>
#include <unordered_map>

#include "FluidPort.h"
#include "SimplePort.h"

namespace Pyrope {
class Stage {
public:
  Stage() {}
  Stage(const Stage &);

  virtual void cycle() {}
  virtual void set_reset(bool b) {}

  void            connect_input(const std::string &name, FluidConnection);
  void            connect_output(const std::string &name, FluidConnection);
  FluidConnection get_input_connection(const std::string &name) { return input_ports.at(name)->get_connection(); }
  FluidConnection get_output_connection(const std::string &name) { return output_ports.at(name)->get_connection(); }

  const char *read_register(const std::string &name, size_t offset = 0, size_t data_width = 1) {
    return registers.at(name)->read(offset * data_width);
  }

  void write_register(const std::string &name, const char *data, size_t bytes, size_t offset = 0, size_t data_width = 1) {
    registers.at(name)->write(data, bytes, offset * data_width);
  }

  const InternalRegister *get_internal_register(const std::string &name) const { return registers.at(name); }

  void clear_register(const std::string &name) { registers.at(name)->clear(); }

  void write_parameter(const std::string &name, const char *data, size_t bytes) {
    parameter_inputs.at(name)->write(data, bytes);
  }

  SimplePort *input_parameter(const std::string &name) { return parameter_inputs.at(name); }

  std::list<std::string> list_fluid_inputs() const;
  std::list<std::string> list_fluid_outputs() const;
  std::list<std::string> list_internal_registers() const;

  std::string io_state() const;

protected:
  std::unordered_map<std::string, FluidPort *>        input_ports;
  std::unordered_map<std::string, FluidPort *>        output_ports;
  std::unordered_map<std::string, InternalRegister *> registers;
  std::unordered_map<std::string, SimplePort *>       parameter_inputs;
};
} // namespace Pyrope

#endif
