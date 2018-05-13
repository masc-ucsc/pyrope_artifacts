#ifndef PYROPE_CONNECTION_H_
#define PYROPE_CONNECTION_H_

#include <cstdint>
#include <iostream>
using std::string;

#include "Integer.hpp"

#ifndef UINT32_MAX
#define UINT32_MAX        4294967295U
#endif

namespace Pyrope
{
  enum PortWidthFlag {
    PYROPE_TYPE_LOGICAL=1,
    PYROPE_TYPE_INT=2,
    PYROPE_TYPE_N64=3,
    PYROPE_TYPE_N32=4,
    PYROPE_TYPE_N16=5,
    PYROPE_TYPE_N8=6
  };

  class PortWidth
  {
    public:
      PortWidth(PortWidthFlag f) : flag(f), bits(0) { }
      PortWidth(PortWidthFlag f, size_t b) : flag(f), bits(b) { }

      PortWidthFlag get_flag() const { return flag; }
      size_t get_bits() const { return bits; }

    private:
      PortWidthFlag flag;
      size_t bits;
  };

  std::string format_data_b(bool);
  std::string format_data_8b(uint8_t);
  std::string format_data_16b(uint16_t);
  std::string format_data_32b(uint32_t);
  std::string format_data_64b(uint64_t);

  class Connection
  {
    public:
      Connection(PortWidth pt, void *d) : type(pt), data(d) { }
      Connection(const Connection &c) : type(c.type), data(c.data) { }

      std::string format_data() const;
      std::string x_string() const;

      virtual void write_logical(bool v) { *(bool *) data = v; }
      virtual void write_u8(uint8_t v) { *(uint8_t *) data = v; }
      virtual void write_u16(uint16_t v) { *(uint16_t *) data = v; }
      virtual void write_u32(uint32_t v) { *(uint32_t *) data = v; }
      virtual void write_u64(uint64_t v) { *(uint64_t *) data = v; }
      virtual void write(const void *src, size_t bytes);

      bool read_logical() const { return *(bool *) data; }
      uint8_t read_u8() const { return *(uint8_t *) data; }
      uint16_t read_u16() const { return *(uint16_t *) data; }
      uint32_t read_u32() const { return *(uint32_t *) data; }
      uint64_t read_u64() const { return *(uint64_t *) data; }
      void read(void *dst, size_t bytes) const;

      PortWidth type;
      void *data;
  };

  class FluidConnection : public Connection
  {
    public:
      FluidConnection(PortWidth pt, void *d, bool *v, bool *r) :
        Connection(pt, d), vlid(v), rtry(r) { }
      FluidConnection(const FluidConnection &c) :
        Connection(c), vlid(c.vlid), rtry(c.rtry) { }

      std::string state() const;

      void write_logical(bool v) { Connection::write_logical(v); *vlid = true; }
      void write_u8(uint8_t v) { Connection::write_u8(v); *vlid = true; }
      void write_u16(uint16_t v) { Connection::write_u16(v); *vlid = true; }
      void write_u32(uint32_t v) { Connection::write_u32(v); *vlid = true; }
      void write_u64(uint64_t v) { Connection::write_u64(v); *vlid = true; }
      void write(const void *src, size_t bytes) { Connection::write(src, bytes); *vlid = true; }

      bool get_valid() const { return *vlid; }
      bool get_retry() const { return *rtry; }

      bool *vlid, *rtry;
  };
}

#endif
