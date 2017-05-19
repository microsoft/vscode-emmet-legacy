'use strict';

import * as vscode from 'vscode';
import { getNode, isStyleSheet } from './util';
import parse from '@emmetio/html-matcher';
import Node from '@emmetio/node';

export function toggleComment() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    if (isStyleSheet(editor.document.languageId)) {
        return;
    }

    let rootNode: Node = parse(editor.document.getText());
    let rangesToUpdate = [];

    editor.edit(editBuilder => {
        editor.selections.reverse().forEach(selection => {
            let [rangesToUnComment, positionForCommentStart, positionForCommentEnd] = getRangesToUpdate(editor, selection, rootNode);
            rangesToUnComment.forEach(rangeToDelete => {
                editBuilder.delete(rangeToDelete);
            });
            if (positionForCommentStart) {
                editBuilder.insert(positionForCommentStart, '<!--');
            }
            if (positionForCommentEnd) {
                editBuilder.insert(positionForCommentEnd, '-->');
            }
        });
    });
}

function getRangesToUpdate(editor: vscode.TextEditor, selection: vscode.Selection, rootNode: Node): [vscode.Range[], vscode.Position, vscode.Position] {
    let offset = editor.document.offsetAt(selection.start);
    let nodeToUpdate = getNode(rootNode, offset);

    let commentNode = nodeToUpdate.type !== 'comment';
    let rangesToUnComment = unComment(nodeToUpdate, editor.document);
    let positionForCommentStart = commentNode ? editor.document.positionAt(nodeToUpdate.start) : null;
    let positionForCommentEnd = commentNode ? editor.document.positionAt(nodeToUpdate.end) : null;

    return [rangesToUnComment, positionForCommentStart, positionForCommentEnd];
}

function unComment(node: Node, document: vscode.TextDocument): vscode.Range[] {
    let rangesToUnComment = [];
    if (node.type === 'comment') {
        rangesToUnComment.push(new vscode.Range(document.positionAt(node.start), document.positionAt(node.start + 4)));
        rangesToUnComment.push(new vscode.Range(document.positionAt(node.end), document.positionAt(node.end - 3)));
    }
    node.children.forEach(childNode => {        
        rangesToUnComment = rangesToUnComment.concat(unComment(childNode, document));
    });
    return rangesToUnComment;
}


