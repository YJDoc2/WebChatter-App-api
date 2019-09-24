const express = require('express');
const uuidv4 = require('uuid/v4');
const router = express.Router();

const User = require('../models/user');
const Chat = require('../models/chat');

router.get('/search/:reg', ensureAuthenticated, (req, res) => {
  let reg = req.params.reg;
  User.find({ userName: { $regex: reg, $options: 'i' } }, (err, users) => {
    let usersExceptSelf = users.filter(user => {
      return (
        user.id !== req.user.id && !req.user.chatsUName.includes(user.userName)
      );
    });
    res.json(usersExceptSelf);
  });
});

router.get('/refreshHomeChats', ensureAuthenticated, (req, res) => {
  Chat.find({ uuid: { $in: req.user.chatsUuid } })
    .sort({ lastUpdate: -1 })
    .exec((err, docs) => {
      if (err) {
        console.log(err);
        return;
      }
      res.json({ user: req.user.userName, chats: docs });
    });
});

router.get('/getChat/:id', ensureAuthenticated, (req, res) => {
  let chatid = req.params.id;
  Chat.findOne({ uuid: chatid }, (err, chat) => {
    if (err) {
      console.log(err);
      res.json({ err: 'Unknown Eroor' });
    }
    if (chat) {
      let query = {};
      let chatName =
        chat.usersUName[0] === req.user.userName
          ? chat.usersUName[1]
          : chat.usersUName[0];
      if (chat.lastSender !== req.user.userName) {
        query = { $set: { unreadMsg: 0 } };
      }
      Chat.updateOne({ uuid: chatid }, query, (err, raw) => {
        if (err) {
          console.log(err);
          res.json({ err: 'Unknown Eroor' });
        }
        let chatName =
          chat.usersUName[0] === req.user.userName
            ? chat.usersUName[1]
            : chat.usersUName[0];
        res.json({ chat: chat, chatName: chatName });
      });
    }
  });
});

router.post('/chatAddMsg', (req, res) => {
  Chat.updateOne(
    { uuid: req.body.id },
    {
      $push: { msgs: { text: req.body.msg, sender: req.user.userName } },
      $set: { lastUpdate: Date.now(), lastSender: req.user.userName },
      $inc: { unreadMsg: 1 }
    },
    (err, affected) => {
      if (err) {
        console.log(err);
        res.json({ success: false });
        return;
      }
      if (affected == 0) {
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});
router.post('/newchat', ensureAuthenticated, (req, res) => {
  let chatid = uuidv4();
  let chat = new Chat({
    uuid: chatid,
    usersuuid: [req.user.uuid, req.body.otherUuid],
    usersUName: [req.user.userName, req.body.otherUserName],
    lastUpdate: Date.now(),
    unreadMsg: 1,
    lastSender: req.user.userName,
    msgs: [
      {
        text: req.body.msg,
        sender: req.user.userName
      }
    ]
  });
  /* ADD ERROR HANDLING BY RESPONSE*/
  chat.save(err => {
    if (err) {
      console.log(err);
      res.json({ err: 'Unknown Error' });
    } else {
      chatid = chatid;
      let userSelf = req.user.uuid;
      let userOther = req.body.otherUuid;
      let otherUserName = req.body.otherUserName;

      /*ADD ERROR HANDLING*/
      User.updateOne(
        { uuid: userSelf },
        { $push: { chatsUuid: chatid, chatsUName: otherUserName } },
        (err, raw) => {
          if (err) {
            console.log(err);
            res.json({ err: 'Unknown Error' });
          }
          User.updateOne(
            { uuid: userOther },
            { $push: { chatsUuid: chatid, chatsUName: req.user.userName } },
            (err, raw) => {
              if (err) {
                console.log(err);
                res.json({ err: 'Unknown Error' });
              }
              res.json({ success: true, chat: chat });
            }
          );
        }
      );
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //eq.flash('danger', 'Please login');
    res.json({ err: 'Unauthorised Access Error' });
  }
}

module.exports = router;
