/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import string from './../lang';
import { Switch } from 'react-switch-input';
import './settingimportemails.scss';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SettingImportEmails = props => (
  <div id="setting-import-emails">
    <div className="cptx-section-block">
      <div className="cptx-section-block-title">
        <h1>{string.settings.import_emails.section}</h1>
      </div>
      <div className="cptx-section-block-content">
        <div className="cptx-section-inner-block">
          {renderImportAllSection(props)}
          {renderLabelToAllSection(props)}
          <div className="cptx-section-block-title cptx-import-from-to">
            <span><b>FROM:</b> fulanito@criptext.com</span>
            <i className="icon-next" />
            <span><b>TO:</b>menganito@criptext.com</span>
          </div>
          <div className="cptx-labels-transform">
            {renderLabelsFound(props)}
          </div>
          {renderBottomSection(props)}
        </div>
      </div>
    </div>
  </div>
);

const renderImportAllSection = props => (
  <div className="cptx-inner-section-date">
    <div className="cptx-inner-section-switch">
      <span>Import All</span>
      {renderImportSwitch(props)}
    </div>
    <div className={importSelectDateClass(props)}>
      <span className='title'>Import emails from</span>
      <DatePicker
        disabled={props.importAll}
        placeholderText="Start Date"
        selected={props.startDate}
        onChange={props.onChangeStartDate}
        selectsStart
        startDate={props.startDate}
        endDate={props.endDate}
      />
      <span className='to'>to</span>
      <DatePicker 
        disabled={props.importAll}
        placeholderText="End Date"
        selected={props.endDate}
        onChange={props.onChangeEndDate}
        selectsEnd
        startDate={props.startDate}
        endDate={props.endDate}
      />
    </div>
  </div>
)

const renderLabelToAllSection = props => (
  <div className="cptx-inner-section-date">
    <div className="cptx-inner-section-switch">
      <span>Add Label to All</span>
      {renderLabelToAllSwitch(props)}
    </div>
    <div className={addLabelToAllClass(props)}>
      <input 
        type={'text'}
        placeholder={'Add Label name'}
        disabled={!props.labelToAll}
        value={props.labelName}
        onChange={props.onChangeLabelInput}
      />
    </div>
  </div>
)

const LabelItem = ({label, index, systemLabels, customLabels, onMailboxSelect, onLabelSelect}) => (
  <div className="cptx-label-transform">
    <label>{label.text}</label>
    <i className="icon-next" />
    <div>
      {renderSystemLabelOptions(index, systemLabels, label.mappedMailboxId, onMailboxSelect)}
    </div>
    <div>
      {renderCustomLabelOptions(index, customLabels, label.mappedLabelId, onLabelSelect)}
    </div>
  </div>
);

const renderSystemLabelOptions = (index, systemLabels, selected, onMailboxSelect) => {
  const labels = systemLabels.map( (label) => {
    return <option value={label.id}>{label.text}</option>
  })

  return (<select value={selected} onChange={ev => {onMailboxSelect(index, ev.target.value)}}>
    <option value={0} disabled>Select Mailbox</option>
    {labels}
    <option value={-2}>Do not import</option>
  </select>)
}

const renderCustomLabelOptions = (index, customLabels, selected, onLabelSelect) => {
  const labels = customLabels.map( (label) => {
    return <option value={label.id}>{label.text}</option>
  })

  return (<select value={selected} onChange={ev => {onLabelSelect(index, ev.target.value)}}>
    <option value={0} disabled>Select Label</option>
    <option value={-1}>None</option>
    {labels}
  </select>)
}

const renderLabelsFound = props => {
  return props.labels.map( (label, index) => {
    return <LabelItem
      key={index}
      label={label}
      index={index}
      systemLabels={props.systemLabels} 
      customLabels={props.customLabels}
      onMailboxSelect={props.onMailboxSelect}
      onLabelSelect={props.onLabelSelect}
    />
  })
};

const renderBottomSection = props => (
  <div className="cptx-import-bottom-section">
    <div className="import-settings-reset" onClick={props.onReset}>
      <i className="icon-settings" />
      <span>Reset to Default</span>
    </div>
    <div>
      <button className="button-a" onClick={props.onCancel}>
        <span>Cancel</span>
      </button>
      <button className="button-a-circle" onClick={props.onImport}>
        <span>Import</span>
      </button>
    </div>
  </div>
)

const importSelectDateClass = props => {
  if (props.importAll) {
    return 'cptx-inner-section-select disabled';
  }
  return 'cptx-inner-section-select';
}

const addLabelToAllClass = props => {
  if (props.labelToAll) {
    return 'cptx-inner-section-select';
  }
  return 'cptx-inner-section-select disabled';
}

const renderImportSwitch = props => (
  <Switch
    theme="two"
    name="importAllSwitch"
    onChange={props.onChangeSwitchImportAll}
    checked={props.importAll}
  />
);

const renderLabelToAllSwitch = props => (
  <Switch
    theme="two"
    name="labelToAll"
    onChange={props.onChangeSwitchLabelToAll}
    checked={props.labelToAll}
  />
);

export default SettingImportEmails;