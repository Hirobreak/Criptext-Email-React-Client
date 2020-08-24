import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './settingaliasblock.scss';

const localize = string.settings.import_mailbox;

const ImportMailboxBlock = props => (
  <div id="settings-account-domains" className="cptx-section-item">
    <span className="cptx-section-item-title">{localize.title}</span>
    <span className="cptx-section-item-description">
      {localize.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => {
          props.onChangePanel('import-mailbox');
        }}
      >
        <span>{localize.import}</span>
      </button>
    </div>
  </div>
);

ImportMailboxBlock.propTypes = {
  onChangePanel: PropTypes.func
};

export default ImportMailboxBlock;
