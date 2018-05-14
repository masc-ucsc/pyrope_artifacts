#include "Type.hpp"
#include "Context.hpp"
#include "Exception.hpp"

#include <string>
using std::string;

namespace Pyrope {
Context *Type::context = nullptr;

void Type::merge(const Type &other) {
  if(get_name() == UNDEF) {
    *this = other;
    return;
  } else if(other.get_name() == UNDEF) {
    return;
  }

  switch(get_name()) {
  case LOGICAL: {
    if(other.get_name() != LOGICAL)
      throw TypeError("Could not merge: " + to_string() + ", " + other.to_string());

    break;
  }

  case STRING: {
    if(other.get_name() != STRING)
      throw TypeError("Could not merge: " + to_string() + ", " + other.to_string());

    if(compare_attributes(other.len, other._len_overflow, len, _len_overflow) > 0) { // other.len > t1.len
      if(_len_fixed)
        throw TypeError("Could not increase fixed length");

      len           = other.len;
      _len_overflow = other._len_overflow;
    }

    break;
  }

  case NUMERIC: {
    if(other.get_name() != NUMERIC)
      throw TypeError("Could not merge: " + to_string() + ", " + other.to_string());

    // take the larger of the two maxes and lengths, and the smaller of the two mins
    _max_overflow = merge_attribute(&max, _max_overflow, _max_fixed, other.max, other._max_overflow);
    _min_overflow = merge_attribute(&min, _min_overflow, _min_fixed, other.min, other._min_overflow, -1);
    _len_overflow = merge_attribute(&len, _len_overflow, _len_fixed, other.len, other._len_overflow);

    // set to signed if either is signed
    _is_signed |= other._is_signed;

    break;
  }

  case MAP: {
    if(other.get_name() != MAP)
      throw TypeError("Could not merge: " + to_string() + ", " + other.to_string());
  }

  default: {
    throw DebugError();
  }
  }
}

bool Type::merge_attribute(pyrint *attr1_out, bool attr1_overflow, bool attr1_fixed,
                           pyrint attr2, bool attr2_overflow, int polarity)
// merge a generic attribute of one type with another
{
  int cmp_result = compare_attributes(*attr1_out, attr1_overflow, attr2, attr2_overflow);
  cmp_result *= polarity;

  if(cmp_result > 0) { // attr2 > attr1
    if(attr1_fixed)
      throw TypeError("Could not expand fixed attribute");

    *attr1_out = attr2;
    return attr2_overflow;
  } else {
    return attr1_overflow;
  }
}

int Type::compare_attributes(pyrint attr1, bool attr1_overflow, pyrint attr2, bool attr2_overflow) {
  if(attr1_overflow || attr2_overflow) {
    const Integer attr1_int = (attr1_overflow) ? context->memory_pool()->load((Char_Array_ID)attr1) : attr1;
    const Integer attr2_int = (attr2_overflow) ? context->memory_pool()->load((Char_Array_ID)attr2) : attr2;

    if(attr1_int > attr2_int) // doing a normal subtraction would necessitate creating a new Integer
      return 1;
    else if(attr1_int < attr2_int)
      return -1;
    else
      return 0;
  } else {
    return attr1 - attr2;
  }
}

pyrsize Type::bits() const {
  switch(name) {
  case UNDEF:
    throw TypeError("bits() called on UNDEF type");

  case LOGICAL:
    return 1;

  case STRING:
    if(len == 0)
      throw TypeError("bits() called on string with undefined length");

    return len * 8;

  case NUMERIC:
    if(_is_signed) {
      if(compare_to_zero(min, _min_overflow) >= 0)
        return signed_bits_required(min, _min_overflow);
      else {
        auto pos_bits = signed_bits_required(max, _max_overflow);
        auto neg_bits = signed_bits_required(min, _min_overflow);

        return (pos_bits >= neg_bits) ? pos_bits : neg_bits;
      }
    } else {
      return unsigned_bits_required(max, _max_overflow);
    }

  default:
    throw DebugError("Not implemented yet");
  }
}

pyrsize Type::signed_bits_required(pyrint attr, bool attr_overflow) {
  if(attr_overflow) {
    Integer pint = context->memory_pool()->load((Char_Array_ID)attr);

    if(pint < 0)
      pint.invert();

    return pint.highest_set_bit() + 1;
  } else {
    if(attr < 0)
      attr *= -1;

    return log2(attr) + 2; // +1 for sign, +1 to use floor()
  }
}

pyrsize Type::unsigned_bits_required(pyrint attr, bool attr_overflow) {
  if(attr_overflow) {
    const Integer pint = context->memory_pool()->load((Char_Array_ID)attr);
    return pint.highest_set_bit();
  } else {
    return log2(attr) + 1;
  }
}

string Type::to_string() const {
  switch(name) {
  case NUMERIC:
    if(_is_signed) {
      if(len > 1)
        return "signed<" + std::to_string(min) + "," + std::to_string(max) + "," + std::to_string(len) + ">";
      else
        return "signed<" + std::to_string(min) + "," + std::to_string(max) + ">";
    } else {
      if(len > 1)
        return "unsigned<" + std::to_string(min) + "," + std::to_string(max) + "," + std::to_string(len) + ">";
      else
        return "unsigned<" + std::to_string(min) + "," + std::to_string(max) + ">";
    }

  case LOGICAL:
    if(len > 1)
      return "logical<" + std::to_string(len) + ">";
    else
      return "logical";

  case STRING:
    if(len > 0)
      return "string<" + std::to_string(len) + ">";
    else
      return "string<>";

  case UNDEF:
    return "UNDEF";
  default:
    throw DebugError("Not implemented yet");
  }
}

Integer Type::get_overflow_min() const { return context->memory_pool()->load((Char_Array_ID)min); }
Integer Type::get_overflow_max() const { return context->memory_pool()->load((Char_Array_ID)max); }
Integer Type::get_overflow_len() const { return context->memory_pool()->load((Char_Array_ID)len); }

bool Type::flags_match(const Type &o) const {
  return (
      _is_signed == o._is_signed &&
      _is_input == o._is_input &&
      _is_output == o._is_output &&
      _is_register == o._is_register &&
      _is_private == o._is_private &&
      _max_overflow == o._max_overflow &&
      _min_overflow == o._min_overflow &&
      _len_overflow == o._len_overflow &&
      _max_fixed == o._max_fixed &&
      _min_fixed == o._min_fixed &&
      _len_fixed == o._len_fixed);
}

bool operator==(const Type &t1, const Type &t2) {
  if(t1.get_name() != t2.get_name() || !t1.flags_match(t2))
    return false;

  switch(t1.get_name()) {
  case NUMERIC:
    return (t1.get_max() == t2.get_max() && t1.get_min() == t2.get_min() && t1.get_len() == t2.get_len());
  case STRING:
    return t1.get_len() == t2.get_len();
  default:
    return true;
  }
}

bool operator!=(const Type &t1, const Type &t2) { return !(t1 == t2); }
} // namespace Pyrope
