{
  var INDENT_STEP = 2;

  var indentLevel = 0;
  
}

start 
	= blocks
    // expressionParsing
    / comment
    //EOS
    // EOI

expressionParsing
	= expressions (newLine expressions)*
    
blocks
	= codeBlocks+

codeBlocks
	= samedent head:(forLoop (samedent forLoop)?/*caseStatement EOS*//tryStatement (samedent catchStatement)?/singleLineIfStatement EOS
    /ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?
    /def/*stage/pipe*//internalScope/puts EOS/returnStatement EOS/expressionAssignment EOS/compileCheckStatement EOS/assertionStatement EOS/negationStatement EOS
    /goto EOS/isExpressions EOS/bitSelectionAssignment EOS/assignmentStatement EOS/multiLineExpression EOS/stringExpressions EOS
    /functionCall EOS/comment EOS/EOL) 

ifStatement
	= head:"if" blankSpace (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA?
    (newLine/comment newLine)+ (indent tail:blocks dedent) {return head;}
   
   //head:"if" blankSpace (logicalExpressions/relationalExpressions/expressions/numbers/strings) (scopeColonNotation/"::"/":") blankSpace* CA?
    //(newLine/comment newLine)+ ((indent tail:blocks dedent) ((newLine/comment newLine)+ (indent tail:blocks  dedent))* )  {return head;}
     
elifStatement
	= head:"elif" blankSpace (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA?
    CN+ ((indent tail:blocks dedent)) {return head;} 

elseStatement
	= head:"else" blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA? CN+ ((indent tail:blocks dedent)) {return head;}
    
singleLineIfStatement
	= head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* 
    singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)* 
    (newLine "elif" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*)+ 
    (newLine "else" blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*)?
    / head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* 
    singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)* 
    newLine "else" blankSpace* ("::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*
    // head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* 
    //assignmentStatement (blankSpace* ";" blankSpace* assignmentStatement)* 
    //(newLine "elif" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* assignmentStatement (blankSpace* ";" blankSpace* assignmentStatement)*)+ 
    / head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)* ";" 
    blankSpace* "elif" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* 
    singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)* (blankSpace* ";" blankSpace* "else" blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*)? 
    / head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* ("::"/":") blankSpace* singleLineIfBlockElements 
    (blankSpace* ";" blankSpace* singleLineIfBlockElements)* ";" blankSpace* "else" blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*
    / head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)* ";" 
    blankSpace* "elif" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*
    / head:"if" blankSpace+ (logicalExpressions/relationalExpressions/expressions/numbers/strings) blankSpace* (scopeColonNotation/"::"/":") blankSpace* singleLineIfBlockElements (blankSpace* ";" blankSpace* singleLineIfBlockElements)*     

singleLineIfBlockElements
	= (puts/returnStatement/expressionAssignment/goto/bitSelectionAssignment/assignmentStatement/functionCall)

forLoop
	= "for" blankSpace+ (forLoopIndexNotation/(tupleArrayNotation/tupleDotNotation/strings)) blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA?
    CN+ ((indent tail:blocks dedent))
    
forLoopIndexNotation
	= strings ":" blankSpace* (rangeNotation/singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings) (blankSpace* "," blankSpace* 
    strings ":" blankSpace* (rangeNotation/singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings))*
    / strings ":" blankSpace* integer
    / (strings ":" blankSpace*)? "(" (nestedTuples/tupleStructure) ("," blankSpace* (strings ":")? (expressions/'"' strings '"'/"'" strings "'"/strings))* ")"

/*
caseStatement
	= "case" blankSpace+ (caseIndexNotation/(tupleArrayNotation/tupleDotNotation/strings/numbers)) (scopeColonNotation/"::"/":") blankSpace* CA?
    newLine indent caseBlock+ caseDefaultBlock? dedent (start/EOS)

caseBlock
	//case body in next line (indented)
	= samedent (logicalExpressions/singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings/numbers) ":" CA? newLine 
    indent (samedent caseBlockElements EOS)+ dedent
    //single line case body (on same line. only one line allowed)
    / samedent (logicalExpressions/singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings/numbers) ":"  blankSpace* 
    caseBlockElements EOS 

caseDefaultBlock
	= samedent "default" ":" CA? newLine indent (samedent caseBlockElements EOS)+ dedent
    / samedent "default" ":" blankSpace* caseBlockElements EOS

caseBlockElements
	= (forLoop (samedent forLoop)?/tryStatement (samedent catchStatement)?/singleLineIfStatement EOS/ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?
    /stage/pipe/puts/goto/returnStatement/expressionAssignment/compileCheckStatement/assertionStatement/negationStatement/isExpressions/bitSelectionAssignment/
    assignmentStatement/multiLineExpression/tupleArithmeticExpression/precedenceExpression/logicalExpressions/relationalExpressions/stringExpressions/
    factor/functionCall/numbers/comment/EOL)

caseIndexNotation
	= (singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings) (blankSpace* "," blankSpace* 
    strings ":" blankSpace* (singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings))*
    // numbers
    / "(" (nestedTuples/tupleStructure) ("," blankSpace* (strings ":")? (expressions/'"' strings '"'/"'" strings "'"/strings))* ")"
*/

tryStatement
	= "try" blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA? CN+ ((indent tail:blocks dedent))

catchStatement
	= "catch" blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA? CN+ ((indent tail:blocks dedent)) 
    
    //"catch" (scopeColonNotation/"::"/":") newLine indent blocks dedent

def
	= functionWithoutDef
    / (tupleArrayNotation/tupleDotNotation/strings/overloadNotation) blankSpace+ ("as"/"="/":="/"+="/"-="/"*="/"/="/"<-"/"++="/"--="/"**=") blankSpace+ 
    scopeColonNotation blankSpace* CA? CN+ ((indent tail:defBlockElements+ dedent))
    //newLine indent defBlockElements+ dedent
    // (tupleArrayNotation/tupleDotNotation/strings/overloadNotation) blankSpace+ ("as"/"="/":=") blankSpace+ (":" "(" (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)? ("," blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)?)* ")" ":"/ "::") 
    / "::" blankSpace* CA? CN+ ((indent tail:defBlockElements+ dedent))
    / (functionCallStatement/functionCall) blankSpace* (scopeColonNotation/"::"/":") blankSpace* CA? CN+ ((indent tail:defBlockElements+ dedent))
    //foo :: <newline> a =1
    // (tupleArrayNotation/tupleDotNotation/strings/strings functionCallNotation) (":"/"::") newLine indent defBlockElements+ dedent

