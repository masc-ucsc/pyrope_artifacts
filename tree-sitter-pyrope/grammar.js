const PREC = {
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

    start: $ =>
      repeat($.stmt)

    ,stmt: $ =>
      seq(
        choice(
           $.if_stmt
          ,$.while_stmt
          ,$.for_stmt
          ,$.ass_fcall_stmt
          ,$.ctrl_stmt
        )
        ,optional($.gate_stmt)
        ,$._newline
      )

    ,gate_stmt: $ =>
      seq(
        choice('when','unless')
        ,$.expr_entry
      ),

    if_stmt: $ => seq(
      optional('unique'),
      'if',
      $.expr_entry,
      $.scope_stmt,
      repeat(seq('elif',
        $.expr_entry,
        $.scope_stmt)
      ),
      optional(seq(
        'else',
        $.scope_stmt)
      )
    ),

    while_stmt: $ => seq(
      'while',
      $.expr_entry,
      $.scope_stmt,
    ),

    for_stmt: $ => seq(
      'for',
      $.identifier,
      'in',
      $.expr_entry, // FIXME: tup_expr_list
      $.scope_stmt,
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
      $.expr_entry, // FIXME: tup_expr_list
    ),

    scope_stmt: $ =>
      seq(
         '{'
        ,$._newline
        ,repeat($.stmt)
        ,'}'
      )

    ,expr_entry: $ =>
      seq(
         $.factor
        ,repeat($.expr_cont)
        ,optional($.in_range)
      )

    ,expr_cont: $ =>
      choice(
        seq(
           choice('++', '+', '*', '/', '|', '&', '^', 'or', 'and', 'has', 'implies', '<', '<=', '==', '!=', '>=', '>')
          ,$.factor
        )
       ,$.is_typecase // FIXME: add fcall_pipe
      )

    ,is_typecase: $ =>
      seq(
        choice(
           'is'
          ,'implements'
          ,'isnot'
        )
        ,$.typecase
      )

    ,in_range: $ =>
      seq(
        choice(
           'in'
          ,'notint'
        )
        ,$.range
      )

    ,range: $ => // FIXME: patch _ts to be consistent
      seq(
         choice(
          seq(
             $.factor
            ,choice(
              seq(
                choice('+:', '<:' , '=:')
               ,$.factor
              )
              ,'..'
            )
          )
          ,seq(
            '..'
            ,optional($.factor)
          )
        )
        ,optional(
          seq(
            'step'
           ,$.factor)
        )
      )

    ,factor: $ => seq(
      optional($.stmt_attr)
      ,optional(choice('!', '-', '~'))
      ,choice(
        $.factor_var_fcall_type
      )
    )

    ,factor_var_fcall_type: $ =>
      seq(
        $.variable_base
        ,choice($.fcall_args, $.typecase)
      )

    ,stmt_attr: $ =>
      seq(
        choice(
           seq('comptime', optional('debug'))
          ,'debug'
        )
      )

    ,fcall_args: $ =>
      seq(
         $.bundle
        ,optional($.fcall_args_lambda)
      )

    ,fcall_args_lambda: $ =>
      seq(
         optional($.pipe_check)
        ,$.lambda_def
        ,optional($.fcall_args_lambda_else)
      )

    ,pipe_check: $ =>
      choice(
        seq(
          choice('pipe', 'async')
          ,'('
          ,$.range
          ,')'
        )
        ,'anypipe'
      )

    ,fcall_args_lambda_else: $ =>
      seq(
         'else'
        ,optional($.pipe_check)
        ,$.lambda_def
      )

    ,lambda_def: $ =>
      seq(
        '{|' // FIXME lambda_def_constrains_opt, '|'
        ,choice(
           seq($._newline, repeat($.stmt))
          ,$.expr_entry
        )
        ,'}'
      )

    ,typecase: $ =>
      seq(
         choice(
          seq(
             ':'
            ,optional(
              seq(
                 choice($.variable_base, $.bundle)
                ,optional($.where_stmt)
              )
            )
          )
        )
        ,seq(
           ':{'
          ,seq(
             choice($.variable_base, $.bundle)
            ,$.where_stmt
          )
          ,'}'
        )
      )

    ,where_stmt: $ =>
      seq(
         'where'
        ,'('
        , $.expr_entry
        ,')'
      )

    ,fcall_def: $ => seq(
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
        $.expr_entry // FIXMEL tup_expr_list
      ),
      '}'
    ),

    variable_base: $ =>
      seq(
         $.variable_base_start
        ,repeat($.variable_base_field)
        //,optional($.variable_prev_field)
        //,optional($.variable_base_last)
      )

    ,variable_base_start: $ =>
      seq(
         choice('$', '%', '#')
        ,choice(
           $.identifier
          ,$.literal
        )
      )

    ,variable_base_field: $ =>
      seq(
         optional('?')
        ,choice(
           $.dot_selector
          ,$.selector
        )
      )

    ,variable_prev_field: $ =>
      seq(
         '#['
        ,$._newline
        ,$.expr_entry
        ,$._newline
        ,']'
      )

    ,variable_base_last: $ =>
      seq(
         choice(
            '?'
           ,'!'
           ,repeat1($.variable_bit_sel)
         )
      )

    ,dot_selector: $ =>
      seq(
         choice('.', /\n./) // FIXME: scanner? , seq($._newline, '.'))
        ,choice($.identifier, $.literal)
      )

    ,selector: $ =>
      seq(
        '['
        ,optional($.expr_seq1)
        ,optional($._newline)
        ,']'
      )

    ,expr_seq1: $ =>
      seq(
         repeat(',')
        ,seq(
          $.expr_entry
          ,repeat(
            seq(
               repeat1(',')
              ,$.expr_entry
            )
          )
        )
        ,repeat(',')
      )

    ,bundle: $ =>
      seq(
        '('
        ,optional($.bundle_seq1)
        ,optional($._newline)
        ,')'
        ,optional($.typecase)
      )

    ,bundle_seq1: $ =>
      seq(
         repeat(',')
        ,seq(
          $.bundle_entry
          ,repeat(
            seq(
               repeat1(',')
              ,$.bundle_entry
            )
          )
        )
        ,repeat(',')
      )

    ,bundle_entry: $ =>
      seq(
        $.factor
        ,optional(
          seq(
             '='
            ,$.factor
          )
        )
        ,repeat($.expr_cont)
      )

    ,variable_bit_sel: $ =>
      seq(
         '@'
        ,optional(choice('sext', 'zext', '|', '&', '^', '+'))
        ,$.selector
      )

    ,identifier: $ => token(seq(LOWER_ALPHA_CHAR, IDENTIFIER_CHARS))

    ,literal: $ =>
      $.integer  // FIXME: integer or string or boolean

    ,integer: $ => /0[bB][01\?](_?[01\?])*|0[oO]?[0-7](_?[0-7])*|(0[dD])?\d(_?\d)*|0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/,

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

    comment: (_) => token(seq("//", /.*/)),
  }
});