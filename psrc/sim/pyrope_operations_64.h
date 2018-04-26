#ifndef PYROPE_OPERATIONS_64_H_
#define PYROPE_OPERATIONS_64_H_

#include <cassert>
#include <cstdint>
#include "PyropeInteger.h"

namespace Pyrope {

  inline uint64_t __pyr64_sel(bool sel, uint64_t tc, uint64_t fc) {
    return sel ? tc : fc;
  }

  inline uint64_t __pyr64_bit_read(uint64_t source, uint32_t start_index, uint32_t end_index) {
    assert(start_index>=end_index);

    uint64_t result = source<<(63-start_index);
    result = result>>(63-start_index+end_index);

    return result;
  }

  inline uint64_t __pyr64_bit_read(uint64_t source, uint32_t index) {
    return (source & (((uint64_t) 1U) << index)) > 0;
  }

  inline uint64_t __pyr64_bit_write(uint64_t source, uint32_t start_index, uint32_t end_index, uint64_t value) {
    uint64_t src_up = source;
    src_up >>= end_index;
    src_up <<= end_index;

    uint64_t src_down = source;
    src_down <<= 64 - start_index;
    src_down >>= 64 - start_index;

    return src_up | (value << start_index) | src_down;
  }

  inline uint64_t __pyr64_bit_write(uint64_t source, uint32_t index, uint64_t value) {
    uint64_t mask = ((uint64_t) 1U) << index;
    source &= ~mask;
    source |= ((uint64_t) value & 1) << index;

    return source;
  }

  inline uint64_t __pyr64_numeric_or(uint64_t a, uint64_t b) { return a | b; }
  inline uint64_t __pyr64_concat(uint64_t a, uint64_t abits, uint64_t b, uint64_t bbits) { return (a << bbits) | b; }
  inline uint64_t __pyr64_addition(uint64_t a, uint64_t b) { return a + b; }
  inline uint64_t __pyr64_subtraction(uint64_t a, uint64_t b) { return a - b; }
  inline uint64_t __pyr64_multiplication(uint64_t a, uint64_t b) { return a * b; }
  inline uint64_t __pyr64_left_shift(uint64_t a, uint32_t b)  { return a << b; }
  inline uint64_t __pyr64_right_shift(uint64_t a, uint32_t b) { return a >> b; }
  inline uint64_t __pyr64_numeric_and(uint64_t a, uint64_t b) { return a & b; }

  inline uint64_t __pyr64_arith_right_shift(uint64_t a, uint64_t b) {
    int64_t sa, sb;

    memcpy(&sa, &a, sizeof(int64_t));
    memcpy(&sb, &b, sizeof(int64_t));

    return sa >> sb;
  }

  inline uint64_t __pyr64_set_access(const PyropeInteger &variable, uint32_t index) {
    return variable.get_bit(index);
  }

  inline uint64_t *__pyr64_array_write(uint64_t *array, uint64_t addr, uint64_t data) {
    array[addr] = data;
    return array;
  }

  inline uint64_t *__pyr64_array_modify(uint64_t *array, uint64_t addr, uint64_t data) {
    array[addr] = data;
    return array;
  }

  inline uint64_t __pyr64__assign_to_range(uint64_t new_value, uint64_t previous_value,
    int size, int start_index, int end_index)
  {
    uint64_t result;
    uint64_t old_mask, new_mask;
    int i;

    old_mask = 0;
    new_mask = 0;

    for (i = 0; i < start_index; i++)
      old_mask |= 1 << i;

    for ( ; i < end_index+1; i++)
      new_mask |= 1 << i;

    for ( ; i < size; i++)
      old_mask |= 1 << i;

    result = ((new_value << start_index) & new_mask) | (previous_value & old_mask);
    return result;
  }
}

#endif

