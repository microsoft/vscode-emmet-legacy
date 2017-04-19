'use strict';

import * as vscode from 'vscode';
import { EmmetCompletionItemProvider } from './emmetCompletionProvider'

const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };
const JADE_MODE: vscode.DocumentFilter = { language: 'jade', scheme: 'file' };
const SLIM_MODE: vscode.DocumentFilter = { language: 'slim', scheme: 'file'};
const HAML_MODE: vscode.DocumentFilter = { language: 'haml', scheme: 'file'};
const XML_MODE: vscode.DocumentFilter = { language: 'xml', scheme: 'file' };
const XSL_MODE: vscode.DocumentFilter = { language: 'xsl', scheme: 'file' };
const CSS_MODE: vscode.DocumentFilter = { language: 'css', scheme: 'file' };
const SCSS_MODE: vscode.DocumentFilter = { language: 'scss', scheme: 'file' };
const SASS_MODE: vscode.DocumentFilter = { language: 'sass', scheme: 'file' };
const LESS_MODE: vscode.DocumentFilter = { language: 'less', scheme: 'file' };
const STYLUS_MODE: vscode.DocumentFilter = { language: 'stylus', scheme: 'file' };
const JSX_MODE: vscode.DocumentFilter = { language: 'javascriptreact', scheme: 'file'};
const TSX_MODE: vscode.DocumentFilter = { language: 'typescriptreact', scheme: 'file'};

export function activate(context: vscode.ExtensionContext) {
    let completionProvider = new EmmetCompletionItemProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, completionProvider, '!', '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(JADE_MODE, completionProvider, '!', '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(SLIM_MODE, completionProvider,  '!', '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HAML_MODE, completionProvider,  '!', '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(XML_MODE, completionProvider,  '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(XSL_MODE, completionProvider,  '.'));

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(CSS_MODE, completionProvider,  ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(SCSS_MODE, completionProvider,  ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(SASS_MODE, completionProvider,  ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(LESS_MODE, completionProvider,  ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(STYLUS_MODE, completionProvider,  ':'));

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(JSX_MODE, completionProvider,  '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TSX_MODE, completionProvider,  '.'));
}

export function deactivate() {
}
