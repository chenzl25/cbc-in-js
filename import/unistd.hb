// unistd.hb

import sys.types;

extern void _exit(int status);
extern pid_t fork(void);
extern pid_t getpid(void);
extern pid_t getppid(void);
extern unsigned int sleep(unsigned int secs);
extern int open (char *filename, int flags);
extern int read(int fildes, void *buf, int nbyte);
extern int close(int fildes);