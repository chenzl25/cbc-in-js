.file	"./integer.cb"
	.section	.rodata
.LC0:
	.string	"%d;%d;%d"
.LC1:
	.string	";%d;%d;%d"
.LC2:
	.string	""
	.text
.globl main
	.type	main,@function
main:
	pushl	%ebp
	movl	%esp, %ebp
	movl	$0, %eax
	pushl	%eax
	movl	$0, %eax
	pushl	%eax
	movl	$0, %eax
	pushl	%eax
	movl	$.LC0, %eax
	pushl	%eax
	call	printf
	addl	$16, %esp
	movl	$1, %eax
	pushl	%eax
	movl	$1, %eax
	pushl	%eax
	movl	$1, %eax
	pushl	%eax
	movl	$.LC1, %eax
	pushl	%eax
	call	printf
	addl	$16, %esp
	movl	$9, %eax
	pushl	%eax
	movl	$9, %eax
	pushl	%eax
	movl	$9, %eax
	pushl	%eax
	movl	$.LC1, %eax
	pushl	%eax
	call	printf
	addl	$16, %esp
	movl	$17, %eax
	pushl	%eax
	movl	$17, %eax
	pushl	%eax
	movl	$17, %eax
	pushl	%eax
	movl	$.LC1, %eax
	pushl	%eax
	call	printf
	addl	$16, %esp
	movl	$.LC2, %eax
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
