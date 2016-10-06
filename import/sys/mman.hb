const int PROT_READ =	0x1;		/* page can be read */
const int PROT_WRITE =	0x2;		/* page can be written */
const int PROT_EXEC =	0x4;		/* page can be executed */
const int MAP_ANON = 0x20;		 	/* don't use a file */
const int MAP_PRIVATE =	0x02;       /* Changes are private */
extern void* mmap(void *addr, unsigned long length, int prot, int flags, int fd, long offset);