#ifndef FLUID_REGISTER_H_
#define FLUID_REGISTER_H_

#include "Integer.hpp"
#include "FluidPort.h"

#include <cstdint>
#include <fstream>

#define STATE_NORMAL    1
#define STATE_RETRY     2
#define STATE_ENT_RETRY 3
#define STATE_EXT_RETRY 4

#define CONNECT_TO_INPUT(port)    port->vlid = &vlid_in;\
                                    port->rtry = &rtry_out;\
                                    port->data = &data_in;

#define CONNECT_TO_OUTPUT(port)   port->vlid = &vlid_out;\
                                    port->rtry = &rtry_in;\
                                    port->data = &data_out;

#define FREG_INTERNAL(state)      switch (state) {\
                                    case STATE_NORMAL:\
                                      data_out = data_in;\
                                      break;\
                                    case STATE_ENT_RETRY:\
                                      retry_slot = data_in;\
                                      break;\
                                    case STATE_EXT_RETRY:\
                                      data_out = retry_slot;\
                                      break;\
                                    default:\
                                      ;\
                                    }

namespace Pyrope 
{
  class FluidRegister
  {
  public:
    FluidRegister(PortWidth pt);
    FluidRegister *copy() const { return create(type); }

    static FluidRegister *create(PortWidth w);

    void reset();

    virtual void update_int();
    void update() {
#if 0
      static int conta=0;
      static int conta_p=0;
      conta++;
      if (conta>10000) {
        printf("ratio=%f\n",((double)conta_p)/conta);
        conta = 0;
        conta_p=0;
      }
#endif
#if 1
      if (false && (!vlid_in && rtry_in == rtry_out && state <= STATE_RETRY)) {
        vlid_out = false;
#if 0
        conta_p++;
#endif
        return;
      }
#endif

      update_int();
    }
    virtual void connect_to_input(FluidPort *port) { }
    virtual void connect_to_output(FluidPort *port) { }

    std::string checkpoint() const;
    std::string data_str(const char *ptr) const;

    virtual void *input_data_ptr() { return NULL; }
    virtual void *output_data_ptr() { return NULL; }
    virtual void *retry_slot_data_ptr() { return NULL; }

    virtual const void *const_input_data_ptr() const { return NULL; }
    virtual const void *const_output_data_ptr() const { return NULL; }
    virtual const void *const_retry_slot_data_ptr() const { return NULL; }

    virtual int width() const { return 0; }

    void clear();

    FluidConnection input_connection() {
      return FluidConnection(type, input_data_ptr(), &vlid_in, &rtry_out);
    }

    FluidConnection output_connection() {
      return FluidConnection(type, output_data_ptr(), &vlid_out, &rtry_in);
    }

    std::string control_signal_checkpoint() const {
      char buffer[8];
      sprintf(buffer, "%d%d%d%d%d%d%d", type.get_flag(), state, rtry_in, rtry_out, vlid_in, vlid_out, retry_buffer_valid);
      return std::string(buffer);
    }

    friend std::ifstream &operator>>(std::ifstream &in, FluidRegister &freg);

    PortWidth type;
    bool rtry_in, rtry_out;
    bool vlid_in, vlid_out;

    int state;
    bool retry_buffer_valid;

  protected:
    virtual void read_from_stream(std::ifstream &) = 0;
    void read_hex_digits(std::ifstream &, unsigned char *out, size_t byte_width = 1);
  };

  class FluidRegisterInt : public FluidRegister
  {
    public:
      FluidRegisterInt(pyrsize b) : FluidRegister(PortWidth(PYROPE_TYPE_INT, b)), data_in(0, b), data_out(0, b), retry_slot(0, b) { }
      void update_int();

      int width() const { return data_in.get_array_size(); }

      void *input_data_ptr() { return &data_in; }
      void *output_data_ptr() { return &data_out; }
      void *retry_slot_data_ptr() { return &retry_slot; }

      const void *const_input_data_ptr() const { return &data_in; }
      const void *const_output_data_ptr() const { return &data_out; }
      const void *const_retry_slot_data_ptr() const { return &retry_slot; }

      Integer data_in, data_out;
      Integer retry_slot;
    protected:
      void read_from_stream(std::ifstream &);
  };

  class FluidRegisterBool : public FluidRegister
  {
  public:
    FluidRegisterBool();
    void update_int();
    
    void *input_data_ptr() { return &data_in; }
    void *output_data_ptr() { return &data_out; }
    void *retry_slot_data_ptr() { return &retry_slot; }

    const void *const_input_data_ptr() const { return &data_in; }
    const void *const_output_data_ptr() const { return &data_out; }
    const void *const_retry_slot_data_ptr() const { return &retry_slot; }

