
//const PREC = { }

//const IDENTIFIER_CHARS = /[^\x00-\x1F\s:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]*/;
//const LOWER_ALPHA_CHAR = /[^\x00-\x1F\sA-Z0-9:;`"'@$#.,|^&<=>+\-*/\\%?!~()\[\]{}]/;

module.exports = grammar({
  name: 'pyrope',

  extras: $ => [
    / /,
    /\t/,
    $._comment,
    $._comment2,
  ]

  ,word: $ => $.trivial_identifier

  ,conflicts: $ => [ ] // No conflicts SLR grammar :D

  ,supertypes: $ => [
    $.stmt_base
    //,$.typecase
  ]

  ,inline: $ => [
    $.expr_seq1
    ,$.expr_simple_seq1
    ,$.bundle_seq1
    ,$.comma_tok
    ,$.dot_tok
    ,$.ok_lambda_tok
    ,$.ok_tok
    ,$.ck_tok
    ,$.ob_tok
    ,$.cb_tok
    ,$.op_tok
    ,$.cp_tok
    ,$.lt_tok
    ,$.gt_tok
    ,$.colonp_tok
    ,$.colon_tok
    ,$.assignment_cont
    ,$.assignment_cont2
    ,$.stmt
    ,$.stmt_seq
    ,$.if_elif
    ,$.else_line
    ,$.expr_cont
    ,$.expr_binary_cont
    ,$.expr_range_cont
    ,$.factor
    ,$.factor_simple
    ,$.factor_rhs
    ,$.pipe_check
    ,$.repipe_check
    // Only called once rule
    ,$.complex_rhs_variable_base
  ]

  ,rules: {

    start: $ =>
      seq(
        optional($._newline)
        ,optional(
          seq(
            $.bar_tok
            ,$.lambda_def_constrains
            ,$._newline
          )
        )
       ,optional($.stmt_seq)
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
        ,optional('defer')
        ,optional($.gate_stmt)
      )

    ,stmt_base: $ =>
      choice(
        $.type_stmt
        // ,$.if_stmt
        // ,$.match_stmt
        // ,$.for_stmt
        ,$.while_stmt
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

    ,match_stmt: $ =>
      seq(
        'match'
        ,$.expr_seq1
        ,$.ok_tok
        ,repeat($.match_stmt_line)
        ,optional($.match_stmt_else)
        ,$.ck_tok
      )

    ,match_stmt_line: $ =>
      seq(
        optional($._newline)
        ,choice(
          $.expr_logical_cont
          ,field("in",$.in_expr_seq1)
          ,field("does",$.does_typecase)
        )
        ,optional($.gate_stmt)
        ,field("code",$.scope_stmt)
      )

    ,match_stmt_else: $ =>
      seq(
        optional($._newline)
        ,'else'
        ,field("else_code",$.scope_stmt)
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
        ,optional($.mut_tok)
        ,field("id1",$.trivial_identifier)
        ,optional(
          seq(
            repeat1($.comma_tok)
            ,field("id2",$.trivial_identifier)
          )
        )
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
        ,optional(
          seq(
            'implements'
            ,optional(':')
            ,$.trivial_identifier_with_dots
          )
        )
        ,$.assignment_cont
      )

    ,assign_stmt: $ =>
      seq(
        $.assign_attr
        ,field("attr",optional($.expr_attr))
        ,choice(
          field("lhs", $.complex_lhs_variable_base)
          ,seq(
            $.op_tok
            ,field("lhs",$.trivial_or_caps_identifier_seq1)
            ,$.cp_tok
          )
        )
        ,optional($.typecase)
        ,$.assignment_cont2
        ,repeat($.fcall_pipe)
      )

    ,ass_fcall_stmt: $ =>
      seq(
        field("lhs",$.expr_seq1)
        ,optional(
          choice(
            $.assignment_cont2
            ,seq(
              field("attr",optional($.expr_attr))
              ,field("f1",$.factor_rhs)
              ,optional($.expr_step)
              ,repeat(
                seq(
                  repeat1($.comma_tok)
                  ,$.expr_simple_entry
                )
              )
            )
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
        ,$.var_tok
        ,'set'
      )

    ,let_attr: $ =>
      choice(
        $.pipe_check
        ,$.repipe_check
      )

  ,assignment_cont: $ =>
    seq(
      $.equal_tok
      ,field("rhs",
        choice(
          $.expr_entry
          ,$.lambda_def
        )
      )
    )

  ,assignment_cont2: $ =>
    seq(
      choice($.equal_tok,$.assign_tok)
      ,field("rhs",
        choice(
          $.expr_entry
          ,$.lambda_def
        )
      )
    )

    ,scope_stmt: $ =>
      seq(
        $.ok_tok
        ,optional($._newline)
        ,optional($.stmt_seq)
        ,$.ck_tok
      )

    ,lambda_def: $ =>
      seq(
        choice(
          seq(
            $.ok_lambda_tok
            ,$.lambda_def_constrains
          )
          ,$.ok_tok
        )
        ,optional($._newline)
        ,optional($.stmt_seq)
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
        ,choice($.string_literal,$.simple_string_literal)
        ,field("code",$.scope_stmt)
      )

    ,test_stmt: $ =>
      seq(
         'test'
        ,choice($.string_literal,$.simple_string_literal)
        ,field("code",$.scope_stmt)
      )

    ,expr_entry: $ =>
      seq(
         field("attr",optional($.expr_attr))
        ,field("f1",$.factor)
        ,optional($.expr_step)
        ,field("in",optional($.in_range))
      )

    ,expr_simple_entry: $ =>
      seq(
        field("attr",optional($.expr_attr))
        ,field("f1",$.factor_simple)
        ,optional($.expr_step)
      )

    ,expr_step: $=>
      choice(
        $.does_typecase
        ,repeat1($.expr_cont)
      )

    ,expr_cont: $ =>
      choice(
        $.expr_binary_cont
        ,$.expr_range_cont
      )

    ,expr_binary_cont: $ =>
      choice(
        seq(
          $.binary_op_tok
          ,$.factor
        )
        ,$.expr_logical_cont
      )

    ,expr_logical_cont: $ =>
      seq(
        $.logical_op_tok
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

    ,does_typecase: $ =>
      seq(
        optional('not')
        ,choice(
          'does' // honors, meets, honors, does, implements, provides
         ,'equals' // is, means
        )
        ,choice($.simple_fcall_or_variable ,$.typecase)
      )

    ,in_range: $ =>
      seq(
        optional('not')
        ,'in'
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

    ,factor: $ =>
      choice(
        $.factor_simple
        //,$.lambda_def
        ,$.if_stmt
        ,$.match_stmt
        ,$.for_stmt
        ,$.bundle
      )

    ,factor_simple: $ =>
      choice(
        seq(
          optional($.unary_op_tok)
          ,choice(
            $.fcall_or_variable
            ,$.bool_literal
            ,$.natural_literal
            ,$.string_literal
            ,$.simple_string_literal
          )
          ,optional($.typecase)
        )
        ,$.typecase
      )

    ,factor_rhs: $ =>
      choice(
        seq(
          optional($.unary_op_tok)
          ,choice(
            $.fcall_or_variable
            ,$.bool_literal
            ,$.natural_literal
            ,$.string_literal
            ,$.simple_string_literal
          )
          ,optional($.typecase)
        )
        ,$.if_stmt
        ,$.match_stmt
        ,$.for_stmt
        // ,$.bundle
        //,$.typecase
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
        $.lambda_def
        ,optional(
          seq(
             'else'
            ,$.lambda_def
          )
        )
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

    ,lambda_def_constrains: $ =>
      choice(
        seq(
          $.trivial_or_caps_identifier_seq1 // just trivial sequence IDs no types no nothing or complex pattern
          ,$.bar_tok
        )
        ,seq(
          optional($.mut_tok)
          ,optional($.pipe_check)
          ,field("attr",optional($.expr_attr))
          ,field("meta"
            ,optional($.meta_list)
          )
          ,field("capture"
            ,optional($.capture_list)
          )
          ,field("input"
            ,optional($.bundle)
          )
          ,field("output"
            ,optional(
              seq(
                $._arrow_tok
                ,choice(
                  $.bundle
                  ,$.typecase
                )
              )
            )
          )
          ,field("where"
            ,optional($.where_modifier)
          )
          ,$.bar_tok
        )
      )

    ,meta_list: $ =>
      seq(
        $.lt_tok
        ,$.trivial_or_caps_identifier_seq1
        ,$.gt_tok
      )

    ,capture_list: $ =>
      seq(
        $.ob_tok
        ,optional($.bundle_seq1)
        ,$.cb_tok
      )

    ,trivial_or_caps_identifier_seq1: $ =>
      seq(
         repeat($.comma_tok)
        ,seq(
          choice($.trivial_identifier,$.all_cap_identifier)
          ,repeat(
            seq(
               repeat1($.comma_tok)
              ,choice($.trivial_identifier,$.all_cap_identifier)
            )
          )
        )
        ,repeat($.comma_tok)
      )

    ,typecase: $ =>
      seq(
        $.colon_tok
        ,choice(
          $.simple_fcall_or_variable // boolean or string or foo
          ,$.bundle
        )
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
        ,optional(choice($.variable_base_last, $.bundle))
      )

    ,complex_lhs_variable_base: $ =>
      seq(
        $.variable_base_field
        ,optional($.variable_prev_field)
        ,optional($.variable_base_last)
      )

    ,variable_base_field: $ =>
      seq(
        choice($.complex_identifier, $.trivial_identifier, $.all_cap_identifier)
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
         $.pob_tok
        ,$.expr_seq1
        ,$.cb_tok
      )

    ,variable_base_last: $ =>
       choice(
         $.qmark_tok
         ,$.bang_tok
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
        optional(choice($.var_tok, $.mut_tok))
        ,field("lhsrhs", $.expr_entry)
        ,optional($.assignment_cont)
      )

    ,variable_bit_sel: $ =>
      seq(
        $.at_tok
        ,optional(token(choice('sext', 'zext', '|', '&', '^', '+')))
        ,$.ob_tok
        ,optional($.expr_seq1)
        ,$.cb_tok
      )

    ,bool_literal: (_) => token(choice("true","false"))
    ,natural_literal: (_) => token(/[0-9][\?\w\d_]*/)

    ,comma_tok: () => seq(/\s*,/)
    ,dot_tok: () => seq(/\s*\./)

    ,assign_tok: () =>
      token(
        seq(
          /\s*/
          ,choice(':=', '++=', '+=', '-=', '*=', '/=', '|=', '&=', '^=', 'or=', 'and=', '<<=', '>>=')
        )
      )

    ,binary_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice(
            '++' // bundle op
            ,'+', '-', '*', '/', '|', '&', '^' // scalar op
          )
        )
      )

    ,logical_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice(
            'or', 'and', 'has', 'implies', '<<', '>>', '<', '<=', '==', '!=', '>=', '>' // logical op
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

    ,_arrow_tok: () =>
      token(
        seq(
          /\s*/
          ,'->'
        )
      )

    ,mut_tok: () =>
      token(
        seq(
          /\s*/
          ,'mut'
        )
      )

    ,var_tok: () =>
      token(
        seq(
          /\s*/
          ,'var'
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

    ,equal_tok: () => token(/\s*=/)

    ,pipe_tok: () => token(/\s*\|>/)

    // No ok_tok because it should have space after only if statement (more complicated per rule case)
    ,ok_lambda_tok: () => seq(/\{\|/)
    ,ok_tok: () => seq(/\{/)
    ,ck_tok: () => seq(/\s*}/)

    ,ob_tok: () => seq(/\[/) // No newline because the following line may be a expr (not a self-contained statement)
    ,cb_tok: () => seq(/\s*\]/)

    ,lt_tok: () => seq(/</)
    ,gt_tok: () => seq(/\s*>/)

    ,op_tok: () => seq(/\(/)
    ,cp_tok: () => seq(/\s*\)/)

    ,colonp_tok: () => seq(/\s*:\{/)
    ,colon_tok: () => seq(/\s*:/)

    ,bar_tok: () => token('|')
    ,pob_tok: () => token('#[')

    ,qmark_tok: () => token('?')
    ,bang_tok: () => token('!')
    ,at_tok: () => token('@')


    ,simple_string_literal: (_) => token(/\'[^\'\n]*\'/)

    ,string_literal: ($) =>
      seq(
        '"'
        ,repeat(choice($._escape_sequence, /[^"\\\n]+/))
        ,token.immediate('"')
      )

    ,_escape_sequence: (_) => token( prec(1, /\\./))

    //,utype: (_) => token(prec(2,/u[\d]+/))
    //,itype: (_) => token(prec(2,/i[\d]+/))
    //,btype: (_) => token(prec(2,/boolean/))

    ,complex_identifier: (_) => token(/[$%#][\.a-zA-Z\d_]*/)
    ,all_cap_identifier: (_) => token(/[A-Z][A-Z\d_]*/)
    ,trivial_identifier: (_) => token(/[A-Z]?[a-z_][a-zA-Z\d_]*/)

    //,identifier: (_) => token(/[a-zA-Zα-ωΑ-Ωµ_][\.a-zA-Zα-ωΑ-Ωµ\d_]*/)

    ,_comment: (_) => token(prec(1,/\/\/[^\n]*/))
    ,_comment2: (_) => token(prec(1,/\s+\/\/[^\n]*/))

    ,_newline: (_) => token(prec(-1,/[;\n\r]+/))
    //,_newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/))
  }
});