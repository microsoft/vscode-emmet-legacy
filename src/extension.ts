'use strict';

import * as vscode from 'vscode';
import { expand } from '@emmetio/expand-abbreviation'
import * as path from 'path';
import * as fs from 'fs';

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('emmet.expand', () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor.selection.isSingleLine) {
            return;
        }

        let rangeToReplace: vscode.Range = editor.selection;
        let wordToExpand = editor.document.getText(editor.selection);

        if (editor.selection.start.character === editor.selection.end.character) {
            let currentLine = editor.document.lineAt(editor.selection.start.line).text;
            let lineTillCursor = currentLine.substr(0, editor.selection.start.character);
            let match = lineTillCursor.match(/(\S+)$/);
            if (match) {
                rangeToReplace = new vscode.Range(editor.selection.start.line, editor.selection.start.character - match[1].length, editor.selection.start.line, editor.selection.start.character);
                wordToExpand = match[1];
            } else {
                return;
            }
        }

        let expandedWord = expand(wordToExpand, {
            field: field,
            syntax: editor.document.languageId
        });

        let snippet = new vscode.SnippetString(expandedWord);
        editor.insertSnippet(snippet, rangeToReplace);
    });

    context.subscriptions.push(disposable);

}

export function deactivate() {
}

