#ifndef PYROPE_OPERATIONS_16_H_
#define PYROPE_OPERATIONS_16_H_

#include <cassert>
#include "PyropeInteger.h"

namespace Pyrope {

  inline uint16_t __pyr16_bit_read(uint64_t source, uint64_t start_index, uint64_t end_index) {
    assert(start_index>=end_index);

    uint64_t result = source<<(63-start_index);
    result = result>>(63-start_index+end_index);

    return result;
  }

  inline uint16_t __pyr16_numeric_or(uint16_t a, uint16_t b) { return a | b; }
  inline uint16_t __pyr16_numeric_and(uint16_t a, uint16_t b) { return a & b; }
  inline uint16_t __pyr16_concat(uint16_t a, uint32_t abits, uint16_t b, uint32_t bbits) { return (a << bbits) | b; }
  inline uint16_t __pyr16_addition(uint16_t a, uint16_t b) { return a + b; }
  inline uint16_t __pyr16_arithmetic_xor(uint16_t a, uint16_t b) { return a ^ b; }
  inline uint16_t __pyr16_array_read(uint16_t *array, uint64_t index) { return array[index]; }
  inline uint64_t __pyr16_subtraction(uint16_t a, uint16_t b) { return a - b; }

  inline uint16_t *__pyr16_array_write(uint16_t *array, uint64_t addr, uint16_t data) {
    array[addr] = data;
    return array;
  }

  inline uint16_t *__pyr16_array_modify(uint16_t *array, uint64_t addr, uint16_t data) {
    array[addr] = data;
    return array;
  }
}

#endif
