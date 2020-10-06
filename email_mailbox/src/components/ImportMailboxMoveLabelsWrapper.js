import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import Button, { ButtonTypes } from './Button';

import './importmailboxmovelabels.scss';

class ImportMailboxMoveLabelsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelForAllEnabled: false,
      labelForAll: '',
      mailboxes: props.mailboxes,
      existingLabels: Object.keys(props.labels).map( key => props.labels[key] ),
      labelsMap: {}
    };
  }

  render() {
    return (<div className="labels-step-container"> 
      <div className="labels-step-title">
        <span>IMPORT EMAILS</span>
      </div>
      <div className="labels-step-wrapper">
        <div className="labels-step-general">
          <span>Add label to All</span>
          <Switch
            theme="two"
            name="unreadSwitch"
            onChange={this.handleToggleLabelForAll}
            checked={this.state.labelForAllEnabled}
          />
          <input type="text" value={this.state.labelForAll} onChange={this.handleChangeLabelForAll} disabled={!this.state.labelForAllEnabled}/>
        </div>
        <div className="labels-step-each">
          <div className="labels-step-each-title">
            Change destination:
          </div>
          <div className="labels-step-each-container">
            {
              this.state.mailboxes.map((mailbox, ind) => {
                return (<div key={ind} className="labels-step-each-item">
                  <span>
                    {mailbox}
                  </span>
                  <icon className="icon-arrow-right"/>
                  <select value={this.state.labelsMap[mailbox]} onChange={ ev => this.handleChangeMailboxMap(mailbox, ev.target.value) }>
                    {this.renderLabels()}
                  </select>
                </div>)
              })
            }
          </div>
        </div>
        <div className="import-button-wrapper">
          <Button onClick={this.handleStartImport} text="Import" type={ButtonTypes.PRIMARY} />
        </div>
      </div>
    </div>)
  }

  renderLabels = () => {
    const optionItems = this.state.existingLabels.map((label, index) => {
      return (
        <option key={index} value={label.id}>
          {label.text}
        </option>
      );
    })
    return [
      (<option key={-1} value={undefined}>
        Select a Mailbox/Label
      </option>),
      ...optionItems
    ]
  }

  handleToggleLabelForAll = () => {
    this.setState({
      labelForAllEnabled: !this.state.labelForAllEnabled
    })
  }

  handleChangeLabelForAll = ev => {
    const value = ev.target.value;
    this.setState({
      labelForAll: value
    })
  }

  handleChangeMailboxMap = (mailbox, labelId) => {
    this.setState({
      labelsMap: {
        ...this.state.labelsMap,
        [mailbox.toLowerCase()]: labelId ? parseInt(labelId) : undefined
      }
    })
  }

  handleStartImport = () => {
    const labelsMap = { ...this.state.labelsMap };
    Object.keys(labelsMap).forEach(key => labelsMap[key] === undefined ? delete labelsMap[key] : {});
    this.props.onImportImapEmails(this.state.labelForAll, labelsMap);
  }
}

export default ImportMailboxMoveLabelsWrapper;