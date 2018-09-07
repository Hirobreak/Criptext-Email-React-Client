export const File = {
  ADD_BATCH: 'ADD_FILES',
  UNSEND_FILES: 'UNSEND_FILES'
};

export const Thread = {
  ADD_BATCH: 'ADD_THREADS',
  ADD_LABELID_THREAD: 'ADD_LABELID_THREAD',
  ADD_LABELID_THREAD_DRAFT: 'ADD_LABELID_THREAD_DRAFT',
  ADD_LABELID_THREADS: 'ADD_LABELID_THREADS',
  REMOVE_LABELID_THREAD: 'REMOVE_LABELID_THREAD',
  REMOVE_LABELID_THREAD_DRAFT: 'REMOVE_LABELID_THREAD_DRAFT',
  REMOVE_LABELID_THREADS: 'REMOVE_LABELID_THREADS',
  REMOVE_THREADS: 'REMOVE_THREADS',
  REMOVE_THREADS_BY_THREAD_ID: 'REMOVE_THREADS_BY_THREAD_ID',
  UPDATE_EMAILIDS_THREAD: 'UPDATE_EMAILIDS_THREAD',
  UPDATE_STATUS_THREAD: 'UPDATE_STATUS_THREAD',
  UPDATE_UNREAD_THREADS: 'UPDATE_UNREAD_THREADS',
  UNREAD_FILTER: 'FILTER_UNREAD_THREAD',
  DESELECT_THREADS: 'DESELECT_THREADS',
  SELECT_THREADS: 'SELECT_THREADS',
  SEARCH_THREADS: 'SEARCH_THREADS',
  MOVE_THREADS: 'MOVE_THREADS'
};

export const Contact = {
  ADD_BATCH: 'ADD_CONTACTS'
};

export const Email = {
  ADD_BATCH: 'ADD_EMAILS',
  MUTE: 'MUTE_EMAIL',
  MARK_UNREAD: 'MARK_UNREAD_EMAIL',
  UNSEND: 'UNSEND_EMAIL'
};

export const Label = {
  ADD_BATCH: 'ADD_LABELS',
  UPDATE_SUCCESS: 'UPDATE_LABEL_SUCCESS',
  REMOVE_SUCCESS: 'REMOVE_LABEL_SUCCESS'
};

export const FeedItem = {
  ADD_BATCH: 'ADD_FEED_ITEMS',
  REMOVE_SUCCESS: 'REMOVE_FEED_ITEM',
  UPDATE_SUCCESS: 'UPDATE_FEED_ITEM',
  UPDATE_ALL: 'UPDATE_ALL_FEED_ITEMS'
};

export const Suggestions = {
  SET_THREADS: 'SET_THREADS',
  SET_ERROR_SUGGESTIONS: 'SET_ERROR_SUGGESTIONS'
};

export const Activity = {
  START_LOAD_SYNC: 'START_LOAD_SYNC',
  STOP_LOAD_SYNC: 'STOP_LOAD_SYNC'
};
