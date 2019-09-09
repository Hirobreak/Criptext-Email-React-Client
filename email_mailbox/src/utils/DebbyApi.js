
import { getDebbyPort } from './electronInterface';

const debbyUrl = 'http://localhost';

const buildUrl = route => {
  const port = getDebbyPort();
  return `${debbyUrl}:${port}${route}`
}

export const getThreads = async ({
  accountId = 1,
  limit = 22, 
  date = Date.now().toString(),
  labelId = 1
}) => {
  const requestUrl = buildUrl('/threadsById');
  const options = {
    method: 'POST',
    body: JSON.stringify({
      accountId,
      limit, 
      date,
      labelId
    })
  };
  return await fetch(requestUrl, options);
};
  
export const createEmail = async ({
  key,
  threadId,
  subject,
  preview,
  date,
  status,
  unread,
  secure,
  unsentDate = null,
  trashDate = null,
  messageId,
  fromAddress,
  replyTo,
  boundary,
  accountId
}) => {
  const requestUrl = buildUrl('/email/create');
  const options = {
    method: 'POST',
    body: JSON.stringify({
      key,
      threadId,
      subject,
      preview,
      date,
      status,
      unread,
      secure,
      unsentDate,
      trashDate,
      messageId,
      fromAddress,
      replyTo,
      boundary,
      accountId
    })
  };
  return await fetch(requestUrl, options);
};

const getEmailsByThreadId = async (threadId, labelId) => {
  const requestUrl = buildUrl('/emails');
  const options = {
    method: 'POST',
    body: JSON.stringify({
      threadId,
      labelId
    })
  };
  return await fetch(requestUrl, options);
};
