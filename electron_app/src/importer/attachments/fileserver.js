const request = require('superagent');
const fileServiceUrl = 'https://services.criptext.com';

const registerFile = async (data, jwt) => {
  const result = await request
    .post(`${fileServiceUrl}/file/upload`)
    .set('Authorization', `Bearer ${jwt}`)
    .ok(res => res.status)
    .send(data);

  console.log(result);
  const { body } = result;
  return Promise.resolve(body.filetoken);
};

const uploadChunk = async (fileToken, attachment, blob, part, jwt) => {
  const result = await request
    .post(`${fileServiceUrl}/file/chunk`)
    .set('Authorization', `Bearer ${jwt}`)
    .field('part', part)
    .field('filetoken', fileToken)
    .attach('chunk', blob, attachment.name || 'unknown')
    .ok(res => res.status);

  console.log(result);
  const { body } = result;
  return Promise.resolve(body.filetoken);
};

const markFilesAsPermanent = async (data, jwt) => {
  const result = await request
    .post(`${fileServiceUrl}/file/save`)
    .set('Authorization', `Bearer ${jwt}`)
    .ok(res => res.status)
    .send(data);

  console.log(result);
  return Promise.resolve();
};

module.exports = {
  registerFile,
  uploadChunk,
  markFilesAsPermanent
};
