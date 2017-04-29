# Slate Stack

Experimenting on how to make [Slate](http://slatejs.org) plugins easier to
write.

My main idea is that plugins should actually be written as React components
instead of plain old JavaScript objects. This would make state management a lot
easier because plugins can keep their own state through local state, but would
also have access to editor state through props.

Here's a simple hotkey plugin:

```javascript
class HotKey extends React.Component {
  handleKeyDown = (event, data) => {
    if (data.isMod && this.props.keys.include(data.key)) {
      return this.props.onFire(event, data);
    }
    return this.props.onKeyDown(event, data);
  }

  render() {
    <Editor.Plugin
      {...this.props}
      onKeyDown={this.handleKeyDown}
    />
  }
};

const HotKeyMarkPlugin = ({ key, type }) =>
  class HotKeyMark extends React.Component {
    handleFire = (event) => {
      event.preventDefault();
      const newState = state
        .transform()
        .toggleMark(type)
        .apply();
      this.props.onChange(newState);
    }

    render() {
      return <HotKey keys={[key]} onFire={this.handleFire} {...this.props} />;
    }
  };

const plugins = [
  HotKeyMarkPlugin({ key: 'b', type: 'bold' }),
  HotKeyMarkPlugin({ key: 'i', type: 'italic' }),
  HotKeyMarkPlugin({ key: 'u', type: 'underscore' }),
];

class MyEditor extends Component {
  state = {
    editorState: Plain.deserialize(''),
  };

  handleChange = (editorState) => {
    this.setState({ editorState });
  };

  render() {
    return (
      <Editor
        state={this.props.editorState}
        onChange={this.props.onChange}
        plugins={plugins}
      />
    );
  }
}
```

On top of that, I thought that it would be neat to try using
[react-slot-fill](https://github.com/camwest/react-slot-fill) to make super
extensible plugins, but I don't think it should necessarily be a core
requirement for the editor.

```javascript
const Toolbar = () =>
  <div>
    <Slot name="Toolbar.Button" />
  </div>;

Toolbar.Button = (props) =>
  <Fill name="Toolbar.Button">
    <button className="Button" {...props} />
  </Fill>;

const ToolbarPlugin = () => (props) =>
  <div>
    <Toolbar />
    <Editor.Plugin ...props />
  </div>

const MarkPlugin = ({ key, type, label }) =>
  class Mark extends React.Component {
    toggleMark() {
      const newState = this.props.state
        .transform()
        .toggleMark(type)
        .apply();

      this.props.onChange(newState);
    }

    handleFire = (event) => {
      event.preventDefault();
      this.toggleMark();
    }

    handleClick = (event) => {
      event.preventDefault();
      this.toggleMark();
    }
    
    render() {
      return [
        <HotKey key={key} onFire={this.handleFire} {...this.props />,
        <Toolbar.Button onClick={this.handleClick}>{label}</Toolbar.Button>,
      ];
    }
  }
```
