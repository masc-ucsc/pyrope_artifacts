
#include "ThreadPool.h"

#include <chrono>
#include <iostream>

int main() {
  using nbsdx::concurrent::ThreadPool;

  ThreadPool<2> pool; // Defaults to 10 threads.
  int           JOB_COUNT = 10;

  for(int i = 0; i < JOB_COUNT; ++i)
    pool.AddJob([]() {
      std::cout << "." << std::endl;
      std::this_thread::sleep_for(std::chrono::seconds(1));
    });

  pool.JoinAll();
  std::cout << "Expected runtime: seconds." << std::endl;
}

// g++ --std=c++14 testpool.cpp -I ../subs/ThreadPool/ -lpthread
