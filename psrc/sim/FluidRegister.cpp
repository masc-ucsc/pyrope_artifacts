#include "FluidRegister.h"

#include <sstream>
#include <iomanip>
#include <cstring>
#include <cassert>

namespace Pyrope
{
  FluidRegister::FluidRegister(PortWidth pt) :
    type(pt), rtry_in(false), rtry_out(false), vlid_in(false), vlid_out(false),
    state(STATE_NORMAL), retry_buffer_valid(false) { }

  FluidRegister *FluidRegister::create(PortWidth width)
  {
    FluidRegister *reg = NULL;

    switch (width.get_flag()) {
      case PYROPE_TYPE_LOGICAL:
        reg = new FluidRegisterBool;
        break;
      case PYROPE_TYPE_N64:
        reg = new FluidRegisterU64;
        break;
      case PYROPE_TYPE_N32:
        reg = new FluidRegisterU32;
        break;
      case PYROPE_TYPE_N16:
        reg = new FluidRegisterU16;
        break;
      case PYROPE_TYPE_N8:
        reg = new FluidRegisterU8;
        break;
      case PYROPE_TYPE_INT:
        reg = new FluidRegisterInt(width.get_bits());
        break;
      default:
        assert(false);
    }

    return reg;
  }

  void FluidRegister::reset()
  {
    rtry_in  = false;
    rtry_out = false;
    vlid_in  = false;
    vlid_out = false;
    state     = STATE_NORMAL;
    retry_buffer_valid = false;
  }

  void FluidRegister::update_int()
  {
    int new_state;

    rtry_out = rtry_in;

    switch (state) {
    case STATE_EXT_RETRY:
    case STATE_NORMAL:
      new_state = (rtry_in) ? STATE_ENT_RETRY : STATE_NORMAL;
      break;

    case STATE_ENT_RETRY:
      new_state = (rtry_in) ? STATE_RETRY : STATE_EXT_RETRY;
      break;

    case STATE_RETRY:
      if (rtry_in)
        new_state = STATE_RETRY;
      else {
        if (retry_buffer_valid)
          new_state = STATE_EXT_RETRY;
        else
          new_state = STATE_NORMAL;
      }
      break;

    default:
      printf("INTERNAL-ERROR: Unrecognized freg state: %d\n", state);
      new_state = STATE_NORMAL;
    }

    switch (new_state) {
    case STATE_NORMAL:
      vlid_out = vlid_in;
      break;
    case STATE_EXT_RETRY:
      vlid_out = retry_buffer_valid;
      retry_buffer_valid = false;
      break;

    case STATE_ENT_RETRY:
      retry_buffer_valid = vlid_in;
      break;

    case STATE_RETRY:
      break;

    default:
      ;
    }

    state = new_state;
  }

  FluidRegisterBool::FluidRegisterBool() : FluidRegister(PYROPE_TYPE_LOGICAL), data_in(false), data_out(false), retry_slot(false) { }

  void FluidRegisterBool::update_int()
  {
    FluidRegister::update_int();
    FREG_INTERNAL(state);
  }

  FluidRegisterU8::FluidRegisterU8() : FluidRegister(PYROPE_TYPE_N8), data_in(0), data_out(0), retry_slot(0) { }
  FluidRegisterU16::FluidRegisterU16() : FluidRegister(PYROPE_TYPE_N16), data_in(0), data_out(0), retry_slot(0) { }
  FluidRegisterU32::FluidRegisterU32() : FluidRegister(PYROPE_TYPE_N32), data_in(0), data_out(0), retry_slot(0) { }
  FluidRegisterU64::FluidRegisterU64() : FluidRegister(PYROPE_TYPE_N64), data_in(0), data_out(0), retry_slot(0) { }
  
  string FluidRegister::checkpoint() const
  {
    string str;

    str += data_str((const char *) const_input_data_ptr());
    str += data_str((const char *) const_output_data_ptr());
    str += data_str((const char *) const_retry_slot_data_ptr());
    str += control_signal_checkpoint();

    return str;
  }

  string FluidRegister::data_str(const char *ptr) const
  {
    std::stringstream ss;

    for (int i = 0; i < width(); i++)
      ss << std::hex << std::setw(2) << std::setfill('0') << (unsigned int) (0xFF & ptr[i]);

    return ss.str();
  }

  void FluidRegister::clear()
  {
    memset(input_data_ptr(), 0, width());
    memset(output_data_ptr(), 0, width());
    memset(retry_slot_data_ptr(), 0, width());
  }

