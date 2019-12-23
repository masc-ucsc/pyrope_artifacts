#ifndef PYROPE_OPERATIONS_8_H_
#define PYROPE_OPERATIONS_8_H_

#include "Integer.hpp"
#include <cassert>
#include <cstdint>

inline uint8_t __pyr8_numeric_and(uint8_t a, uint8_t b) { return a & b; }
inline uint8_t __pyr8_numeric_or(uint8_t a, uint8_t b) { return a | b; }

inline uint8_t __pyr8_bit_read(uint64_t source, uint64_t start_index, uint64_t end_index) {
  assert(start_index >= end_index);

  uint64_t result = source << (63 - start_index);
  result          = result >> (63 - start_index + end_index);

  return result;
}

inline uint8_t __pyr8_array_read(uint8_t *array, uint64_t index) { return array[index]; }

inline uint8_t __pyr8_bit_read(uint64_t source, uint32_t index) {
  return ((source & (((uint64_t)1U) << index)) > 0) ? 1 : 0;
}

inline uint8_t __pyr8_concat(uint8_t a, uint32_t abits, uint8_t b, uint32_t bbits) { return (a << bbits) | b; }

inline uint8_t *__pyr8_array_write(uint8_t *array, uint64_t addr, uint8_t data) {
  array[addr] = data;
  return array;
}

inline uint8_t *__pyr8_array_modify(uint8_t *array, uint64_t addr, uint8_t data) {
  array[addr] = data;
  return array;
}

inline uint8_t __pyr8_addition(uint8_t a, uint8_t b) { return a + b; }
inline uint8_t __pyr8_subtraction(uint8_t a, uint8_t b) { return a - b; }
inline uint8_t __pyr8_left_shift(uint8_t a, uint8_t b) { return a << b; }

#endif
