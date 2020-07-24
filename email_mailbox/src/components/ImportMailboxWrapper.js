import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { startImportEmails } from '../utils/ipc';
import { showOpenFileDialog } from '../utils/electronInterface';


class ImportMailboxWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div>
        <button onClick={this.handleSelectFile}>
          Select Mbox File
        </button>
      </div>
    );
  }

  handleSelectFile = async () => {
    const { filePaths } = await showOpenFileDialog();
    console.log(filePaths);
    startImportEmails(filePaths[0]);
  }
}

ImportMailboxWrapper.propTypes = {
  onChangePanel: PropTypes.func,
};

export default ImportMailboxWrapper;
