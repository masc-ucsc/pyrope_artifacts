const PREC = {
  fcall : 21,
  fcallimp : 20,
  unary : 20,
  mult : 19,
  addtv : 19,
  addplusmns : 18,
  comparators : 17,
  logical : 16,
}

module.exports = grammar({
  name: 'pyrope',

  extras: $ => [$._whitespace],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.binaryoperator],
    [$._additiveoperator],
    [$.tupleconcat],
    [$.tupleconcat, $._additiveoperator],
    [$._statement, $._exspression]
  ],

  rules: {

    start: $ => optional($._codeblocks),

    _codeblocks: $ => seq(repeat($._comment),repeat1(seq(
      $._statement,
      repeat(choice($._lineterminatorsequence, $._lineterminator, $._SEMICOLON))
      ))),

/**************************CODE BLOCK INSTRUCTIONS*****************************/
    _statement: $ => seq(
      //repeat($._comment),
      choice(
        $.ifstatement,
        $.whilestatement,
        $.forstatement,
        $.assignmentexpression,
        $.assertionstatement,
        $.fcallexplicit,
        $.fcallimplicit,
        $.fpipestatement,
        $.returnstatement,
        $.punchstatement,
        $.importstatement,
        $.waitforstatement,
        $.yieldstatement,
        $.breakstatement,
        $.trystatement
        //$.scopedeclaration
        ),
      repeat($._comment)
    ),

    ifstatement: $ => seq(
      choice('if', 'unique if'),
      $._exspression,
      $.scopedec_compound_statement,
      repeat(seq(
        'elif',
        $._exspression,
        $.scopedec_compound_statement)),
      optional(
        $.scopeelse),
    ),

    whilestatement: $ => seq(
      'while',
      $._exspression,
      $.scopedec_compound_statement
    ),

    forstatement: $ => prec.left(seq(
      'for',
      $.identifier,
      'in',
      choice($._tuplenotation, $.rangenotation),
      repeat(seq(
        $._SEMICOLON,
        $.identifier,
        'in',
        choice($._tuplenotation, $.rangenotation))),
      $.scopedec_compound_statement
    )),

    assignmentexpression: $ => seq(
      choice(
        $.overloadnotation,
        $._exspression),
      $.assignmentoperator,
      choice($._exspression, $.scopedeclaration) // add fcallimplicit
    ),

    assertionstatement: $ => seq('I(',$._exspression,')'),

    fcallexplicit: $ => prec.left(PREC.fcall,seq(
      $._tupledotnotation,
      $.scopeargument,
      optional($.scopedeclaration),
      optional(seq('.', choice($.fcallexplicit, $._tupledotnotation))),
      optional($.funcpipe)
    )),

    fcallimplicit: $ => prec.left(PREC.fcallimp,seq(
      $._tupledotnotation,
      optional($.scopedeclaration),
      optional($.funcpipe)
    )),

    funcpipe: $ => seq(
      '|>',
      choice($.fcallexplicit, $.fcallimplicit)
    ),

    fpipestatement: $ => seq(
      $._tuplenotation,
      '|>',
      choice($.fcallexplicit, $.fcallimplicit)
    ),

    returnstatement: $ => seq('return', $._exspression),

    breakstatement: $ => 'break',

    punchstatement: $ => seq(
      'punch',
      '(',
      $._stringconstant,
      ')',
    ),

    importstatement: $ => seq(
      'import',
      '(',
      $._stringconstant,
      ')',
    ),

    trystatement: $ => seq(
      'try',
      $.scopedec_compound_statement
    ),

    yieldstatement: $ => seq(
      'yield',
      $.scopeargument
    ),

    waitforstatement: $ => seq(
      'waitfor',
      $.scopeargument
    ),
/************************** SCOPE DECLARATIONS ********************************/
    scopedeclaration: $ => seq(
      choice(
        seq(':',optional($.scopeargument),':'),
        optional($._exspression)),
      $._LBRACE,
      choice($._codeblocks, $._exspression),
      $._RBRACE,
      optional($.scopeelse)
    ),

    scopeelse: $ => seq(
      'else',
      $._LBRACE,
      choice($._codeblocks, $._exspression),
      $._RBRACE
      ),

    scopeargument: $ => seq(
      '(',
      optional(seq(
        choice($.assignmentexpression, $._exspression),
        repeat(seq(',', choice($.assignmentexpression, $._exspression))),
        repeat(','))),
      ')'
      ),

    scopedec_compound_statement: $ =>  seq(
      $._LBRACE,
      $._codeblocks,
      $._RBRACE,
    ),

/**************************EXSPRESSIONS***************************/

    _exspression: $ => choice(
      $.unaryoperator,
      $.binaryoperator,
      $.tupleconcat,
      $._tuplenotation,
      $.rangenotation,
      $.fcallexplicit,
      $.punchstatement,
      $.importstatement
    ),

    unaryoperator: $ => prec.left(PREC.unary,choice(
      seq(
        choice('not' ,'!', '~'),
        $._exspression))),

    binaryoperator: $ => choice(
      prec(PREC.logical,seq(
        $._exspression,
        choice('and', 'or', 'xor'),
        $._exspression)),
      prec(PREC.comparators,seq(
        $._exspression,
        choice($._EQUEQU, $._ISEQU, $._BANGEQU, $._LE, $._GE, $._LT, $._GT),
        $._exspression)),
      $._additiveoperator,
    ),

    _additiveoperator: $ => choice(
      prec(PREC.addtv, seq(
        $._exspression,
        choice('|', '^', '&', '<<', '>>', '<<<', '>>>'),
        $._exspression)),
      prec.left(PREC.addplusmns, seq(
        $._exspression,
        choice('+', '-'),
        $._exspression)),
      prec(PREC.mult, seq(
        $._exspression,
        choice('*', '/'),
        $._exspression)),
    ),

    tupleconcat: $ => prec(PREC.addtv, seq(
      $._exspression,
      choice('++', '--'),
      $._exspression
    )),

/************************ OPERATORS ******************************/

    _LT: $ => choice ('<', ':<'),
    _GT: $ => choice ('>', ':>'),
    _LE: $ => choice ('<=', ':<='),
    _GE: $ => choice ('>=', ':>='),

    _EQUEQU: $ => choice('==',':=='),
    _ISEQU: $ => 'is',

    assignmentoperator: $ => choice(
      $._EQU,
      $._AS,
      $._TPLUSEQU,
      $._STAREQU,
      $._PLUSEQU,
      $._MINUSEQU,
      $._LEFTEQU,
      $._RIGHTEQU
    ),

    _BANGEQU: $ => choice('!=', ':!='),
    _EQU: $ => choice('=', ':='),
    _AS: $ => 'as',
    _IN: $ => 'in',

    _TPLUSEQU: $ => choice('++=', '++:='),
    _STAREQU: $ => choice('*=', '*:='),
    _DIVEQU: $ => choice('/=','/:='),
    _MODEQU: $ => choice('%=', '%:='),
    _PLUSEQU: $ => choice('+=', '+:='),
    _MINUSEQU: $ => choice('-=', '-:='),
    _LEFTEQU: $ => choice('<<=', '<<:='),
    _RIGHTEQU: $ => choice('>>=', '>>:='),

/************************* RANGE NOTATION ***********************/

    rangenotation: $ => prec.right(2,seq(
      optional($._lhsvarname),
      '..',
      optional(choice($._additiveoperator, $._bitselectionnotation)),
      optional($.tupleby)
    )),

/************************* TUPLE NOTATION ***********************/

    _tuplenotation: $ => prec.left(choice(
      seq(
        '(',
        optional(choice($._exspression, $.assignmentexpression)),
        repeat(seq(/,+/, choice($._exspression, $.assignmentexpression))),
        /,*/,
        ')',
        optional(choice($._bitselectionbracket)),
        optional($.funcpipe)
        ),
      seq($._bitselectionnotation, optional($.funcpipe))
    )),

    tupleby: $ => seq('by', $._lhsvarname),

    _bitselectionnotation: $ => prec.right(seq($._tupledotnotation, optional($._bitselectionbracket))),
    _bitselectionbracket: $ => repeat1(seq($._LLBRK, optional($._exspression), $._RRBRK)),

    _tupledotnotation: $ => seq(
      $._tuplearraynotation,
      repeat(seq('.', $._tuplearraynotation))
    ),

    _tuplearraynotation: $ => seq(
      $._lhsvarname,
      repeat(seq($._LBRK, $._exspression, $._RBRK)) // decimal to expression
    ),


    _lhsvarname: $ => prec.right(choice(
      seq(
        optional(choice($.input, $.output, $.register)),
        choice($.identifier, $.constant)),
      choice($.input, $.output, $.register)
      )),

    _lhsvarname: $ => prec.right(choice(
      $.identifier, $.constant, $.input, $.output, $.register
      )),


    input: $ => prec.right(seq('$', optional(choice($.identifier, $.constant)))),
    output: $ => prec.right(seq('%', optional(choice($.identifier, $.constant)))),
    register: $ => prec.right(seq('#', optional(choice($.identifier, $.constant)))),

/*************************** MISC *********************************/
    _LLBRK: $ => '[[',
    _RRBRK: $ => ']]',
    _LBRK: $ => '[',
    _RBRK: $ => ']',
    _LBRACE: $ => '{',
    _RBRACE: $ => '}',
    _SEMICOLON: $ => ';',

/*************************** OVERLOAD *****************************/

    overloadnotation: $ => prec.left(4,seq(
      '..',
      $.overloadname,
      '..'
      )),

    //overloadname: $ => prec(2,/\.\.[^\n\r\u2028\u2029\s#;,={}()/?!|'"]+\.\./), // [] will be added
    overloadname: $ => /[^\n\r\u2028\u2029\s#;,={}()/?!|'"]+/, // [] will be added

/***************************IDENTIFIER*****************************/

    identifier: $ => /[_]*[a-zA-Z]{1}[a-zA-Z0-9_]*([?]|[!]{0,2})?/,
    //idprefix: $ => /[!-]{1}/,
    //idnondigit: $ => /[a-zA-Z%$#]{1}/,
    //idchar: $ => /[a-zA-Z0-9]{1}/,

/****************************CONSTANTS*****************************/

    constant: $ => choice($._stringconstant, $._numericalconstant),

    _stringconstant: $ => choice(
      /'(.*[^"\n\r\u2028\u2029])'/, //check this
      /"(.*[^'\n\r\u2028\u2029])"/ //check this
    ),

    _numericalconstant: $ => choice(
      $._boolean,
      $._hexadecimal,
      $._binary,
      $._decimalsigned,
      $._decimaldigit
    ),

    _boolean: $ => choice(
      'true',
      'TRUE',
      'false',
      'FALSE'
    ),

    //_decimalsigned: $ => /([-]?[0-9]{1}[0-9_]*)(s|u)?([0-9_]+(bit){1}s?)?/,
    _decimalsigned: $ => /([-]?[0-9]{1}[0-9_]*)(s|u)?[0-9_]*((bit){1}s?)?/,


    _decimaldigit: $ => /([-]?[0-9]{1}[0-9_]*)/,

    _binary: $ => /0b["0-1_]+(s|u)?[?0-9_]*((bit){1}s?)?/,

    _hexadecimal: $ => /0x["A-Fa-f0-9_]+(s|u)?[0-9_]*((bit){1}s?)?/,

/****************************LINE TERMINATOR*****************************/

    _whitespace: $ => /[ \n\t\u000B\u000C\uFEFF]+/, // /n ?????
    _lineterminator: $ => /[\n\r\u2028\u2029]+/,
    _lineterminatorsequence: $ => choice(
      /[\n\u2028\u2029]+/,
      /[\r][\n]?/,
    ),

/****************************COMMENT*****************************/
    _comment: $ => choice(
      $._multilinecomment,
      $._singlelinecomment
    ),

    //_multilinecomment: $ => /\/\*((.|\s)*?)\*\//, // is supposed to give */*/

    _multilinecomment: $ => seq( //DONT GIVE  * and / is not supported in the comment body
      '/*',
      /[^\*\/]*/,
      '*/'
    ),

    _singlelinecomment: $ => /\/\/([^\n\r\u2028\u2029])*/,

  }
});