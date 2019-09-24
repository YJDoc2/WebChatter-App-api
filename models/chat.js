let mongoose = require('mongoose');

let chatSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true
    },
    usersuuid: [
      {
        type: String
      }
    ],
    usersUName: [
      {
        type: String
      }
    ],
    lastUpdate: {
      type: Date
    },
    unreadMsg: {
      type: Number
    },
    lastSender: {
      type: String
    },
    msgs: [
      {
        text: String,
        sender: String
        //read: Boolean
      }
    ]
  },
  { collection: 'Chats' }
);

const Chat = (module.exports = mongoose.model('Chat', chatSchema));
