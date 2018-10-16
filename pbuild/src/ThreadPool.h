#ifndef CONCURRENT_THREADPOOL_H
#define CONCURRENT_THREADPOOL_H

#include <unistd.h>
#include <assert.h>

#include <atomic>
#include <thread>
#include <mutex>
#include <vector>
#include <functional>
#include <condition_variable>
#include <type_traits>

#include "spsc.hpp"

template<class Func,class ... Args>
inline auto forward_as_lambda(Func &&func,Args &&...args) {
  using namespace std;
  return [f=forward<decltype(func)>(func),tup=tuple<conditional_t<std::is_lvalue_reference_v<Args>,Args,remove_reference_t<Args>>...>(forward<decltype(args)>(args)...)]() mutable{
    return apply(move(f),move(tup));
  };
}

class ThreadPool {

  std::vector<std::thread> threads;
  spsc<std::function<void(void)>> queue;

  std::atomic_int         jobs_left;
  std::atomic_bool        finishing;

  size_t thread_count;

  std::condition_variable job_available_var;
  std::mutex              queue_mutex;

  /**
   *  Take the next job in the queue and run it.
   *  Notify the main thread that a job has completed.
   */
  void task() {
    while( !finishing || jobs_left>0 ) {
      next_job()();
      --jobs_left;
    }
  }

  std::function<void(void)> next_job() {
    std::function<void(void)> res;
    std::unique_lock<std::mutex> job_lock( queue_mutex );

    // Wait for a job if we don't have any.
    job_available_var.wait( job_lock, [this]() ->bool { return !queue.empty() || finishing; } );

    bool has_work = queue.dequeue(res);
    if (has_work)
      return res;

    assert(finishing);

    return []{}; // Nothing to do
  }

  void add_( std::function<void(void)> job ) {
    if (jobs_left>48) {
      job();
      return;
    }
    queue.emplace_back( job );
    ++jobs_left;
    job_available_var.notify_one();
  }

  public:
  ThreadPool(int _thread_count=0)
    : queue(64)
      , jobs_left( 0 )
      , finishing( false )
  {
    thread_count = _thread_count;
    int lim = (std::thread::hardware_concurrency()-1)/2;

    if (thread_count > lim)
      thread_count = lim;
    else if (thread_count<1)
      thread_count = 1;

    assert(thread_count);

    for( unsigned i = 0; i < thread_count; ++i )
      threads.push_back(std::thread( [this]{ this->task(); } ));
  }

  ~ThreadPool() {
    wait_all();
  }

  inline unsigned size() const {
    return thread_count;
  }

  template<class Func,class ... Args>
    void add(Func &&func,Args &&...args) {
      return add_(forward_as_lambda(std::forward<decltype(func)>(func),std::forward<decltype(args)>(args)...));
    }

  void wait_all() {
    if( jobs_left == 0 )
      return;

    finishing = true;
    job_available_var.notify_all();

    for( auto &x : threads )
      if( x.joinable() )
        x.join();
  }
};

#endif //CONCURRENT_THREADPOOL_H
