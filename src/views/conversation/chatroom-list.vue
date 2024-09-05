<script setup>
import utils from "../../common/utils";
import { reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import Chatroom from "./chatroom.vue";
import { STORAGE, EVENT_NAME, CHATROOMS } from "../../common/enum";
import Storage from "../../common/storage";
import im from "../../common/im";
import common from "../../common/common";
import emitter from "../../common/emmit";
import chatroomTools from "./chatroom.js";

const context = getCurrentInstance();
const router = useRouter();
let { currentRoute: { _rawValue: { query } } } = router;

let juggle = im.getCurrent();
let { UnreadTag } = juggle;
let { Event, ConnectionState, MentionType, MessageType } = juggle;

let state = reactive({
  chatrooms: CHATROOMS,
  currentChatroom: {},
  currentUser: {}
});

let isJoining = false;
function onConversation(item) {
  if(isJoining){
    return;
  }
  isJoining = true;
  chatroomTools.joinChatroom({ id: item.id }).then(() => {
    state.currentChatroom = item;
    isJoining = false;
  }, (error) => {
    let { code, msg } = error;
    isJoining = false;
    context.proxy.$toast({ icon: 'error', text: `${code} ${msg}` });
  });
}

let user = Storage.get(STORAGE.USER_TOKEN);
if (utils.isEmpty(user)) {
  router.replace({ name: 'Login' });
}

im.connect(user, {
  success: (_user) => {
    console.log('conversation connect success', _user)
    let isFirst = true;
    utils.extend(state.currentUser, user);
  },
  error: () => {
    router.replace({ name: 'Login' });
  }
});

function onQuit(){
  let { id } = state.currentChatroom;
  chatroomTools.quitChatroom({ id })
  state.currentChatroom = {};
}

function isSameConversation(origin, source) {
  return utils.isEqual(origin.conversationId, source.conversationId) && utils.isEqual(origin.conversationType, source.conversationType);
}

</script>
<template>
  <div class="jg-container">
    <ul class="jg-list">
      <li class="jg-item fadein-o" v-for="chatroom in state.chatrooms" @click="onConversation(chatroom)">
        <div class="jg-chatbox">
          <img class="jg-chatpost" :src="chatroom.poster" alt="">
          <div class="jg-chatcount wr wr-user">{{ chatroom.count }}</div>
        </div>
        <div class="jg-chatinfo">
          <div class="jg-chattitle">{{ chatroom.title }} {{ chatroom.id }}</div>
          <div class="jg-anchorinfo">
            <div class="tyn-media tyn-size-xs tyn-header-logo jg-anchor-avatar"
          :style="{ 'background-image': 'url(' + chatroom.user.avatar + ')' }"></div>
            <div class="jg-username">{{ chatroom.user.name }}</div>
          </div>
        </div>
      </li>       
    </ul>
    <Chatroom :chatroom="state.currentChatroom" @onquit="onQuit" :class="[utils.isEmpty(state.currentChatroom) ? '' : 'jg-chatroom-container-show']"></Chatroom>
  </div>
</template>