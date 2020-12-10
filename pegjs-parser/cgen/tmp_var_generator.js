convertToNumberingScheme = function (number) {
  var baseChar = ("a").charCodeAt(0),
      letters  = "";

  do {
    number -= 1;
    letters = String.fromCharCode(baseChar + (number % 26)) + letters;
    number = (number / 26) >> 0; // quick `floor`
  } while(number > 0);

  return "___"+letters;
}

