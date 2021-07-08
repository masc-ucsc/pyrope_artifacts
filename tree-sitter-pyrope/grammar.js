const PREC = {
}

const IDENTIFIER_CHARS = /[^\x00-\x1F\s:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]*/;
const LOWER_ALPHA_CHAR = /[^\x00-\x1F\sA-Z0-9:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]/;

module.exports = grammar({
  name: 'pyrope',

  extras: $ => [
    / /,
    /\t/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
  ],

  rules: {

    start: $ =>
      seq(
        optional($._newline)
        ,optional(
          seq(
            '|'
            ,$.lambda_def_constrains
            ,$._newline
          )
        )
       ,repeat($.stmt)
      )

    ,stmt: $ =>
      seq(
        choice(
           $.if_stmt
          ,$.match_stmt
          ,$.while_stmt
          ,$.for_stmt
          ,$.ass_fcall_stmt
          ,$.ctrl_stmt
          ,$.scope_stmt
          ,$.try_stmt
          ,$.debug_comptime_stmt
          ,$.yield_stmt
          ,$.fail_stmt
          ,$.test_stmt
        )
        ,optional($.gate_stmt)
        ,$._newline
      )

    ,gate_stmt: $ =>
      seq(
        choice('when', 'unless')
        ,$.expr_entry
      )

    ,if_stmt: $ =>
      seq(
        optional('unique')
        ,'if'
        ,$.expr_entry
        ,$.scope_stmt
        ,repeat($.if_elif)
        ,optional($.else_line)
      )

    ,if_expr: $ =>
      seq(
        'if'
        ,$.expr_entry
        ,'{'
        ,optional($._newline)
        ,$.expr_seq1
        ,optional($._newline)
        ,'}'
        ,'else'
        ,'{'
        ,optional($._newline)
        ,$.expr_seq1
        ,optional($._newline)
        ,'}'
      )

    ,match_stmt: $ =>
      seq(
        'match'
        ,$.expr_seq1
        ,'{'
        ,repeat($.match_stmt_line)
        ,optional($.match_stmt_else)
        ,optional($._newline)
        ,'}'
      )

    ,match_expr: $ =>
      seq(
        'match'
        ,$.expr_seq1
        ,'{'
        ,repeat($.match_expr_line)
        ,optional($.match_expr_else)
        ,optional($._newline)
        ,'}'
      )

    ,match_stmt_line: $ =>
      seq(
        optional($._newline)
        ,choice(
          $.is_typecase
          ,$.in_range
          ,$.expr_seq1
        )
        ,optional($.gate_stmt)
        ,$.scope_stmt
      )

    ,match_expr_line: $ =>
      seq(
        optional($._newline)
        ,choice(
          $.is_typecase
          ,$.in_range
          ,$.expr_seq1
        )
        ,optional($.gate_stmt)
        ,'{'
        ,optional($._newline)
        ,$.expr_seq1
        ,optional($._newline)
        ,'}'
      )

    ,match_stmt_else: $ =>
      seq(
        optional($._newline)
        ,'else'
        ,$.scope_stmt
      )

    ,match_expr_else: $ =>
      seq(
        optional($._newline)
        ,'else'
        ,'{'
        ,optional($._newline)
        ,$.expr_seq1
        ,optional($._newline)
        ,'}'
      )

    ,if_elif: $ =>
      seq(
        'elif'
        ,$.expr_entry
        ,$.scope_stmt
      )

    ,else_line: $ =>
      seq(
        'else'
        ,$.scope_stmt
      )

    ,while_stmt: $ =>
      seq(
        'while'
        ,$.expr_entry
        ,$.scope_stmt
      )

    ,for_stmt: $ =>
      seq(
        'for'
        ,$.identifier
        ,$.in_range
        ,$.scope_stmt
      )

    ,ctrl_stmt: $ =>
      choice(
        'continue'
        ,'break'
        ,seq(
          'return'
          ,$.expr_seq1
        )
      )

    ,ass_fcall_stmt: $ =>
      seq(
        optional($.expr_attr)
        ,optional($.assign_attr)
        ,choice(
          $.variable_base
          ,$.argument_list
        )
        ,seq(
          choice(
            $.assignment_cont
            ,$.expr_seq1
          )
          ,repeat($.fcall_pipe)
        )
      )

    ,fcall_pipe: $ =>
      seq(
        //optional($._newline)
        '|>'
        ,$.variable_base
        ,$.fcall_args
      )

    ,assign_attr: $ =>
      choice(
        seq(
          'let'
          ,optional($.let_attr)
        )
        ,'mut'
        ,'set'
        ,'var'
      )

    ,let_attr: $ =>
      choice(
        $.pipe_check
        ,$.repipe_check
        ,'type'
      )

    ,assignment_cont: $ =>
      seq(
        optional($.typecase)
        ,$.assign_tok
        ,$.expr_seq1
      )

    ,scope_stmt: $ =>
      seq(
         '{'
        ,optional($._newline)
        ,repeat($.stmt)
        ,'}'
      )

    ,try_stmt: $ =>
      seq(
         'try'
        ,$.scope_stmt
        ,optional($.else_line)
      )

    ,debug_comptime_stmt: $ =>
      seq(
         $.expr_attr
        ,$.scope_stmt
      )

    ,yield_stmt: $ =>
      seq(
         'yield'
        ,optional($.expr_entry)
        ,$.scope_stmt
      )

    ,fail_stmt: $ =>
      seq(
         'fail'
        ,$.string_literal
        ,$.scope_stmt
      )

    ,test_stmt: $ =>
      seq(
         'test'
        ,$.string_literal
        ,$.scope_stmt
      )

    ,expr_entry: $ =>
      seq(
        optional($.expr_attr)
        ,$.factor
        ,repeat($.expr_cont)
        //,optional($.in_range)
        ,optional($.is_typecase)
      )

    ,expr_cont: $ =>
      seq(
        $.op_tok
        ,$.factor
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
        ,$.expr_seq1
      )

    ,range: $ =>
      seq(
        $.factor
        ,choice('..<', '..=', '..+')
        ,$.factor
        ,optional(
          seq(
            'by'
           ,$.factor)
        )
      )

    ,factor: $ => seq(
       optional(choice('!', '-', '~'))
      ,choice(
         seq(
           $.variable_base
           ,optional(choice($.fcall_args, $.typecase))
         )
				,$.literal
        ,$.bundle
        ,$.lambda_def
        ,$.if_expr
        ,$.match_expr
      )
    )

    ,expr_attr: $ =>
      choice(
         seq('comptime', optional('debug'))
        ,'debug'
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
          ,$.bundle
        )
        ,'anypipe'
      )

    ,repipe_check: $ =>
      seq(
        choice('repipe', 'reasync')
        ,$.bundle
      )

    ,fcall_args_lambda_else: $ =>
      seq(
         'else'
        ,optional($.pipe_check)
        ,$.lambda_def
      )

    ,lambda_def: $ =>
      seq(
        '{|'
        ,$.lambda_def_constrains
        ,choice(
           seq($._newline, repeat($.stmt))
          ,$.expr_seq1
        )
        ,'}'
      )

    ,lambda_def_constrains: $ =>
      seq(
        optional('mut')
        ,field("meta"
          ,optional(
            seq(
              '<'
              ,$.argument_seq1
              ,'>'
            )
          )
        )
        ,field("input"
          ,optional($.argument_list)
        )
        ,field("output"
          ,optional(
            seq(
              '->'
              ,$.argument_list
            )
          )
        )
        ,field("where"
          ,optional($.where_modifier)
        )
        ,'|'
      )

    ,argument_list: $ =>
      seq(
        '('
        ,optional($.argument_seq1)
        ,')'
      )

    ,argument_seq1: $ =>
      seq(
         repeat($.comma_tok)
        ,seq(
          $.argument
          ,repeat(
            seq(
               repeat1($.comma_tok)
              ,$.argument
            )
          )
        )
        ,repeat($.comma_tok)
      )

    ,argument: $ =>
      choice(
        seq($.identifier ,optional($.typecase))
       ,$.typecase
      )

    ,typecase: $ =>
      choice(
        $.typecase_where
        ,$.typecase_simple
      )

    ,typecase_where: $ =>
      seq(
        ':{'
        ,choice($.variable_base, $.bundle)
        ,$.where_modifier
        ,'}'
      )

    ,typecase_simple: $ =>
      seq(
        ':'
        ,optional(
          choice($.variable_base, $.bundle)
        )
      )


    ,where_modifier: $ =>
      seq(
        'where'
        ,$.expr_entry
      )

    ,variable_base: $ =>
      seq(
         $.variable_base_start
        ,repeat($.variable_base_field)
        ,optional($.variable_prev_field)
        ,optional($.variable_base_last)
      )

    ,variable_base_start: $ =>
      choice(
        $.ioreg_id_tok
        ,$.identifier
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
        ,$.expr_seq1
        ,optional($._newline)
        ,']'
      )

    ,variable_base_last: $ =>
      seq(
         choice(
            '?'
           //,'!'
           ,repeat1($.variable_bit_sel)
         )
      )

    ,dot_selector: $ =>
      seq(
        $.dot_tok
        ,choice($.identifier, $.literal)
      )

    ,selector: $ =>
      seq(
        '['
        ,$.expr_seq1
        ,optional($._newline)
        ,']'
      )

    ,selector_empty: $ =>
      seq(
        '['
        ,optional($.expr_seq1)
        ,optional($._newline)
        ,']'
      )

    ,expr_seq1: $ =>
      choice(
        $.range
        ,seq(
          repeat($.comma_tok)
          ,seq(
            $.expr_entry
            ,repeat(
              seq(
                repeat1($.comma_tok)
                ,$.expr_entry
              )
            )
          )
          ,repeat($.comma_tok)
        )
      )

    ,bundle: $ =>
      seq(
        '('
        ,choice(
          seq(
            optional($.bundle_seq1)
            ,optional($._newline)
          )
         ,$.range
        )
        ,')'
      )

    ,bundle_seq1: $ =>
      seq(
         repeat($.comma_tok)
        ,seq(
          $.bundle_entry
          ,repeat(
            seq(
               repeat1($.comma_tok)
              ,$.bundle_entry
            )
          )
        )
        ,repeat($.comma_tok)
      )

    ,bundle_entry: $ =>
      seq(
        $.factor
        ,optional(
          seq(
             $.equal_tok
            ,$.factor
          )
        )
        ,repeat($.expr_cont)
      )

    ,variable_bit_sel: $ =>
      seq(
         '@'
        ,optional(choice('sext', 'zext', '|', '&', '^', '+'))
        ,$.selector_empty
      )


    ,literal: $ =>
      choice(
        $.integer_literal
        ,$.string_literal
        ,$.boolean_literal
      )

    ,integer_literal: (_) =>
      token(choice(/[0-9][0-9_]*/, /0x[_0-9a-fA-F]+/, /0sb[_01?]+/, /0b[_01?]+/, /0o[_0-7]+/))

    ,boolean_literal: (_) => choice("true", "false")

    ,comma_tok: () => token(/\s*,/)
    ,dot_tok: () => token(/\s*\./)

    ,op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('++', '+', '-', '*', '/', '|', '&', '^', 'or', 'and', 'has', 'implies', '<<', '>>', '<', '<=', '==', '!=', '>=', '>')
        )
      )

    ,assign_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('=', '++=', '+=', '-=', '*=', '/=', '|=', '&=', '^=', 'or=', 'and=', '<<=', '>>=')
        )
      )

    ,equal_tok: () => token(/\s*=/)

    ,string_literal: $ => seq(
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
    )

    // WARNING: identifier must be last so that other tokens have higher priority (and, or,...)
    ,identifier: (_) => token(/[a-zA-Zα-ωΑ-Ωµ_][a-zA-Zα-ωΑ-Ωµ\d_]*/)
    ,ioreg_id_tok: (_) => token(/[$%#][a-zA-Zα-ωΑ-Ωµ\d_]*/)
    //,identifier: $ => token(seq(LOWER_ALPHA_CHAR, IDENTIFIER_CHARS))

    ,_newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/))

    ,comment: (_) => token(seq("//", /.*/))
  }
});