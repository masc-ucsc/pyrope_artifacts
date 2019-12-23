
#include "Pipe.h"
#include "Runtime.h"

#include <list>

using Pyrope::CheckpointData;
using Pyrope::FluidRegister;
using Pyrope::Pipe;
using Pyrope::Stage;

#include <cassert>
#include <dlfcn.h>
#include <fstream>
#include <iostream>
#include <string>
using std::string;

void save_checkpoint_helper(const string &                                     filename,
                            const std::unordered_map<string, Stage *> &        stage,
                            const std::unordered_map<string, FluidRegister *> &fluid_registers);

Pipe::~Pipe() {
  while(stages.size() > 0) {
    auto ptr = stages.begin()->second;
    stages.erase(stages.begin());
    delete ptr;
  }

  while(fluid_registers.size() > 0) {
    auto ptr = fluid_registers.begin()->second;
    fluid_registers.erase(fluid_registers.begin());
    delete ptr;
  }
}

FluidRegister *Pipe::create_fluid_register(const string &name, PortWidth width) {
  FluidRegister *reg    = FluidRegister::create(width);
  fluid_registers[name] = reg;

  fluid_registers_vector.clear(); // Nasty code, but infrequent
  for(const auto &pair : fluid_registers)
    fluid_registers_vector.push_back(pair.second);

  return reg;
}

FluidRegister *Pipe::create_input(const std::string &name, PortWidth width, FluidPort *connection) {
  FluidRegister *reg = create_fluid_register(name + "_in", width);
  input_fregs[name]  = reg;
  reg->connect_to_input(connection);

  return reg;
}

FluidRegister *Pipe::create_output(const std::string &name, PortWidth width, FluidPort *connection) {
  FluidRegister *reg = create_fluid_register(name + "_out", width);
  output_fregs[name] = reg;
  reg->connect_to_output(connection);

  return reg;
}

void Pipe::connect_block_input(const string &instance, const string &name, const FluidConnection &c) {
  stages.at(instance)->connect_input(name, c);
}

void Pipe::connect_block_output(const string &instance, const string &name, const FluidConnection &c) {
  stages.at(instance)->connect_output(name, c);
}

void Pipe::add_stage(const string &name, const string &source, Stage *s) {
  stages[name] = s;
  stage_sources[source].push_back(name);
}

void Pipe::replace_stage(const string &to_replace, Stage *stage)
// at the moment, this methods requires at all ports in the old stage match those in
// the new stage, and none are missing or added
{
  Stage *old = stages.at(to_replace);

  for(const string &name : old->list_fluid_inputs())
    stage->connect_input(name, old->get_input_connection(name));

  for(const string &name : old->list_fluid_outputs())
    stage->connect_output(name, old->get_output_connection(name));

  for(const string &name : old->list_internal_registers())
    stage->write_register(name, old->read_register(name), old->get_internal_register(name)->byte_size());

  stages[to_replace] = stage;
  delete old;
}

void Pipe::update_stages(const std::unordered_map<string, string> &updated) {
  Pyrope::set_working_directory(".");

  for(const auto &pair : updated) {
    const string &source  = pair.first;
    const string &so_path = pair.second;

    Pyrope::load_stage(source, so_path);

    for(const string &instance : stage_sources[source])
      replace_stage(instance, Pyrope::create_stage(source));
  }
}

void Pipe::toggle_clock() {
  for(const auto &pair : stages)
    pair.second->cycle();

  for(const auto &it : fluid_registers_vector)
    it->update();

  cycle_ctr++;
}

bool Pipe::next_result(int batch_size) {
  for(int i = 0; i < batch_size; i++) {
    toggle_clock();

    if(has_valid_output())
      return true;

    update_inputs();
  }

  return false;
}

bool Pipe::next_state_change(int batch_size) {
  for(int i = 0; i < batch_size; i++) {
    toggle_clock();

    if(has_valid_output() || has_open_input())
      return true;

    update_inputs();
  }

  return false;
}

void Pipe::update_inputs() {
  for(auto &pair : input_fregs) {
    if(!pair.second->rtry_out)
      pair.second->vlid_in = false;
  }
}

bool Pipe::has_open_input() const {
  for(const auto &pair : input_fregs) {
    if(!pair.second->rtry_out)
      return true;
  }

  return false;
}

bool Pipe::has_valid_output() const {
  for(const auto &pair : output_fregs) {
    if(pair.second->vlid_out)
      return true;
  }

  return false;
}

bool Pipe::has_valid_input() const {
  for(const auto &pair : input_fregs) {
    if(pair.second->vlid_in)
      return true;
  }

  return false;
}

void Pipe::set_reset(bool b) {
  for(auto &pair : stages)
    pair.second->set_reset(b);
}

