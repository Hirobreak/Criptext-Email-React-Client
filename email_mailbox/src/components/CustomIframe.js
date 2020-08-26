import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CustomIframe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0
    };
    this.iframe = undefined;
  }

  render() {
    return (
      <iframe width="100%" frameBorder="0" height={this.state.height} onLoad={this.updateFrameHeight} ref={ r => { this.iframe = r; }} srcDoc={this.props.content}>

      </iframe>
    );
  }

  componentDidMount() {
    this.updateFrameHeight()
  }

  componentDidUpdate(){
    this.updateFrameHeight()
  }

  updateFrameHeight = () => {
    if (this.iframe && this.iframe.contentWindow && this.iframe.contentWindow.document.documentElement) {
      const height = this.iframe.contentWindow.document.documentElement.scrollHeight;
      if (height !== this.state.height) {
        this.setState({
          height
        })
      }
    }
  }
}

CustomIframe.propTypes = {
  content: PropTypes.string
};

export default CustomIframe;
