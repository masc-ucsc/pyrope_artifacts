
//const PREC = { }

//const IDENTIFIER_CHARS = /[^\x00-\x1F\s:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]*/;
//const LOWER_ALPHA_CHAR = /[^\x00-\x1F\sA-Z0-9:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]/;

module.exports = grammar({
  name: 'pyrope',

  extras: $ => [
    / /,
    /\t/,
    $.comment,
  ]

  ,word: $ => $.trivial_identifier

  ,conflicts: $ => [ ] // No conflicts SLR grammar :D

  ,supertypes: $ => [
    $.stmt_base
    ,$.typecase
  ]

  ,inline: $ => [
    $.expr_seq1
    ,$.expr_simple_seq1
    ,$.bundle_seq1
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
    ,$.colonp_tok
    ,$.colon_tok
    ,$.assignment_cont
    ,$.stmt
    ,$.stmt_seq
    ,$.if_elif
    ,$.else_line
    ,$.expr_cont
    ,$.typecase_base
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
       ,$.stmt_seq
      )

    ,stmt_seq: $ =>
      seq(
         $.stmt
        ,repeat(
          seq(
            $._newline
            ,$.stmt
          )
        )
        ,optional($._newline)
      )

    ,stmt: $ =>
      seq(
        $.stmt_base
        ,optional($.gate_stmt)
      )

    ,stmt_base: $ =>
      choice(
         $.if_stmt
        ,$.match_stmt
        ,$.while_stmt
        ,$.for_stmt
        ,$.type_stmt
        ,$.assign_stmt
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

    ,for_expr: $ =>
      seq(
        'for'
        ,field("id",$.trivial_identifier)
        ,field("in",$.in_expr_seq1)
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
          ,$.in_expr_seq1
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
          ,$.in_expr_seq1
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
        ,field("id",$.trivial_identifier)
        ,field("in",$.in_expr_seq1)
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

    ,type_stmt: $ =>
      seq(
        'type'
        ,$.trivial_identifier_with_dots
        ,$.typecase
      )

    ,assign_stmt: $ =>
      seq(
        $.assign_attr
        ,field("attr",optional($.expr_attr))
        ,field("lhs", $.complex_lhs_variable_base)
        ,field("rhs",$.assignment_cont)
        ,repeat($.fcall_pipe)
      )

    ,ass_fcall_stmt: $ =>
      seq(
        field("attr",optional($.expr_attr))
        ,choice(
          seq(
            field("lhs",$.complex_lhs_variable_base)
            ,choice(
              field("rhs",$.assignment_cont)
              ,field("args",$.fcall_args)
            )
          )
          ,seq(
            field("lhs",$.argument_list)
            ,field("rhs",$.assignment_cont)
          )
        )
        ,repeat($.fcall_pipe)
      )

    ,fcall_pipe: $ =>
      seq(
        $.pipe_tok
        ,$.variable_base_field
        ,optional($.fcall_args)
      )

    ,assign_attr: $ =>
      choice(
        seq(
          $.let_tok
          ,optional($.let_attr)
        )
        ,$.mut_tok
        ,'set'
        ,'var'
      )

    ,let_attr: $ =>
      choice(
        $.pipe_check
        ,$.repipe_check
      )

    ,assignment_cont: $ =>
      seq(
        optional($.typecase)
        ,choice($.assign_tok, $.equal_tok)
        ,$.expr_seq1
      )

    ,scope_stmt: $ =>
      seq(
         $.ok_tok
        ,seq(optional($._newline), $.stmt_seq)
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
         field("attr",$.expr_attr)
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
        ,field("in",optional($.in_range))
      )

    ,expr_simple_entry: $ =>
      seq(
        field("attr",optional($.expr_attr))
        ,field("f1",$.factor_simple)
        ,field("cont",repeat($.expr_cont))
      )

    ,expr_cont: $ =>
      choice(
        $.is_typecase
        ,$.expr_binary_cont
        ,$.expr_range_cont
      )

    ,expr_binary_cont: $ =>
      seq( // simple ops
        $.binary_op_tok
        ,$.factor
      )

    ,expr_range_cont: $ =>
      seq( // range ops
        $.range_op_tok
        ,$.factor
        ,field("by"
          ,optional(
            seq(
              'by'
              ,$.factor
            )
          )
        )
      )

    ,is_typecase: $ =>
      seq(
        optional('not')
        ,choice(
          'implements'
          ,'equals'
        )
        ,choice($.simple_fcall_or_variable ,$.typecase)
      )

    ,in_range: $ =>
      seq(
        choice(
           'in'
          ,seq('not', 'in')
        )
        ,choice(
          seq(
            $.factor_simple
            ,optional($.expr_range_cont)
          )
          ,$.bundle
        )
      )

    ,in_expr_seq1: $ =>
      seq(
        'in'
        ,$.expr_seq1
      )

    ,factor: $ => seq(
       optional($.unary_op_tok)
      ,choice(
				 $.bool_literal
				,$.natural_literal
        ,$.string_literal
        ,$.all_cap_identifier
        ,$.complex_rhs_variable_base
        ,$.bundle
        ,$.lambda_def
        ,$.if_expr
        ,$.for_expr
        ,$.match_expr
      )
    )

    ,factor_simple: $ => seq(
       choice(
         $.fcall_or_variable
				,$.bool_literal
				,$.natural_literal
        ,$.string_literal
        ,$.all_cap_identifier
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
          choice(
            $.expr_simple_seq1
            ,$.bundle
          )
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
           seq($._newline, $.stmt_seq)
          ,$.expr_seq1
        )
        ,$.ck_tok
      )

    ,lambda_def_constrains: $ =>
      seq(
        optional($.mut_tok)
        ,field("meta"
          ,optional($.meta_list)
        )
        ,field("capture"
          ,optional($.capture_list)
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
        ,optional($.bundle_seq1)
        ,$.cp_tok
      )

    ,meta_list: $ =>
      seq(
        $.olt_tok
        ,optional($.bundle_seq1) // WARNING; This should be just a list of identifiers
        ,$.clt_tok
      )

    ,capture_list: $ =>
      seq(
        $.ob_tok
        ,optional($.bundle_seq1)
        ,$.cb_tok
      )

    ,typecase: $ =>
      choice(
        $.typecase_where
        ,$.typecase_simple
      )

    ,typecase_where: $ =>
      seq(
        $.colonp_tok
        ,$.typecase_base
        ,$.where_modifier
        ,$.ck_tok
      )

    ,typecase_simple: $ =>
      seq(
        $.colon_tok
        ,optional($.typecase_base)
      )

    ,typecase_base: $ =>
      choice(
        $.utype
        ,$.itype
        ,$.btype
        ,$.simple_fcall_or_variable
        ,$.bundle
      )

    ,where_modifier: $ =>
      seq(
        'where'
        ,field("cond",$.expr_entry)
      )


    ,fcall_or_variable: $ =>
      seq(
        $.variable_base_field
        ,choice(
          $.bundle
          ,seq(
             optional($.variable_prev_field)
            ,optional($.variable_base_last)
          )
        )
      )

    ,simple_fcall_or_variable: $ =>
      seq(
        $.variable_base_field
        ,optional($.bundle)
      )

    ,complex_rhs_variable_base: $ =>
      seq(
        $.variable_base_field
        ,optional($.variable_prev_field)
        ,optional(choice($.variable_base_last, $.bundle, $.typecase))
      )

    ,complex_lhs_variable_base: $ =>
      seq(
        $.variable_base_field
        ,optional($.variable_prev_field)
        ,optional($.variable_base_last)
      )

    ,variable_base_field: $ =>
      seq(
        choice($.complex_identifier, $.trivial_identifier)
        ,repeat(
          choice(
            $.dot_selector
            ,$.selector
          )
        )
      )

    ,trivial_identifier_with_dots: $ =>
      seq(
        $.trivial_identifier
        ,repeat($.dot_selector)
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
        ,choice($.trivial_identifier, $.natural_literal)
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

    ,expr_simple_seq1: $ =>
      seq(
        $.expr_simple_entry
        ,repeat(
          seq(
            repeat1($.comma_tok)
            ,$.expr_simple_entry
          )
        )
      )

    ,expr_seq1: $ =>
      seq(
        $.expr_entry
        ,choice(
          repeat1(
            seq(
              $.comma_tok
              ,optional($.expr_entry)
            )
          )
          ,$.expr_entry
        )
        ,repeat(
          seq(
            repeat1($.comma_tok)
            ,$.expr_entry
          )
        )
        ,repeat($.comma_tok)
      )

    ,bundle: $ =>
      seq(
        $.op_tok
        ,choice(
          seq(
            optional($.bundle_seq1)
            ,optional($._newline)
          )
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
        optional(choice($.let_tok, $.mut_tok))
        ,field("lhsrhs", $.expr_entry)
        ,optional(
          seq(
            $.equal_tok
            ,field("rhs",$.expr_entry)
          )
        )
      )

    ,variable_bit_sel: $ =>
      seq(
         '@'
        ,optional(choice('sext', 'zext', '|', '&', '^', '+'))
        ,$.selector_empty
      )


    ,bool_literal: (_) => token(choice("true","false"))
    ,natural_literal: (_) => token(/[0-9][a-zA-Zα-ωΑ-Ωµ\d_]*/)

    ,comma_tok: () => seq(/\s*,/)
    ,dot_tok: () => seq(/\s*\./)

    ,binary_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice(
            '++' // bundle op
            ,'+', '-', '*', '/', '|', '&', '^' // scalar op
            ,'or', 'and', 'has', 'implies', '<<', '>>', '<', '<=', '==', '!=', '>=', '>' // logical op
          )
        )
      )

    ,let_tok: () =>
      token(
        seq(
          /\s*/
          ,'let'
        )
      )

    ,mut_tok: () =>
      token(
        seq(
          /\s*/
          ,'mut'
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
          ,choice(':=', '++=', '+=', '-=', '*=', '/=', '|=', '&=', '^=', 'or=', 'and=', '<<=', '>>=')
        )
      )

    ,equal_tok: () => token('=')

    ,pipe_tok: () => token(/\s*\|>/)


    // No ok_tok because it should have space after only if statement (more complicated per rule case)
    ,ok_tok: () => seq('{')
    ,ck_tok: () => seq(/\s*}/)

    ,ob_tok: () => seq(/\[/) // No newline because the following line may be a expr (not a self-contained statement)
    ,cb_tok: () => seq(/\s*\]/)

    ,olt_tok: () => seq(/<\s*/)
    ,clt_tok: () => seq(/\s*>/)

    ,op_tok: () => seq(/\(s*/)
    ,cp_tok: () => seq(/\s*\)/)

    ,colonp_tok: () => seq(':{')
    ,colon_tok: () => seq(':')

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

    ,utype: (_) => token(prec(2,/u[\d]+/))
    ,itype: (_) => token(prec(2,/i[\d]+/))
    ,btype: (_) => token(prec(2,/boolean/))

    ,complex_identifier: (_) => token(/[$%#][\.a-zA-Z\d_]*/)
    ,all_cap_identifier: (_) => token(/[A-Z][A-Z\d_]+/)
    ,trivial_identifier: (_) => token(/[a-z_][a-zA-Z\d_]*/)

    //,identifier: (_) => token(/[a-zA-Zα-ωΑ-Ωµ_][\.a-zA-Zα-ωΑ-Ωµ\d_]*/)

    ,_newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/))

    ,comment: (_) => token(seq("//", /.*/))
  }
});