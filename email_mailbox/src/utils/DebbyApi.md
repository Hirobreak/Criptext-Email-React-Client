
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

```

### Create Email
#### /email/create

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
```

Response Example:

```javascript

```