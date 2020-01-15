import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-verification-code-input';
import Button, { ButtonTypes, ButtonStatus } from './Button';
import string from './../lang';
import './changesecuritypinpopup.scss';

const page_pin_new = string.popups.security_pin.new_pin;

class ChangeSecurityPinPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      buttonState: ButtonStatus.DISABLED
    };
    this.firstPin = undefined;
    this.secondPin = undefined;
  }

  render() {
    return (
      <section>
        <div className="pin-new-content">
          <h1>{page_pin_new.title}</h1>
          <p>{page_pin_new.description}</p>
          <div className="pin-new-code">
            <div className="pin-code">
              <h2>{page_pin_new.new_pin}</h2>
              <ReactCodeInput
                autoFocus={true}
                fieldWidth={32}
                fields={4}
                onChange={value => this.handleChange(value)}
                onComplete={value => this.handleComplete(value, 1)}
                type={'text'}
              />
            </div>
            <div
              className={
                this.state.hasError
                  ? 'pin-code pin-code-status-error'
                  : 'pin-code'
              }
            >
              <h2>{page_pin_new.confirm_pin}</h2>
              <ReactCodeInput
                autoFocus={false}
                fieldWidth={32}
                fields={4}
                onChange={value => this.handleChange(value)}
                onComplete={value => this.handleComplete(value, 2)}
                type={'text'}
              />
              {this.state.hasError && (
                <span className="error">{page_pin_new.error}</span>
              )}
            </div>
          </div>
          <Button
            onClick={this.handleClickSetPin}
            state={this.state.buttonState}
            text={page_pin_new.button}
            type={ButtonTypes.PRIMARY}
          />
        </div>
      </section>
    );
  }

  handleChange = value => {
    if (value.length !== 4) {
      this.setState({ buttonState: ButtonStatus.DISABLED });
    }
  };

  handleComplete = (value, index) => {
    if (index === 1) {
      this.firstPin = value;
    } else {
      this.secondPin = value;
    }

    if (this.firstPin && this.secondPin) {
      if (this.firstPin === this.secondPin) {
        this.setState({ hasError: false, buttonState: ButtonStatus.ENABLED });
      } else {
        this.setState({ hasError: true, buttonState: ButtonStatus.DISABLED });
      }
    }
  };

  handleClickSetPin = () => {
    this.props.onClickSetPin(this.secondPin);
  };
}

ChangeSecurityPinPopup.propTypes = {
  onClickSetPin: PropTypes.func
};

export default ChangeSecurityPinPopup;