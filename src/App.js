import React from 'react';
import Portal from 'react-portal';
import { Provider as SlotProvider, Slot, Fill } from 'react-slot-fill';
import { Plain } from 'slate';

import Editor from './Editor';
import './App.css';

const EditorChromePlugin = (toolbarLabel) => (props) =>
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

const HoverMenuPlugin = () => HoverMenu;

const KeyLoggerPlugin = () =>
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

class HotKey extends React.Component {
  handleKeyDown = (event, data) => {
    if (data.isMod && this.props.keys.includes(data.key)) {
      return this.props.onFire(event, data);
    }
    return this.props.onKeyDown(event, data);
  }

  render() {
    return (
      <Editor.Plugin
        {...this.props}
        onKeyDown={this.handleKeyDown}
      />
    );
  }
};

const HotKeyMarkPlugin = ({ key, type }) =>
  class HotKeyMark extends React.Component {
    applyTransformation() {
      return this.props.state
        .transform()
        .toggleMark(type)
        .apply();
    }

    hasMark() {
      const { state } = this.props;
      return state.marks.some(mark => mark.type === type);
    }

    handleFire = (event) => {
      event.preventDefault();
      return this.applyTransformation();
    }

    handleClick = (event) => {
      event.preventDefault();
      const newState = this.applyTransformation();
      this.props.onChange(newState);
    }

    render() {
      return [
        <HotKey
          key="hotkey"
          keys={[key]}
          onFire={this.handleFire}
          {...this.props}
        />,
        <HoverMenu.Button
          key="button"
          onMouseDown={this.handleClick}
        >
          {this.hasMark() && 'un-'}{key}
        </HoverMenu.Button>
      ];
    }
  };

const schema = {
  marks: {
    bold: ({ children }) => <strong>{children}</strong>,
  },
};

class App extends React.Component {
  state = {
    editorState: Plain.deserialize(''),
  };

  constructor(props) {
    super(props);
    this.plugins = this.getPlugins();
  }

  getPlugins() {
    return [
      EditorChromePlugin('Toolbar'),
      HoverMenuPlugin(),
      KeyLoggerPlugin(),
      DisableKeyPlugin(['e']),
      HotKeyMarkPlugin({ key: 'b', type: 'bold' }),
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
          className="DemoEditor"
          schema={schema}
          plugins={this.plugins}
          state={this.state.editorState}
          onChange={this.handleChange}
        />
      </SlotProvider>
    );
  }
}

export default App;
