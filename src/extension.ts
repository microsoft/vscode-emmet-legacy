'use strict';

import * as vscode from 'vscode';
import { expand, createSnippetsRegistry } from '@emmetio/expand-abbreviation'
import * as extract from '@emmetio/extract-abbreviation';
import * as path from 'path';
import * as fs from 'fs';
import { getWordAndRangeToReplace, EmmetCompletionItemProvider, EmmetSnippetCompletionItemProvider } from './emmetCompletionProvider'

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;
const snippetCompletionsCache = new Map<string, vscode.CompletionItem[]>();

export const HTML_MODE: vscode.DocumentFilter = { language: 'html', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('emmet.expand', () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor.selection.isSingleLine) {
            return;
        }

        let rangeToReplace: vscode.Range = editor.selection;
        let wordToExpand = editor.document.getText(editor.selection);

        if (editor.selection.start.character === editor.selection.end.character) {
            let result = getWordAndRangeToReplace(editor.selection.start);
            rangeToReplace = result[0];
            wordToExpand = result[1];
        }

        let expandedWord = expand(wordToExpand, {
            field: field,
            syntax: editor.document.languageId
        });

        let snippet = new vscode.SnippetString(expandedWord);
        editor.insertSnippet(snippet, rangeToReplace);
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetCompletionItemProvider()));

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(HTML_MODE, new EmmetSnippetCompletionItemProvider()));
}

export function deactivate() {
}
