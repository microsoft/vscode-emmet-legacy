# Emmet plugin for [Visual Studio Code](https://code.visualstudio.com)

This is experimental alpha version of new Emmet plugin with limited features. 

- Expanded abbreviation show up in the suggestion list.
- Possible abbreviations show up in the sugestion list.
- Commands
    - Emmet 2.0 Expand abbreviation
        - The selected text or the text preceeding the cursor if no text is selected is taken as the abbreviation to expand.
    - Emmet 2.0 Wrap with abbreviation
        - The selected text or the current line if no text is selected, is wrapped with given abbreviation. 
    - Emmet 2.0 Remove Tag
        - The tag under the cursor is removed along with the corresponding opening/closing tag. Works with multiple cursors.
    - Emmet 2.0 Update Tag
        - The tag under the cursor is updated to the given tag. Works with multiple cursors.

![Emmet Completions](emmet.gif)


