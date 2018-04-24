

#include <stdint.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>


int main(int argc, char **argv) {

  if (argc!=2) {
    fprintf(stderr,"Usage:\n\t%s cfg\n",argv[0]);
    exit(-3);
  }

  int fd = open(argv[1], O_RDONLY);
  if (fd<0) {
    fprintf(stderr,"error, could not open %s\n",argv[1]);
    exit(-3);
  }

  struct stat sb;
  fstat(fd, &sb);
  printf("Size: %lu\n", (uint64_t)sb.st_size);

  char *memblock = (char *)mmap(NULL, sb.st_size, PROT_WRITE, MAP_PRIVATE, fd, 0);
  if (memblock == MAP_FAILED) {
    fprintf(stderr,"error, mmap failed\n");
    exit(-3);
  }

  int nlines  = 0;
  int nchunks = 1;
  int nopen   = 0;
  char last_c = 0;
  bool in_comment            = false;
  bool in_singleline_comment = false;
  bool in_multiline_comment  = false;

  char *ptr_section = memblock;

  for(size_t i=0;i<sb.st_size;i++) {
    char c = memblock[i];
    if (c == '#') {
      if (!in_comment && sb.st_size > (i+2) && memblock[i+1] == '#' && memblock[i+2] == '#')
        in_multiline_comment = !in_multiline_comment;
      else
        in_singleline_comment = true;
      in_comment = in_singleline_comment | in_multiline_comment;
    }else if (c == '\n' || c == '\r' || c == '\f') {
      nlines++;
      in_singleline_comment = false;
      in_comment = in_singleline_comment | in_multiline_comment;

      // At least 128 characters, and not close to the end of file
      if (nopen == 0 && (ptr_section + 128) < &memblock[i] && !in_comment && (last_c == '\n' || last_c == '\r' || last_c == '\f') && ((i+128)<sb.st_size)) {
        memblock[i] = 0;
        printf("chunk:\n%s\n",ptr_section);
        ptr_section = &memblock[i+1];
        nchunks++;
      }
    }else if (!in_comment && c == '{') {
      nopen++;
    }else if (!in_comment && c == '}') {
      nopen--;
    }

    last_c = c;
  }
  memblock[sb.st_size-1] = 0;
  printf("chunk:\n%s\n", ptr_section);


  printf("nline:%d nchunks:%d\n",nlines,nchunks);
}

