'use strict';

import * as vscode from 'vscode';
import { expand, createSnippetsRegistry } from '@emmetio/expand-abbreviation'
import { getSyntax, isStyleSheet, getProfile, extractAbbreviation } from './util';

const field = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;
const snippetCompletionsCache = new Map<string, vscode.CompletionItem[]>();

export class EmmetCompletionItemProvider implements vscode.CompletionItemProvider {

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionList> {

        let expandedAbbr = getExpandedAbbreviation(document, position);
        let abbreviationSuggestions = getAbbreviationSuggestions(getSyntax(document), getCurrentWord(document, position));
        let completionItems = expandedAbbr ? [expandedAbbr, ...abbreviationSuggestions] : abbreviationSuggestions;

        return Promise.resolve(new vscode.CompletionList(completionItems, true));
    }
}

function getExpandedAbbreviation(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem {
    if (!vscode.workspace.getConfiguration('emmet')['suggestExpandedAbbreviation']) {
        return;
    }
    let [rangeToReplace, wordToExpand] = extractAbbreviation(position);
    if (!rangeToReplace || !wordToExpand) {
        return;
    }
    let expandedWord = expand(wordToExpand, {
        field: field,
        syntax: getSyntax(document),
        profile: getProfile(getSyntax(document))
    });

    let completionitem = new vscode.CompletionItem(wordToExpand);
    completionitem.insertText = new vscode.SnippetString(expandedWord);
    completionitem.documentation = removeTabStops(expandedWord);
    completionitem.range = rangeToReplace;

    return completionitem;
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

function removeTabStops(expandedWord: string): string {
    return expandedWord.replace(/\$\{\d+\}/g, '').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
}
function getAbbreviationSuggestions(syntax, prefix) {
    if (!vscode.workspace.getConfiguration('emmet')['suggestAbbreviations'] || !prefix || isStyleSheet(syntax)) {
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
            item.detail = removeTabStops(expandedWord);
            item.insertText = snippet.key;
            return item;
        });
        snippetCompletionsCache.set(syntax, completions);
    }

    let snippetCompletions = snippetCompletionsCache.get(syntax);

    snippetCompletions = snippetCompletions.filter(x => x.label.startsWith(prefix));

    return snippetCompletions;

}



