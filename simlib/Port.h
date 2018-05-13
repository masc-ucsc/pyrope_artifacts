#ifndef PORT_H_
#define PORT_H_

#include "Connection.h"

namespace Pyrope
{
  class Port
  {
    public:
      Port(PortWidth t) : type(t) { }
      Port(const Port &p) : type(p.type) { }

      void set_type(PortWidth t) { type = t; }

      virtual char *data_ptr() = 0;
      virtual const char *const_data_ptr() const = 0;

      virtual bool read_logical() const { return *(const bool *) const_data_ptr(); }
      virtual uint8_t read_u8() const { return *(const uint8_t *) const_data_ptr(); }
      virtual uint16_t read_u16() const { return *(const uint16_t *) const_data_ptr(); }
      virtual uint32_t read_u32() const { return *(const uint32_t *) const_data_ptr(); }
      virtual uint64_t read_u64() const { return *(const uint64_t *) const_data_ptr(); }

      virtual void write_logical(bool v) { *(bool *) data_ptr() = v; }
      virtual void write_u8(uint8_t v) { *(uint8_t *) data_ptr() = v; }
      virtual void write_u16(uint16_t v) { *(uint16_t *) data_ptr() = v; }
      virtual void write_u32(uint32_t v) { *(uint32_t *) data_ptr() = v; }
      virtual void write_u64(uint64_t v) { *(uint64_t *) data_ptr() = v; }
      virtual void write_int(const Integer &v) { ((Integer *) data_ptr())->set_value(v); }
      virtual void write(const char *v, size_t bytes);

      PortWidth type;
  };
}

#endif
