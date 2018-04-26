CC=g++
CFLAGS=-O2 -fPIC

PCH_SRC=Pyrope.h
PCH_OUT=Pyrope.h.gch
PCH_DEPS=$(wildcard *.h)

CPP_FILES=$(wildcard *.cpp)
OBJ_FILES=$(CPP_FILES:%.cpp=%.o)
STAGES_DIR=stages

STAGE_SRCS=$(wildcard ./$(STAGES_DIR)/*.cpp)
SO_FILES=$(STAGE_SRCS:%.cpp=%.so) 

all: $(OBJ_FILES) $(SO_FILES)

debug: CFLAGS += -g
debug: all

$(PCH_OUT): $(PCH_SRC) $(PCH_DEPS)
	$(CC) $(CFLAGS) -o $@ $(PCH_SRC)

%.o: %.cpp
	$(CC) $(CFLAGS) -c $<

$(STAGES_DIR)/%.so: $(STAGES_DIR)/%.cpp
	$(CC) $(CFLAGS) -I. -shared -o $@ $<

clean:
	rm -f *.o *.so
