/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import SettingImportEmails from './SettingImportEmails';
import SettingImportFile from './SettingImportFile';
import SettingImportingFile from './SettingImportingFile';
import {startImport, storeImportedEmails, cancelImport} from '../utils/ipc'
import { defineImportTime } from '../utils/TimeUtils'
import { myAccount } from '../utils/electronInterface';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';

const STAGE = {
  IMPORT_FILE: 'import-file',
  PARSING_FILE: 'parsing-file',
  IMPORT_SETUP: 'import-setup',
  IMPORTING: 'importing',
}

class SettingImportEmailsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      importAll: true,
      labelToAll: false,
      labels: [],
      totalEmails: 0,
      labelName: defineImportTime(Date.now()),
      startDate: null,
      endDate: null,
      stage: STAGE.IMPORT_FILE,
      filePath: null,
      parseProgress: 0,
      storeProgress: 0
    };
  }

  render() {
    return this.renderSection();
  }

  componentDidMount() {
    this.initImportListeners();
  }

  componentWillUnmount() {
    this.removeEventHandlers()
  }

  renderSection = () => {
    switch(this.state.stage) {
      case STAGE.IMPORT_FILE: 
        return <SettingImportFile
          onDrop={this.handleDrop}
        />
      case STAGE.PARSING_FILE:
        return <SettingImportingFile
          message={'Retrieving emails from file, please wait until it\'s finished...'}
          progress={(this.state.parseProgress/50) %  100}
        />
      case STAGE.IMPORT_SETUP: 
        return (
          <SettingImportEmails
            importAll={this.state.importAll}
            labelToAll={this.state.labelToAll}
            labelName={this.state.labelName}
            onChangeSwitchImportAll={this.toggleImportAll}
            onChangeSwitchLabelToAll={this.toggleLabelToAll}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            onChangeStartDate={this.changeStartDate}
            onChangeEndDate={this.changeEndDate}
            onChangeLabelInput={this.changeLabelInput}
            onMailboxSelect={this.handleMailboxSelect}
            onLabelSelect={this.handleLabelSelect}
            onReset={this.handleReset}
            labels={this.state.labels}
            customLabels={this.props.customLabels}
            systemLabels={this.props.systemLabels}
            onImport={this.handleStartImport}
            onCancel={this.handleCancelImport}
          />
        );
      case STAGE.IMPORTING:
        return <SettingImportingFile
          message={'Storing your emails, please wait until it\'s finished...'}
          progress={100 * this.state.storeProgress / this.state.totalEmails}
        />
      default: 
        return null;
    }
  }

  handleDrop = async ev => {
    ev.preventDefault();
    const file = ev.target.files[0];
    if (!file) {
      return;
    }
    this.setState({
      stage: STAGE.PARSING_FILE
    }, async () => {
      const response = await startImport(file.path)
      const myLabels = response.labels.map( (label) => {
        return {
          text: label,
          mappedMailboxId: 0,
          mappedLabelId: 0
        }
      })
      this.setState({
        stage: STAGE.IMPORT_SETUP,
        labels: myLabels,
        totalEmails: response.count
      })
    })
  }

  handleMailboxSelect = (index, id) => {
    const newLabel = {
      ...this.state.labels[index],
      mappedMailboxId: id
    }
    this.setState({
      labels: Object.assign([...this.state.labels], {[index]: newLabel})
    })
  }

  handleLabelSelect = (index, id) => {
    const newLabel = {
      ...this.state.labels[index],
      mappedLabelId: id
    }
    this.setState({
      labels: Object.assign([...this.state.labels], {[index]: newLabel})
    })
  }

  handleReset = () => {
    const newLabels = this.state.labels.map( label => {
      return {
        ...label,
        mappedMailboxId: 0,
        mappedLabelId: 0
      }
    })
    this.setState({
      labels: newLabels
    })
  }

  handleStartImport = () => {
    const data = {
      username: myAccount.recipientId.includes('@') ? myAccount.recipientId : `${myAccount.recipientId}@jigl.com`,
      labels: [ ...this.state.labels ],
      startDate: this.state.importAll ? null : this.state.startDate,
      endDate: this.state.importAll ? null : this.state.endDate,
      labelName: this.state.labelToAll ? this.state.labelName : null
    }

    storeImportedEmails(data)
    this.setState({
      stage: STAGE.IMPORTING
    })
  }
  
  handleCancelImport = () => {
    this.setState( {
      stage: STAGE.IMPORT_FILE
    })

    cancelImport();
  }

  toggleImportAll = () => {
    this.setState({
      importAll: !this.state.importAll
    })
  }

  toggleLabelToAll = () => {
    this.setState({
      labelToAll: !this.state.labelToAll
    })
  }

  changeStartDate = date => {
    this.setState({
      startDate: date
    })
  }

  changeEndDate = date => {
    this.setState({
      endDate: date
    })
  }

  changeLabelInput = ev => {
    const labelName = ev.target.value;
    this.setState({
      labelName
    })
  }

  initImportListeners = () => {
    addEvent(
      Event.IMPORT_FILE,
      this.importFileProgress
    );
    addEvent(
      Event.IMPORT_EMAILS,
      this.importEmailsProgress
    );
  };

  removeEventHandlers = () => {
    removeEvent(
      Event.IMPORT_FILE,
      this.importFileProgress
    );
    removeEvent(
      Event.IMPORT_EMAILS,
      this.importEmailsProgress
    );
  };

  importFileProgress = progress => {
    this.setState({
      parseProgress: progress
    })
  }

  importEmailsProgress = progress => {
    const myStage = progress === this.totalEmails && this.state.stage === STAGE.IMPORTING ? STAGE.IMPORT_FILE : this.state.stage
    this.setState({
      storeProgress: progress,
      stage: myStage
    })
  }
}

SettingImportEmailsWrapper.propTypes = {
};

export default SettingImportEmailsWrapper;