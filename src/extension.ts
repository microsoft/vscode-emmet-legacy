'use strict';

import * as vscode from 'vscode';
import { expand } from '@emmetio/expand-abbreviation'
import * as path from 'path';
import * as fs from 'fs';

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;

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

}

export function deactivate() {
}

export class EmmetCompletionItemProvider implements vscode.CompletionItemProvider {

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        let [rangeToReplace, wordToExpand] = getWordAndRangeToReplace(position);
        let expandedWord = expand(wordToExpand, {
            field: field,
            syntax: document.languageId
        });

        let snippet = new vscode.SnippetString(expandedWord);

        let completionitem = new vscode.CompletionItem(wordToExpand);
        completionitem.insertText = snippet;
        completionitem.documentation = expandedWord;
        completionitem.range = rangeToReplace;
        return Promise.resolve([completionitem]);
    }
}

function getWordAndRangeToReplace(position: vscode.Position): [vscode.Range, string] {
    let editor = vscode.window.activeTextEditor;
    let currentLine = editor.document.lineAt(position.line).text;
    let lineTillCursor = currentLine.substr(0, position.character);
    let match = lineTillCursor.match(/(\S+)$/);
    if (match) {
        let rangeToReplace = new vscode.Range(position.line, position.character - match[1].length, position.line, position.character);
        let wordToExpand = match[1];
        return [rangeToReplace, wordToExpand];
    } else {
        return;
    }
}