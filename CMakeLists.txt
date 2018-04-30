cmake_minimum_required(VERSION 3.10)
project(pyrope)

# C++1z is enough, but C++14 is supposed to be more standard/stable
set(CMAKE_CXX_STANDARD 14)
#add_definitions("-std=c++14")

include_directories(psrc)
include_directories(psrc/sim)
include_directories(psrc/utils)
include_directories(subs)
include_directories(subs/sparsehash-c11)
include_directories(subs/lgraph/misc/spdlog/include)

file(GLOB SOURCES "psrc/*.cpp" "psrc/sim/*.cpp" "psrc/utils/*.cpp")

add_executable(type_test ${SOURCES} "test/types.cpp")

find_package(Threads)

target_link_libraries(type_test ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(type_test dl)
