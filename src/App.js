import React from 'react';
import Portal from 'react-portal';
import { Provider as SlotProvider, Slot, Fill } from 'react-slot-fill';

import Editor from './Editor';

const EditorChrome = (toolbarLabel) => (props) =>
  <div>
    <span>{toolbarLabel}</span>
    <Editor.Plugin {...props} />
  </div>

const HoverMenu = (props) => [
  <Editor.Plugin key="HoverMenu-plugin" {...props} />,
  <Portal isOpened key="Plugin2-portal">
    <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <Slot name="HoverMenu.Button" />
    </div>
  </Portal>
];

HoverMenu.Button = (props) =>
  <Fill name="HoverMenu.Button">
    <button className="HoverMenuButton" {...props} />
  </Fill>;

class BoldPlugin extends React.Component {
  handleClick = (event) => {
    event.preventDefault();
    console.log('clicked');
  };

  render() {
    return [
      <Editor.Plugin key="editor" {...this.props} />,
      <HoverMenu.Button key="button" onClick={this.handleClick}>
        click me {this.props.state.endText.text}
      </HoverMenu.Button>
    ];
  }
}

class KeyLoggerPlugin extends React.Component {
  handleKeyDown = (event) => {
    console.log('KeyLoggerPlugin', event.key);
    return this.props.onKeyDown(event);
  };

  render() {
    return (
      <Editor.Plugin
        {...this.props}
        onKeyDown={this.handleKeyDown}
      />
    );
  }
}

const DisableKeyPlugin = (keys) =>
  class DisableKeyPlugin extends React.Component {
    handleKeyDown = (event) => {
      if (keys.includes(event.key)) {
        event.preventDefault();
        console.log('DisableKeyPlugin disabled key!');
        return;
      }
      return this.props.onKeyDown(event);
    };

    render() {
      return (
        <Editor.Plugin
          {...this.props}
          onKeyDown={this.handleKeyDown}
        />
      );
    }
  };

class App extends React.Component {
  state = {
    editorState: '',
  };

  constructor(props) {
    super(props);
    // XXX: if we don't cache the value of plugins over here, the
    // textarea loses focus. I'm not sure if that's actually a
    // problem in Slate where the focus is tracked in editorState.
    this.plugins = this.getPlugins();
  }

  getPlugins() {
    return [
      EditorChrome('Toolbar'),
      HoverMenu,
      KeyLoggerPlugin,
      DisableKeyPlugin(['e']),
      BoldPlugin,
    ];
  }

  handleChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render() {
    return (
      <SlotProvider>
        <Editor
          plugins={this.plugins}
          state={this.state.editorState}
          onChange={this.handleChange}
        />
      </SlotProvider>
    );
  }
}

export default App;