defBlockElements
	= samedent head:(forLoop (samedent forLoop)?/tryStatement (samedent catchStatement)?/singleLineIfStatement EOS/ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?
    /def/puts EOS/goto EOS/internalScope/returnStatement EOS/expressionAssignment EOS/compileCheckStatement EOS/assertionStatement EOS/isExpressions EOS/
    bitSelectionAssignment EOS/assignmentStatement EOS/multiLineExpression EOS/tupleArithmeticExpression EOS/precedenceExpression EOS/
    logicalExpressions EOS/relationalExpressions EOS/stringExpressions EOS/factor EOS/functionCall EOS/numbers EOS/comment/EOL)

functionWithoutDef //foo :: <newline> a =1
	= (tupleArrayNotation/tupleDotNotation/strings functionCallNotation/strings) scopeColonNotation blankSpace* CA? 
    CN+ ((indent tail:defBlockElements+ dedent))

internalScope //:(a:, b:): 
	= (":" internalScopeElements ":"/ "::"/":") blankSpace* CA? CN+ ((indent tail:defBlockElements+ dedent))
    //(":" "(" (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)? ("," blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)?)* ")" ":"/ "::"/":") 
    //newLine indent defBlockElements+ dedent 

internalScopeElements
	= when
    / "(" (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)? ("," blankSpace* (strings ":")? 
    (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)?)* ")"
    // when

scopeColonNotation
	= (":" internalScopeElements ":"/ "::"/":")

/*
stage
	= (singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "as" blankSpace+ "stage" blankSpace* scopeColonNotation 
    blankSpace* CA? CN+ ((indent tail:stageBlockElements+ dedent))
    //newLine indent stageBlockElements+ dedent
      
//    (samedent head:(forLoop (samedent forLoop)?/caseStatement EOS/tryStatement (samedent catchStatement)?/singleLineIfStatement EOS/ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?
//    /def/pipe/puts EOS/goto EOS/returnStatement EOS/expressionAssignment EOS/compileCheckStatement EOS/assertionStatement EOS/isExpressions EOS
//    /bitSelectionAssignment EOS///assignmentStatement EOS/multiLineExpression EOS/tupleArithmeticExpression EOS
//    /precedenceExpression EOS/logicalExpressions EOS/relationalExpressions EOS/
//    /factor EOS/functionCall EOS/numbers EOS/comment/EOL))+ dedent

stageBlockElements
	= samedent head:(forLoop (samedent forLoop)?/tryStatement (samedent catchStatement)?/singleLineIfStatement EOS
    /ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?
    /def/pipe/internalScope/puts EOS/returnStatement EOS/expressionAssignment EOS/compileCheckStatement EOS/assertionStatement EOS/goto EOS
    /isExpressions EOS/bitSelectionAssignment EOS/assignmentStatement EOS/multiLineExpression EOS/tupleArithmeticExpression EOS
    /precedenceExpression EOS/logicalExpressions EOS/relationalExpressions EOS/

pipeBlockElements
	= samedent head:(forLoop (samedent forLoop)?/tryStatement (samedent catchStatement)?/singleLineIfStatement EOS
    /ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?
    /def/stage/internalScope/puts EOS/returnStatement EOS/expressionAssignment EOS/compileCheckStatement EOS/assertionStatement EOS/goto EOS
    /isExpressions EOS/bitSelectionAssignment EOS/assignmentStatement EOS/multiLineExpression EOS/tupleArithmeticExpression EOS
    /precedenceExpression EOS/logicalExpressions EOS/relationalExpressions EOS/stringExpressions EOS
    /factor EOS/functionCall EOS/numbers EOS/comment EOS/EOL)

pipe
	= (singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "as" blankSpace+ "pipe" blankSpace* scopeColonNotation 
    blankSpace* CA? CN+ ((indent tail:pipeBlockElements+ dedent))    
*/ 

returnStatement
	= "return" blankSpace* (rangeNotation/logicalExpressions/relationalExpressions/strings functionCallNotation/singleElementTupleNotation/tupleArrayIndex/tupleArrayNotation
    /tupleDotNotation/expressions/strings)

initStatement
	= "__init" blankSpace* (tupleDotNotation/tupleArrayNotation/strings/overloadNotation)

assignmentStatement 
	= rangeAssignment
    / functionCallStatement
    / tupleAssignment 
    / variableAssignment
    / initStatement

functionCall  //foo(1 2)
	= (functionCallNotation ".") (tupleDotNotation/tupleArrayNotation/strings/overloadNotation) (blankSpace* functionCallNotation)? ("." (strings/overloadNotation) blankSpace* functionCallNotation)*
    / (functionCallNotation ".")? (tupleDotNotation/tupleArrayNotation/strings/overloadNotation) (blankSpace* functionCallNotation) ("." (strings/overloadNotation) blankSpace* functionCallNotation)*
    / (functionCallNotation) (overloadNotation) (blankSpace* functionCallNotation)? ((overloadNotation) blankSpace* functionCallNotation)*
    / (functionCallNotation)? (overloadNotation) (blankSpace* functionCallNotation) ((overloadNotation) blankSpace* functionCallNotation)*
    // strings
   
