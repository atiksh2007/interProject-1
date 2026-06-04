const repo = require("../repositories/leaveTypeRepository");
module.exports = {
  list:   ()      => repo.getAll(),
  create: (d)     => repo.create(d),
  update: (id, d) => repo.update(id, d),
  remove: (id)    => repo.delete(id),
};
