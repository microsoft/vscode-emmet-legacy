'use strict';

import * as vscode from 'vscode';
import { expand, createSnippetsRegistry } from '@emmetio/expand-abbreviation'
import * as extract from '@emmetio/extract-abbreviation';
import * as path from 'path';
import * as fs from 'fs';
import { EmmetCompletionItemProvider, EmmetSnippetCompletionItemProvider } from './emmetCompletionProvider'

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;
const snippetCompletionsCache = new Map<string, vscode.CompletionItem[]>();

export const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetCompletionItemProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetSnippetCompletionItemProvider()));
}

export function deactivate() {
}
