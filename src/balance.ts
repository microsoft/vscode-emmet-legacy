'use strict';

import * as vscode from 'vscode';
import { getNode, getNodeOuterSelection, getNodeInnerSelection, isStyleSheet } from './util';
import parse from '@emmetio/html-matcher';
import Node from '@emmetio/node';

export function balanceOut() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    if (isStyleSheet(editor.document.languageId)) {
        return;
    }
    
    let rootNode: Node = parse(editor.document.getText());

    let newSelections: vscode.Selection[] = [];
    editor.selections.forEach(selection => {
        let range = getRangeToBalance(editor.document, selection, rootNode);
        if (range) {
            newSelections.push(range);
        } 
    });

    editor.selection = newSelections[0];
    editor.selections = newSelections;
}

function getRangeToBalance(document: vscode.TextDocument, selection: vscode.Selection, rootNode: Node): vscode.Selection {
    let offset = document.offsetAt(selection.start);
    let nodeToBalance = getNode(rootNode, offset);

    let innerSelection = getNodeInnerSelection(document, nodeToBalance);
    let outerSelection = getNodeOuterSelection(document, nodeToBalance);

    if (innerSelection.contains(selection) && !innerSelection.isEqual(selection)){
        return innerSelection;
    }
    if (outerSelection.contains(selection) && !outerSelection.isEqual(selection)){
        return outerSelection;
    }
    return;
}


