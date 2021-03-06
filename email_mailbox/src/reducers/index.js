import { combineReducers } from 'redux-immutable';
import activities from './activity';
import contacts from './contacts';
import emails from './emails';
import files from './files';
import labels from './labels';
import feeditems from './feeditems';
import suggestions from './suggestions';
import threads from './threads';

export default combineReducers({
  activities,
  contacts,
  emails,
  files,
  feeditems,
  labels,
  suggestions,
  threads
});
