
#include "ThreadPool.h"

#include <chrono>
#include <iostream>


int control = 1023;

struct Test1 {
  int a;
  void inc_a(int v) {
    a+=v;
    std::cout << "Test1.inc_a:" << a << std::endl;
  }
};

std::atomic<int> total;
void mywork(int a) {
  int t = 1;
#if 0
  if ((a&3)==0) {
    for(int i=0;i<control;i+=2)
      t++;
    if (t&1)
      a++;
  }
#endif
  total+=a;
}

int main() {

  total = 0;

  ThreadPool pool;
  int        JOB_COUNT = 8000000;

  Test1 t1;

  pool.add(&Test1::inc_a,t1,3);

  for(int i = 0; i < JOB_COUNT; ++i) {
    pool.add(mywork,1);
  }

  pool.wait_all();
  std::cout << "finished total:" << total << std::endl;
  std::cout << "test1.a:" << t1.a << std::endl;

}

// g++ --std=c++14 testpool.cpp -I ../subs/ThreadPool/ -lpthread
