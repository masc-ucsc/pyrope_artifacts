#include "SimplePort.h"
using Pyrope::SimplePort;

#include <cassert>

SimplePort *SimplePort::copy() const {
  SimplePort *port = NULL;

  switch(type.get_flag()) {
  case PYROPE_TYPE_LOGICAL:
    port = new SimplePortLogical;
    break;
  case PYROPE_TYPE_N64:
    port = new SimplePortU64;
    break;
  case PYROPE_TYPE_N32:
    port = new SimplePortU32;
    break;
  default:
    assert(false);
  }

  return port;
}

void Pyrope::Port::write(const char *v, size_t bytes) { memcpy(data_ptr(), v, bytes); }