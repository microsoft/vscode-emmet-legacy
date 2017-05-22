'use strict';
import * as vscode from 'vscode';
import { validate, getNode } from './util';
import Node from '@emmetio/node';
import parse from '@emmetio/html-matcher';

export function fetchSelectItem(direction: string): void {
    let editor = vscode.window.activeTextEditor;
    if (!validate()) {
        return;
    }
    let rootNode: Node = parse(editor.document.getText());
    let newSelections: vscode.Selection[] = [];
    editor.selections.forEach(selection => {
        let updatedSelection = direction === 'next' ? nextItem(selection.active, editor, rootNode) : prevItem(selection.active, editor, rootNode);
        newSelections.push(updatedSelection ? updatedSelection : selection);
    });
    editor.selections = newSelections;
}

function nextItem(position: vscode.Position, editor: vscode.TextEditor, rootNode: Node): vscode.Selection {
    let offset = editor.document.offsetAt(position);
    let currentNode = getNode(rootNode, offset);

    // Cursor is in the open tag
    if (offset < currentNode.open.end) {
        // TODO: Check attributes
    }

    // Get the first child of current node which is right after the cursor
    let nextNode = currentNode.firstChild;
    while (nextNode && nextNode.start < offset) {
        nextNode = nextNode.nextSibling;
    }

    // Get next sibling of current node or the parent
    while (!nextNode && currentNode) {
        nextNode = currentNode.nextSibling;
        currentNode = currentNode.parent;
    }

    return getSelectionFromNode(nextNode, editor.document);
}

function prevItem(position: vscode.Position, editor: vscode.TextEditor, rootNode: Node): vscode.Selection {
    let offset = editor.document.offsetAt(position);
    let currentNode = getNode(rootNode, offset);
    let prevNode: Node;

    // Cursor is in the open tag after the tag name
    if (offset > currentNode.open.start + currentNode.name.length + 1 && offset <= currentNode.open.end) {
        // TODO: Check attributes
        return getSelectionFromNode(currentNode, editor.document);
    }

    // Cursor is inside the tag
    if (offset > currentNode.open.end) {
        if (!currentNode.firstChild) {
            // No children, so current node should be selected
            prevNode = currentNode
        } else {
            // Select the child that appears just before the cursor
            prevNode = currentNode.firstChild;
            while (prevNode.nextSibling && prevNode.nextSibling.end < offset) {
                prevNode = prevNode.nextSibling;
            }
        }
    }

    if (!prevNode && currentNode.previousSibling) {
        let prevSiblingChildren = (currentNode.previousSibling && currentNode.previousSibling.children) ? currentNode.previousSibling.children : [];
        prevNode = prevSiblingChildren.length > 0 ? prevSiblingChildren[prevSiblingChildren.length - 1] : currentNode.previousSibling;
    }

    if (!prevNode && currentNode.parent) {
        prevNode = currentNode.parent;
    }

    return getSelectionFromNode(prevNode, editor.document);
}

function getSelectionFromNode(node: Node, document: vscode.TextDocument): vscode.Selection {
    if (node && node.open) {
        let selectionStart = document.positionAt(node.open.start + 1);
        let selectionEnd = node.type === 'comment' ? document.positionAt(node.open.end - 1) : selectionStart.translate(0, node.name.length);

        return new vscode.Selection(selectionStart, selectionEnd);
    }
}