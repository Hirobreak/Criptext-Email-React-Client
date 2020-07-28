import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { startImportEmails } from '../utils/ipc';
import { showOpenFileDialog } from '../utils/electronInterface';
import {
  addEvent,
  removeEvent,
  Event
} from '../utils/electronEventInterface';

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
    switch(this.state.step) {
      case STEP.IMPORT: 
        return (
          <div>
            <h4>Import Emails into Database</h4>
            <h5>This may take a while</h5>
            <div>
              <span>{this.state.parsedEmails}</span> / <span>{this.state.totalEmails}</span>
            </div>
            <div>
              <span>{parseInt(100 * this.state.parsedEmails / this.state.totalEmails)} %</span>
            </div>
            { this.state.lastEmail && 
              (<div>
                <span>Last Parsed : {this.state.lastEmail}</span>
              </div>)
            }
            { this.state.error && 
              (<div>
                <h5>Error Found:</h5>
                <span>{this.state.error} : interrupted => {this.state.interrupted}</span>
              </div>)
            }
          </div>
        );
      case STEP.MBOX: 
        return (
          <div>
            <div>
              Reading your MBOX file
            </div>
            <div>
              This may take a while...
            </div>
            { this.state.error && 
              (<div>
                <h5>Error Found:</h5>
                <span>{this.state.error} : interrupted => {this.state.interrupted}</span>
              </div>)
            }
          </div>
        );
      default:
        return (
          <div>
            <button onClick={this.handleSelectFile}>
              Select Mbox File
            </button>
            { this.state.error && 
              (<div>
                <h5>Error Found:</h5>
                <span>{this.state.error} : interrupted => {this.state.interrupted}</span>
              </div>)
            }
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
          lastEmail: data.lastEmail
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
