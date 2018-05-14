#ifndef SIMPLE_PORT_H_
#define SIMPLE_PORT_H_

#include <cstdint>
#include <iostream>
using std::string;

#include "Connection.h"
#include "Integer.hpp"
#include "Port.h"

namespace Pyrope {
class SimplePort : public Port {
public:
  SimplePort(PortWidth t, char *d) : Port(t), dptr(d) {}
  SimplePort *copy() const;

  virtual char *      data_ptr() { return dptr; }
  virtual const char *const_data_ptr() const { return dptr; }

  Connection get_connection() { return Connection(type, dptr); }

  char *dptr;
};

class SimplePortU32 : public SimplePort {
public:
  SimplePortU32() : SimplePort(PYROPE_TYPE_N32, (char *)&internal), internal(0) {}

  uint32_t read() const { return internal; }
  void     write(uint32_t v) { internal = v; }

  uint32_t internal;
};

class SimplePortU64 : public SimplePort {
public:
  SimplePortU64() : SimplePort(PYROPE_TYPE_N64, (char *)&internal), internal(0) {}

  uint64_t read() const { return internal; }
  void     write(uint64_t v) { internal = v; }

  uint64_t internal;
};

class SimplePortLogical : public SimplePort {
public:
  SimplePortLogical() : SimplePort(PYROPE_TYPE_LOGICAL, (char *)&internal), internal(false) {}

  bool read() const { return internal; }
  void write(bool v) { internal = v; }

  bool internal;
};
} // namespace Pyrope

#endif