#ifndef FLUID_PORT_H_
#define FLUID_PORT_H_

#include <string>
#include "Connection.h"
#include "Port.h"

namespace Pyrope
{
  class FluidPort : public Port
  {
  public:
    FluidPort(PortWidth pt) : Port(pt), vlid(NULL), rtry(NULL) { }
    FluidPort *copy() const;

    bool get_valid() const { return *vlid; }
    bool get_retry() const { return *rtry; }
    void invalid() { *vlid = false; }

    std::string format_data() const;
    std::string state() const;

    void write_logical(bool v) { Port::write_logical(v); *vlid = true; }
    void write_u8(uint8_t v) { Port::write_u8(v); *vlid = true; }
    void write_u16(uint16_t v) { Port::write_u16(v); *vlid = true; }
    void write_u32(uint32_t v) { Port::write_u32(v); *vlid = true; }
    void write_u64(uint64_t v) { Port::write_u64(v); *vlid = true; }

    virtual char *data_ptr() { return NULL; }
    virtual const char *const_data_ptr() const { return NULL; }

    virtual void write() { *vlid = true; }

    virtual void connect(FluidConnection *c) { vlid = c->vlid; rtry = c->rtry; }
    virtual FluidConnection get_connection() { return FluidConnection(type, (void *) data_ptr(), vlid, rtry); }

    bool *vlid, *rtry;
  };

  class FluidPortInt : public FluidPort
  {
  public:
    FluidPortInt(size_t bits) : FluidPort(PortWidth(PYROPE_TYPE_INT, bits)), data(NULL) { }
    FluidPortInt() : FluidPort(PortWidth(PYROPE_TYPE_INT, 0)), data(NULL) { }

    char *data_ptr() { return (char *) data->data_ptr(); }
    const char *const_data_ptr() const { return (const char *) data->const_data_ptr(); }

    const Integer &read() const { return *data; }
    void write(const Integer &i) { FluidPort::write(); *data = i; }

    void connect(FluidConnection *c) { FluidPort::connect(c); data = (Integer *) c->data; }
    FluidConnection get_connection() { return FluidConnection(type, (void *) data, vlid, rtry); }

    Integer *data;
  };

  class FluidPortU64 : public FluidPort
  {
  public:
    FluidPortU64() : FluidPort(PYROPE_TYPE_N64), data(NULL) { }

    char *data_ptr() { return (char *) data; }
    const char *const_data_ptr() const { return (const char *) data; }

    uint64_t read() const { return *data; }
    void write(uint64_t d) { FluidPort::write(); *data = d; }

    void connect(FluidConnection *c) { FluidPort::connect(c); data = (uint64_t *) c->data; }

    uint64_t *data;
  };

  class FluidPortU32 : public FluidPort
  {
  public:
    FluidPortU32() : FluidPort(PYROPE_TYPE_N32), data(NULL) { }

    char *data_ptr() { return (char *) data; }
    const char *const_data_ptr() const { return (const char *) data; }

    uint32_t read() const { return *data; }
    void write(uint32_t d) { FluidPort::write(); *data = d; }

    void connect(FluidConnection *c) { FluidPort::connect(c); data = (uint32_t *) c->data; }

    uint32_t *data;
  };

  class FluidPortU16 : public FluidPort
  {
  public:
    FluidPortU16() : FluidPort(PYROPE_TYPE_N16), data(NULL) { }

    char *data_ptr() { return (char *) data; }
    const char *const_data_ptr() const { return (const char *) data; }

    uint16_t read() const { return *data; }
    void write(uint16_t d) { FluidPort::write(); *data = d; }

    void connect(FluidConnection *c) { FluidPort::connect(c); data = (uint16_t *) c->data; }

    uint16_t *data;
  };

  class FluidPortU8 : public FluidPort
  {
  public:
    FluidPortU8() : FluidPort(PYROPE_TYPE_N8), data(NULL) { }

    char *data_ptr() { return (char *) data; }
    const char *const_data_ptr() const { return (const char *) data; }

    uint8_t read() const { return *data; }
    void write(uint8_t d) { FluidPort::write(); *data = d; }

    void connect(FluidConnection *c) { FluidPort::connect(c); data = (uint8_t *) c->data; }

    uint8_t *data;
  };

  class FluidPortLogical : public FluidPort
  {
  public:
    FluidPortLogical() : FluidPort(PYROPE_TYPE_LOGICAL), data(NULL) { }

    char *data_ptr() { return (char *) data; }
    const char *const_data_ptr() const { return (const char *) data; }

    bool read() const { return *data; }
    void write(bool d) { FluidPort::write(); *data = d; }

    void connect(FluidConnection *c) { FluidPort::connect(c); data = (bool *) c->data; }

    bool *data;
  };
}

#endif