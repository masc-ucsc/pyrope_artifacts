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

const IDENTIFIER_CHARS = /[^\x00-\x1F\s:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]*/;
const LOWER_ALPHA_CHAR = /[^\x00-\x1F\sA-Z0-9:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]/;

module.exports = grammar({
  name: 'pyrope',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
  ],

  rules: {

    file_top: $ => repeat($.stmt),

    stmt: $ => seq(
      $._stmt_itself,
      // optional($.gate_stmt),
      $._newline
    ),

    gate_stmt: $ => seq(
      choice('when','unless'),
      $.bool_expr
    ),

    _stmt_itself: $ => choice(
      $.if_stmt,
      $.while_stmt,
      $.for_stmt,
      $.ass_fcall_stmt,
      $.ctrl_stmt,
    ),

    if_stmt: $ => seq(
      optional('unique'),
      'if',
      optional('comptime'),
      $.bool_expr,
      $.new_scope,
      repeat(seq('elif',
        optional('comptime'),
        $.bool_expr,
        $.new_scope)
      ),
      optional(seq(
        'else',
        $.new_scope)
      )
    ),

    while_stmt: $ => seq(
      'while',
      optional('comptime'),
      $.bool_expr,
      $.new_scope,
    ),

    for_stmt: $ => seq(
      'for',
      optional('comptime'),
      $.identifier,
      'in',
      $.bool_expr, // FIXME: tup_expr_list
      $.new_scope,
    ),

    ctrl_stmt: $ => choice('continue', 'break', 'return'),

    ass_fcall_stmt: $ => choice(
      seq($.assign_attribute, $.variable_base, $.assignment_cont),
      $.variable_base, // FIXME:
    ),

    assign_attribute: $ => seq(
      choice('let', 'mut', 'var', 'set', 'raw'),
      choice(
        seq(
          optional(choice('pipe', 'comb')),
          optional('comptime'),
        ),
        optional('type'),
      ),
    ),

    assignment_cont: $ => seq(
      optional($.typecase),
      choice('=', ':=', '+=', '-=', '++=', '|=', '&=', '^=', '*=', '/=', 'or=', 'and='),
      $.bool_expr, // FIXME: tup_expr_list
    ),

    new_scope: $ => seq(
      '{',
      $._newline,
      repeat($.stmt),
      '}'
    ),

    bool_expr: $ => seq(
      $.factor,
      repeat($.bool_expr_cont)
    ),

    bool_expr_cont: $ => seq(
      choice('or', 'and', 'implies', 'is', 'isnot', '<', '<=', '==', '!=', '>=', '>'),
      $.factor
    ),

    factor: $ => seq(
      optional(choice('!', '-', '~')),
      choice(
        seq(
          $.variable_base,
          optional(choice($.variable_bit_sel, $.typecase, $.fcall_args)),
        ),
        $.constant,
        seq('(',
          optional($.bool_expr), // FIXME: expr_list
          ')',
          optional($.typecase)
        ),
        $.fcall_def,
      ),
    ), // FIXME: add fcall, if...

    fcall_args: $ => seq(
      '(',
      optional($.bool_expr), // FIXME: expr_list
      ')',
      optional(
        seq(
          $.fcall_def,
          optional(
            seq(
              'else',
              $.new_fun_scope
            ),
          ),
        ),
      ),
    ),

    typecase: $ => seq(
      ':',
      $.variable_base,
      optional(
        seq(
          'constrain',
          $.new_fun_scope,
        ),
      ),
    ),

    fcall_def: $ => seq(
      '|',
      optional(
        seq(
          '(',
          repeat(','),
          repeat(
            seq(
              '$',
              $.identifier,
              repeat(','),
            )
          ),
          ')',
        ),
      ),
      '|',
      $.new_fun_scope,
    ),

    new_fun_scope: $ => seq(
      '{',
      choice(
        seq(
          $._newline,
          repeat($.stmt),
        ),
        $.bool_expr // FIXMEL tup_expr_list
      ),
      '}'
    ),

    variable_base: $ => seq(
      optional(choice('$', '%', '#')),
      $.identifier,
      repeat(
        choice(
          seq(
            '.',
            choice(
              $.identifier,
              $.constant
            )
          ),
          seq(
            '[',
            $.bool_expr, // FIXME: expr_list
            ']'
          )
        )
      )
    ),

    variable_bit_sel: $ => seq(
      '@',
      optional(choice('sext', 'zext', '|', '&', '^', '+')),
      '(',
      optional($.bool_expr), // FIXME: expr_list
      ')'
    ),

    identifier: $ => token(seq(LOWER_ALPHA_CHAR, IDENTIFIER_CHARS)),

    integer: $ => /0[bB][01\?](_?[01\?])*|0[oO]?[0-7](_?[0-7])*|(0[dD])?\d(_?\d)*|0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/,

    string: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(1, /[^\\"\n]+/)),
        $._escape_sequence
      )),
      '"',
    ),

    _escape_sequence: $ => token(
      prec(1,
        seq(
          '\\',
          choice(
            /[^xuU]/,
            /\d{2,3}/,
            /x[0-9a-fA-F]{2,}/,
            /u[0-9a-fA-F]{4}/,
            /U[0-9a-fA-F]{8}/
          )
        )
      )
    ),

    constant: $ => choice($.integer, $.string),

    _newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/)),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: $ => token(choice(
      seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),
  }
});