functionCallStatement //a = foo(1 2)
	= (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings)? blankSpace* (":="/"="/"<-") blankSpace* 
    (functionCallNotation ".")? (strings/overloadNotation) (blankSpace* functionCallNotation)? ("." (strings/overloadNotation) blankSpace* functionCallNotation)*
    / (functionCallNotation ".")? (strings/overloadNotation) (blankSpace* functionCallNotation)? ("." (strings/overloadNotation) blankSpace* functionCallNotation)* 
    "->" blankSpace* (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings)
    / (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings)? blankSpace* (":="/"="/"<-") blankSpace* (functionCallNotation)? (overloadNotation) (blankSpace* functionCallNotation)? ((overloadNotation) blankSpace* functionCallNotation)*
    / (functionCallNotation)? (overloadNotation) (blankSpace* functionCallNotation)? ((overloadNotation) blankSpace* functionCallNotation)* 
    "->" blankSpace* (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings)
    // (functionCallNotation ".")? (strings/overloadNotation) (blankSpace* functionCallNotation)? ("." (strings/overloadNotation) blankSpace* functionCallNotation)*

functionCallNotation
	= "(" ((strings ":")? (tupleArrayNotation/tupleDotNotation/expressions/factor/'"' strings '"'/"'" strings "'"/puts/strings/numbers/"::"/":")) 
    (blankSpace* (strings ":")? (tupleDotNotation/expressions/factor/'"' strings '"'/"'" strings "'"/puts/strings/numbers/"::"/":"))* ")"
    / "(" (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/puts/strings/"::"/":")? 
    ("," blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/puts/strings/"::"/":")?)* ")"
    / "(" ".*"? ")"
        
expressionAssignment
	= (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings) blankSpace* (":="/"="/"+="/"-="/"*="/"/="/"<-"/"++="/"--="/"**=") blankSpace* 
    ((strings ":")? ('"' strings '"'/"'" strings "'"/multiLineExpression/expressions/precedenceExpression/logicalExpressions/relationalExpressions/tupleDotNotation/tupleArrayNotation/functionCall/numbers/strings))
	/ ((strings ":")? ('"' strings '"'/"'" strings "'"/multiLineExpression/expressions/precedenceExpression/logicalExpressions/relationalExpressions/tupleDotNotation/tupleArrayNotation/functionCall/numbers/strings)) 
    blankSpace* "->" blankSpace* (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings)
   
    
variableAssignment
	= (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings) blankSpace* (":="/"="/"<-") blankSpace* (numbers/strings)
    / (numbers/strings) blankSpace* "->" blankSpace* (tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings)

assertionStatement
	= "I" blankSpace+ (logicalExpressions/relationalExpressions/expressions/rangeExpressions/isExpressions/trueFalse) (blankSpace+ putsNotation)?

compileCheckStatement
	= "C" ":" newLine indent (samedent (expressionAssignment/assignmentStatement/assertionStatement) newLine?)+ dedent (start/EOS)
    / "C" blankSpace+ (singleLineIfStatement EOS/ifStatement (samedent elifStatement)+ (samedent elseStatement)?/ifStatement (samedent elseStatement)?)+ (start/EOS)
    / "C" blankSpace+ (logicalExpressions/relationalExpressions/expressions/rangeExpressions/isExpressions/trueFalse/expressionAssignment/
      assignmentStatement/assertionStatement/negationStatement/strings) (blankSpace+ putsNotation)?

negationStatement
	= "N" blankSpace+ (logicalExpressions/relationalExpressions/expressions/rangeExpressions/isExpressions/trueFalse) (blankSpace+ putsNotation)?

goto
	= "goto" blankSpace+ (tupleDotNotation/tupleArrayNotation/strings)

when
	= "when" blankSpace+ (logicalExpressions/relationalExpressions/isExpressions/trueFalse)

variableNames
 	= !keywords v:[a-zA-Z0-9_?]

strings "variables"
	= !keywords v:[a-zA-Z0-9_?]+
    / ("$"/"%") !keywords v:[a-zA-Z0-9_?]+ ("!")?
    / "%" !"%"
    / "$" !"$"
/*    
    /("$"/"%") !keywords v:[a-zA-Z0-9_] ("?"/"!") 		{return v;}
    / "__" variableMethods
    / overloadNotation
    / accessAllNotation !keywords v:[a-zA-Z0-9_]
    / (implicitVarAccess)? ("$"/"%"/"&")? "."? !keywords v:[a-zA-Z0-9_] {return v;}
    / percentageNotation
    / "%" !"%"
    / "$" !"$"
*/

string
	= [0-9A-Za-z_?]
    
accessAllNotation //a = (*.) foo
	= ("(" ".*" ")") blankSpace*
 
implicitVarAccess // a = (b:) foo 
	= "(" (("$"/"%"/"&")? "."? !keywords string+ ":")?  ("," blankSpace* (("$"/"%"/"&")? "."? !keywords string+ ":")?)* ")" blankSpace* string+

overloadNotation
	= "." !keywords ([a-zA-Z0-9_?]+/operator+) "."
    / "." "." !keywords ([a-zA-Z0-9_?]+) "." "."
  	/ operator operator+ !([a-zA-Z0-9_?])
    / tupleOps+ !(v:[a-zA-Z0-9_?])

operatorOverloadVar
	= operator
    / tupleOps

variableMethods //foo.__read, foo.__write
	= "read"
    / "write"
    / "init"
    / "flop"
    / "parent"
    / "index_read"
    / "index_write"
    / "fluid"
    / "nelems"
    / "bits"
    / "assoc"
    / asDatatype

percentageNotation
	= "%" ("."? !keywords string+)
    / "%" "[" (tupleArrayIndex/'"' !keywords string+ '"'/"'" !keywords string+ "'"/!keywords string+/expressions/integer) "]" ("[" ('"' !keywords string+ '"'/"'" !keywords string+ "'"/!keywords string+/expressions/integer) "]")*

keywords "keywords"
 	= "if" !string
    / "else" !string
    / "elif" !string
    / "as" !string
    / "and" !string
    / "or" !string
    / "for" !string
    / "bool" !string
    / "const" !string
    / "intersect" !string
    / "union" !string
    / "to" !string
    / "by" !string
    // "case" !strings
    / "default" !string
    / "try" !string
    / "catch" !string
    // "stage" !string
    // "pipe" !string
    / "return" !string
    / "puts" !string
    / "in" !string   
    / "goto" !string
    / "when" !string

puts
	= "puts" blankSpace+ (tupleArrayIndex/tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings/'"' (!'"' .)* '"'/factor) (blankSpace+ "++" blankSpace+ 
    (tupleArrayIndex/tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings/'"' (!'"' .)* '"'/factor))* 
    / "puts" blankSpace+ strings '"' (!'"' .)* '"'

