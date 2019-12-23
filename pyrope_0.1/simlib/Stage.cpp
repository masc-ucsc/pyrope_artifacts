#include "Stage.h"
using Pyrope::Stage;

#include <cstdlib>
#include <list>
#include <string>
using std::list;
using std::string;

Stage::Stage(const Stage &s) : input_ports(s.input_ports.size()), output_ports(s.output_ports.size()), registers(s.registers.size()), parameter_inputs(s.parameter_inputs.size()) {
  for(const auto &pair : s.input_ports)
    input_ports[pair.first] = pair.second->copy();

  for(const auto &pair : s.output_ports)
    output_ports[pair.first] = pair.second->copy();

  for(const auto &pair : s.registers)
    registers[pair.first] = pair.second->copy();

  for(const auto &pair : s.parameter_inputs)
    parameter_inputs[pair.first] = pair.second->copy();
}

void Stage::connect_input(const string &name, FluidConnection c) {
  input_ports[name]->connect(&c);
}

void Stage::connect_output(const string &name, FluidConnection c) {
  output_ports[name]->connect(&c);
}

list<string> Stage::list_fluid_inputs() const {
  list<string> rtrn;

  for(auto &pair : input_ports)
    rtrn.push_back(pair.first);

  return rtrn;
}

list<string> Stage::list_fluid_outputs() const {
  list<string> rtrn;

  for(auto &pair : output_ports)
    rtrn.push_back(pair.first);

  return rtrn;
}

list<string> Stage::list_internal_registers() const {
  list<string> rtrn;

  for(const auto &pair : registers)
    rtrn.push_back(pair.first);

  return rtrn;
}

string Stage::io_state() const {
  string istate, ostate, rtrn;
  bool   display_inputs  = false;
  bool   display_outputs = false;

  for(const auto &pair : input_ports) {
    const auto freg = pair.second;

    if(*freg->vlid || *freg->rtry) {
      istate += string("\t\t") + pair.first + string(": ");
      istate += freg->state() + "\n";
      display_inputs = true;
    }
  }

  for(const auto &pair : output_ports) {
    const auto freg = pair.second;

    if(*freg->vlid || *freg->rtry) {
      ostate += string("\t\t") + pair.first + string(": ");
      ostate += freg->state() + "\n";
      display_outputs = true;
    }
  }

  if(display_inputs || display_outputs) {
    if(display_inputs) {
      rtrn += "\tinputs:\n";
      rtrn += istate;
    }

    if(display_outputs) {
      rtrn += "\toutputs:\n";
      rtrn += ostate;
    }
  }

  return rtrn;
}
