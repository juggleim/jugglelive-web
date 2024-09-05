import utils from "../../common/utils";
import im from "../../common/im";
import common from "../../common/common";

let juggle = im.getCurrent();
let { MessageType, ConversationType } = juggle;

let joinChatroom = (chatroom) => {
  return juggle.joinChatroom(chatroom);
};

let quitChatroom = (chatroom) => {
  return juggle.quitChatroom(chatroom);
};
export default {
  joinChatroom,
  quitChatroom,
}