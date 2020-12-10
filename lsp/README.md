## Functionality

This Language Server works for Pyrope file. It has the following language features:
- Syntaxes highlight
- Basic auto-completion
- Syntaxes Diagnostics
- Code snippet
- Code folding
- Command shortcut


## Structure

```
.
├── syntaxes // syntax hgihlight configuration
│   ├── language-configuration.json // syntax hgihlight configuration
├── client // Language Client
│   ├── src
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
├── code snippets// code snippets for while, for, if, assert
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Running the extension in debug mode

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder base on the package.json
- Open VS Code on this folder
- Choose start dubuging from the run tab in vsCode top menu
- The vscode will pop-up [Extension Development Host]
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open .prp document, which will automatically regonize as the pyrope mode.
  - wait for pop-up message `Welcome to use Pyrope vscode, from server side` and the language server is activated.