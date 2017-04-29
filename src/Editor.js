import React from 'react';

import Stack from './Stack';

const noop = () => {};

export const Core = ({ plugins, ...inputProps }) =>
  <textarea {...inputProps} />;

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
