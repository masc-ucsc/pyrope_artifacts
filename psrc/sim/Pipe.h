#ifndef PYROPE_PIPE_H_
#define PYROPE_PIPE_H_

#include "pyrope_environment.h"

#include <unordered_map>
#include <vector>
#include <string>

#define DEFAULT_BATCH_SIZE  256

namespace Pyrope
{
  struct CheckpointData {
    std::unordered_map<std::string, Stage *> stages;
    std::unordered_map<std::string, FluidRegister *> fluid_registers;

    CheckpointData(size_t ssize, size_t fsize) : stages(ssize), fluid_registers(fsize) { }
    void save_checkpoint(const std::string &filename) const;
    ~CheckpointData();
  };

  class Pipe
  {
  public:
    Pipe() : cycle_ctr(0) { }
    Pipe(size_t stages_size, size_t fregs_size) : stages(stages_size), fluid_registers(fregs_size), cycle_ctr(0) { }
    ~Pipe();

    virtual void toggle_clock();
    bool next_result(int batch_size = DEFAULT_BATCH_SIZE);
    bool next_state_change(int batch_size = DEFAULT_BATCH_SIZE);
    bool has_valid_output() const;
    bool has_valid_input() const;
    bool has_open_input() const;
    void update_inputs();

    void set_reset(bool);
    void clear_state();

    FluidRegister *create_fluid_register(const std::string &name, PortWidth);
    FluidConnection input(const std::string &name) { return input_fregs.at(name)->input_connection(); }
    FluidConnection output(const std::string &name) { return output_fregs.at(name)->output_connection(); }

    void add_stage(const std::string &name, const std::string &source, Stage *s);
    void replace_stage(const std::string &to_replace, Stage *);
    Stage *get_stage(const std::string &name) { return stages.at(name); }
    void update_stages(const std::unordered_map<std::string, std::string> &updated);

    FluidRegister *create_input(const std::string &name, PortWidth width, FluidPort *connection);
    FluidRegister *create_output(const std::string &name, PortWidth width, FluidPort *connection);
    void connect_block_input(const std::string &block, const std::string &name, const FluidConnection &);
    void connect_block_output(const std::string &block, const std::string &name, const FluidConnection &);

    uint64_t cycle_count() const { return cycle_ctr; }

    /*
     * checkpoints
     */

    void create_checkpoint(const std::string &filename) const;
    void load_checkpoint(const std::string &filename);
    void copy_checkpoint_data(CheckpointData *) const;

    /*
     * debugging
     */

    std::string external_io() const;
    std::string internal_io() const;
    std::string io_state() const;

    const std::unordered_map<std::string, Stage *> &get_stages() const { return stages; }
    const std::unordered_map<std::string, FluidRegister *> &get_fluid_registers() const { return fluid_registers; }

  protected:
    std::unordered_map<std::string, Stage *> stages;
    std::unordered_map<std::string, std::list<string>> stage_sources;         // mapping of stage_name => list<instances of stage_name>

    std::unordered_map<std::string, FluidRegister *> fluid_registers;
    std::vector<FluidRegister *> fluid_registers_vector;

    std::unordered_map<std::string, FluidRegister *> input_fregs;
    std::unordered_map<std::string, FluidRegister *> output_fregs;

    uint64_t cycle_ctr;

    bool read_destination(std::ifstream &is, std::string &out);
    char read_number(std::ifstream &is, void *dest, int width = 1);
  };
}

#endif
