#include <iostream>
#include <string>
#include <zmq.hpp>

int main() {
  //  Prepare our context and socket
  zmq::context_t context(1);
  zmq::socket_t  socket(context, ZMQ_REQ);

  std::cout << "Connecting to hello world server…" << std::endl;
  //socket.connect ("tcp://localhost:5555");
  socket.connect("ipc:///tmp/renau/lgen0");

  //  Do 10 requests, waiting each time for a response
  for(int request_nbr = 0; request_nbr != 10; request_nbr++) {
    zmq::message_t request(5);
    memcpy(request.data(), "Hello", 5);
    std::cout << "Sending Hello " << request_nbr << "…" << std::endl;
    socket.send(request);

    //  Get the reply.
    zmq::message_t reply;
    socket.recv(&reply);
    std::cout << "Received World " << request_nbr << std::endl;
  }
  return 0;
}

// g++ -o hwserver hwserver.cpp  -lzmq
