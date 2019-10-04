/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import './settingimportemails.scss';

const SettingImportingFile = props => (
  <div className='cptx-setting-import-file'>
    <div>
      <span>
        {props.message}
      </span>
    </div>
    <div className="cptx-backing-up-bar">
      <div className="bar-background">
        <div
          className={`bar-progress ${defineProgressBarClass(
            props.progress
          )}`}
          style={{ width: `${props.progress}%` }}
        />
      </div>
      <span className="cptx-section-item-description bar-message">
        {props.progressMessage}
      </span>
    </div>
  </div>
);

const defineProgressBarClass = percentage => {
  return percentage === 100 ? 'bar-is-success' : 'bar-in-progress';
};

export default SettingImportingFile;