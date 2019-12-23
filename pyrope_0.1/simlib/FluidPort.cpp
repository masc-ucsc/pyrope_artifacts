#include "FluidPort.h"
#include <cassert>
#include <cstring>
using std::string;

namespace Pyrope {
string FluidPort::format_data() const {
  switch(type.get_flag()) {
  case PYROPE_TYPE_LOGICAL:
    return format_data_b(*(bool *)const_data_ptr());
  case PYROPE_TYPE_N64:
    return format_data_64b(*(uint64_t *)const_data_ptr());
  case PYROPE_TYPE_N32:
    return format_data_32b(*(uint32_t *)const_data_ptr());
  case PYROPE_TYPE_N16:
    return format_data_16b(*(uint16_t *)const_data_ptr());
  case PYROPE_TYPE_N8:
    return format_data_8b(*(uint8_t *)const_data_ptr());
  case PYROPE_TYPE_INT:
    return ((Integer *)const_data_ptr())->str();
  default:
    assert(false);
    return "";
  }
}

string FluidPort::state() const {
  string value = (*vlid) ? format_data() : "<INVALID>";

  if(*rtry)
    value += " (!)";

  return value;
}

FluidPort *FluidPort::copy() const {
  switch(type.get_flag()) {
  case PYROPE_TYPE_LOGICAL:
    return new FluidPortLogical();
  case PYROPE_TYPE_N64:
    return new FluidPortU64;
  case PYROPE_TYPE_N32:
    return new FluidPortU32;
  case PYROPE_TYPE_N16:
    return new FluidPortU16;
  case PYROPE_TYPE_N8:
    return new FluidPortU8;
  case PYROPE_TYPE_INT:
    return new FluidPortInt(type.get_bits());
  default:
    assert(false);
  }
}
} // namespace Pyrope