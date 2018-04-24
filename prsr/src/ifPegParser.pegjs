{
  var INDENT_STEP = 2;

  var indentLevel = 0;
}

start 
	= blocks/expressionParsing
    

expressionParsing
	= expressions (newLine expressions)*

blocks
	= codeBlocks*
    
codeBlocks
	= samedent head: (ifStatement/ expressionWOS EOS/ expressionWS EOS/ factor EOS/ numbers EOS)
    

ifStatement
	= head:"if" blankSpace? "(" expressions ")" ":" newLine indent tail: blocks dedent {return head;} 

expressions
	= expressionWOS
    / expressionWS
    / _
    / factor
    / numbers
    / EOI

//expression without space
expressionWOS
	= head:(factor/integer) tail:(operator (factor/integer))+ {
    var tmp = [].concat.apply([], tail)
    return head+[].concat.apply([], tmp).join('');}
    
//expression with space
expressionWS
	= head:(factor/integer) tail:(_ (tupleOps/operator) _ (factor/integer))+ {
    var tmp = [].concat.apply([], tail)
    return head+[].concat.apply([], tmp).join('');}
   
factor 
	= "(" expr:(expressionWOS) ")"
    / "(" expr:(expressionWS) ")"

numbers 
	= hexaDecimal
    / binary
    / float
    / decimalSigned
    / decimalDigit+

samedent "correct indentation"
  = spaces:" "* &{ return spaces.length === indentLevel * INDENT_STEP; }

indent
  = &{ indentLevel++; return true; }

dedent
  = &{ indentLevel--; return true; }
    
	
hexaDecimal
	= head:("0x") tail:(decimalDigit/hexDigit)+ ("s" nonZeroDigit decimalDigit*)
    / head:("0x") tail:(decimalDigit/hexDigit)+ ("u" nonZeroDigit decimalDigit*)
	/ head:("0x") tail:(decimalDigit/hexDigit)+ 

binary
	= head:("0b") tail:binaryDigit+ ("_" binaryDigit+)? ("u" nonZeroDigit decimalDigit*)
    / head:("0b") tail:binaryDigit+ ("_" binaryDigit+)?

float 
	= head:("0."/nonZeroDigit+ ".") tail:decimalDigit+
    / head:("0e"/nonZeroDigit+ "e") tail:decimalDigit+
    / ("+"/"-") head:("0."/nonZeroDigit+ ".") tail:decimalDigit+
    / ("+"/"-") head:("0e"/nonZeroDigit+ "e") tail:decimalDigit+

decimalSigned
	= decimalDigit+ "u" nonZeroDigit decimalDigit*
    / decimalDigit+ "s" nonZeroDigit decimalDigit*

decimalDigit "integer greater than or equal to zero"
	= [0-9]+
    / ("+"/"-") [0-9]

nonZeroDigit "integer greater than zero"
	= [1-9]+
    
binaryDigit "binary digits"
	= [0-1]+

hexDigit "hexadecimal characters"
	= [A-F]+
      
integer "integer"
  = [0-9]+

operator 
	= $("+")
  / $("-")
  / $("*")
  / $("/")
  / $(">>")
  / $("<<")
  / $(">>>")
  / $("<<<")

tupleOps
	= $("++")
  / $("--")
  / $("**")
  / $("in")
  / $("by")

EOI "End of Input"
	= ""

newLine "newline"
	= "\n"

blankSpace "blank space"
	= " "
    
EOS
  = EOL
  / EOF

EOL
  = "\n"

EOF
  = !.
    
_ "whitespace"
	//= [" "\t\n\r]+
    = "\t"
  / "\v"
  / "\n"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs
  
Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

comment 
	= "#" .*
