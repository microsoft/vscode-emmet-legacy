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
        let line = editor.document.lineAt(lineNum);

        if (lineNum != position.line && line.isEmptyOrWhitespace) {
            editor.selection = new vscode.Selection(lineNum, 0, lineNum, 0);
            return;
        }

        let lineContent = line.text;
        let emptyAttrIndex = lineContent.indexOf('""', lineNum == position.line ? position.character : 0);
        let emptyTagIndex = lineContent.indexOf('><', lineNum == position.line ? position.character : 0);

        let editPoint = getEditPoint(lineNum, emptyAttrIndex, emptyTagIndex, true);

        if (editPoint) {
            editor.selection = editPoint;
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
        let line = editor.document.lineAt(lineNum);

        if (lineNum != position.line && line.isEmptyOrWhitespace) {
            editor.selection = new vscode.Selection(lineNum, 0, lineNum, 0);
            return;
        }

        let lineContent = lineNum == position.line ? line.text.substr(0, position.character) : line.text;
        let emptyAttrIndex = lineContent.lastIndexOf('""');
        let emptyTagIndex = lineContent.lastIndexOf('><');

        let editPoint = getEditPoint(lineNum, emptyAttrIndex, emptyTagIndex, false);

        if (editPoint) {
            editor.selection = editPoint;
            return;
        }
    }
}

function getEditPoint(lineNum, emptyAttrIndex, emptyTagIndex, findNext: boolean): vscode.Selection {
    let winner = -1;

    if (emptyAttrIndex > -1 && emptyTagIndex > -1) {
        winner = findNext ? Math.min(emptyAttrIndex, emptyTagIndex) : Math.max(emptyAttrIndex, emptyTagIndex) ;
    } else if (emptyAttrIndex > -1) {
        winner = emptyAttrIndex;
    } else {
        winner = emptyTagIndex;
    }

    if (winner > -1) {
        return new vscode.Selection(lineNum, winner + 1, lineNum, winner + 1);
    }
}