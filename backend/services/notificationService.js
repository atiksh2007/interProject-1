const r = require("../repositories/notificationRepository");
module.exports = {
  list:     (u)      => r.list(u),
  unread:   (u)      => r.unread(u),
  markRead: (id, u)  => r.markRead(id, u),
  markAll:  (u)      => r.markAll(u),
};
