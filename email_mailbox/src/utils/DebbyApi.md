
# Deby API Interface

### Get Threads
#### /threads

Retrieve Threads to be displaying in mailbox

| Param        | Type           | Description  |
| ------------- |:-------------:| -----:|
| accountId     | int | Active Account's ID |
| labelId     | int |  Label ID related to current mailbox |
| limit | int | Max return rows |
| date | int | Starting date as timestamp |

```javascript
export const getThreads = async ({
  accountId = 1,
  limit = 22, 
  date = Date.now().toString(),
  labelId = 1
}) => {
  const requestUrl = buildUrl('/threads');
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
```

Response Example:

```javascript
threads = [
  Object {
    "allLabels": "1,3",
    "boundary": null,
    "content": "<p>RE: Hello there</p>",
    "date": "2018-06-15 08:23:19.120",
    "emailIds": "3,4",
    "fileTokens": "tokenC",
    "fromAddress": "user@criptext.com",
    "fromContactName": "User A <usera@criptext.com>,user@criptext.com",
    "id": 4,
    "isMuted": 0,
    "key": "4",
    "maxDate": "2018-06-15 08:23:19.120",
    "messageId": "messageIdD",
    "preview": "RE: Hello there",
    "recipientContactIds": "2,1",
    "replyTo": null,
    "s3Key": "s3KeyD",
    "secure": 1,
    "status": 0,
    "subject": "Greetings",
    "threadId": "threadC",
    "trashDate": null,
    "uniqueId": "threadC",
    "unread": 1,
    "unsendDate": "2018-06-14 08:23:20.000",
  }
]
```

### Create Email
#### /email/create

Retrieve Threads to be displaying in mailbox

| Param        | Type           | Description  |
| ------------- |:-------------:| -----:|
| key | int | Key identifier of the email
| threadId     | string | Thread identifier of the email |
| subject     | string |   |
| preview | string | preview of email's content |
| date | string | formatted date string |
| status     | int | current email status |
| unread     | bool | Whether the email is not read |
| secure | bool | Whether the email was sent encrypted by the sender or not |
| trashDate | optiona&lt;string&gt; | Date string when the email was sent to trash |
| unsentDate | optional&lt;string&gt; | Date string when the email was unsent|
| messageId     | string | Message identifier according to email protocol |
| fromAddress | string | Formatted sender name and email address |
| replyTo | optional&lt;string&gt; | Email address to reply to |
| boundary | optional&lt;string&gt; | Boundary code to display with email source |

```javascript
const createEmail = async ({
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
```

Response Example:

```javascript
{
  emailId: 1
}
```

### Get Emails from Thread
#### /emails

Retrieve Threads to be displaying in mailbox

| Param        | Type           | Description  |
| ------------- |:-------------:| -----:|
| threadId     | string | Thread identifier of the email |
| labelId     | string | current mailbox label |

```javascript
const createEmail = async ({
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
```

Response Example:

```javascript
{ emails : [
  {
    threadId: 'threadB',
    key: '2',
    s3Key: 's3KeyB',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-10-07 08:23:19.120',
    status: 1,
    unread: true,
    secure: true,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdB',
    fromAddress: 'User me <user@criptext.com>'
    fromContactIds: '1,2,5',
    to: '3,4',
    cc: '7',
    bcc: '8,9',
    fileTokens: 'sfhshvgaiondfi,hbtiugngisodfsgy'
  }
]}
```