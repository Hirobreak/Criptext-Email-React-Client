import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChangeSecurityPinPopup from './ChangeSecurityPinPopup';

const STEP = {
  INPUT_NEW_PIN: 'input-new-pin',
  RECOVERY_KEY: 'recovery_key',
  DONE: 'done'
}

class ChangeSecurityPinWrapperPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputPin: undefined,
      step: STEP.INPUT_NEW_PIN,
      recoveryKey: undefined
    };
  }

  render() {
    switch(this.state.step) {
      case STEP.INPUT_NEW_PIN:
        return <ChangeSecurityPinPopup
          onClickSetPin={this.handleSetPin}
        />;
      case STEP.RECOVERY_KEY:
        return <div></div>;
      case STEP.DONE:
        return <div></div>;
    }
  }

  handleSetPin = pin => {
    this.setState({
      inputPin: pin,
      step: STEP.RECOVERY_KEY
    })
  }
}

export default ChangeSecurityPinWrapperPopup;