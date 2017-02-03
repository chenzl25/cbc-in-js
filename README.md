# cbc-in-js

Implement a c-flat compiler(cbc) in javascript.

## Usage

`$: node cbc.js [options] <file...>`

> 
### cmd options
-  `--dump-tokens`    : Dumps tokens and quit.
-  `--dump-ast`       : Dumps AST and quit.
-  `--dump-ir`        : Dumps IR and quit.
-  `--dump-asm`       : Dumps AssemblyCode and quit.
-  `-S`               : Generates an assembly file and quit.
-  `-c`               : Generates an object file and quit.
-  `-o PATH`          : Places output in file PATH.
-  `--help`           : Prints this message and quit.

## File Structure

- `asm` : assembly related code.
- `ast` : abstract syntax tree related code.
- `compiler`: compiler main entry.
- `entity`: constant, variable, function ... entities.
- `import`: some .hb files work as c .h file.
- `ir`: immediate representation related code.
- `lexer`: lexical analysis related code.
- `parser`: syntax analysis related code.
- `sysdep`: system dependented component like assembler, linker, cpu, operating system.
- `test`: test related code
- `type`: type used by parser
- `util`: utility
- `visitor`: a collection of visitor used by each pass of compiler.
- `cbc.js`: this project main entry.

## Sample Code

```c
import stdio;
import stdlib;

int main(void) {
	int i = 0, j = 0;
	int[50] a;
	int tmp;
	printf("before sort: \n");
	for (i = 0; i < 50; i++) {
		a[i] = rand() % 50;
		printf("%d, ", a[i]);
	}
	printf("\n");

	for (i = 0; i < 50; i++) {
		for (j = i + 1; j < 50; j++) {
			if (a[i] > a[j]) {
				tmp = a[i];
				a[i] = a[j];
				a[j] = tmp;
			}
		}
	}
	printf("after sort: \n");
	for (i = 0; i < 50; i++) {
		printf("%d, ", a[i]);
	}
	printf("\n");
}
```