void Pipe::clear_state() {
  for(const auto &pair : fluid_registers)
    pair.second->clear();

  for(const auto &stage_pair : stages) {
    auto &stage_name = stage_pair.first;
    auto  stage      = stage_pair.second;

    for(const auto &reg_name : stage->list_internal_registers())
      stage->clear_register(reg_name);
  }
}

string Pipe::external_io() const {
  string rtrn, ext_inputs, ext_outputs;
  bool   display_inputs  = false;
  bool   display_outputs = false;

  for(const auto &pair : input_fregs) {
    const auto freg = pair.second;

    if(freg->vlid_in || freg->rtry_out) {
      ext_inputs += string("\t\t") + pair.first + string(": ");
      ext_inputs += freg->input_connection().state() + "\n";
      display_inputs = true;
    }
  }

  for(const auto &pair : output_fregs) {
    const auto freg = pair.second;

    if(freg->vlid_out || freg->rtry_in) {
      ext_outputs += string("\t\t") + pair.first + string(": ");
      ext_outputs += freg->output_connection().state() + "\n";
      display_outputs = true;
    }
  }

  if(display_inputs || display_outputs) {
    rtrn += "global:\n";

    if(display_inputs)
      rtrn += string("\tinputs:\n") + ext_inputs;

    if(display_outputs)
      rtrn += string("\toutputs:\n") + ext_outputs;
  }

  return rtrn;
}

string Pipe::internal_io() const {
  string rtrn;

  for(const auto &pair : stages) {
    const auto stage = pair.second;
    string     stio  = stage->io_state();

    if(stio.length() > 0)
      rtrn += pair.first + string("\n") + stio;
  }

  return rtrn;
}

string Pipe::io_state() const {
  return external_io() + string("\n") + internal_io() + string("\n");
}

void Pipe::copy_checkpoint_data(CheckpointData *out) const {
  for(const auto &pair : stages)
    out->stages[pair.first] = new Stage(*pair.second);

  for(const auto &pair : fluid_registers)
    out->fluid_registers[pair.first] = pair.second->copy();
}

void Pipe::create_checkpoint(const string &filename) const {
  save_checkpoint_helper(filename, stages, fluid_registers);
}

void Pipe::load_checkpoint(const string &filename) {
  std::ifstream is(filename);

  while(true) {
    string destination = "";

    if(!read_destination(is, destination))
      break;

    size_t period = destination.find(".");

    if(period != string::npos) {
      string inst     = destination.substr(0, period);
      string reg_name = destination.substr(period + 1);

      int  offset = 0;
      char next;

      do {
        uint8_t buffer;
        next = read_number(is, &buffer);
        get_stage(inst)->write_register(reg_name, (char *)&buffer, sizeof(uint8_t), offset++);
      } while(next != '\n');

    } else {
      auto freg = fluid_registers[destination];
      is >> *freg;
    }
  }

  is.close();
}

void save_checkpoint_helper(const string &                                     filename,
                            const std::unordered_map<string, Stage *> &        stages,
                            const std::unordered_map<string, FluidRegister *> &fluid_registers) {
  std::ofstream os(filename);

  for(const auto &pair : fluid_registers)
    os << pair.first << ": " << pair.second->checkpoint() << "\n";

  for(const auto &stage_pair : stages) {
    auto &stage_name = stage_pair.first;
    auto  stage      = stage_pair.second;

    for(const auto &reg_name : stage->list_internal_registers())
      os << stage_name << "." << reg_name << ": " << stage->get_internal_register(reg_name)->checkpoint() << "\n";
  }

  os.close();
}

bool Pipe::read_destination(std::ifstream &is, string &dest) {
  char c;

  while(is >> c) {
    if(c == ':')
      return true;

    if((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_' || c == '.')
      dest += c;
  }

  return false;
}

char Pipe::read_number(std::ifstream &is, void *dest, int width) {
  int  offset = 0;
  char c;

  char buffer[2];
  int  bindex     = 0;
  int  bytes_read = 0;

  while(is >> c) {
    if((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'))
      buffer[bindex++] = c;

    if(bindex == 2) {
      uint8_t high                    = char_to_byte(buffer[0]);
      uint8_t low                     = char_to_byte(buffer[1]);
      ((uint8_t *)dest)[bytes_read++] = (high << 4) + low;

      if(bytes_read == width)
        return is.peek();

      bindex = 0;
    }
  }

  return '\0';
}

CheckpointData::~CheckpointData() {
  while(stages.size() > 0) {
    auto ptr = stages.begin()->second;
    stages.erase(stages.begin());
    delete ptr;
  }

  while(fluid_registers.size() > 0) {
    auto ptr = fluid_registers.begin()->second;
    fluid_registers.erase(fluid_registers.begin());
    delete ptr;
  }
}

void CheckpointData::save_checkpoint(const string &filename) const { save_checkpoint_helper(filename, stages, fluid_registers); }
