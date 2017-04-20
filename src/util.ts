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

export function getProfile(syntax: string): any {
    let config = vscode.workspace.getConfiguration('emmet')['syntaxProfiles'] || {};
    let options = config[syntax];
    if (!options || typeof options === 'string') {
        return {}
    }
    let newOptions = {};
    for (let key in options) {
        switch (key) {
            case 'tag_case':
                newOptions['tagCase'] = (options[key] === 'lower' || options[key] === 'upper') ? options[key] : '';
                break;
            case 'attr_case':
                newOptions['attributeCase'] = (options[key] === 'lower' || options[key] === 'upper') ? options[key] : '';
                break;
            case 'attr_quotes':
                newOptions['attributeQuotes'] = options[key];
                break;
            case 'tag_nl':
                newOptions['format'] = (options[key] === 'true' || options[key] === 'false') ? options[key] : 'true';
                break;
            case 'indent':
                newOptions['attrCase'] = (options[key] === 'true' || options[key] === 'false') ? '\t' : options[key];
                break;
            case 'inline_break':
                newOptions['inlineBreak'] = options[key];
                break;
            case 'self_closing_tag':
                if (options[key] === true) {
                    newOptions['selfClosingStyle'] = 'xml'; break;
                }
                if (options[key] === false) {
                    newOptions['selfClosingStyle'] = 'html'; break
                }
                newOptions['selfClosingStyle'] = options[key];
                break;
            default:
                newOptions[key] = options[key];
                break;
        }
    }
    return newOptions;
}