import { Extension } from '@tiptap/core';

export interface IndentOptions {
  types: string[];
  indentLevels: number[];
  defaultIndentLevel: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Set the indent attribute
       */
      indent: () => ReturnType;
      /**
       * Unset the indent attribute
       */
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      indentLevels: [0, 24, 48, 72, 96, 120, 144, 168, 192, 216],
      defaultIndentLevel: 0,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,
            parseHTML: element => {
              const paddingLeft = element.style.paddingLeft;
              if (paddingLeft) {
                const value = parseInt(paddingLeft, 10);
                if (!isNaN(value)) {
                  return value;
                }
              }
              return this.options.defaultIndentLevel;
            },
            renderHTML: attributes => {
              if (attributes.indent === this.options.defaultIndentLevel) {
                return {};
              }

              return {
                style: `padding-left: ${attributes.indent}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch, editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.sinkListItem('listItem');
        }

        const { selection } = state;
        tr = tr.setSelection(selection);
        
        // This is a naive implementation that applies to the selection block.
        // For a more robust implementation, one would use Tiptap's updateAttributes or similar.
        let changed = false;
        
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const currentIndex = this.options.indentLevels.indexOf(currentIndent);
            const nextIndex = Math.min(currentIndex === -1 ? 0 : currentIndex + 1, this.options.indentLevels.length - 1);
            const nextIndent = this.options.indentLevels[nextIndex];
            
            if (currentIndent !== nextIndent) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: nextIndent,
              });
              changed = true;
            }
          }
        });

        if (changed && dispatch) {
          dispatch(tr);
          return true;
        }

        return changed;
      },
      outdent: () => ({ tr, state, dispatch, editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.liftListItem('listItem');
        }

        const { selection } = state;
        tr = tr.setSelection(selection);
        
        let changed = false;
        
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            const currentIndex = this.options.indentLevels.indexOf(currentIndent);
            const nextIndex = Math.max((currentIndex === -1 ? 0 : currentIndex) - 1, 0);
            const nextIndent = this.options.indentLevels[nextIndex];
            
            if (currentIndent !== nextIndent) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: nextIndent,
              });
              changed = true;
            }
          }
        });

        if (changed && dispatch) {
          dispatch(tr);
          return true;
        }

        return changed;
      },
    };
  },
  
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    };
  },
});
