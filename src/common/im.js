import JuggleChat from "../libs/juggleim-es-1.6.3";
import { CONFIG } from "../config";
import utils from "./utils";
import { EVENT_NAME, STORAGE } from "../common/enum";
import emitter from "../common/emmit";
import Storage from "../common/storage";

let juggle = JuggleChat.init({ appkey: CONFIG.appkey, upload: OSS });


function getCurrent(){
  return juggle;
}

function connect(user, callbacks){
  let { Event, ConnectionState, ErrorType } = juggle;
  if(juggle.isConnected()){
    let user = juggle.getCurrentUser();
    return  callbacks.success(user)
  }
  juggle.on(Event.STATE_CHANGED, ({ state }) => {
    if (ConnectionState.DISCONNECTED == state) {
      console.log('im is disconnected');
    }
    if (ConnectionState.CONNECTED == state) {
      let _user = Storage.get(STORAGE.USER_TOKEN);
      utils.extend(_user, user);
      Storage.set(STORAGE.USER_TOKEN, _user);
      callbacks.success(user);
    }
  });

  let { id, token } = user;
  juggle.connect({ userId: id, token }).then((user) => {}, () => {
    callbacks.error(juggle);
  });
}

function isConnected(){
  return juggle.isConnected();
}

export default {
  getCurrent,
  isConnected,
  connect
}