  void FluidRegisterInt::update_int()
  {
    if (!vlid_in && !rtry_in && state == STATE_NORMAL) {
      vlid_out = false;
      return;
    }
    FluidRegister::update_int();
    FREG_INTERNAL(state);
  }

  void FluidRegisterU8::update_int()
  {
    if (!vlid_in && !rtry_in && state == STATE_NORMAL) {
      vlid_out = false;
      return;
    }
    FluidRegister::update_int();
    FREG_INTERNAL(state);
  }

  void FluidRegisterU16::update_int()
  {
    if (!vlid_in && !rtry_in && state == STATE_NORMAL) {
      vlid_out = false;
      return;
    }

    FluidRegister::update_int();
    FREG_INTERNAL(state);
  }

  void FluidRegisterU32::update_int()
  {
    if (!vlid_in && !rtry_in && state == STATE_NORMAL) {
      vlid_out = false;
      return;
    }

    FluidRegister::update_int();
    FREG_INTERNAL(state);
  }

  void FluidRegisterU64::update_int()
  {
    FluidRegister::update_int();
    FREG_INTERNAL(state);
  }

  void FluidRegister::read_hex_digits(std::ifstream &is, unsigned char *out, size_t byte_width)
  {
    for (size_t i = 0; i < byte_width; i++) {
      int chars_read = 0;
      int buffer[2];

      char c;
      while (is >> c) {
        if (c >= '0' && c <= '9')
          buffer[chars_read++] = c - '0';
        else if (c >= 'a' && c <= 'f')
          buffer[chars_read++] = c - 'a' + 10;
        else if (c >= 'A' && c <= 'F')
          buffer[chars_read++] = c - 'A' + 10;
        
        if (chars_read == 2)
          break;
      }

      out[i] = buffer[0] * 16 + buffer[1];
    }
  }

  void FluidRegisterInt::read_from_stream(std::ifstream &is)
  {
    read_hex_digits(is, (unsigned char *) data_in.data_ptr(), data_in.get_array_size());
    read_hex_digits(is, (unsigned char *) data_out.data_ptr(), data_out.get_array_size());
    read_hex_digits(is, (unsigned char *) retry_slot.data_ptr(), retry_slot.get_array_size());
  }

  void FluidRegisterU64::read_from_stream(std::ifstream &is)
  {
    read_hex_digits(is, (unsigned char *) &data_in, sizeof(uint64_t));
    read_hex_digits(is, (unsigned char *) &data_out, sizeof(uint64_t));
    read_hex_digits(is, (unsigned char *) &retry_slot, sizeof(uint64_t));
  }

  void FluidRegisterU32::read_from_stream(std::ifstream &is)
  {
    read_hex_digits(is, (unsigned char *) &data_in, sizeof(uint32_t));
    read_hex_digits(is, (unsigned char *) &data_out, sizeof(uint32_t));
    read_hex_digits(is, (unsigned char *) &retry_slot, sizeof(uint32_t));
  }

  void FluidRegisterU16::read_from_stream(std::ifstream &is)
  {
    read_hex_digits(is, (unsigned char *) &data_in, sizeof(uint16_t));
    read_hex_digits(is, (unsigned char *) &data_out, sizeof(uint16_t));
    read_hex_digits(is, (unsigned char *) &retry_slot, sizeof(uint16_t));
  }

  void FluidRegisterU8::read_from_stream(std::ifstream &is)
  {
    read_hex_digits(is, (unsigned char *) &data_in, sizeof(uint8_t));
    read_hex_digits(is, (unsigned char *) &data_out, sizeof(uint8_t));
    read_hex_digits(is, (unsigned char *) &retry_slot, sizeof(uint8_t));
  }

  void FluidRegisterBool::read_from_stream(std::ifstream &is)
  {
    read_hex_digits(is, (unsigned char *) &data_in, sizeof(bool));
    read_hex_digits(is, (unsigned char *) &data_out, sizeof(bool));
    read_hex_digits(is, (unsigned char *) &retry_slot, sizeof(bool));
  }

  std::ifstream &operator>>(std::ifstream &is, FluidRegister &freg) {
    freg.read_from_stream(is);

    char control_signals[7];
    is.read(control_signals, 7);

    freg.state = control_signals[1] - '0';
    freg.rtry_in = control_signals[2] == '1';
    freg.rtry_out = control_signals[3] == '1';
    freg.vlid_in = control_signals[4] == '1';
    freg.vlid_out = control_signals[5] == '1';
    freg.retry_buffer_valid = control_signals[6] == '1';

    return is;
  }
}
