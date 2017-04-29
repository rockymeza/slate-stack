import React from 'react';
import { pick } from 'ramda';

class Stack extends React.Component {
  filterProps(props) {
    const whitelist = ['key'].concat(Object.keys(this.props));
    return pick(whitelist, props);
  }

  getRenderNext = queue => (props) => {
    const [Next, ...tail] = queue;
    const nextProps = this.filterProps(props);
    if (tail.length >= 1) {
      nextProps.renderNext = this.getRenderNext(tail);
    }

    return <Next {...nextProps} />;
  };

  render() {
    const renderNext = this.getRenderNext(this.props.plugins);
    return renderNext(this.props);
  }
}

export default Stack;
