
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
    // $.comma_tok
    // ,$.dot_tok
    // ,$.ok_tok
    // ,$.ck_tok
    // ,$.ob_tok
    // ,$.cb_tok
    // ,$.op_tok
    // ,$.cp_tok
    // ,$.lt_tok
    // ,$.gt_tok
    // ,$.colonp_tok
    // ,$.colon_tok
    // ,$.stmt
    // ,$.stmt_seq
    // ,$.if_elif
    // ,$.else_line
    // ,$.expr_binary_cont
    // ,$.factor_first
    // ,$.factor_second
    // ,$.factor_simple
    // ,$.factor_simple_fcall
    // ,$.select_sequence
  ]

  ,rules: {

    start: $ =>
      seq(
        optional($._newline)
        ,optional($.lambda_def_constrains)
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
        ,$.while_stmt
        ,$.assign_stmt
        ,$.multiple_stmt
        ,$.ctrl_stmt
        ,$.scope_stmt
        ,$.try_stmt
        ,$.debug_comptime_stmt
        ,$.fail_stmt
        ,$.test_stmt
      )

    ,gate_stmt: $ =>
      seq(
        choice('when', 'unless')
        ,field("cond",$.expr_entry)
      )

    ,repipe_stmt: $ =>
      seq(
        'repipe'
        ,$.bundle
        ,optional(
          seq(
            'to'
            ,$.factor_second
          )
        )
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
        ,$._expr_seq1
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
          ,$._expr_seq1
        )
      )

    ,type_stmt: $ =>
      seq(
        'type'
        ,$.variable_base_field
        ,optional(
          seq(
            'implements'
            ,choice(
              $.variable_base_field
              ,$.typecase
            )
          )
        )
        ,$.assignment_cont
      )

    // Very close to multiple_stmt but not fcall_args allowed
    ,assign_stmt: $ =>
      seq(
        choice(
          $.let_tok
          ,$.mut_tok
          ,$.var_tok
          ,'set'
        )
        ,field("lhs",$._expr_seq1)
        ,optional(
          $.assignment_cont2
        )
        ,repeat($.fcall_pipe)
      )

    ,multiple_stmt: $ =>
      seq(
        field("lhs",$._expr_seq1)
        ,optional(
          choice(
            $.assignment_cont2
            ,$.fcall_args
          )
        )
        ,repeat($.fcall_pipe)
      )

    ,fcall_args: $ =>
      seq(
        optional($.expr_attr)
        ,$.factor_simple_fcall
        ,optional($.expr_cont)
        ,repeat(
          seq(
            repeat1($.comma_tok)
            ,$.expr_entry
          )
        )
      )

    ,fcall_pipe: $ =>
      seq(
        $.pipe_tok
        ,choice(
          seq(
            $.variable_base_field
            ,optional($._expr_simple_seq1)
          )
          ,$.lambda_def
        )
      )

    ,assignment_cont: $ =>
      seq(
        $.equal_tok
        ,field("rhs",
          $.expr_entry
        )
      )

    ,assignment_cont2: $ =>
      seq(
        field("assign",
          choice(
            $.equal_tok
            ,$.assign_tok
            ,seq(
              $.eq_pound_tok
              ,optional($.selector1)
            )
          )
        )
        ,field("rhs",
          seq(
            field("attr",optional($.expr_attr))
            ,field("f1",$.factor_first)
            ,choice(
              seq(
                optional($.expr_cont)
                ,field("in",optional($.in_range))
              )
              ,optional($.fcall_args)
              ,seq(
                repeat1($.comma_tok)
                ,$.expr_simple_entry
              )
            )
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
        $.ok_tok
        ,$.lambda_def_constrains
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
        ,field("f1",$.factor_first)
        ,optional($.expr_cont)
        ,field("in",optional($.in_range))
      )

    ,expr_simple_entry: $ =>
      seq(
        field("attr",optional($.expr_attr))
        ,field("f1",$.factor_simple)
        ,optional($.expr_cont)
      )

    ,expr_cont: $=>
      choice(
        $.does_typecase
        ,repeat1(
          choice(
            $.expr_binary_cont
            ,$.expr_range_cont
          )
        )
      )

    ,does_typecase: $ =>
      seq(
        choice(
          'does' // honors, meets, honors, does, implements, provides
          ,'doesnt' // honors, meets, honors, does, implements, provides
          ,seq('not', 'equals')
          ,'equals' // is, means
        )
        ,choice(
          $.variable_base_field
          ,$.typecase
        )
      )

    ,expr_binary_cont: $ =>
      choice(
        seq(
          $.binary_op_tok
          ,$.factor_second
        )
        ,$.expr_logical_cont
      )

    ,expr_logical_cont: $ =>
      seq(
        $.logical_op_tok
        ,$.factor_second
      )

    ,expr_range_cont: $ =>
      choice(
        $.range_open_tok
        ,seq(
          $.range_op_tok
          ,$.factor_second
          ,field("by"
            ,optional(
              seq(
                'by'
                ,$.factor_second
              )
            )
          )
        )
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
        ,$._expr_seq1
      )

    ,factor_first: $ =>
      choice(
        $.factor_second
        ,$.lambda_def
        ,$.if_stmt
        ,$.repipe_stmt
        ,$.match_stmt
        ,$.for_stmt
        ,$.expr_range_cont   // open range
      )

    ,factor_second: $ =>
      choice(
        $.factor_simple
        ,seq(
          //optional($.unary_op_tok)
          $.bundle
          ,repeat($.select_sequence)
        )
      )

    ,factor_simple: $ =>
      choice(
        $.factor_simple_fcall
        ,seq(
          $.inplace_concat_tok
          ,choice(
            $.variable_base_field
            ,$.bundle
          )
        )
        ,$.typecase
      )

    ,factor_simple_fcall: $ =>
      seq(
        choice(
          seq(
            $.unary_op_tok
            ,$.bundle
          )
          ,seq(
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
        )
      )

    ,fcall_or_variable: $ =>
      seq(
        $.variable_base_field
        ,seq(
          optional($.variable_prev_field)
          ,optional($.variable_base_last)
        )
      )

    ,expr_attr: $ =>
      choice(
         seq('comptime', optional('debug'))
        ,'debug'
      )

    ,lambda_def_constrains: $ =>
      seq(
        optional($.expr_attr)
        ,optional($.mut_tok)
        ,$.bar_tok
        ,choice(
          $.trivial_or_caps_identifier_seq1 // just trivial sequence IDs no types no nothing or complex pattern
          ,seq(
            field("meta"
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
            ,optional(
              seq(
                'where'
                ,field("cond",$.expr_entry)
              )
            )
          )
        )
        ,$.bar_tok
        ,optional($._newline)
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
        ,optional($._bundle_seq)
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
          $.variable_base_field   // var or fcall
          ,$.bundle               // bundle
          ,$.lambda_def           // function
          ,repeat1($.selector0)   // Array
        )
      )

    ,variable_base_field: $ =>
      seq(
        choice($.complex_identifier, $.trivial_identifier, $.all_cap_identifier)
        ,repeat($.select_sequence)
      )

    ,variable_base_last: $ =>
       choice(
         $.qmark_tok
         //,$.bang_tok  // CONFLICT
         ,repeat1($.variable_bit_sel)
       )

    ,select_sequence: $ =>
      choice(
        $.dot_selector
        ,$.selector1
        ,$.bundle
      )

    ,dot_selector: $ =>
      seq(
        $.dot_tok
        ,choice($.trivial_identifier, $.natural_literal)
      )

    ,variable_prev_field: $ =>
      seq(
         $.pob_tok
        ,$._expr_seq1
        ,$.cb_tok
      )

    ,selector1: $ =>
      seq(
         $.ob_tok
        ,$._expr_seq1
        ,$.cb_tok
      )

    ,selector0: $ =>
      seq(
         $.ob_tok
        ,optional($._expr_seq1)
        ,$.cb_tok
      )

    ,_expr_simple_seq1: $ =>
      seq(
        $.expr_simple_entry
        ,repeat(
          seq(
            repeat1($.comma_tok)
            ,$.expr_simple_entry
          )
        )
      )

    ,_expr_seq1: $ =>
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
        ,optional($._bundle_seq)
        ,$.cp_tok
      )

    ,_bundle_seq: $ =>
      choice(
        $._newline
        ,seq(
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
      )

    ,bundle_entry: $ =>
      seq(
        optional(choice($.var_tok, $.let_tok))
        ,field("lhsrhs", $.expr_entry)
        ,optional($.assignment_cont)
      )

    ,variable_bit_sel: $ =>
      seq(
        $.at_tok
        ,optional(token(choice('sext', 'zext', '|', '&', '^', '+')))
        ,$.selector0
      )

    ,bool_literal: (_) => token(choice("true","false"))
    ,natural_literal: (_) => token(/[0-9][\?\w\d_]*/)

    ,comma_tok: () => seq(/\s*,/)
    ,dot_tok: () => seq(/\s*\./)

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

    ,unary_op_tok: $ =>
      choice(
        token(
          seq(
            /\s*/
            ,choice('not', '-', '~')
          )
        )
        ,$.bang_tok
      )

    ,inplace_concat_tok: () => token('...')

    ,range_open_tok: () => token('..')
    ,range_op_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('..<', '..=', '..+')
        )
      )

    ,equal_tok: () => token(/\s*=/)

    ,assign_tok: () =>
      token(
        seq(
          /\s*/
          ,choice(':=', '++=', '+=', '-=', '*=', '/=', '|=', '&=', '^=', 'or=', 'and=', '<<=', '>>=')
        )
      )
    ,eq_pound_tok: () =>
      token(
        seq(
          /\s*/
          ,choice('=#', ':=#', '++=#', '+=#', '-=#', '*=#', '/=#', '|=#', '&=#', '^=#', 'or=#', 'and=#', '<<=#', '>>=#')
        )
      )

    ,pipe_tok: () => token(/\s*\|>/)

    // No ok_tok because it should have space after only if statement (more complicated per rule case)
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
    ,trivial_identifier: (_) =>
      token(
        choice(
          /[A-Z]?[a-z_][a-zA-Z\d_]*/
          ,/`[^`]+`/
        )
      )

    //,identifier: (_) => token(/[a-zA-Zα-ωΑ-Ωµ_][\.a-zA-Zα-ωΑ-Ωµ\d_]*/)

    ,_comment: (_) => token(prec(1,/\/\/[^\n]*/))
    ,_comment2: (_) => token(prec(1,/\s+\/\/[^\n]*/))

    ,_newline: (_) => token(prec(-1,/[;\n\r]+/))
    //,_newline: $ => repeat1(choice(/;/,/\n/,/\\\r?\n/))
  }
});