putsNotation
	= (tupleArrayIndex/tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings/'"' (!'"' .)* '"'/factor) (blankSpace+ "++" blankSpace+ 
    (tupleArrayIndex/tupleDotNotation/tupleArrayNotation/bitSelectionNotation/strings/'"' (!'"' .)* '"'/factor))*
    / strings '"' (!'"' .)* '"'

//"###" (!"###" .)* "###"           //multi-line comment
     // "#" (!newLine .)* 
tupleAssignment
	= asTupleNotation
    / multiLineTuples
    / multiDimensionalTuples
    / singleDimensionalTuples
    / singleElementTuples
    // tupleArithmeticExpression

singleElementTuples     //single element tuple without commas
	= (rangeAccess/tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* "(" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/factor/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":")? (tupleDotNotation/factor/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* ")"
    /(rangeAccess/tupleArrayNotation/tupleDotNotation/strings)? blankSpace* (":="/"=") blankSpace* "(" blankSpace* ((strings ":") (tupleArrayNotation/tupleDotNotation/factor/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":") (tupleDotNotation/factor/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* ")"
    / "(" blankSpace* (tupleArrayNotation/tupleDotNotation/strings) (blankSpace* "," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* blankSpace* ")" 
    blankSpace* (":="/"=") blankSpace* "(" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* ")"
    / (rangeAccess/tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))*
    / (rangeAccess/tupleArrayNotation/tupleDotNotation/strings)? blankSpace* (":="/"=") blankSpace* ((strings ":") (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":") (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))*
    / "(" blankSpace* (tupleArrayNotation/tupleDotNotation/strings) (blankSpace* "," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* blankSpace* ")" blankSpace* (":="/"=") 
    blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) (blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))*
    / (rangeAccess/tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* "(" ")"
    // (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "=" blankSpace+ ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/strings/expressions)) 
    
singleDimensionalTuples		//1-D tuples with commas 
	= (rangeAccess/tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* "(" blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings) 
    (blankSpace* "," blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings))* blankSpace* ")"
    / (rangeAccess/tupleArrayNotation/tupleDotNotation/strings)? blankSpace* (":="/"=") blankSpace* "(" blankSpace* (strings ":") (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings) 
    (blankSpace* "," blankSpace* (strings ":") (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings))* blankSpace* ")"
    / "(" (tupleArrayNotation/tupleDotNotation/strings) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* ")" blankSpace* (":="/"=") blankSpace* "(" blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings) 
    (blankSpace* "," blankSpace* (strings ":")? (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings))* blankSpace* ")"
    //strings blankSpace+ "=" blankSpace+ "(" strings ":" (expressions/strings) ("," blankSpace strings ":" (expressions/strings))* ")"

multiDimensionalTuples
	= (tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* "(" (nestedTuples/tupleStructure)
    ("," blankSpace* (strings ":")? (expressions/'"' strings '"'/"'" strings "'"/strings))*")"
    / (tupleArrayNotation/tupleDotNotation/strings)? blankSpace* (":="/"=") blankSpace* "(" (nestedTuples/tupleStructure)
    ("," blankSpace* (strings ":") (expressions/'"' strings '"'/"'" strings "'"/strings))*")"
    / "(" (tupleArrayNotation/tupleDotNotation/strings) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* ")" blankSpace* (":="/"=") 
    blankSpace* "(" (nestedTuples/tupleStructure) ("," blankSpace* (strings ":")? (expressions/'"' strings '"'/"'" strings "'"/strings))*")" 
    //lhs:strings blankSpace+ "=" blankSpace+ "(" (nestedTuples/tupleStructure)+ ("," blankSpace strings ":" (strings/expressions))*")"

multiLineTuples
	= (tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* "(" ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions))
    (newLine blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)))+ ")"
    / "(" (tupleArrayNotation/tupleDotNotation/strings) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* ")" blankSpace* (":="/"=") 
    blankSpace* "(" ((strings ":")? (tupleArrayNotation/tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)) (newLine blankSpace* ((strings ":")?
    (tupleArrayNotation/tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)))+ ")" 

tupleStructure
	= (strings ":")? (nestedTuples/tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings) 
    ("," blankSpace* (strings ":")? (nestedTuples/tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings))*
    
nestedTuples
	= "(" nest:tupleStructure ")"

tupleDotNotation
	= (tupleArrayNotation/strings) "." (integer/strings) ("." (integer/strings))*

tupleArrayNotation
	= (strings) "[" (tupleArrayNotation/tupleArrayIndexWithoutComma/tupleArrayIndex/'"' strings '"'/"'" strings "'"/strings/expressions/integer) "]" ("[" (tupleArrayNotation/tupleArrayIndex/'"' strings '"'/"'" strings "'"/strings/expressions/integer) "]")*

tupleArrayIndexWithoutComma //a[1 2] = 3
	=  (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer) 
    (blankSpace* ","? blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer))*  
    // (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer) 
    //(blankSpace* "," blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer))+

tupleArrayIndex
	= "(" blankSpace*  (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer) 
    (blankSpace* "," blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer))* blankSpace* ")"
    / "(" blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer) 
    (blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/expressions/integer))* blankSpace* ")"
  

