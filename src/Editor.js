import React from 'react';
import { Editor as SlateEditor } from 'slate';

import Stack from './Stack';

const noop = () => {};

export const Core = ({ plugins, ...editorProps }) =>
  <SlateEditor {...editorProps} />;

const Editor = ({ plugins, ...props }) =>
  <Stack
    plugins={[
      ...plugins,
      Core,
    ]}
    // list out all of the extendible props here
    onKeyDown={noop}
    {...props}
  />;

Editor.Plugin = ({ renderNext, ...props }) =>
  renderNext(props);

export default Editor;
