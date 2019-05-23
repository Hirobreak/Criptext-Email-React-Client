import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderHOC from './HeaderHOC';
import HeaderMainBasic from './../containers/HeaderMain';
import HeaderThreadOptionsBasic from './../containers/HeaderThreadOptions';
import Threads from '../containers/Threads';
import Thread from '../containers/Thread';
import Settings from './../containers/Settings';
import { SectionType } from '../utils/const';
import { Set } from 'immutable';
import { addEvent, Event, removeEvent } from '../utils/electronEventInterface';

const HeaderMain = HeaderHOC(HeaderMainBasic);
const HeaderThreadOptions = HeaderHOC(HeaderThreadOptionsBasic);

class MainWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdateAvailable: false,
      threadItemsChecked: Set(),
      shouldLoadMailbox: false
    };

    this.initEventHandlers(props);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.sectionSelected.type !== this.props.sectionSelected.type &&
      this.props.sectionSelected.type === SectionType.MAILBOX
    ) {
      this.setState({ shouldLoadMailbox: true });
    } else if (this.state.shouldLoadMailbox) {
      this.setState({ shouldLoadMailbox: false });
    }
  }

  render() {
    return (
      <div className="main-container">
        {this.renderHeader()}
        {this.renderSection()}
      </div>
    );
  }

  renderHeader = () => {
    switch (this.props.sectionSelected.type) {
      case SectionType.MAILBOX: {
        if (this.state.threadItemsChecked.size) {
          return (
            <HeaderThreadOptions
              mailboxSelected={
                this.props.sectionSelected.params.mailboxSelected
              }
              onToggleActivityPanel={this.props.onToggleActivityPanel}
              onBackOption={this.handleClickBackHeaderMailbox}
              onCheckAllThreadItems={this.handleCheckAllThreadItems}
              itemsChecked={this.state.threadItemsChecked}
            />
          );
        }
        return (
          <HeaderMain
            isLoadAppCompleted={this.props.isLoadAppCompleted}
            onClickSection={this.props.onClickSection}
            onToggleActivityPanel={this.props.onToggleActivityPanel}
            onUpdateApp={this.props.onUpdateApp}
          />
        );
      }
      case SectionType.THREAD: {
        return (
          <HeaderThreadOptions
            mailboxSelected={this.props.sectionSelected.params.mailboxSelected}
            onBackOption={() =>
              this.handleClickBackHeaderThread(
                this.props.sectionSelected.params.mailboxSelected,
                this.props.onClickSection
              )
            }
            onToggleActivityPanel={this.props.onToggleActivityPanel}
            threadIdSelected={
              this.props.sectionSelected.params.threadIdSelected
            }
          />
        );
      }
      case SectionType.SETTINGS: {
        return (
          <HeaderMain
            onClickSection={this.props.onClickSection}
            onToggleActivityPanel={this.props.onToggleActivityPanel}
            onUpdateApp={this.props.onUpdateApp}
          />
        );
      }
      default:
        break;
    }
  };

  renderSection = () => {
    switch (this.props.sectionSelected.type) {
      case SectionType.SETTINGS: {
        return (
          <Settings
            onUpdateApp={this.props.onUpdateApp}
            onClickSection={this.props.onClickSection}
          />
        );
      }
      default:
        return this.renderThreads();
    }
  };

  renderThreads = () => {
    const isThreadsVisible =
      this.props.sectionSelected.type === SectionType.MAILBOX;
    const isThreadVisible =
      this.props.sectionSelected.type === SectionType.THREAD;
    if (isThreadsVisible || isThreadVisible) {
      return (
        <div className="content-container">
          <Threads
            isUpdateAvailable={this.state.isUpdateAvailable}
            isVisible={!isThreadVisible}
            mailboxSelected={this.props.sectionSelected.params.mailboxSelected}
            onBackOption={this.handleClickBackHeaderMailbox}
            onClickSection={this.props.onClickSection}
            onCheckThreadItem={this.handleCheckThreadItem}
            onCloseUpdateMessage={this.handleCloseUpdateMessage}
            shouldInitLoad={this.state.shouldLoadMailbox}
            searchParams={this.props.sectionSelected.params.searchParams}
            threadItemsChecked={this.state.threadItemsChecked}
          />
          {isThreadVisible && (
            <Thread
              mailboxSelected={
                this.props.sectionSelected.params.mailboxSelected
              }
              onBackOption={() =>
                this.handleClickBackHeaderThread(
                  this.props.sectionSelected.params.mailboxSelected,
                  this.props.onClickSection
                )
              }
              onClickSection={this.props.onClickSection}
              threadIdSelected={
                this.props.sectionSelected.params.threadIdSelected
              }
            />
          )}
        </div>
      );
    }
    return;
  };

  handleCheckAllThreadItems = (value, threadIds) => {
    if (!value) this.setState({ threadItemsChecked: threadIds });
    else this.setState({ threadItemsChecked: Set() });
  };

  handleCheckThreadItem = (threadId, value) => {
    if (value)
      this.setState({
        threadItemsChecked: this.state.threadItemsChecked.add(threadId)
      });
    else
      this.setState({
        threadItemsChecked: this.state.threadItemsChecked.delete(threadId)
      });
  };

  handleClickBackHeaderMailbox = () => {
    this.setState({ threadItemsChecked: Set() });
  };

  handleClickBackHeaderThread = (mailboxSelected, onClickSection) => {
    const type = SectionType.MAILBOX;
    const params = {
      mailboxSelected
    };
    onClickSection(type, params);
  };

  handleCloseUpdateMessage = () => {
    this.setState({ isUpdateAvailable: false });
  };

  initEventHandlers = () => {
    addEvent(Event.UPDATE_AVAILABLE, this.updateAvailableListenerCallback);
  };

  removeEventHandlers = () => {
    removeEvent(Event.UPDATE_AVAILABLE, this.updateAvailableListenerCallback);
  };

  updateAvailableListenerCallback = ({ value }) => {
    if (value) {
      this.setState({ isUpdateAvailable: value });
    }
  };
}

MainWrapper.propTypes = {
  isLoadAppCompleted: PropTypes.bool,
  onClickSection: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  onUpdateApp: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default MainWrapper;
