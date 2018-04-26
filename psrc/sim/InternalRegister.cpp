#include "InternalRegister.h"
#include "pyrope_operations.h"
using Pyrope::InternalRegister;
using Pyrope::RegisterArrayU32;
using Pyrope::RegisterArrayU64;

#include <cstring>
#include <string>
#include <sstream>
#include <iomanip>
using std::string;

string InternalRegister::checkpoint() const
{
  std::ostringstream os;

  for (size_t i = 0; i < BYTE_SIZE(bits); i++) {
    uint8_t d = const_data_ptr()[i];
    os << std::hex << std::setw(2) << std::setfill('0') << (unsigned int) (0xFF & d);
  }

  return os.str();
}

void InternalRegister::write(const char *src, size_t bytes, size_t offset) { memcpy(&data_ptr()[offset], src, bytes); }
void InternalRegister::clear() { memset(data_ptr(), 0, BYTE_SIZE(bits)); }

RegisterArrayU32::RegisterArrayU32(const RegisterArrayU32 &o) : InternalRegister(o.bits), length(o.length), data(new uint32_t[length])
{
  memcpy(data, o.data, sizeof(data[0]) * length);
}

RegisterArrayU64::RegisterArrayU64(const RegisterArrayU64 &o) : InternalRegister(o.bits), length(o.length), data(new uint64_t[length])
{
  memcpy(data, o.data, sizeof(data[0]) * length);
}
