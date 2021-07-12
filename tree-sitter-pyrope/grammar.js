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
  ]

  ,word: $ => $.identifier

  ,conflicts: $ => [ ] // No conflicts SLR grammar :D

  ,supertypes: $ => [
    $.stmt_base
    ,$.typecase
  ]

  ,inline: $ => [
    $.variable_base_field
    ,$.expr_seq1
    ,$.bundle_seq1
    ,$.argument_seq1
    ,$.comma_tok
    ,$.dot_tok
    ,$.ok_tok
    ,$.ck_tok
    ,$.ob_tok
    ,$.cb_tok
    ,$.op_tok
    ,$.cp_tok
    ,$.olt_tok
    ,$.clt_tok
    ,$.argument
    ,$.assignment_cont
    ,$.stmt
    ,$.if_elif
    ,$.else_line
    ,$.equal_tok
    ,$.expr_cont
  ]

  ,rules: {

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
        $.stmt_base
        ,optional($.gate_stmt)
        ,$._newline
      )

    ,stmt_base: $ =>
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


    ,gate_stmt: $ =>
      seq(
        choice('when', 'unless')
        ,field("cond",$.expr_entry)
      )

    ,if_stmt: $ =>
      seq(
        optional('unique')
        ,'if'
        ,field("cond",$.expr_entry)
        ,field("code",$.scope_stmt)
        ,repeat($.if_elif)
        ,optional($.else_line)
      )

    ,if_expr: $ =>
      seq(
        'if'
        ,field("cond",$.expr_entry)
        ,$.ok_tok
        ,$.expr_seq1
        ,$.ck_tok
        ,'else'
        ,$.ok_tok
        ,$.expr_seq1
        ,$.ck_tok
      )

    ,match_stmt: $ =>
      seq(
        'match'
        ,$.expr_seq1
        ,$.ok_tok
        ,repeat($.match_stmt_line)
        ,optional($.match_stmt_else)
        ,$.ck_tok
      )

    ,match_expr: $ =>
      seq(
        'match'
        ,$.expr_seq1
        ,$.ok_tok
        ,repeat($.match_expr_line)
        ,optional($.match_expr_else)
        ,$.ck_tok
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
        ,field("code",$.scope_stmt)
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
        ,$.ok_tok
        ,$.expr_seq1
        ,$.ck_tok
      )

    ,match_stmt_else: $ =>
      seq(
        optional($._newline)
        ,'else'
        ,field("else_code",$.scope_stmt)
      )

    ,match_expr_else: $ =>
      seq(
        optional($._newline)
        ,'else'
        ,$.ok_tok
        ,$.expr_seq1
        ,$.ck_tok
      )

    ,if_elif: $ =>
      seq(
        'elif'
        ,field("cond",$.expr_entry)
        ,field("code",$.scope_stmt)
      )

    ,else_line: $ =>
      seq(
        'else'
        ,field("else_code",$.scope_stmt)
      )

    ,while_stmt: $ =>
      seq(
        'while'
        ,field("cond",$.expr_entry)
        ,field("code",$.scope_stmt)
      )

    ,for_stmt: $ =>
      seq(
        'for'
        ,field("id",$.identifier)
        ,field("range",$.in_range)
        ,field("code",$.scope_stmt)
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
        ,field("lhs"
          ,choice(
            $.variable_base
            ,$.argument_list
          )
        )
        ,seq(
          choice(
            field("rhs",$.assignment_cont)
            ,field("args",$.expr_seq1)
          )
          ,repeat($.fcall_pipe)
        )
      )

    ,fcall_pipe: $ =>
      seq(
        $.pipe_tok
        ,$.variable_base
        ,optional($.fcall_args)
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
         $.ok_tok
        ,choice(
          seq(
             $._newline
            ,repeat($.stmt)
          )
          ,seq(
            $.stmt_base
            ,optional($._newline)
          )
        )
        ,$.ck_tok
      )

    ,try_stmt: $ =>
      seq(
         'try'
        ,field("code",$.scope_stmt)
        ,optional($.else_line)
      )

    ,debug_comptime_stmt: $ =>
      seq(
         $.expr_attr
        ,field("code",$.scope_stmt)
      )

    ,yield_stmt: $ =>
      seq(
         'yield'
        ,optional($.expr_entry)
        ,field("code",$.scope_stmt)
      )

    ,fail_stmt: $ =>
      seq(
         'fail'
        ,$.string_literal
        ,field("code",$.scope_stmt)
      )

    ,test_stmt: $ =>
      seq(
         'test'
        ,$.string_literal
        ,field("code",$.scope_stmt)
      )

    ,expr_entry: $ =>
      seq(
        field("attr",optional($.expr_attr))
        ,field("f1",$.factor)
        ,field("cont",repeat($.expr_cont))
        ,optional(choice($.in_range,$.is_typecase))
      )

    ,expr_entry_no_in: $ =>
      seq(
        field("attr",optional($.expr_attr))
        ,field("f1",$.factor)
        ,field("cont",repeat($.expr_cont))
        ,optional($.is_typecase)
      )

    ,expr_cont: $ =>
      seq(
        $.binary_op_tok
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
        ,$.range_op_tok
        ,$.factor
        ,optional(
          seq(
            'by'
           ,$.factor)
        )
      )

    ,factor: $ => seq(
       optional($.unary_op_tok)
      ,choice(
         seq(
           $.variable_base
           ,optional(choice($.fcall_args, $.typecase))
         )
				,$.literal
        ,$.string_literal
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
      choice(
        seq(
           $.bundle
          ,optional($.fcall_args_lambda)
        )
        ,$.fcall_args_lambda
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
        ,$.ck_tok
      )

    ,lambda_def_constrains: $ =>
      seq(
        optional('mut')
        ,field("meta"
          ,optional($.meta_list)
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
        $.op_tok
        ,optional($.argument_seq1)
        ,$.cp_tok
      )

    ,meta_list: $ =>
      seq(
        $.olt_tok
        ,optional($.argument_seq1)
        ,$.clt_tok
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
        ,$.ck_tok
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
        ,field("cond",$.expr_entry)
      )

    ,variable_base: $ =>
      seq(
         $.identifier
        ,repeat($.variable_base_field)
        ,optional($.variable_prev_field)
        ,optional($.variable_base_last)
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
        ,$.cb_tok
      )

    ,variable_base_last: $ =>
       choice(
          '?'
         ,'!'
         ,repeat1($.variable_bit_sel)
       )

    ,dot_selector: $ =>
      seq(
        $.dot_tok
        ,choice($.identifier, $.literal)
      )

    ,selector: $ =>
      seq(
         $.ob_tok
        ,$.expr_seq1
        ,$.cb_tok
      )

    ,selector_empty: $ =>
      seq(
         $.ob_tok
        ,optional($.expr_seq1)
        ,$.cb_tok
      )

    ,expr_seq1: $ =>
      choice(
        $.range
        ,seq(
          repeat($.comma_tok)
          ,seq(
            $.expr_entry_no_in
            ,repeat(
              seq(
                repeat1($.comma_tok)
                ,$.expr_entry_no_in
              )
            )
          )
          ,repeat($.comma_tok)
        )
      )

    ,bundle: $ =>
      seq(
        $.op_tok
        ,choice(
          seq(
            optional($.bundle_seq1)
            ,optional($._newline)
          )
         ,$.range
        )
        ,$.cp_tok
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
        field("f1",$.factor)
        ,optional(
          seq(
             $.equal_tok
            ,field("f2",$.factor)
          )
        )
        ,field("cont",repeat($.expr_cont))
      )

    ,variable_bit_sel: $ =>
      seq(
         '@'
        ,optional(choice('sext', 'zext', '|', '&', '^', '+'))
        ,$.selector_empty
      )


    ,literal: (_) => token(choice(/[0-9][a-zA-Zα-ωΑ-Ωµ\d_]*/,"true","false"))

    ,comma_tok: () => seq(/\s*,/)
    ,dot_tok: () => seq(/\s*\./)

    ,binary_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('++', '+', '-', '*', '/', '|', '&', '^', 'or', 'and', 'has', 'implies', '<<', '>>', '<', '<=', '==', '!=', '>=', '>')
        )
      )

    ,unary_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('!', '-', '~')
        )
      )

    ,range_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('..<', '..=', '..+')
        )
      )

    ,assign_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('=', '++=', '+=', '-=', '*=', '/=', '|=', '&=', '^=', 'or=', 'and=', '<<=', '>>=')
        )
      )

    ,pipe_tok: () => token(/\s*\|>/)

    ,equal_tok: () => seq(/\s*=/)

    // No ok_tok because it should have space after only if statement (more complicated per rule case)
    ,ok_tok: () => seq('{')
    ,ck_tok: () => seq(/\s*}/)

    ,ob_tok: () => seq(/\[/) // No newline because the following line may be a expr (not a self-contained statement)
    ,cb_tok: () => seq(/\s*\]/)

    ,olt_tok: () => seq(/<\s*/)
    ,clt_tok: () => seq(/\s*>/)

    ,op_tok: () => seq(/\(s*/)
    ,cp_tok: () => seq(/\s*\)/)

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

    ,identifier: (_) => token(/[$%#a-zA-Zα-ωΑ-Ωµ_][\.a-zA-Zα-ωΑ-Ωµ\d_]*/)

    // WARNING: identifier must be last so that other tokens have higher priority (and, or,...)
    //,identifier: (_) => token(/[a-zA-Zα-ωΑ-Ωµ_][\.a-zA-Zα-ωΑ-Ωµ\d_]*/)

    ,_newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/))

    ,comment: (_) => token(seq("//", /.*/))
  }
});