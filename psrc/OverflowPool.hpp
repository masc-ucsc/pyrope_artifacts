#ifndef OVERFLOW_POOL_H_
#define OVERFLOW_POOL_H_

#include "lgraph/core/char_array.hpp"
#include "PyropeInteger.h"
#include <string>

namespace Pyrope
{
  class OverflowPool
  {
    public:
      OverflowPool(const std::string &path) : pool(path, "_ofp") { }

      Char_Array_ID save(const PyropeInteger &i) {
        auto buffer_size = i.get_array_size() * sizeof(pyrchunk);
        char *buffer = new char[buffer_size + 1];

        memcpy(buffer, i.const_data_ptr(), buffer_size);
        buffer[buffer_size] = '\0';

        auto id = pool.create_id(buffer, i.get_bits());
        delete[] buffer;

        return id;
      }

      PyropeInteger load(Char_Array_ID id) const {
        const char *buffer = pool.get_char(id);
        pyrsize size = pool.get_field(id);

        return PyropeInteger::from_buffer((const pyrchunk *) buffer, size);
      }
    
    private:
      Char_Array<pyrsize> pool;
  };
}

#endif
