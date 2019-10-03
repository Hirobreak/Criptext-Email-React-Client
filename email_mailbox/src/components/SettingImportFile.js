/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import './settingimportemails.scss';

const SettingImportFile = props => (
  <div className='cptx-setting-import-file'>
    <div>
      <p>
        Download your emails from your email client and import them into Criptext
      </p>
      <div class="upload-btn-wrapper">
        <button class="button-a-circle">Upload a file</button>
        <input type="file" name="myfile" onChange={props.onDrop}/>
      </div>
    </div>
  </div>
);


export default SettingImportFile;