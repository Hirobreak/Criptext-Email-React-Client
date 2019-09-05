
const debbyUrl = 'http://localhost';
const port = '8086'

const buildUrl = route => {
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
  bounday,
  accountId
}) => {
  const requestUrl = `${debbyUrl}/threadsById`;
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
      bounday,
      accountId
    })
  };
  return await fetch(requestUrl, options);
};
