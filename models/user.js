let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    reuired: true
  },
  userName: {
    type: String,
    reuired: true
  },
  password: {
    type: String,
    required: true
  },
  chatsUuid: [
    {
      type: String
    }
  ],
  chatsUName: [{
    type: String
  }
  ]
}, { collection: 'Users' });

const User = (module.exports = mongoose.model('User', userSchema));
