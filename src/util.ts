'use strict';

import * as vscode from 'vscode';

export function getSyntax(document: vscode.TextDocument): string {
    if (document.languageId === 'jade') {
        return 'pug';
    }
    if (document.languageId === 'javascriptreact' || document.languageId === 'typescriptreact') {
        return 'jsx';
    }
    return document.languageId;
}

export function isStyleSheet(syntax): boolean {
    let stylesheetSyntaxes = ['css', 'scss', 'sass', 'less', 'stylus'];
    return (stylesheetSyntaxes.indexOf(syntax) > -1);
}