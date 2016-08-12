.file	"./funcall5.cb"
	.section	.rodata
.LC0:
	.string	"%d"
.LC1:
	.string	";%d;%d"
.LC2:
	.string	";%d;%d;%d"
.LC3:
	.string	";%d;%d;%d;%d"
.LC4:
	.string	";%d;%d;%d;%d;%d"
.LC5:
	.string	";%d;%d;%d;%d;%d;%d"
.LC6:
	.string	";%d;%d;%d;%d;%d;%d;%d"
.LC7:
	.string	";%d;%d;%d;%d;%d;%d;%d;%d"
.LC8:
	.string	";%d;%d;%d;%d;%d;%d;%d;%d;%d"
.LC9:
	.string	";%d;%d;%d;%d;%d;%d;%d;%d;%d;%d"
.LC10:
	.string	""
	.text
.globl main
	.type	main,@function
main:
	pushl	%ebp
	movl	%esp, %ebp
	movl	$1, %eax
	pushl	%eax
	movl	$.LC0, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$3, %eax
	pushl	%eax
	movl	$2, %eax
	pushl	%eax
	movl	$.LC1, %eax
	pushl	%eax
	call	printf
	addl	$12, %esp
	movl	$6, %eax
	pushl	%eax
	movl	$5, %eax
	pushl	%eax
	movl	$4, %eax
	pushl	%eax
	movl	$.LC2, %eax
	pushl	%eax
	call	printf
	addl	$16, %esp
	movl	$10, %eax
	pushl	%eax
	movl	$9, %eax
	pushl	%eax
	movl	$8, %eax
	pushl	%eax
	movl	$7, %eax
	pushl	%eax
	movl	$.LC3, %eax
	pushl	%eax
	call	printf
	addl	$20, %esp
	movl	$15, %eax
	pushl	%eax
	movl	$14, %eax
	pushl	%eax
	movl	$13, %eax
	pushl	%eax
	movl	$12, %eax
	pushl	%eax
	movl	$11, %eax
	pushl	%eax
	movl	$.LC4, %eax
	pushl	%eax
	call	printf
	addl	$24, %esp
	movl	$21, %eax
	pushl	%eax
	movl	$20, %eax
	pushl	%eax
	movl	$19, %eax
	pushl	%eax
	movl	$18, %eax
	pushl	%eax
	movl	$17, %eax
	pushl	%eax
	movl	$16, %eax
	pushl	%eax
	movl	$.LC5, %eax
	pushl	%eax
	call	printf
	addl	$28, %esp
	movl	$28, %eax
	pushl	%eax
	movl	$27, %eax
	pushl	%eax
	movl	$26, %eax
	pushl	%eax
	movl	$25, %eax
	pushl	%eax
	movl	$24, %eax
	pushl	%eax
	movl	$23, %eax
	pushl	%eax
	movl	$22, %eax
	pushl	%eax
	movl	$.LC6, %eax
	pushl	%eax
	call	printf
	addl	$32, %esp
	movl	$36, %eax
	pushl	%eax
	movl	$35, %eax
	pushl	%eax
	movl	$34, %eax
	pushl	%eax
	movl	$33, %eax
	pushl	%eax
	movl	$32, %eax
	pushl	%eax
	movl	$31, %eax
	pushl	%eax
	movl	$30, %eax
	pushl	%eax
	movl	$29, %eax
	pushl	%eax
	movl	$.LC7, %eax
	pushl	%eax
	call	printf
	addl	$36, %esp
	movl	$45, %eax
	pushl	%eax
	movl	$44, %eax
	pushl	%eax
	movl	$43, %eax
	pushl	%eax
	movl	$42, %eax
	pushl	%eax
	movl	$41, %eax
	pushl	%eax
	movl	$40, %eax
	pushl	%eax
	movl	$39, %eax
	pushl	%eax
	movl	$38, %eax
	pushl	%eax
	movl	$37, %eax
	pushl	%eax
	movl	$.LC8, %eax
	pushl	%eax
	call	printf
	addl	$40, %esp
	movl	$55, %eax
	pushl	%eax
	movl	$54, %eax
	pushl	%eax
	movl	$53, %eax
	pushl	%eax
	movl	$52, %eax
	pushl	%eax
	movl	$51, %eax
	pushl	%eax
	movl	$50, %eax
	pushl	%eax
	movl	$49, %eax
	pushl	%eax
	movl	$48, %eax
	pushl	%eax
	movl	$47, %eax
	pushl	%eax
	movl	$46, %eax
	pushl	%eax
	movl	$.LC9, %eax
	pushl	%eax
	call	printf
	addl	$44, %esp
	movl	$.LC10, %eax
	pushl	%eax
	call	puts
	addl	$4, %esp
	movl	$0, %eax
	jmp	.L0
.L0:
	movl	%ebp, %esp
	popl	%ebp
	ret
	.size	main,.-main
