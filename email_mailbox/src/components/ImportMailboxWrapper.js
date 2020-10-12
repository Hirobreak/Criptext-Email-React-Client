import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SingleLoading, statusType } from './Loading';
import { importEmailsFromMbox, importMailboxesFromMbox, importFromImapMailboxes, importFromImapEmails } from '../utils/ipc';
import { showOpenFileDialog } from '../utils/electronInterface';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';
import './importmailbox.scss';
import ImportMailboxMoveLabelsWrapper from './ImportMailboxMoveLabelsWrapper';

const STEP = {
  SELECT: 'select',
  EXTRACTING: 'extracting',
  IMPORT: 'import',
  SUCCESS: 'success',
  LABELS: 'labels'
};

const IMPORT = {
  MBOX: 'mbox',
  IMAP: 'imap'
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
      interrupted: true,
      email: '',
      password: '',
      client: 'gmail',
      mailboxes: undefined,
      import: undefined
    };

    this.clients = ['gmail', 'outlook'];
  }

  componentDidMount() {
    addEvent(Event.IMPORT_PROGRESS, this.handleProgress);
    addEvent(Event.IMPORT_END, this.handleProcessEnd);
  }

  componentWillUnmount() {
    removeEvent(Event.IMPORT_PROGRESS, this.handleProgress);
    removeEvent(Event.IMPORT_END, this.handleProcessEnd);
  }

  render() {
    return (
      <div className="settings-import-container">
        {this.renderStep()}
      </div>
    );
  }

  renderStep = () => {
    switch (this.state.step) {
      case STEP.IMPORT:
        return (
          <div className="importing-step-container">
            <h4>Importing Emails</h4>
            <SingleLoading
              percent={parseInt(
                100 * this.state.parsedEmails / this.state.totalEmails
              )}
              animationClass={statusType.ACTIVE}
            />
            <div>
              <span>This may take a while... {this.state.parsedEmails}</span> /{' '}
              <span>{this.state.totalEmails}</span>
            </div>
          </div>
        );
      case STEP.EXTRACTING:
        return (
          <div className="extracting-step-container">
            <h4>Extracting Mailbox Data</h4>
            <SingleLoading percent={100} animationClass={statusType.RUNNING} />
            <div>
              <span>Reading your mailbox</span>
            </div>
            <div>
              <span>This may take a while...</span>
            </div>
          </div>
        );
      case STEP.SUCCESS:
        return (
          <div className="success-step-container">
            <div className="import-success-circle">
              <i className="icon-check" />
            </div>
            <div>
              <span>Mailbox Successfully Imported</span>
            </div>
          </div>
        );
      case STEP.LABELS:
        return <ImportMailboxMoveLabelsWrapper onImportImapEmails={this.handleImportEmails} labels={this.props.labels} mailboxes={this.state.mailboxes} />;
      default:
        return (
          <div className="import-step-container import-options">
            <div className="import-mbox-container">
              <h4>Import Mailbox</h4>
              <div>
                <span>Please select a .mbox file to import your emails.</span>
                <button onClick={this.handleSelectFile}>Select Mbox File</button>
                {
                  this.state.error && this.state.error.mbox &&
                  (<span className="import-error">
                    {this.state.error.mbox}
                  </span>)
                }
              </div>
            </div>
            <div className="import-imap-container">
              <h4>Import from Imap</h4>
              <div>
                <div className="import-input-container">
                  <span>Import emails from an email service through IMAP</span>
                  <div className="import-input-wrapper">
                    <span>Email Client</span> 
                    <select
                      onChange={this.handleChangeClient}
                      value={this.state.client}
                    >
                      {this.clients.map((client, index) => {
                        return (
                          <option key={index} value={client}>
                            {client}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="import-input-wrapper">
                    <span>Email</span> 
                    <input
                      placeholder="email"
                      type="text"
                      value={this.state.email}
                      onChange={this.handleChangeEmail}
                    />
                  </div>
                  <div className="import-input-wrapper">
                    <span>Password</span> 
                    <input
                      placeholder="password"
                      type="password"
                      value={this.state.password}
                      onChange={this.handleChangePassword}
                    />
                  </div>
                </div>
                <button onClick={this.handleImportFromImap}>
                  Authenticate and Import
                </button>
                {
                  this.state.error && this.state.error.imap &&
                  (<span className="import-error">
                    {this.state.error.imap}
                  </span>)
                }
              </div>
            </div>
          </div>
        );
    }
  };

  handleChangeClient = ev => {
    this.setState({
      client: ev.target.value
    });
  };

  handleChangeEmail = ev => {
    this.setState({
      email: ev.target.value
    });
  };

  handleChangePassword = ev => {
    this.setState({
      password: ev.target.value
    });
  };

  handleProgress = data => {
    switch (data.type) {
      case 'import':
        this.setState({
          totalEmails: data.totalEmails,
          step: STEP.IMPORT
        });
        break;
      case 'progress':
        this.setState({
          totalEmails: data.totalEmails,
          parsedEmails: data.parsedEmails,
          lastEmail: data.lastEmail,
          step: STEP.IMPORT
        });
        break;
      case 'error':
        this.setState({
          error: data.error,
          interrupted: data.interrupted
        });
        break;
      default:
        break;
    }
  };

  handleProcessEnd = () => {
    this.setState({
      step: STEP.SUCCESS
    });
  };

  handleSelectFile = async () => {
    const { filePaths } = await showOpenFileDialog();
    if (!filePaths[0]) {
      this.setState({
        error: {
          mbox: 'Please select a .mbox file to continue'
        }
      });
      return;
    }
    this.setState({
      step: STEP.EXTRACTING,
      import: IMPORT.MBOX
    }, () => {
      this.requestMboxMailboxes(filePaths[0])
    });
  };

  requestMboxMailboxes = async filepath => {
    const { mailboxes, count, error } = await importMailboxesFromMbox(filepath);
    if (error) {
      this.setState({
        step: STEP.SELECT,
        error: {
          mbox: 'Unable to retrieve malboxes'
        }
      })
      return;
    }
    if (!mailboxes) {
      this.setState({
        step: STEP.SELECT,
        error: {
          mbox: 'No mailboxes to import emails from'
        }
      })
      return
    }
    this.setState({
      mailboxes,
      count,
      step: STEP.LABELS
    })
  }

  handleImportFromImap = () => {
    this.setState({
      step: STEP.EXTRACTING,
      import: IMPORT.IMAP
    }, this.requestImapMailboxes)
  };

  requestImapMailboxes = async () => {
    const { mailboxes, error } = await importFromImapMailboxes({
      email: this.state.email,
      password: this.state.password,
      client: this.state.client
    });
    if (error) {
      this.setState({
        step: STEP.SELECT,
        error: {
          imap: 'Unable to retrieve malboxes'
        }
      })
      return;
    }
    if (!mailboxes) {
      this.setState({
        step: STEP.SELECT,
        error: {
          imap: 'No mailboxes to import emails from'
        }
      })
      return
    }
    this.setState({
      mailboxes,
      step: STEP.LABELS
    })
  }

  handleImportEmails = (defaultLabel, labelsMap) => {
    if (this.state.import === IMPORT.IMAP) {
      this.handleImportImapEmails(defaultLabel, labelsMap);
    } else {
      this.handleImportMboxEmails(defaultLabel, labelsMap);
    }
  }

  handleImportMboxEmails = (defaultLabel, labelsMap) => {
    this.setState({
      step: STEP.IMPORT
    }, async () => {
      await importEmailsFromMbox({
        count: this.state.count,
        labelsMap,
        addedLabels: defaultLabel ? [defaultLabel] : []
      });
    })
  }

  handleImportImapEmails = (defaultLabel, labelsMap) => {
    this.setState({
      step: STEP.IMPORT
    }, async () => {
      await importFromImapEmails({
        email: this.state.email,
        password: this.state.password,
        client: this.state.client,
        labelsMap,
        addedLabels: defaultLabel ? [defaultLabel] : []
      });
    })
  }
}

ImportMailboxWrapper.propTypes = {
  onChangePanel: PropTypes.func
};

export default ImportMailboxWrapper;
