import { connect } from 'react-redux';
import SettingImportEmailsWrapper from '../components/SettingImportEmailsWrapper';
import { getSystemLabels, getVisibleLabels } from '../selectors/labels';

const mapStateToProps = state => {
  return {
    systemLabels: getSystemLabels(state),
    customLabels: getVisibleLabels(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

const SettingImportEmails = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingImportEmailsWrapper);

export default SettingImportEmails;