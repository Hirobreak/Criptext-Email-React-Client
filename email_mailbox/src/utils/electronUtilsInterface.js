const { remote } = window.require('electron');

export const EmailUtils = remote.require('./src/utils/EmailUtils');
export const RegexUtils = remote.require('./src/utils/RegexUtils');
export const StringUtils = remote.require('./src/utils/StringUtils');
