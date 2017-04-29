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
    if (data.isMod && this.props.keys.includes(data.key)) {
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
    applyTransformation() {
      return this.props.state
        .transform()
        .toggleMark(type)
        .apply();
    }

    handleFire = (event) => {
      event.preventDefault();
      return this.applyTransformation();
    }

    render() {
      return (
        <HotKey
          key="hotkey"
          keys={[key]}
          onFire={this.handleFire}
          {...this.props}
        />
      );
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
        <Toolbar.Button
          key="button"
          onMouseDown={this.handleClick}
        >
          {this.hasMark() && 'un-'}{key}
        </Toolbar.Button>
      ];
    }
  };
```
