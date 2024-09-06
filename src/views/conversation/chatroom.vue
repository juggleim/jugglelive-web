<script setup>
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import im from "../../common/im";
import Storage from "../../common/storage";
import utils from "../../common/utils";
import { EVENT_NAME, STORAGE } from "../../common/enum";
import common from "../../common/common";
import chatroomTools from "./chatroom.js";
import Danmaku from "danmaku";

const props = defineProps(['chatroom']);
const emit = defineEmits(["onquit"]);

let danmu = null;
let _user = Storage.get(STORAGE.USER_TOKEN);

let juggle = im.getCurrent();
let { MessageType, Event, ConversationType } = juggle;

let context = getCurrentInstance();
let defaultMsg = {
    isAdmin: false,
    isNotify: true,
    grade: 0,
    sender: {
      name: ''
    },
    content: {
      content: '欢迎来到直播间！抖音严禁未成年人直播或打赏。直播间内严禁出现违法违规、低俗色情、吸烟酗酒、人身伤害等内容。如主播在直播过程中以不当方式诱导打赏、私下交易，请谨慎判断，以防人身财产损失。请大家注意财产安全，理性消费，谨防网络诈骗。'
    }
  };

let state = reactive({
  currentChatroom: props.chatroom,
  messages: [utils.clone(defaultMsg)],
  content: '',
  total: 0
});

juggle.once(Event.MESSAGE_RECEIVED, (message) => {
  if (isSameChatroom({ id: message.conversationId })) {
    let { sender } = message;
    let info = common.getMemberInfo(sender);
    utils.extend(message, info);
    appendMsg(message);
  }
});

juggle.once(Event.CHATROOM_ATTRIBUTE_DELETED, (chatroom) => {
  console.log('chatroom attr deleted', chatroom)
});

juggle.once(Event.CHATROOM_ATTRIBUTE_UPDATED, (chatroom) => {
  console.log('chatroom attr updated', chatroom)
  let { attributes } = chatroom;
  if(isSameChatroom(chatroom)){
    utils.forEach(attributes, (attr) => {
      let { key, value } = attr;
      if(utils.isEqual(key, 'total')){
        value = value < 0 ? 0 : value;
        state.total = value;
      }
    });
  }
});

juggle.once(Event.CHATROOM_DESTROYED, (chatroom) => {
  if(isSameChatroom(chatroom)){
    emit('onquit');
  }
});

let isSending = false;
function onSend(){
  if(isSending){
    return;
  }
  isSending = true;
  let { content } = state;
  if(utils.isEqual(content.length, 0)){
    return;
  }

  let msg = {
    conversationType: ConversationType.CHATROOM,
    conversationId: props.chatroom.id,
    name: MessageType.TEXT,
    content: { content: content },
  };

  let _msg = utils.clone(msg);

  let info = common.getMemberInfo({ id: _user.id });
  utils.extend(_msg, { ...info, sender: _user });
  appendMsg(_msg, true);
  juggle.sendMessage(msg).then((msg) => {
    console.log('send message successfully.', msg)
    isSending = false;
    state.content = '';
  }, (error) => {
    isSending = false;
    console.log(error)
  });
}

function appendMsg(msg, isSender){
  if(!utils.isEqual(MessageType.TEXT, msg.name)){
    msg = { ...msg, content: { content: '[啊～ 收到一条来自火星的消息]' } }
  }
  state.messages.push(msg);
  scrollBottom();

  if(isSender){
    return emitDanmu(msg.content.content);
  }
  setTimeout(() => {
    emitDanmu(msg.content.content);
  }, Math.random() * 10000)
}
function scrollBottom() {
  nextTick(() => {
    let { messages } = context.refs;
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  });
}

function isSameChatroom(chatroom){
  return utils.isEqual(chatroom.id, props.chatroom.id)
}

function clearCache(){
  state.messages = [utils.clone(defaultMsg)];
  state.total = 0;
  danmu.clear();
}

function initDanmu(){
  let danmuku = new Danmaku({
    container: document.querySelector('.jg-anchor-box'),
    speed: 144
  });
  return danmuku;
}

function emitDanmu(text){
  danmu.emit({
    text: text,
    // 默认为 rtl（从右到左），支持 ltr、rtl、top、bottom。
    mode: 'rtl',
    style: {
      fontSize: '18px',
      color: '#ffffff',
      textShadow: '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
    },
  });
}

watch(() => props.chatroom.id, async () => {
  let { chatroom: { id } } = props;
  if(!danmu){
    danmu = initDanmu();
  }
  if(!id){
    clearCache();
  }
  
});


</script>
<template>
  <div class="jg-chatroom-container">
    <div class="jg-anchor-box">
      <div class="jg-chatroom-title">{{ props.chatroom.id }} {{ props.chatroom.title }}</div>
      <video autoplay loop class="jg-anchor-video" :src="props.chatroom.url"></video>
      <div class="jg-pip-anchor"></div>
    </div>
    <div class="jg-chatroom-box">
      <div class="jg-chatroom-header">
        <div class="jg-chatroom-info">
          <span class="wr wr-user"></span>
          <span>在房间人数：{{ state.total }}</span>
        </div>
        <ul class="jg-chatroom-tools">
          <li class="tyn-appbar-link jg-chatroom-tool jg-chatroom-logout wr wr-quit" @click="emit('onquit')">退出</li>
        </ul>
      </div>
      <ul class="jg-chatroom-body jg-messages" ref="messages">
        <li class="jg-message" v-for="message in state.messages">
          <span class="jg-tag-bg jg-member-admin" v-if="message.isAdmin"></span>
          <span  v-if="message.grade" class="jg-tag-bg" :class="['jg-member-grade-' + message.grade]"></span>
          <span  v-if="message.sender.name" class="jg-member-name">{{ message.sender.name }}</span>
          <span v-if="message.isNotify" class="jg-member-content jg-chatroom-notify">{{ message.content.content }}</span>
          <span v-else class="jg-member-content">{{ message.content.content }}</span>
        </li>
      </ul>
      <div class="jg-chatroom-footer">
        <div class="jg-chatroom-inputbox">
          <input class="form-control jg-chatroom-input" v-model="state.content" type="text" @keydown.enter="onSend">
          <div class="jg-chatroom-send wr wr-send" @click="onSend"></div>
        </div>
      </div>
    </div>
  </div>
</template>