#ifndef OVERFLOW_POOL_H_
#define OVERFLOW_POOL_H_

#include "Integer.hpp"
#include "lgraph/core/char_array.hpp"
#include <string>

namespace Pyrope {
class Overflow_Pool {
public:
  Overflow_Pool(const std::string &path) : pool(path, "_ofp") {}

  Char_Array_ID save(const Integer &i) {
    auto  buffer_size = i.get_array_size() * sizeof(pyrchunk);
    char *buffer      = new char[buffer_size + 1];

    memcpy(buffer, i.const_data_ptr(), buffer_size);
    buffer[buffer_size] = '\0';

    auto id = pool.create_id(buffer, i.get_bits());
    delete[] buffer;

    return id;
  }

  Integer load(Char_Array_ID id) const {
    const char *buffer = pool.get_char(id);
    pyrsize     size   = pool.get_field(id);

    return Integer::from_buffer((const pyrchunk *)buffer, size);
  }

private:
  Char_Array<pyrsize> pool;
};
} // namespace Pyrope

#endif
