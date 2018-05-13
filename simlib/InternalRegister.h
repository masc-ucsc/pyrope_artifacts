#ifndef INTERNAL_REGISTER_H_
#define INTERNAL_REGISTER_H_

#include <string>
#define BYTE_SIZE(s)  (s / 8 + ((s % 8 == 0) ? 0 : 1))

namespace Pyrope
{
  class InternalRegister
  {
    public:
      InternalRegister(size_t s) : bits(s) { }

      virtual InternalRegister *copy() const = 0;
      virtual char *data_ptr() = 0;
      virtual const char *const_data_ptr() const = 0;

      virtual ~InternalRegister() { }

      const char *read(size_t offset = 0) const { return &const_data_ptr()[offset]; }
      void write(const char *src, size_t bytes, size_t offset = 0);
      void clear();

      size_t byte_size() const { return BYTE_SIZE(bits); }

      std::string checkpoint() const;

      size_t bits;
  };

  class RegisterU8 : public InternalRegister
  {
    public:
      RegisterU8() : InternalRegister(sizeof(data) * 8) { }
      RegisterU8(uint8_t d) : InternalRegister(sizeof(data) * 8), data(d) { }

      char *data_ptr() { return (char *) &data; }
      const char *const_data_ptr() const { return (const char *) &data; }

      RegisterU8 &operator=(uint8_t d) { data = d; return *this; }
      operator uint8_t() const { return data; }

      InternalRegister *copy() const { return new RegisterU8(data); }

    private:
      uint8_t data;
  };

  class RegisterU32 : public InternalRegister
  {
    public:
      RegisterU32() : InternalRegister(sizeof(data) * 8) { }
      RegisterU32(uint32_t d) : InternalRegister(sizeof(data) * 8), data(d) { }

      char *data_ptr() { return (char *) &data; }
      const char *const_data_ptr() const { return (const char *) &data; }

      RegisterU32 &operator=(uint32_t d) { data = d; return *this; }
      operator uint32_t() const { return data; }

      InternalRegister *copy() const { return new RegisterU32(data); }

    private:
      uint32_t data;
  };

  class RegisterU64 : public InternalRegister
  {
    public:
      RegisterU64() : InternalRegister(sizeof(data) * 8) { }
      RegisterU64(uint64_t d) : InternalRegister(sizeof(data) * 8), data(d) { }

      char *data_ptr() { return (char *) &data; }
      const char *const_data_ptr() const { return (const char *) &data; }

      RegisterU64 &operator=(uint64_t d) { data = d; return *this; }
      operator uint64_t() const { return data; }

      InternalRegister *copy() const { return new RegisterU64(data); }

    private:
      uint64_t data;
  };

  class RegisterArrayU32 : public InternalRegister
  {
    public:
      RegisterArrayU32(size_t len) : InternalRegister(len * sizeof(uint32_t) * 8), length(len), data(new uint32_t[length]) { }
      RegisterArrayU32(const RegisterArrayU32 &o);

      ~RegisterArrayU32() { delete[] data; }

      char *data_ptr() { return (char *) data; }
      const char *const_data_ptr() const { return (const char *) data; }

      uint32_t &operator[](size_t idx) { return data[idx]; }
      const uint32_t &operator[](size_t idx) const { return data[idx]; }

      InternalRegister *copy() const { return new RegisterArrayU32(*this); }

    private:
      size_t length;
      uint32_t *data;
  };

  class RegisterArrayU64 : public InternalRegister
  {
    public:
      RegisterArrayU64(size_t len) : InternalRegister(len * sizeof(uint64_t) * 8), length(len), data(new uint64_t[length]) { }
      RegisterArrayU64(const RegisterArrayU64 &o);

      ~RegisterArrayU64() { delete[] data; }

      char *data_ptr() { return (char *) data; }
      const char *const_data_ptr() const { return (const char *) data; }

      uint64_t &operator[](size_t idx) { return data[idx]; }
      const uint64_t &operator[](size_t idx) const { return data[idx]; }

      InternalRegister *copy() const { return new RegisterArrayU64(*this); }

    private:
      size_t length;
      uint64_t *data;
  };
}

#endif
