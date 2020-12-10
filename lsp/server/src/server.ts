/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. 
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;
let token = new Map<string, any>();
connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
	connection.window.showInformationMessage('Welcome to use Pyrope vscode, from server side');
	connection.console.log('Workspace folder change event received.');
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	// documents.all().forEach(validateTextDocument);
});



function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result; 
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	// tried to implement a basic parser
	// token.clear() 
	// let text = change.document.getText()
	// let define = /[A-Za-z0-9a]*(?=[ \t]*[=][^=])/;
	// let vtoken: RegExpExecArray | null;
	// vtoken = define.exec(text)
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	let settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	let text = textDocument.getText();
	let pattern = /\b([a-zA-Z0-9_]* +[(or)]+ [a-zA-Z0-9_]* +[(and)]+ [a-zA-Z0-9_]*.*)|([a-zA-Z0-9_]* +[(and)]+ [a-zA-Z0-9_]* +[(or)]+ [a-zA-Z0-9_]*.*)\b/g;
	let pattern1 = /\b([a-zA-Z0-9_]*\s?[\+][\+]\s?[a-zA-Z0-9_]*\s?[\-][\-]\s?[a-zA-Z0-9_]*.*)|([a-zA-Z0-9_]*\s?[\-][\-]\s?[a-zA-Z0-9_]*\s?[\+][\+]\s?[a-zA-Z0-9_]*.*)\b/g;
	let pattern2 = /\W(;)\w+\b/g;
	let pattern3 = /\b([a-zA-Z0-9_]* +[(&)|(and)|(or)|(|))]+ [a-zA-Z0-9_]* +[(-)|(+)|(*)|(/)] [a-zA-Z0-9_]*.*)|([a-zA-Z0-9_]* +[(-)|(+)|(*)|(/)]+ [a-zA-Z0-9_]* +[(&)|(and)|(or)|(|))]+ [a-zA-Z0-9_]*.*)\b/g;
	let pattern4 = /(if)\s?[a-zA-Z0-9_]+[^{]*?\n({)/g;
	let pattern5 = /(if)\s?[a-zA-Z0-9_]+[^{]*?({)\s?[a-zA-Z0-9_]+\s?= [a-zA-Z0-9_]+ [a-zA-Z0-9_]+[^}]*/g;
	let m: RegExpExecArray | null;
	let problems = 0;
	let diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
			problems++;
			let diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `${m[0]} parse error: precedence`,
			source: 'Pyrope'
			
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'parse error: precedence'
				},
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Operator precedence'
				}
			];
		}
		diagnostics.push(diagnostic);
	}
	while ((m = pattern1.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		let diagnostic: Diagnostic = {
		severity: DiagnosticSeverity.Error,
		range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length)
		},
		message: `${m[0]} parse error: precedence`,
		source: 'Pyrope'
		
	};
	if (hasDiagnosticRelatedInformationCapability) {
		diagnostic.relatedInformation = [
			{
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message: 'parse error: precedence'
			},
			{
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message: 'Operator precedence'
			}
		];
	}
		diagnostics.push(diagnostic);
	}
	while ((m = pattern2.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		let diagnostic: Diagnostic = {
		severity: DiagnosticSeverity.Error,
		range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length)
		},
		message: `${m[0]} parse error: operator follow by ";"`,
		source: 'Pyrope'
	
};
	if (hasDiagnosticRelatedInformationCapability) {
		diagnostic.relatedInformation = [
			{
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message: 'recommandation fix: move ";" to the front of operator'
			}
		];
	}
	diagnostics.push(diagnostic);
	}	
	while ((m = pattern3.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		let diagnostic: Diagnostic = {
		severity: DiagnosticSeverity.Error,
		range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length)
		},
		message: `${m[0]} parse error: parse error: precedence`,
		source: 'Pyrope'
	
};
	if (hasDiagnosticRelatedInformationCapability) {
		diagnostic.relatedInformation = [
			{
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message: 'parse error: parse error: precedence'
			}
		];
	}
	diagnostics.push(diagnostic);
	}	
	while ((m = pattern4.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		let diagnostic: Diagnostic = {
		severity: DiagnosticSeverity.Error,
		range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length)
		},
		message: `${m[0]} parse error: extra newline`,
		source: 'Pyrope'
	
};
	if (hasDiagnosticRelatedInformationCapability) {
		diagnostic.relatedInformation = [
			{
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message: 'fix recommandation: \nif condition {\ndo}'
			}
		];
	}
	diagnostics.push(diagnostic);
	}
	while ((m = pattern5.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		let diagnostic: Diagnostic = {
		severity: DiagnosticSeverity.Error,
		range: {
			start: textDocument.positionAt(m.index),
			end: textDocument.positionAt(m.index + m[0].length +1)
		},
		message: `${m[0]} parse error: missing newline`,
		source: 'Pyrope'
	
};
	if (hasDiagnosticRelatedInformationCapability) {
		diagnostic.relatedInformation = [
			{
				location: {
					uri: textDocument.uri,
					range: Object.assign({}, diagnostic.range)
				},
				message: 'fix recommandation: \nif condition {\ndo}'
			}
		];
	}
	diagnostics.push(diagnostic);
	}
	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			{
				label: 'module' + _textDocumentPosition.position.character,
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'always' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 2
			},
			{
				label: 'posedge' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 3
			},
			{
				label: 'import' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 4
			},
			{
				label: 'super' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 5
			},
			{
				label: 'while' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 6
			},
			{
				label: 'logic' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 7
			},
			{
				label: '__posclk' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 8
			},
			{
				label: '__q_pin' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 9
			},
			{
				label: '__fwd' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 10
			},

			{
				label: '__latch' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 11
			},

			{
				label: '__clk_pin' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 12
			},
			{
				label: '__reset' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 13
			},

			{
				label: '__reset_pin' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 14
			},
			{
				label: '__reset_cycles' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 15
			},

			{
				label: '__async' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 16
			},
			{
				label: '__last_value' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 17
			},

			{
				label: '__stage' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 18
			},
			{
				label: '__fluid' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 19
			},
			{
				label: '__size' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 20
			},
			{
				label: '__port' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 21
			},
			{
				label: '__debug ' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 22
			},
			{
				label: '__clk_pin' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 23
			},
			{
				label: '__posclk' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 24
			},
			{
				label: '__port' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 25
			},
			{
				label: '__negreset' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 26
			},
			{
				label: '__latency' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 27
			},
			{
				label: '__fwd' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 28
			},
			{
				label: '__addr' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 29
			},
			{
				label: '__wrmask' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 30
			},
			{
				label: '__enable' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 31
			},
			{
				label: '__allowed' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 32
			},
			{
				label: '__ubits' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 33
			},
			{
				label: '__sbits' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 34
			},
			{
				label: '__max' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 35
			},
			{
				label: '__min' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 36
			},
			{
				label: '__key' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 37
			},
			{
				label: '__rnd' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 38
			},
			{
				label: '__rnd_bias' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 39
			},
			{
				label: '__comptime' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 40
			},
			{
				label: '__set' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 41
			},
			{
				label: '__enum' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 42
			},
			{
				label: '__index' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 43
			},
			{
				label: '__do' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 44
			},
			{
				label: '__else' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 45
			}
		];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 8) {
			item.detail = 'Flop/Latches Specific:__posclk';
			item.documentation = 'Posedge (true) or negedge';
		} else if (item.data === 9) {
			item.detail = 'Flop/Latches Specific:__q_pin ';
			item.documentation = 'Previous cycle value, no fwd (registers)';
		} else if (item.data === 10) {
			item.detail = 'Flop/Latches Specific:__fwd   ';
			item.documentation = 'Perform forwarding in cycle (true)';
		}else if (item.data === 11) {
			item.detail = 'Flop/Latches Specific:__latch ';
			item.documentation = 'Latch not flop based (false)';
		}else if (item.data === 12) {
			item.detail = 'Flop/Latches Specific: __clk_pin ';
			item.documentation = 'Wire signal to control clk pin';
		}else if (item.data === 13) {
			item.detail = 'Flop/Latches Specific:__reset  ';
			item.documentation = 'Code block to execute during reset';
		}else if (item.data === 14) {
			item.detail = 'Flop/Latches Specific:__reset_pin ';
			item.documentation = 'Wire signal to control reset pin';
		}else if (item.data === 15) {
			item.detail = 'Flop/Latches Specific:__reset_cycles ';
			item.documentation = 'Number of reset cycles required (1)';
		}else if (item.data === 16) {
			item.detail = 'Flop/Latches Specific:__async  ';
			item.documentation = 'Asynchronous reset (false)';
		}else if (item.data === 17) {
			item.detail = 'Flop/Latches Specific:__last_value ';
			item.documentation = 'Read last write to the variable/tuple';
		}else if (item.data === 18) {
			item.detail = 'Flop/Latches Specific:__stage  ';
			item.documentation = 'Previous cycle value, no fwd (registers)';
		}else if (item.data === 19) {
			item.detail = 'Flop/Latches Specific:__fluid ';
			item.documentation = 'Outputs in module handled as fluid';
		}else if (item.data === 20) {
			item.detail = ' SRAM Specific: __size  ';
			item.documentation = 'number of entries SRAMs';
		}else if (item.data === 21) {
			item.detail = 'SRAM Specific: __port ';
			item.documentation = 'tuple with ports in SRAM';
		}else if (item.data === 22) {
			item.detail = 'SRAM Specific:__debug ';
			item.documentation = 'Port debug (false), no side-effects';
		}else if (item.data === 23) {
			item.detail = 'SRAM Specific:__clk_pin  ';
			item.documentation = 'Port clock';
		}else if (item.data === 24) {
			item.detail = 'SRAM Specific: __posclk ';
			item.documentation = 'clock posedge (true) or negedge';
		}else if (item.data === 25) {
			item.detail = 'SRAM Specific:__negreset ';
			item.documentation = ' reset posedge (true) or negedge';
		}else if (item.data === 26) {
			item.detail = 'SRAM Specific:__latency ';
			item.documentation = ' Read or Write latency (1)';
		}else if (item.data === 27) {
			item.detail = 'SRAM Specific:__fwd ';
			item.documentation = 'Perform forwarding (false) in cycle';
		}else if (item.data === 28) {
			item.detail = 'SRAM Specific:__addr ';
			item.documentation = 'Address pin';
		}else if (item.data === 29) {
			item.detail = 'SRAM Specific:__data';
			item.documentation = 'Data pin';
		}else if (item.data === 30) {
			item.detail = 'SRAM Specific:__wrmask  ';
			item.documentation = 'Write mask pin';
		}else if (item.data === 31) {
			item.detail = 'SRAM Specific:__enable ';
			item.documentation = 'Enable pin';
		}else if (item.data === 32) {
			item.detail = 'Generic bitwidth:__allowed   ';
			item.documentation = 'Allowed values in variable';
		}else if (item.data === 33) {
			item.detail = 'Generic bitwidth:__ubits  ';
			item.documentation = 'Number of bits and set as unsigned';
		}else if (item.data === 34) {
			item.detail = 'Generic bitwidth:__sbits ';
			item.documentation = 'Number of bits and set as signed';
		}else if (item.data === 35) {
			item.detail = 'Generic bitwidth:__max ';
			item.documentation = 'Alias for maximum __allowed value';
		}else if (item.data === 36) {
			item.detail = 'Generic bitwidth:__min ';
			item.documentation = 'Alias for minimum __allowed value';
		}else if (item.data === 37) {
			item.detail = 'Generic:__key ';
			item.documentation = 'string key name for instrospection';
		}else if (item.data === 38) {
			item.detail = 'Generic:__rnd ';
			item.documentation = ' Generate an allowed random number';
		}else if (item.data === 39) {
			item.detail = 'Generic:__rnd_bias  ';
			item.documentation = 'Controls random generation';
		}else if (item.data === 40) {
			item.detail = 'Generic:__comptime';
			item.documentation = 'Fully solved at compile time';
		}else if (item.data === 41) {
			item.detail = 'Tuple:__set';
			item.documentation = 'Tuple behaves like a set (false)';
		}else if (item.data === 42) {
			item.detail = 'Tuple:__enum';
			item.documentation = 'Tuple values become an enum';
		}else if (item.data === 43) {
			item.detail = 'Tuple:__index';
			item.documentation = 'tuple position (typically for loops)';
		}else if (item.data === 44) {
			item.detail = 'Tuple:__do';
			item.documentation = 'Code block passes ($.__do)';
		}else if (item.data === 45) {
			item.detail = 'Tuple:__else';
			item.documentation = 'Else code block ($.__else)';
		}
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
