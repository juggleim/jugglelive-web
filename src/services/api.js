import { CONFIG } from '../config'
import utils from '../common/utils'
let SERVER_PATH = {
  USER_SENDCODE: 'sms/send',
  USER_VERIFYCODE: 'sms_login',
  USER_MODIFY: 'users/update',
  USER_SEARCH: 'users/search',
  USER_FILE_TOKEN: 'file_cred',
  USER_GET: 'users/info',

  FRIEND_ADD: 'friends/add',
  FRIEND_REMOVE: 'friends/remove',
  FRIEND_LIST: 'friends/list',
  
  GROUP_CREATE: 'groups/add',
  GROUP_UPDATE: 'groups/update',
  GROUP_LIST: 'groups/mygroups',
  GROUP_MEMBER_ADD: 'groups/members/add',
  GROUP_MEMBER_REMOVE: 'groups/members/del',
  GROUP_DISSOLVE: 'groups/',
  GROUP_GET: 'groups/info',
};
utils.forEach(SERVER_PATH, (url, name) => {
  SERVER_PATH[name] = `${CONFIG.API}${url}`;
});

export default SERVER_PATH;