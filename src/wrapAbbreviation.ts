'use strict';

import * as vscode from 'vscode';
import { parse, expand } from '@emmetio/expand-abbreviation'
import { getSyntax } from './util';

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;

export function wrapAbbreviation() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    let rangeToReplace: vscode.Range = editor.selection;
    if (rangeToReplace.isEmpty) {
        rangeToReplace = new vscode.Range(rangeToReplace.start.line, 0, rangeToReplace.start.line, editor.document.lineAt(rangeToReplace.start.line).text.length - 1);
    }
    let textToReplace = editor.document.getText(rangeToReplace);
    let options = {
        field: field,
        syntax: getSyntax(editor.document)
    };

    vscode.window.showInputBox().then(abbr => {
        if (!abbr || !abbr.trim()) return;

        let newOptions = Object.assign({}, options, {text: textToReplace});
        let expandedText = expand(abbr, newOptions);

        editor.insertSnippet(new vscode.SnippetString(expandedText), rangeToReplace);
    });
}