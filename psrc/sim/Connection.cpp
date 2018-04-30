#include "Connection.h"
#include <cassert>
#include <bitset>
#include <sstream>
#include <iomanip>
#include <cstring>
using std::bitset;
using std::stringstream;

namespace Pyrope {

  string format_data_b(bool b) { return (b) ? "true" : "false"; }
  
  string format_data_8b(uint8_t i)
  {
    char buffer[3];
    sprintf(buffer, "%02X", i);
    return string(buffer);
  }

  string format_data_16b(uint16_t i)
  {
    char buffer[5];
    sprintf(buffer, "%04X", i);
    return string(buffer);
  }

  string format_data_32b(uint32_t i)
  {
    char buffer[9];
    sprintf(buffer, "%08X", i);
    return string(buffer);
  }

  string format_data_64b(uint64_t i)
  {
    char buffer[17];
    sprintf(buffer, "%016lX", i);
    return string(buffer);
  }

  string Connection::format_data() const
  {
    switch (type.get_flag()) {
      case PYROPE_TYPE_LOGICAL:
        return format_data_b(*(bool *) data);
      case PYROPE_TYPE_N64:
        return format_data_64b(*(uint64_t *) data);
      case PYROPE_TYPE_N32:
        return format_data_32b(*(uint32_t *) data);
      case PYROPE_TYPE_N16:
        return format_data_16b(*(uint16_t *) data);
      case PYROPE_TYPE_N8:
        return format_data_8b(*(uint8_t *) data);
      case PYROPE_TYPE_INT:
        return ((Integer *) data)->str();
      default:
        assert(false);
        return "";
    }
  }

  string FluidConnection::state() const
  {
    string value = (*vlid) ? format_data() : x_string();

    if (*rtry)
      value += " (!)";

    return value;
  }

  void Connection::write(const void *src, size_t bytes)
  {
    if (type.get_flag() == PYROPE_TYPE_INT)
      memcpy(((Integer *) data)->data_ptr(), src, bytes);
    else
      memcpy(data, src, bytes);
  }

  void Connection::read(void *dst, size_t bytes) const
  {
    if (type.get_flag() == PYROPE_TYPE_INT)
      memcpy(dst, ((Integer *) data)->data_ptr(), bytes);
    else
      memcpy(dst, data, bytes);
  }

  string Connection::x_string() const
  {
    string rtrn;

    switch (type.get_flag()) {
      case PYROPE_TYPE_LOGICAL:
        rtrn = "xx";
        break;
      case PYROPE_TYPE_N64:
        rtrn = "xxxxxxxxxxxxxxxx";
        break;
      case PYROPE_TYPE_N32:
        rtrn = "xxxxxxxx";
        break;
      case PYROPE_TYPE_N16:
        rtrn = "xxxx";
        break;
      case PYROPE_TYPE_N8:
        rtrn = "xx";
        break;
      case PYROPE_TYPE_INT:
        rtrn = ((Integer *) data)->x_string();
        break;
      default:
        assert(false);
        return "";
    }

    return rtrn;
  }
}

