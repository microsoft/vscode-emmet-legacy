'use strict';

import * as vscode from 'vscode';
import { EmmetCompletionItemProvider } from './emmetCompletionProvider'

const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };
const XML_MODE: vscode.DocumentFilter = { language: 'xml', scheme: 'file' };
const JADE_MODE: vscode.DocumentFilter = { language: 'jade', scheme: 'file' };
const CSS_MODE: vscode.DocumentFilter = { language: 'css', scheme: 'file' };
const SCSS_MODE: vscode.DocumentFilter = { language: 'scss', scheme: 'file' };
const LESS_MODE: vscode.DocumentFilter = { language: 'less', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetCompletionItemProvider(), '!', '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(JADE_MODE, new EmmetCompletionItemProvider(), '!', '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(XML_MODE, new EmmetCompletionItemProvider(),  '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(CSS_MODE, new EmmetCompletionItemProvider(),  ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(SCSS_MODE, new EmmetCompletionItemProvider(),  ':'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(LESS_MODE, new EmmetCompletionItemProvider(),  ':'));
}

export function deactivate() {
}
