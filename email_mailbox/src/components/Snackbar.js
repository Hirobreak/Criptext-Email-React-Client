import React from 'react';
import PropTypes from 'prop-types';
import './snackbar.scss';
import { SingleLoading, statusType } from './Loading';
import AvatarImage from './AvatarImage';
import string from '../lang';

export const SnackbarId = {
  BACKUP: 'backup',
  IMPORT: 'import'
}

const backupString = string.backup;
const importString = string.import;

const Snackbar = props => (
  <div className="snackbars">
    {
      props.displayOrder.map ( snackbarId => {
        console.log(snackbarId);
        return (<SnackbarWrapper key={snackbarId} identifier={snackbarId} {...props[snackbarId]} onDismissSnackbar={ () => props.onDismissSnackbar(snackbarId) } />)
      })
    }
  </div>
);

const SnackbarWrapper = props => (
  <div className="snackbar-wrapper">
    <div className="snackbar-title-container">
      <h4>{props.identifier === SnackbarId.BACKUP ? backupString.title : importString.title}</h4>
      <div className="snackbar-title-hide" onClick={props.onDismissSnackbar}>
        <span>{backupString.hide}</span>
      </div>
    </div>
    <div className="snackbar-info-container">
      <AvatarIndicator {...props} />
      <div className="snackbar-message-contianer">
        <div className="snackbar-message">
          <Loader {...props} />
        </div>
        <div className="snackbar-account">
          <span>{props.email}</span>
        </div>
      </div>
    </div>
  </div>
)

const Loader = props => {
  switch (props.progress) {
    case -1:
      return <SingleLoading percent={100} animationClass={statusType.STOP} />;
    case 100:
      return (
        <SingleLoading
          percent={props.progress}
          animationClass={statusType.COMPLETE}
        />
      );
    default:
      return (
        <SingleLoading
          percent={props.progress}
          animationClass={statusType.ACTIVE}
        />
      );
  }
};

const AvatarIndicator = props => {
  return (
    <div className="snackbar-loader-container">
      <AvatarImage
        showBorder={false}
        name={props.name}
        color={props.color}
        avatarUrl={props.avatarUrl}
      />
    </div>
  );
};

Snackbar.propTypes = {
  email: PropTypes.string,
  onDismissSnackbar: PropTypes.func
};

AvatarIndicator.propTypes = {
  progress: PropTypes.number,
  name: PropTypes.string,
  color: PropTypes.string,
  avatarUrl: PropTypes.string
};

Loader.propTypes = {
  progress: PropTypes.number
};

export default Snackbar;
