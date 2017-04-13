'use strict';

import * as vscode from 'vscode';
import { EmmetCompletionItemProvider } from './emmetCompletionProvider'

export const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetCompletionItemProvider(), '!', '.'));
}

export function deactivate() {
}
