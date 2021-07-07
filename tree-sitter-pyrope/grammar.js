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
        choice('when','unless')
        ,$.expr_entry
      ),

    if_stmt: $ =>
      seq(
        optional('unique')
        ,'if'
        ,$.expr_entry
        ,$.scope_stmt
        ,repeat($.if_elif)
        ,optional($.else_line)
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
        optional($.assign_attr)
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

    ,ass_fcall_func_cont: $ =>
      seq(
        $.fcall_args
        ,optional($.fcall_pipe)
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
          $.expr_attr
          ,'let'
          ,$.let_attr
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
        ,choice('=', ':=', '+=', '-=', '++=', '|=', '&=', '^=', '*=', '/=', 'or=', 'and=')
        ,$.expr_entry
      )

    ,scope_stmt: $ =>
      seq(
         '{'
        ,$._newline
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
        ,optional($.in_range)
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
        ,choice($.bundle, $.range)
        //,$.bundle
      )

    ,range: $ => // FIXME: patch _ts to be consistent
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
         $.factor_var_fcall_type
				,$.literal // FIXME: add if_expr match_expr
        ,$.bundle
        ,$.lambda_def
      )
    )

    ,factor_var_fcall_type: $ =>
      seq(
        $.variable_base
        ,optional(choice($.fcall_args, $.typecase))
      )

    ,expr_attr: $ =>
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
          ,$.expr_entry
        )
        ,'}'
      )

    ,lambda_def_constrains: $ =>
      seq(
        optional('mut')
        ,optional(
          seq(
            '<'
            ,$.argument_seq1
            ,'>'
          )
        )
        ,optional($.argument_list)
        ,optional(
          seq(
            '->'
            ,$.argument_list
          )
        )
        ,optional($.where_modifier)
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
         repeat(',')
        ,seq(
          $.argument
          ,repeat(
            seq(
               repeat1(',')
              ,$.argument
            )
          )
        )
        ,repeat(',')
      )

    ,argument: $ =>
      choice(
        seq($.identifier ,optional($.typecase))
       ,$.typecase
      )

    ,typecase: $ =>
      seq(
        ':'
        ,optional(
          seq(
            choice($.variable_base, $.bundle)
            ,optional($.where_modifier)
          )
        )
      )

    ,where_modifier: $ =>
      seq(
        'where'
        ,'{'
        ,choice(
           seq($._newline, repeat($.stmt))
          ,$.expr_entry
        )
        ,'}'
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
        ,optional($.variable_prev_field)
        ,optional($.variable_base_last)
      )

    ,variable_base_start: $ =>
      seq(
				choice(
					 seq( choice('$', '%', '#')
						,choice(
							$.identifier
							,$.literal
						)
					)
					,$.identifier
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
        ,choice($.range, $.expr_seq1)
        ,optional($._newline)
        ,']'
      )

    ,selector_empty: $ =>
      seq(
        '['
        ,optional(choice($.range, $.expr_seq1))
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
        ,$.selector_empty
      )

    ,identifier: (_) => token(/[a-zA-Zα-ωΑ-Ωµ_][a-zA-Zα-ωΑ-Ωµ\d_]*/)
    //,identifier: $ => token(seq(LOWER_ALPHA_CHAR, IDENTIFIER_CHARS))

    ,literal: $ =>
      choice(
        $.integer_literal
        ,$.string_literal
        ,$.boolean_literal
      )

    ,integer_literal: (_) =>
      token(choice(/[0-9][0-9_]*/, /0x[_0-9a-fA-F]+/, /0sb[_01?]+/, /0b[_01?]+/, /0o[_0-7]+/))

    ,boolean_literal: (_) => choice("true", "false")

    ,dot_tok: () => token(/\s*\./)

    ,op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('++', '+', '-', '*', '/', '|', '&', '^', 'or', 'and', 'has', 'implies', '<<', '>>', '<', '<=', '==', '!=', '>=', '>')
        )
      )

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
    ),

    _newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/)),

    comment: (_) => token(seq("//", /.*/)),
  }
});