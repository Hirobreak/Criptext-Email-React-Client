import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PopupHOC from './PopupHOC';
import LogoutPopup from './LogoutPopup';
import Message from '../containers/Message';
import './settings.scss';

const Logoutpopup = PopupHOC(LogoutPopup);

const renderPathSection = titles => {
  return titles.reduce((result, title, index) => {
    if (!result.length) {
      return [...result, <h1 key={index}>{title}</h1>];
    }
    return [
      ...result,
      <i key={`i-${index}`} className="icon-arrow-right" />,
      <h1 key={index}>{title}</h1>
    ];
  }, []);
};

const SettingsHOC = InComponent =>
  class Popup extends Component {
    static propTypes = {
      titlePath: PropTypes.array,
      isHiddenSettingsPopup: PropTypes.bool,
      onClosePopup: PropTypes.func,
      onConfirmLogout: PropTypes.func
    };

    render() {
      return (
        <div className="settings-container">
          <Message onClickSection={() => {}} />
          <div className="settings-title">
            {renderPathSection(this.props.titlePath)}
          </div>
          <InComponent {...this.props} />
          <Logoutpopup
            isHidden={this.props.isHiddenSettingsPopup}
            onConfirmLogout={this.props.onConfirmLogout}
            onTogglePopup={this.props.onClosePopup}
            popupPosition={{ left: '45%', top: '45%' }}
            theme={'dark'}
          />
        </div>
      );
    }
  };

export default SettingsHOC;