    int width() const { return sizeof(bool); }

    void connect_to_input(FluidPort *port) {
      FluidPortLogical *cport = (FluidPortLogical *) port;
      CONNECT_TO_INPUT(cport);
    }

    void connect_to_output(FluidPort *port) {
      FluidPortLogical *cport = (FluidPortLogical *) port;
      CONNECT_TO_OUTPUT(cport);
    }

    bool data_in, data_out;
    bool retry_slot;

    protected:
      void read_from_stream(std::ifstream &);
  };

  class FluidRegisterU8 : public FluidRegister
  {
  public:
    FluidRegisterU8();
    void update_int();

    void *input_data_ptr() { return &data_in; }
    void *output_data_ptr() { return &data_out; }
    void *retry_slot_data_ptr() { return &retry_slot; }

    const void *const_input_data_ptr() const { return &data_in; }
    const void *const_output_data_ptr() const { return &data_out; }
    const void *const_retry_slot_data_ptr() const { return &retry_slot; }

    int width() const { return sizeof(uint8_t); }

    void connect_to_input(FluidPort *port) {
      FluidPortU8 *cport = (FluidPortU8 *) port;
      CONNECT_TO_INPUT(cport);
    }

    void connect_to_output(FluidPort *port) {
      FluidPortU8 *cport = (FluidPortU8 *) port;
      CONNECT_TO_OUTPUT(cport);
    }

    uint8_t data_in, data_out;
    uint8_t retry_slot;

    protected:
      void read_from_stream(std::ifstream &);
  };

  class FluidRegisterU16 : public FluidRegister
  {
  public:
    FluidRegisterU16();
    void update_int();

    void *input_data_ptr() { return &data_in; }
    void *output_data_ptr() { return &data_out; }
    void *retry_slot_data_ptr() { return &retry_slot; }

    const void *const_input_data_ptr() const { return &data_in; }
    const void *const_output_data_ptr() const { return &data_out; }
    const void *const_retry_slot_data_ptr() const { return &retry_slot; }

    int width() const { return sizeof(uint16_t); }

    void connect_to_input(FluidPort *port) {
      FluidPortU16 *cport = (FluidPortU16 *) port;
      CONNECT_TO_INPUT(cport);
    }
    
    void connect_to_output(FluidPort *port) {
      FluidPortU16 *cport = (FluidPortU16 *) port;
      CONNECT_TO_OUTPUT(cport);
    }

    uint16_t data_in, data_out;
    uint16_t retry_slot;

    protected:
      void read_from_stream(std::ifstream &);
  };

  class FluidRegisterU32 : public FluidRegister
  {
  public:
    FluidRegisterU32();
    void update_int();
    
    void *input_data_ptr() { return &data_in; }
    void *output_data_ptr() { return &data_out; }
    void *retry_slot_data_ptr() { return &retry_slot; }
    
    const void *const_input_data_ptr() const { return &data_in; }
    const void *const_output_data_ptr() const { return &data_out; }
    const void *const_retry_slot_data_ptr() const { return &retry_slot; }

    int width() const { return sizeof(uint32_t); }

    void connect_to_input(FluidPort *port) {
      FluidPortU32 *cport = (FluidPortU32 *) port;
      CONNECT_TO_INPUT(cport);
    }

    void connect_to_output(FluidPort *port) {
      FluidPortU32 *cport = (FluidPortU32 *) port;
      CONNECT_TO_OUTPUT(cport);
    }

    uint32_t data_in, data_out;
    uint32_t retry_slot;

    protected:
      void read_from_stream(std::ifstream &);
  };

  class FluidRegisterU64 : public FluidRegister
  {
  public:
    FluidRegisterU64();
    void update_int();

    void *input_data_ptr() { return &data_in; }
    void *output_data_ptr() { return &data_out; }
    void *retry_slot_data_ptr() { return &retry_slot; }

    const void *const_input_data_ptr() const { return &data_in; }
    const void *const_output_data_ptr() const { return &data_out; }
    const void *const_retry_slot_data_ptr() const { return &retry_slot; }

    int width() const { return sizeof(uint64_t); }

    void connect_to_input(FluidPort *port) {
      FluidPortU64 *cport = (FluidPortU64 *) port;
      CONNECT_TO_INPUT(cport);
    }

    void connect_to_output(FluidPort *port) {
      FluidPortU64 *cport = (FluidPortU64 *) port;
      CONNECT_TO_OUTPUT(cport);
    }

    uint64_t data_in, data_out;
    uint64_t retry_slot;

    protected:
      void read_from_stream(std::ifstream &);
  };
}

#endif
