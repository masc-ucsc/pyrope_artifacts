#ifndef PYROPE_OPERATIONS_32_H_
#define PYROPE_OPERATIONS_32_H_

#include <cstdint>
#include <cassert>
#include "Integer.hpp"

namespace Pyrope {

  inline uint32_t __pyr32_bit_read(uint64_t source, uint32_t start_index, uint32_t end_index) {
    assert(start_index>=end_index);

    uint64_t result = source<<(63-start_index);
    result = result>>(63-start_index+end_index);

    return result;
  }

  inline uint32_t __pyr32_sel(bool sel, uint32_t tc, uint32_t fc) {
    return sel ? tc : fc;
  }

  inline uint32_t __pyr32_array_read(uint32_t *array, uint64_t index) { return array[index]; }

  inline uint32_t __pyr32_bit_read(uint64_t source, uint32_t index) {
    return ((source & (((uint64_t) 1U) << index)) > 0) ? 1 : 0;
  }

  inline uint32_t __pyr32_bit_read(Integer &i, uint32_t index) {
    return i.get_bit(index);
  }

  inline uint32_t __pyr32_bit_read(Integer &i, uint32_t start_index, uint32_t end_index) {
    return i.get_bits32(start_index, end_index);
  }

  inline uint32_t __pyr32_left_rotate(uint32_t number, uint32_t amt)
  {
    amt &= 0x1f;
    uint32_t mask = (1 << amt) - 1;
    uint32_t shifted = number & mask;

    number <<= amt;
    number |= shifted >> amt;
    return number;
  }

  inline uint32_t __pyr32_bit_write(uint32_t source, uint32_t index, uint32_t value) {
    uint32_t mask = ((uint32_t) 1U) << index;
    source &= ~mask;
    source |= ((uint32_t) value & 1) << index;

    return source;
  }

  inline uint32_t __pyr32_numeric_or(uint32_t a, uint32_t b) { return a | b; }
  inline uint32_t __pyr32_numeric_and(uint32_t a, uint32_t b) { return a & b; }
  inline uint32_t __pyr32_left_shift(uint32_t a, uint32_t b) { return a << b; }
  inline uint32_t __pyr32_right_shift(uint32_t a, uint32_t b) { return a >> b; }
  inline uint32_t __pyr32_concat(uint32_t a, uint32_t abits, uint32_t b, uint32_t bbits) { return (a << bbits) | b; }

  inline uint32_t __pyr32_subtraction(uint32_t a, uint32_t b) { return a - b; }
  inline uint32_t __pyr32_addition(uint32_t a, uint32_t b) { return a + b; }
  inline uint32_t __pyr32_multiplication(uint32_t a, uint32_t b) { return a * b; }
  inline uint32_t __pyr32_arithmetic_xor(uint32_t a, uint32_t b) { return a ^ b; }
  inline uint32_t __pyr64_arithmetic_xor(uint64_t a, uint64_t b) { return a ^ b; }
  inline uint32_t __pyr32_numeric_not(uint32_t a)            { return ~a; }

  inline uint32_t __pyr32_set_access(const Integer &variable, uint32_t index) {
    return variable.get_bit(index);
  }

  inline uint32_t __pyr32_arith_right_shift(uint32_t a, uint32_t b) {
    int32_t sa, sb;

    memcpy(&sa, &a, sizeof(int32_t));
    memcpy(&sb, &b, sizeof(int32_t));

    return sa >> sb;
  }

  inline bool __pyr32_is_not_equal(const Integer &a, const Integer &b) {
    uint32_t max_index, i;
    uint32_t aval, bval;

    max_index = (a.get_array_size() > b.get_array_size()) ? a.get_array_size() : b.get_array_size();

    for (i = 0; i < max_index; i++) {
      aval = (i < a.get_array_size()) ? a.get_chunk(i) : 0;
      bval = (i < b.get_array_size()) ? b.get_chunk(i) : 0;

      if (aval != bval)
        return true;
    }

    return false;
  }

  inline void __pyr32_puts(uint64_t i) {
#ifndef PYR_VERILOG
    printf("%lu\n", i);
#endif
  }

  inline uint32_t *__pyr32_array_write(uint32_t *array, uint64_t addr, uint32_t data) {
    array[addr] = data;
    return array;
  }

  inline uint32_t *__pyr32_array_modify(uint32_t *array, uint64_t addr, uint32_t data) {
    array[addr] = data;
    return array;
  }

  inline bool __pyr32_is_equal(uint64_t a, uint64_t b)       { return a == b; }
  inline bool __pyr32_greater_than(uint64_t a, uint64_t b)   { return a > b; }

  inline bool __pyr32_logical_and(bool a, bool b)            { return a && b; }
  inline bool __pyr32_logical_or(bool a, bool b)             { return a || b; }
  inline bool __pyr32_logical_not(bool a)                    { return !a; }

}

#endif

