cmake_minimum_required(VERSION 3.10)
project(pyrope)

add_definitions("-std=c++11")

include_directories(src)
include_directories(src/sim)
include_directories(src/utils)
include_directories(../lgraph/misc/sparsehash)
include_directories(../lgraph/misc)
include_directories(../lgraph/core)

file(GLOB SOURCES "src/*.cpp" "src/sim/*.cpp" "src/utils/*.cpp")

add_executable(type_test ${SOURCES} "tests/types.cpp")

find_package(Threads)

target_link_libraries(type_test ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(type_test dl)
