'use strict';

import * as vscode from 'vscode';
import { EmmetCompletionItemProvider, EmmetSnippetCompletionItemProvider } from './emmetCompletionProvider'

export const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetCompletionItemProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetSnippetCompletionItemProvider()));
}

export function deactivate() {
}