singleElementTupleNotation
	= "(" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace+ (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* ")"
    
asTupleNotation
	= //(tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "as" blankSpace+ "(" (tupleArrayNotation/tupleDotNotation/strings) 
    //blankSpace* "as" blankSpace* (asDatatypeNotation) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings) blankSpace* "as" blankSpace* (asDatatypeNotation))* ")"
     (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "as" blankSpace+ "(" (asNotation1/asNotation2) blankSpace* ("," blankSpace* (asNotation1/asNotation2))* ")"
    / (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "as" blankSpace+ asNotation1 (blankSpace+ asNotation1)*
    / (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "as" blankSpace+ (asNotation1/asDatatypeNotation/'"' strings '"'/"'" strings "'"/strings/numbers)

asNotation1
	= strings (":"/"=") blankSpace* numbers

asNotation2
	= strings blankSpace* "as" blankSpace* (asTypes/strings)
    
asTypes
	= asBitNotation
    / asDatatypeNotation
    / asSetNotation
    
asBitNotation
	= "bits" ":" integer

asDatatypeNotation
	= asDatatype !strings ((":"/"=") trueFalse)?
    // "const" ((":"/"=") trueFalse)?

asDatatype
	= "bool"
    / "const"
    / "def"

asSetNotation
	= "type:set"

isExpressions
 	= (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "is" blankSpace+ strings ":" blankSpace* (numbers/strings)
    / (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "is" blankSpace+ (asDatatypeNotation/strings)
    / (tupleArrayNotation/tupleDotNotation/strings) blankSpace+ "is" blankSpace+ "(" (strings ":") (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)? ("," blankSpace* (strings ":") (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)?)* ")"
    / "(" (tupleArrayNotation/tupleDotNotation/strings) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* ")" blankSpace+ "is" blankSpace+ strings ":" blankSpace* (numbers/strings)
    / "(" (tupleArrayNotation/tupleDotNotation/strings) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* ")" blankSpace+ "is" blankSpace+ (asDatatypeNotation/strings)
    / "(" (tupleArrayNotation/tupleDotNotation/strings) ("," blankSpace* (tupleArrayNotation/tupleDotNotation/strings))* ")" blankSpace+ "is" blankSpace+ 
    "(" (strings ":") (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)? ("," blankSpace* (strings ":") (tupleDotNotation/expressions/'"' strings '"'/"'" strings "'"/strings)?)* ")"

bitSelectionNotation 
	= //(tupleArrayNotation/tupleDotNotation/rangeNotation/strings) "{" (integer/strings)? "}"
     (tupleArrayNotation/tupleDotNotation/rangeNotation/strings) "{" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* "}"
    / "{" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) 
    ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) blankSpace* "}"
    / "(" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) (blankSpace* (strings ":")? 
    (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* ")" "{" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) 
    (blankSpace* (strings ":")? (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* "}"
    / "(" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) (blankSpace* (strings ":")? 
    (tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers))* blankSpace* ")" "{" blankSpace* ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) 
    ((strings ":")? (tupleArrayNotation/tupleDotNotation/'"' strings '"'/"'" strings "'"/strings/numbers)) blankSpace* "}"

bitSelectionAssignment
	= (tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* bitSelectionNotation
    //bitSelectionNotation blankSpace* (":="/"=") blankSpace* (binary/integer/strings)
    
rangeBoundNotation    //bound notation only
	= (tupleArrayNotation/tupleDotNotation/strings/integer) (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) (tupleArrayNotation/tupleDotNotation/strings/integer) 
    / "(" (tupleArrayNotation/tupleDotNotation/strings/integer) (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) (tupleArrayNotation/tupleDotNotation/strings/integer) ")"

rangeUnboundNotation
	= (tupleArrayNotation/tupleDotNotation/strings/integer)? (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) (tupleArrayNotation/tupleDotNotation/strings/integer)? 
    / "(" (tupleArrayNotation/tupleDotNotation/strings/integer)? (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) (tupleArrayNotation/tupleDotNotation/strings/integer)? 
    (blankSpace+ "by" blankSpace+ (tupleArrayNotation/tupleDotNotation/strings/integer))? ")"

rangeNotation
	= rangeBoundNotation
    / rangeUnboundNotation

rangeAccess
	= (tupleArrayNotation/tupleDotNotation/strings) "[" (tupleArrayNotation/tupleDotNotation/strings/integer)? (".."/blankSpace+ "to" blankSpace+/blankSpace+ "until" blankSpace+) (tupleArrayNotation/tupleDotNotation/strings/integer)? "]"
    
rangeAssignment
	= (tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* (rangeAccess/rangeUnboundNotation/rangeNotation)
    / (tupleArrayNotation/tupleDotNotation/strings) blankSpace* (":="/"=") blankSpace* rangeExpressions
    
rangeExpressions
	= (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer) blankSpace+ (operator/"=="/":=="/"!="/":!="/"union"/"intersect") blankSpace+ 
    (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer) blankSpace+ ("=="/":=="/"!="/":!=") blankSpace+ (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer)
    / (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer) blankSpace+ ("=="/":=="/"!="/":!=") blankSpace+ 
    (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer) blankSpace+ (operator/"=="/":=="/"!="/":!="/"union"/"intersect") blankSpace+ (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer)
    / (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer) blankSpace+ (operator/"=="/":=="/"!="/":!="/"union"/"intersect") blankSpace+ 
    (rangeNotation/tupleArrayNotation/tupleDotNotation/strings/integer)

multiLineExpression
	= (expressions/strings/numbers) newLine (blankSpace* "+" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS) //newLine
    / (singleElementTupleNotation/(expressions/strings/numbers)) newLine (blankSpace* "++" blankSpace (singleElementTupleNotation/(expressions/strings/numbers)) newLine?)+ (start/EOS)
    / (expressions/strings/numbers) newLine (blankSpace* "-" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS) //newLine
    / (singleElementTupleNotation/(expressions/strings/numbers)) newLine (blankSpace* "--" blankSpace (singleElementTupleNotation/(expressions/strings/numbers)) newLine?)+ (start/EOS)
    / (expressions/strings/numbers) newLine (blankSpace* "*" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS) //newLine
    / (singleElementTupleNotation/(expressions/strings/numbers)) newLine (blankSpace* "**" blankSpace (singleElementTupleNotation/(expressions/strings/numbers)) newLine?)+ (start/EOS)
    / (expressions/strings/numbers) newLine (blankSpace* "/" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS)//newLine
    / (expressions/strings/numbers) newLine (blankSpace* "<<<" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS)
    / (expressions/strings/numbers) newLine (blankSpace* ">>>" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS)
    / (expressions/strings/numbers) newLine (blankSpace* "<<" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS)
    / (expressions/strings/numbers) newLine (blankSpace* ">>" blankSpace (expressions/strings/numbers) newLine?)+ (start/EOS)
    / (logicalExpressions/strings/numbers) newLine (blankSpace* "or" blankSpace (logicalExpressions/strings/numbers) newLine?)+ (start/EOS)
    / (logicalExpressions/strings/numbers) newLine (blankSpace* "and" blankSpace (logicalExpressions/strings/numbers) newLine?)+ (start/EOS)

expressions
	= //expressionWOS
    // expressionWS
    //shiftExpression
     //tupleArithmeticExpression 
    precedenceExpression  //line 457 was commented and inserted in 459 dec 19
    / tupleArithmeticExpression
    / isExpressions
    / factor
    / numbers 
    
shiftExpression //has higher precedence than arithmetic ops
	= " " //shiftOperationFactor
     /*head:((shiftOperationFactor/precedenceFactor/strings/precedenceExpression/numbers/integer))  tail: (blankSpace? ("<<<"/">>>"/"<<"/">>") blankSpace? (shiftOperationFactor/precedenceFactor/strings/precedenceExpression/numbers/integer))+ &{
    var i;
    for (i=0; i<tail.length; i++) {
    	//"<<" precedence
       	if ((tail[i][1] == ">>>" || tail[i][1] == "<<<" || tail[i][1] == ">>" || tail[i][1] == "<<") && tail.length == 1) {
        	if (tail[i][0] == " " && tail[i][2] == " ") {}
            else if (tail[i][0] != " " && tail[i][2] != " ") {}
            //1>> 2, 1 <<2
            else {return false;}
           	//all working perfect
      	}
        else if ((tail[i][1] == ">>>" || tail[i][1] == "<<<" || tail[i][1] == ">>" || tail[i][1] == "<<") && i != tail.length - 1) {
        	if (tail[i][0] == " " && tail[i][2] == " ") {} 
            //1>>2>>3 is error! same precedence operators must have brackets
           	if(tail[i+1][1] == ">>>" || tail[i+1][1] == "<<<" || tail[i+1][1] == ">>" || tail[i+1][1] == "<<") {return false;}
            //if(tail[i+1][1] == ">>>" || tail[i+1][1] == "<<<" || tail[i+1][1] == ">>" || tail[i+1][1] == "<<") {return false;}
       	}
    }   
    return true;
    //return tail[0][3];
}*/ 

precedenceExpression
	= //precedenceFactor
     head:((precedenceFactor/tupleArrayNotation/rangeBoundNotation/bitSelectionNotation/strings/numbers/integer))  
     tail: (blankSpace* ("+"/"-"/"*"/"/"/"<<<"/">>>"/"<<"/">>") blankSpace* (precedenceFactor/tupleArrayNotation/rangeBoundNotation/bitSelectionNotation/strings/numbers/integer))+ &{
    	var i;
    	for (i=0; i<tail.length; i++) {
        
        	//"<<" precedence
       		if ((tail[i][1] == ">>>" || tail[i][1] == "<<<" || tail[i][1] == ">>" || tail[i][1] == "<<") && tail.length == 1) {
        		if (tail[i][0] == " " && tail[i][2] == " ") {}
            	else if (tail[i][0] != " " && tail[i][2] != " ") {}
            	//1>> 2, 1 <<2
            	if ((tail[i][0] != "" && tail[i][2] == "") || (tail[i][0] == "" && tail[i][2] != "")) {return false;}
            	// a >> 3+4                   # error: unclear (a>>3)+4 : a>>(3+4)
            	//if(tail[i][3][1][0][1] == "+" || tail[i][3][1][0][1] == "-" || tail[i][3][1][0][1] == "*" || tail[i][3][1][0][1] == "/") {return false;}
           		//all working perfect
      		}
        	else if ((tail[i][1] == ">>>" || tail[i][1] == "<<<" || tail[i][1] == ">>" || tail[i][1] == "<<") && i != tail.length - 1) {
        		if (tail[i][0] == " " && tail[i][2] == " ") {} 
            	//1>>2>>3 is error! same precedence operators must have brackets
           		if(tail[i+1][1] == ">>>" || tail[i+1][1] == "<<<" || tail[i+1][1] == ">>" || tail[i+1][1] == "<<") {return false;}
                //a >> 3+4
            	if((tail[i+1][1] == "+" || tail[i+1][1] == "-" || tail[i+1][1] == "*" || tail[i+1][1] == "/") && tail[i][0] != "" && tail[i][2] != "" && tail[i+1][0] == "") {return false;}
                //a >>3+4, a>> 3+4
                //if((tail[i+1][1] == "+" || tail[i+1][1] == "-" || tail[i+1][1] == "*" || tail[i+1][1] == "/") && ((tail[i][0] == " " && tail[i][2] == null)||(tail[i][0] == null && tail[i][2] == " ")) && tail[i+1][0] == null) {return "rule2";}
                //a>>3+4, a>>3* 4, (a>>3*4) + 5, (a>>3*4)*5
                if((tail[i+1][1] == "+" || tail[i+1][1] == "-" || tail[i+1][1] == "*" || tail[i+1][1] == "/") && tail[i][0] == "" && tail[i][2] == "" && tail[i+1][0] == "") {return false;}
                //a>> 3 + 5, a >>3 * 5, a >>3+4, a>> 3+4
                if((tail[i+1][1] == "+" || tail[i+1][1] == "-" || tail[i+1][1] == "*" || tail[i+1][1] == "/") && ((tail[i][0] != "" && tail[i][2] == "")||(tail[i][0] == "" && tail[i][2] != ""))) {return false;}
                //a >> 3 + 4, a >> 3*4
                if((tail[i+1][1] == "+" || tail[i+1][1] == "-" || tail[i+1][1] == "*" || tail[i+1][1] == "/") && tail[i][0] != "" && tail[i][2] != "") {return false;}
       		}
            else if ((tail[i][1] == ">>>" || tail[i][1] == "<<<" || tail[i][1] == ">>" || tail[i][1] == "<<") && i == tail.length - 1) {
            	//a+1>>3, a+ 1>>2,
            	if((tail[i-1][1] == "+" || tail[i-1][1] == "-" || tail[i-1][1] == "*" || tail[i-1][1] == "/") && tail[i][0] == "" && tail[i][2] == "" && (tail[i-1][0] == "" || tail[i-1][2] == "")) {return false;}
                //a+1>> 2, a + 1 >>3, a + 1>> 3
                if((tail[i-1][1] == "+" || tail[i-1][1] == "-" || tail[i-1][1] == "*" || tail[i-1][1] == "/") && ((tail[i][0] != "" && tail[i][2] == "")||(tail[i][0] == "" && tail[i][2] != ""))) {return false;}
                //a + 1 >> 3
                if((tail[i-1][1] == "+" || tail[i-1][1] == "-" || tail[i-1][1] == "*" || tail[i-1][1] == "/") && tail[i][0] != "" && tail[i][2] != "") {return false;}
            
            }
            
        //"+" precedence
        	if ((tail[i][1] == "+" || tail[i][1] == "-") && tail.length == 1) {
           		if (tail[i][0] == " " && tail[i][2] == " ") {}
                else if (tail[i][0] == "" && tail[i][2] == "") {}
                //1+ 2, 1 -2
                if ((tail[i][0] != "" && tail[i][2] == "") || (tail[i][0] == "" && tail[i][2] != "")) {return false;}
                //all working perfect
            }
    		else if ((tail[i][1] == "+" || tail[i][1] == "-") && i != tail.length - 1) {
           		if (tail[i][0] == " " && tail[i][2] == " ") {} 
                //1+2+3 is error! same precedence operators must have brackets
                //if(tail[i+1][1] == "+" || tail[i+1][1] == "-") {return false;}
                 //1+2*3, 1+2 *3, 1+2* 3, 1+2 * 3 // * and / both working for rule2
                if (tail[i][0] == "" && tail[i][2] == "" && (tail[i+1][1] == "*" || tail[i+1][1] == "/")) {return false;}
                //1+ 2*3, 1 +2*3, 1 +2* 3, 1 +2+ 3, 1*2 +3*4
                if ((tail[i][0] == "" || tail[i][2] == "") && (tail[i+1][1] == "*" || tail[i+1][1] == "/")) {return false;}
                //1 + 2+ 3, 1 + 2+3, 1+2 + 3 // + and - works perfectly
                if ((tail[i][0] != "" && tail[i][2] != "" && tail[i+1][0] == "" && (tail[i+1][1] == "+" || tail[i+1][1] == "-")) || ((tail[i][0] == "" || tail[i][2] == "") && tail[i+1][0] != "")) {return false;}
                //if ((tail[i][0] == " " && tail[i][2] == " " && tail[i+1][0] != " " && tail[i+1][1] != "/") || (tail[i+1][0] == " " && tail[i+1][2] == " " && tail[i][0] != " " && tail[i][1] != "/")) {return "rule4.1";}
                //+ and - working perfectly with * and /
            }
            else if ((tail[i][1] == "+" || tail[i][1] == "-") && i == tail.length - 1) {
           		if (tail[i][0] == " " && tail[i][2] == " ") {} 
                //1 + 2 +3, 1*2+ 3, 1*2 +3, 1+2+ 3
                if ((tail[i][0] == "" && tail[i][2] != "") || (tail[i][0] != "" && tail[i][2] == "")) {return false;}
                //rule 6 matches examples that satisfy rule5! rule6 maybe redundant (check and remove)
                //1*2+3 //both * AND / working perfectly
                if ((tail[i-1][0] == "" && tail[i-1][2] == "" && (tail[i-1][1] == "*" || tail[i-1][1] == "/") && tail[i][0] == "")) {return false;}
                //+ and - working perfectly with * and /
            }
            
            
            //"*" precedence
            if ((tail[i][1] == "*" || tail[i][1] == "/") && tail.length == 1) {
           		if (tail[i][0] == " " && tail[i][2] == " ") {}
                else if (tail[i][0] == "" && tail[i][2] == "") {}
                //1* 2, 1 /2
                if((tail[i][0] != "" && tail[i][2] == "") || (tail[i][0] == "" && tail[i][2] != "")) {return false;}
                //all working perfect
            }
            else if ((tail[i][1] == "*" || tail[i][1] == "/") && i != tail.length - 1) {
           		if (tail[i][0] == " " && tail[i][2] == " ") {} 
                //1*2*3 is error! same precedence operators must have brackets
                //if(tail[i+1][1] == "*" || tail[i+1][1] == "/") {return false;}
                //1* 2 + 3, 1 *2 + 3, 1 *2+3, 1*  2+ 3, 1 *2 * 3, 1* 2 * 3 
                if ((tail[i][0] == "" && tail[i][2] != "") || (tail[i][0] != "" && tail[i][2] == "")) {return false;}
                //1 * 2 + 3, 1 * 2+3, 1 * 2+ 3, 1 * 2 +3  //second part of rule 9 is useless (rule 8 covers that part already) (check and remove)
                if ((tail[i][0] != "" && tail[i][2] != "" && (tail[i+1][1] == "+" || tail[i+1][1] == "-"))) {return false;}   
                //4*3 * 3, 1*2 * 3*4 and 1 * 2*3
                if ((tail[i][0] != "" && tail[i][2] != "" && tail[i+1][0] == "" && tail[i+1][1] == "*") || (tail[i+1][0] != "" && tail[i+1][2] != "" && tail[i][0] == "" && tail[i+1][1] == "*")) {return false;}
                if ((tail[i][0] != "" && tail[i][2] != "" && tail[i+1][0] == "" && tail[i+1][1] == "/") || (tail[i+1][0] != "" && tail[i+1][2] != "" && tail[i][0] == "" && tail[i+1][1] == "/")) {return false;}           
                //1*2 + 3
                if ((tail[i+1][0] == " " && tail[i+1][2] == " " && tail[i][0] != " " && (tail[i+1][1] == "+" || tail[i+1][1] == "-"))) {}
                //1 + 2*3>>4
                if ((tail[i+1][1] == "<<<" || tail[i+1][1] == ">>>" || tail[i+1][1] == "<<" || tail[i+1][1] == ">>") && (tail[i-1][1] == "+" || tail[i-1][1] == "-")) {return false;}
                //* and / works perfectly with + and -
            }
            else if ((tail[i][1] == "*" || tail[i][1] == "/") && i == tail.length - 1) {
            	if (tail[i][0] == " " && tail[i][2] == " ") {}
                //1 + 2 * 3. works with * and /
           		if (tail[i][0] != "" && tail[i][2] != "" && (tail[i-1][1] == "+" || tail[i-1][1] == "-")) {return false;} 
                //1 + 2* 3, 1 + 2 *3. works with * and /
                if ((tail[i][0] != "" && tail[i][2] == "") || (tail[i][0] == "" && tail[i][2] != "")) {return false;}
                //if ((tail[i-1][0] != " " && tail[i-1][2] != " " && tail[i-1][1] == "*" && tail[i][0] != " " && tail[i][1] != "*")) {return "rule13";}
                //* and / works perfectly wih + and -
            }
            
    	}
        //return head+tail;
        return true;
    }
    
tupleArithmeticExpression
	= head:(rangeBoundNotation/factor/'"' strings '"'/strings/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/numbers/integer) 
    tail:(blankSpace+ (tupleOps/overloadNotation) blankSpace+ (rangeBoundNotation/factor/'"' strings '"'/strings/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/numbers/integer))+


//expression without space
expressionWOS
	= head:(factor/strings/numbers/integer) tail:(operator (factor/strings/numbers/integer))+ {
    var tmp = [].concat.apply([], tail)
    return head+[].concat.apply([], tmp).join('');}
    
//expression with space
expressionWS
	= head:(factor/strings/numbers/integer) tail:(blankSpace+ (operator) blankSpace+ (factor/strings/numbers/integer))+ {
    var tmp = [].concat.apply([], tail)
    return head+[].concat.apply([], tmp).join('');}
    / head:(factor/'"' strings '"'/strings/tupleArrayIndex/singleElementTupleNotation/numbers/integer) 
    tail:(blankSpace+ (tupleOps) blankSpace+ (factor/'"' strings '"'/strings/tupleArrayIndex/singleElementTupleNotation/numbers/integer))+ 
  
  
stringExpressions
	= strings blankSpace+ tupleOps blankSpace+ strings
    / '"' strings '"' blankSpace+ tupleOps blankSpace+ '"' strings '"'

relationalExpressions
	= "!"? head:(expressions/factor/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/bitSelectionNotation/rangeNotation/ /*strings blankSpace* functionCallNotation*/ strings/numbers) tail:blankSpace* relationalOps blankSpace* 
    "!"? (expressions/factor/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/bitSelectionNotation/rangeNotation/ /*strings blankSpace* functionCallNotation*/ strings/numbers/"()")
    / "(" head:(expressions/factor/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/bitSelectionNotation/strings blankSpace* functionCallNotation/strings/numbers) tail:blankSpace* relationalOps blankSpace* 
    (expressions/factor/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/bitSelectionNotation/strings blankSpace* functionCallNotation/strings/numbers/"()") ")"
    / "!"? head:(functionCall) tail:blankSpace* relationalOps blankSpace* "!"? (functionCall)
    / "(" head:(functionCall) tail:blankSpace* relationalOps blankSpace* (functionCall) ")"

logicalExpressions
	= "!"? (factor/relationalExpressions/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/expressions/strings) blankSpace+ logicalOps blankSpace+ 
    "!"? (factor/relationalExpressions/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/expressions/strings)
    / "!"? factor (blankSpace+ logicalOps blankSpace+ "!"? factor)+
    / logicalNOT (factor/relationalExpressions/tupleArrayNotation/tupleArrayIndex/singleElementTupleNotation/expressions/strings)

factor 
	= 
    // "(" expr:(precedenceExpression) ")"
   "(" expr:(relationalExpressions) ")"
    / "(" expr:(precedenceExpression) ")"
    / "(" expr:(logicalExpressions) ")"
    // "(" expr:(numbers) ")"
    / numbers

precedenceFactor
	= "(" expr:(precedenceExpression/numbers) ")"
    
shiftOperationFactor
	= "(" expr:(shiftExpression) ")"
    
numbers 
	= hexaDecimal
    / binary
    // float
    / trueFalse
    / decimalSigned
    / decimalDigit

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

/*float 
	= head:("0."/nonZeroDigit+ ".") tail:decimalDigit+
    / head:("0e"/nonZeroDigit+ "e") tail:decimalDigit+
    / ("-") head:("0."/nonZeroDigit+ ".") tail:decimalDigit+
    / ("-") head:("0e"/nonZeroDigit+ "e") tail:decimalDigit+
*/

trueFalse "true or false"
	= "true"
    / "TRUE"
    / "false"
    / "FALSE"

decimalSigned
	= decimalDigit+ "u" nonZeroDigit decimalDigit*
    / decimalDigit+ "s" nonZeroDigit decimalDigit*

decimalDigit "integer greater than or equal to zero"
	= ("-")? ["?"0-9]+
    // ("+"/"-") [0-9]

nonZeroDigit "integer greater than zero"
	= ["?"1-9]+
    
binaryDigit "binary digits"
	= ["?"0-1]+

hexDigit "hexadecimal characters"
	= ["?"A-F]+
      
integer "integer"
  = ["?"0-9]+

operator 
	= $("+")
  / $("-")
  / $("*")
  / $("/")
  / $(">>")
  / $("<<")
  / $(">>>")
  / $("<<<")

relationalOps
	= $("==")
  / $("!=")
  / $("<=")
  / $(">=")
  / $(">")
  / $("<")
  / $(":==")
  / $(":!=")
  / $(":<=")
  / $(":>=")
  / $(":>")
  / $(":<")
  
logicalOps
	= $("and")
  / $("or")

logicalNOT
	= $("!")

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
  = EOL+ comment EOL+
  / EOL+
  / EOF
  / blankSpace* comment EOL*
  / blankSpace+

EOL
  = "\n"

EOF
  = !.

CN  //comment or new line anywhere
 = newLine
 / comment newLine

CA  //comment anywhere
 = blankSpace* comment
 
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

comment "comments"
	= head:"###" "{" ((!("###}").)* "###}")+
    / "###" (!"###" .)* "###"           //multi-line comment
     / "#" (!newLine .)*                //single line comment

