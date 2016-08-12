.file	"./funcall3.cb"
	.text
.globl main
	.type	main,@function
main:
	pushl	%ebp
	movl	%esp, %ebp
	subl	$4, %esp
	movl	$0, %eax
	pushl	%eax
	movl	$999, %eax
	pushl	%eax
	movl	$998, %eax
	pushl	%eax
	call	f
	addl	$12, %esp
	movl	%eax, -4(%ebp)
	movl	-4(%ebp), %eax
	jmp	.L0
.L0:
	movl	%ebp, %esp
	popl	%ebp
	ret
	.size	main,.-main
.globl f
	.type	f,@function
f:
	pushl	%ebp
	movl	%esp, %ebp
	movl	16(%ebp), %eax
	jmp	.L1
.L1:
	movl	%ebp, %esp
	popl	%ebp
	ret
	.size	f,.-f
