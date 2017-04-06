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

function getProfile(syntax: string): any {
    let profiles = vscode.workspace.getConfiguration('emmet')['syntaxProfiles'];
    return profiles ? profiles[syntax] : null;
}

function getSnippets(): any {
    return getEmmetCustomization('snippets.json');
}

function getEmmetCustomization(fileName: string): any {
    let extPath = vscode.workspace.getConfiguration('emmet')['extensionsPath'];
    if (!extPath || !extPath.trim()) {
        return;
    }

    let dirPath = path.isAbsolute(extPath) ? extPath : path.join(vscode.workspace.rootPath, extPath);
    let filePath = path.join(dirPath, fileName);
    if (!fileExists(filePath)) {
        return;
    }

    let buffer = fs.readFileSync(filePath);
    let parsedData = {};
    try {
        parsedData = JSON.parse(buffer.toString());
    } catch (err) {
        vscode.window.showErrorMessage(`Error while parsing "${filePath}": ${err}`);
    }
    return parsedData;
}

function fileExists(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isFile();
    } catch (e) {
        return false;
    }
}

function dirExists(dirPath: string): boolean {
    try {
        return fs.statSync(dirPath).isDirectory();
    } catch (e) {
        return false;
    }
}