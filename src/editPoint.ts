'use strict';

import * as vscode from 'vscode';
import { validate } from './util';

export function nextEditPoint() {
    let editor = vscode.window.activeTextEditor;
    if (!validate()) {
        return;
    }

    let position = editor.selection.anchor;

    for (let lineNum = position.line; lineNum < editor.document.lineCount; lineNum++) {
        if (findEditPoint(lineNum, editor, position, 'next')) {
            return;
        }
    }
}

export function prevEditPoint() {
    let editor = vscode.window.activeTextEditor;
    if (!validate()) {
        return;
    }

    let position = editor.selection.anchor;

    for (let lineNum = position.line; lineNum >= 0; lineNum--) {
        if (findEditPoint(lineNum, editor, position, 'prev')) {
            return;
        }
    }
}

function findEditPoint(lineNum, editor, position, direction): boolean {
    let line = editor.document.lineAt(lineNum);

    if (lineNum != position.line && line.isEmptyOrWhitespace) {
        editor.selection = new vscode.Selection(lineNum, 0, lineNum, 0);
        return;
    }

    let lineContent = line.text;
    if (lineNum == position.line && direction == 'prev' ) {
        lineContent = lineContent.substr(0, position.character);
    }
    let emptyAttrIndex = direction == 'next' ? lineContent.indexOf('""', lineNum == position.line ? position.character: 0) : lineContent.lastIndexOf('""');
    let emptyTagIndex = direction == 'next' ? lineContent.indexOf('><', lineNum == position.line ? position.character: 0) : lineContent.lastIndexOf('><');

    let winner = -1;

    if (emptyAttrIndex > -1 && emptyTagIndex > -1) {
        winner = direction == 'next' ? Math.min(emptyAttrIndex, emptyTagIndex) : Math.max(emptyAttrIndex, emptyTagIndex);
    } else if (emptyAttrIndex > -1) {
        winner = emptyAttrIndex;
    } else {
        winner = emptyTagIndex;
    }

    if (winner > -1) {
        editor.selection = new vscode.Selection(lineNum, winner + 1, lineNum, winner + 1);
        return true;
    }
    return false;
}





