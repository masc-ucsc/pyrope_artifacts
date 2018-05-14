#include "pyrope_operations.h"
#include <iostream>
#include <bitset>
#include <cstring>
#include <cstdarg>
#include <assert.h>

using std::bitset;

void Pyrope::pyrprintf(const char *fmt, ...)
{
#ifndef TB_SILENT
  va_list args;
  va_start(args, fmt);
  vprintf(fmt, args);
  va_end(args);
#endif
}

uint8_t Pyrope::char_to_byte(char c)
{
  if (c >= '0' && c <= '9')
    return c - '0';
  else if (c >= 'a' && c <= 'f')
    return c - 'a' + 10;
  else if (c >= 'A' && c <= 'F')
    return c - 'A' + 10;
  else
    return 0;
}