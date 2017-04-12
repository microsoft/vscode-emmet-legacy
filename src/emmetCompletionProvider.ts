'use strict';

import * as vscode from 'vscode';
import { expand, createSnippetsRegistry } from '@emmetio/expand-abbreviation'
import * as extract from '@emmetio/extract-abbreviation';
import * as path from 'path';
import * as fs from 'fs';

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;
const snippetCompletionsCache = new Map<string, vscode.CompletionItem[]>();

export class EmmetCompletionItemProvider implements vscode.CompletionItemProvider {

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionList> {
        if (!vscode.workspace.getConfiguration('emmet')['autocomplete']) {
            return Promise.resolve(new vscode.CompletionList([]));
        }
        let [rangeToReplace, wordToExpand] = getWordAndRangeToReplace(position);
        let expandedWord = expand(wordToExpand, {
            field: field,
            syntax: document.languageId
        });

        let completionitem = new vscode.CompletionItem(wordToExpand);
        completionitem.insertText = new vscode.SnippetString(expandedWord);
        completionitem.documentation = expandedWord.replace(/\$\{\d+\}/g, '').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
        completionitem.range = rangeToReplace;

        return Promise.resolve(new vscode.CompletionList([completionitem], true));
    }
}

export class EmmetSnippetCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        if (!vscode.workspace.getConfiguration('emmet')['autocomplete']) {
            return Promise.resolve([]);
        }

        // get current word
        let wordAtPosition = document.getWordRangeAtPosition(position);
        let currentWord = '';
        if (wordAtPosition && wordAtPosition.start.character < position.character) {
            let word = document.getText(wordAtPosition);
            currentWord = word.substr(0, position.character - wordAtPosition.start.character);
        }

        let allItems = getSnippetCompletions(document.languageId, currentWord);
        return Promise.resolve(allItems);
    }
}

function getWordAndRangeToReplace(position: vscode.Position): [vscode.Range, string] {
    let editor = vscode.window.activeTextEditor;
    let currentLine = editor.document.lineAt(position.line).text;
    let lineTillCursor = currentLine.substr(0, position.character);
    let result = extract(lineTillCursor);
    let rangeToReplace = new vscode.Range(position.line, result.location, position.line, position.character);

    return [rangeToReplace, result.abbreviation];
}

function getSnippetCompletions(syntax, prefix) {
    if (!prefix) {
        return [];
    }

    if (!snippetCompletionsCache.has(syntax)) {
        let registry = createSnippetsRegistry(syntax);
        let completions: vscode.CompletionItem[] = registry.all({ type: 'string' }).map(snippet => {
            let expandedWord = expand(snippet.value, {
                field: field,
                syntax: syntax
            });

            let item = new vscode.CompletionItem(snippet.key);
            item.detail = expandedWord;
            item.insertText = snippet.key;
            return item;
        });
        snippetCompletionsCache.set(syntax, completions);
    }

    let snippetCompletions = snippetCompletionsCache.get(syntax);

    snippetCompletions = snippetCompletions.filter(x => x.label.startsWith(prefix));

    return snippetCompletions;

}