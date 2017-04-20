'use strict';

import * as vscode from 'vscode';
import { expand, createSnippetsRegistry } from '@emmetio/expand-abbreviation'
import * as extract from '@emmetio/extract-abbreviation';
import { getSyntax, isStyleSheet } from './util';

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
            syntax: getSyntax(document)
        });

        let completionitem = new vscode.CompletionItem(wordToExpand);
        completionitem.insertText = new vscode.SnippetString(expandedWord);
        completionitem.documentation = expandedWord.replace(/\$\{\d+\}/g, '').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
        completionitem.range = rangeToReplace;
        completionitem.kind = vscode.CompletionItemKind.Snippet;

        let snippetCompletionItems = getSnippetCompletions(getSyntax(document), getCurrentWord(document, position));
        return Promise.resolve(new vscode.CompletionList([completionitem, ...snippetCompletionItems], true));
    }
}

function getWordAndRangeToReplace(position: vscode.Position): [vscode.Range, string] {
    let editor = vscode.window.activeTextEditor;
    let currentLine = editor.document.lineAt(position.line).text;
    let result = extract(currentLine, position.character, true);
    let rangeToReplace = new vscode.Range(position.line, result.location, position.line, result.location + result.abbreviation.length);

    return [rangeToReplace, result.abbreviation];
}

function getCurrentWord(document: vscode.TextDocument, position: vscode.Position): string {
    let wordAtPosition = document.getWordRangeAtPosition(position);
    let currentWord = '';
    if (wordAtPosition && wordAtPosition.start.character < position.character) {
        let word = document.getText(wordAtPosition);
        currentWord = word.substr(0, position.character - wordAtPosition.start.character);
    }
    return currentWord;
}

function getSnippetCompletions(syntax, prefix) {
    if (!prefix || isStyleSheet(syntax)) {
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



