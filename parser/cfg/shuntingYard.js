/**
 * Shunting yard algorithm
 * See: http://en.wikipedia.org/wiki/Shunting_yard_algorithm
 *
 * Converts infix notation to postfix notation
 *
 * by Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 * MIT Style License
 */

// helper, top element of an array w/o removing it

 
Array.prototype.peek = function () {
  return this[this.length - 1];
};

// operators set
var operators = {"+": 1, "-": 1, "*": 1, "/": 1};

// associations (left / right) sets
var leftAssoc =  {"*": 1, "/": 1, "%": 1, "+": 1, "-": 1};
var rightAssoc = {"=": 1, "!": 1};

/**
 * precedenceOf
 *
 * precedence   operators       associativity
 * 1            !               right to left
 * 2            * / %           left to right
 * 3            + -             left to right
 * 4            =               right to left
 */

var precedenceOf = {
  "!": 4,

  "*": 3,
  "/": 3,
  "%": 3,

  "+": 2,
  "-": 2,

  "=": 1
};

/**
 * Shunting_yard_algorithm
 * @param {String} string
 *
 * TODO:
 *    - support digits > 10
 *    - functions
 */

module.exports = {

shuntingYard:function shuntingYard(string) {

  var output = [];
  var stack = [];

  for (var k = 0, length = string.length; k < length;  k++) {

    // current char
    var ch = string[k];

    // skip whitespaces
    if (ch == " ")
      continue;

    // if it's a number, add it to the output queue
    if (/\d/.test(ch))
      output.push(ch);

    // TODO: if the token is a function token, then push it onto the stack

    // TODO: if the token is a function argument separator (e.g., a comma):

    // if the token is an operator, op1, then:
    else if (ch in operators) {

      var op1 = ch; // just for readability

      // while ...
      while (stack.length) {

        // ... there is an operator token, op2, at the top of the stack
        var op2 = stack.peek();

        if (op2 in operators && (
            // and op1 is left-associative and its precedence is less than or equal to that of op2,
            (op1 in leftAssoc && (precedenceOf[op1] <= precedenceOf[op2])) ||
            // or op1 is right-associative and its precedence is less than that of op2,
            (op1 in rightAssoc && (precedenceOf[op1] < precedenceOf[op2]))
        )) {

          // push op2 onto the output queue (it's already popped from the stack);
          output.push(stack.pop()); // op2

        } else {
          break;
        }

      }

      // push op1 onto the stack
      stack.push(op1);

    }

    // if the token is a left parenthesis, then push it onto the stack.
    else if (ch == "(")
      stack.push(ch);

    // if the token is a right parenthesis:
    else if (ch == ")") {

      var foundLeftParen = false;

      // until the token at the top of the stack is a left parenthesis,
      // pop operators off the stack onto the output queue
      while (stack.length) {
        var c = stack.pop();
        if (c == "(") {
          foundLeftParen = true;
          break;
        } else {
          output.push(c);
        }
      }

      // if the stack runs out without finding a left parenthesis, then there are mismatched parentheses.
      if (!foundLeftParen)
        throw "Error: parentheses mismatched";

      // pop the left parenthesis from the stack, but not onto the output queue.
      stack.pop();

      // TODO: if the token at the top of the stack is a function token, pop it onto the output queue.

    }

    else throw "Unknown token " + ch;

  }

  // when there are no more tokens to read:
  // while there are still operator tokens in the stack:
  while (stack.length) {

    var c = stack.pop();

    if (c == "(" || c == ")")
      throw "Error: parentheses mismatched";

    // push it to the output
    output.push(c);

  }

  //return output.join(" ");
  return output;

}

};
// tests

//console.log("2 + 2 + 2 ->", shuntingYard("2+2 + 2")); // 2 2 + 2 +
//console.log("2 + 2 * 2 ->", shuntingYard("2 + 2 * 2")); // 2 2 2 * +
//console.log("(2 + 2) * 2 ->", shuntingYard("(2 + 2) * 2")); // 2 2 + 2 *
