#ifndef PYROPE_OPERATIONS_H_
#define PYROPE_OPERATIONS_H_

#include <stdint.h>
#include <string.h>
#include <assert.h>

#include "Integer.hpp"
#include "pyrope_operations_8.h"
#include "pyrope_operations_16.h"
#include "pyrope_operations_32.h"
#include "pyrope_operations_64.h"

#ifndef UINT32_MAX
#define UINT32_MAX        4294967295U
#endif

namespace Pyrope {

  // wrapper for vprintf which can respond to the --benchmark flag
  void pyrprintf(const char *fmt, ...);

  Integer __pyr_concat(uint32_t result_size, Integer a, uint32_t a_size, Integer b, uint32_t b_size);

  inline bool __pyrbool_sel(bool sel, bool tc, bool fc) {
    return sel ? tc : fc;
  }


  inline bool __pyrbool_numeric_and(bool a, bool b) { return a && b; }
  inline bool __pyrbool_is_equal(uint32_t a, uint32_t b)     { return a == b; }
  inline bool __pyrbool_is_not_equal(uint32_t a, uint32_t b) { return a != b; }
  inline bool __pyrbool_logical_or(bool a, bool b)           { return a | b; }
  inline bool __pyrbool_less_than(uint32_t a, uint32_t b)    { return a < b; }
  inline bool __pyrbool_less_than_or_equal(uint32_t a, uint32_t b)    { return a <= b; }
  inline bool __pyrbool_greater_than(uint32_t a, uint32_t b) { return a > b; }
  inline bool __pyrbool_greater_than_or_equal(uint32_t a, uint32_t b) { return a >= b; }
  inline bool __pyrbool_logical_not(bool a)                  { return !a; }
  inline bool __pyrbool_logical_and(bool a, bool b)          { return a && b; }

  inline Integer __pyr_multiplication(uint32_t result_size, uint64_t a, uint64_t b)
  {
    // TODO: fill in this method
    Integer result(0, result_size);
    return result;
  }

  inline Integer &__pyr_bit_write(Integer &result, const Integer &a, uint32_t index, uint32_t value)
  {
    result = a;
    result.set_bit(index, value);
    return result;
  }

  inline Integer &__pyr_bit_write(Integer &result, const Integer &a, uint32_t start_index, uint32_t end_index, uint64_t value)
  {
    result = a;
    result.set_bits64(start_index, end_index, value);
    return result;
  }

  inline Integer &__pyr_numeric_or(Integer &result, const Integer &a, const Integer &b) {
    for (size_t i = 0; i < result.get_array_size(); i++)
      result.set_chunk(i, a.get_chunk(i) | b.get_chunk(i));

    return result;
  }

  inline Integer &__pyr_left_shift(Integer &result, const Integer &a, uint32_t b) {
    auto array_offset = Integer::array_index(b);
    auto bit_offset = Integer::chunk_bit_index(b);
    auto inverse_bit_offset = PINT_CHUNK_SIZE - bit_offset;

    uint32_t carry_mask = (1 << bit_offset) - 1;
    uint32_t carry = 0;

    for (size_t i = 0; i < a.get_array_size(); i++) {
      uint32_t new_value = a.get_chunk(i) << bit_offset;
      new_value |= carry;
      result.set_chunk(i + array_offset, new_value);

      carry = (a.get_chunk(i) >> inverse_bit_offset) & carry_mask;
    }

    return result;
  }

  inline Integer &__pyr_concat(Integer &result, const Integer &a, uint32_t a_size, const Integer &b, uint32_t b_size) {
    __pyr_left_shift(result, a, b_size);
    __pyr_numeric_or(result, result, b);

    return result;
  }

  inline Integer __pyr_addition(uint32_t result_size, const Integer &a, const Integer &b) {
    Integer result(0, result_size);
    uint64_t buffer;
    uint32_t aval, bval, cval;
    unsigned int i;

    cval = 0;
    for (i = 0; i < result.get_array_size(); i++) {
      aval = (i < a.get_array_size()) ? a.get_chunk(i) : 0;
      bval = (i < b.get_array_size()) ? b.get_chunk(i) : 0;

      buffer = aval + bval + cval;
      result.set_chunk(i, (uint32_t) buffer & 0xFFFF);
      if (buffer > UINT32_MAX)
        cval = buffer >> 32;
      else
        cval = 0;
    }

    return result;
  }

  inline Integer __pyr_subtraction(uint32_t result_size, const Integer &a, const Integer &b) {
    Integer result(0, result_size);
    Integer b_copy(0, b.get_bits());

    b_copy.set_value(b);

    b_copy.invert();
    result.set_value(__pyr_addition(result_size, a, b_copy), true);

    return result;
  }

  inline void __range(uint32_t *out, uint32_t start, uint32_t end) {
    uint32_t i, counter;

    for (i = 0, counter = start; counter < end; i++, counter++)
      out[i] = counter;
  }

  inline Integer __pyr_right_shift(uint32_t result_size, const Integer &a, uint32_t b)
  {
    Integer result(0, result_size);

    for (unsigned int i = 0; i < result_size; i++) {
      if (i + b >= a.get_bits())
        break;

      result.set_bit(i, a.get_bit(i + b));
    }

    return result;
  }

  inline Integer __pyr_numeric_and(uint32_t result_size, const Integer &a, const Integer &b)
  {
    Integer result(0, result_size);
    uint32_t aval, bval;

    for (unsigned int i = 0; i < result.get_array_size(); i++) {
      aval = (i < a.get_array_size()) ? a.get_chunk(i) : 0;
      bval = (i < b.get_array_size()) ? b.get_chunk(i) : 0;

      result.set_chunk(i, aval & bval);
    }

    return result;
  }

  inline bool __pyrbool_signed_less_than(uint32_t a, uint32_t b)
  {
    int32_t sa, sb;

    memcpy(&sa, &a, sizeof(int32_t));
    memcpy(&sb, &b, sizeof(int32_t));

    return sa < sb;
  }

  inline bool __pyrbool_signed_greater_than(uint32_t a, uint32_t b)
  {
    int32_t sa, sb;

    memcpy(&sa, &a, sizeof(int32_t));
    memcpy(&sb, &b, sizeof(int32_t));

    return sa > sb;
  }

  inline bool __pyrbool_signed_greater_than_or_equal(uint32_t a, uint32_t b)
  {
    int32_t sa, sb;

    memcpy(&sa, &a, sizeof(int32_t));
    memcpy(&sb, &b, sizeof(int32_t));

    return sa >= sb;
  }

  uint8_t char_to_byte(char c);
}

#endif
