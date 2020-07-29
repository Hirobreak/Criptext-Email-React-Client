import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SingleLoading, statusType } from './Loading';
import { startImportEmails } from '../utils/ipc';
import { showOpenFileDialog } from '../utils/electronInterface';
import {
  addEvent,
  removeEvent,
  Event
} from '../utils/electronEventInterface';
import './importmailbox.scss'

const STEP = {
  SELECT: 'select',
  MBOX: 'mbox',
  IMPORT: 'import'
}

class ImportMailboxWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: STEP.SELECT,
      totalEmails: 0,
      parsedEmails: 0,
      lastEmail: undefined,
      error: undefined,
      interrupted: true
    };
  }

  componentDidMount() {
    addEvent(Event.IMPORT_PROGRESS, this.handleProgress);
  }

  componentWillUnmount() {
    removeEvent(Event.IMPORT_PROGRESS, this.handleProgress);
  }

  render() {
    return (<div className="settings-import-container">
      {this.renderStep()}
      { this.state.error && 
        (<div>
          <h5>Error Found:</h5>
          <span>{this.state.error} : interrupted => {this.state.interrupted}</span>
        </div>)
      }
    </div>)
  }

  renderStep = () => {
    switch(this.state.step) {
      case STEP.IMPORT: 
        return (
          <div className="import-step-container">
            <h4>Importing Emails</h4>
            <SingleLoading 
              percent={parseInt(100 * this.state.parsedEmails / this.state.totalEmails)}
              animationClass={statusType.ACTIVE}
            />
            <div>
              <span>This may take a while... {this.state.parsedEmails}</span> / <span>{this.state.totalEmails}</span>
            </div>
            { this.state.lastEmail && 
              (<div>
                <span>Last Parsed : {this.state.lastEmail}</span>
              </div>)
            }
          </div>
        );
      case STEP.MBOX: 
        return (
          <div className="import-step-container">
            <h4>Extracting File</h4>
            <SingleLoading 
              percent={100}
              animationClass={statusType.RUNNING}
            />
            <div>
              <span>Reading your MBOX file</span>
            </div>
            <div>
              <span>This may take a while...</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="import-step-container">
            <h4>Import Mailbox</h4>
            <div><span>Please select a .mbox file to import your emails.</span></div>
            <button onClick={this.handleSelectFile}>
              Select Mbox File
            </button>
          </div>
        );
    }
  }

  handleProgress = data => {
    switch(data.type) {
      case 'import':
        this.setState({
          totalEmails: data.totalEmails,
          step: STEP.IMPORT
        })
        break;
      case 'progress':
        this.setState({
          totalEmails: data.totalEmails,
          parsedEmails: data.parsedEmails,
          lastEmail: data.lastEmail,
          step: STEP.IMPORT
        })
        break;
      case 'error': 
        this.setState({
          error: data.error,
          interrupted: data.interrupted
        })
      default:
        break;
    }
  }

  handleSelectFile = async () => {
    const { filePaths } = await showOpenFileDialog();
    if (!filePaths[0]) {
      this.setState({
        error: 'Please select a .mbox file to continue'
      })
      return;
    }
    startImportEmails(filePaths[0]);
    this.setState({
      step: STEP.MBOX
    })
  }
}

ImportMailboxWrapper.propTypes = {
  onChangePanel: PropTypes.func,
};

export default ImportMailboxWrapper;
