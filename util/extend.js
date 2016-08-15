var $import = require('./import');
module.exports = $extend;

function $extend (sub, sup) {
  var subOriginPrototype = sub.prototype;
  $import(sub, sup); // for static method
  function fun() {};
  fun.prototype = sup.prototype;
  var subNewPrototype = $import(new fun(), subOriginPrototype); 
  sub.prototype = subNewPrototype;
  sub.prototype.super = sup;
  sub.prototype.constructor = sub;
  return sub;
}

/*============================
=            test            =
============================*/

// function A(name) {
//   this.name = name;
// }
// A.prototype.method1 = function() {
//   console.log("A_method1");
// }
// A.prototype.method2 = function() {
//   console.log("A_method2");
// }

// function B(name, age) {
//   this.super(name);
//   this.age = age;
// }
// B.prototype.method2 = function() {
//   console.log("B_method2");
// }

// $extend(B, A);

// b = new B("Dylan", 22);
// console.log(b);
// b.method1();
// b.method2();

/*=====  End of test  ======*/







