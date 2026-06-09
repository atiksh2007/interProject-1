// backend/services/assetService.js
const repo = require("../repositories/assetRepository");
module.exports = {
  list:         (q)            => repo.list(q),
  findById:     (id)           => repo.findById(id),
  create:       (d)            => repo.create(d),
  update:       (id, d)        => repo.update(id, d),
  delete:       (id)           => repo.delete(id),
  allocate:     (a, e, by, n)  => repo.allocate(a, e, by, n),
  returnAsset:  (aid, by)      => repo.returnAsset(aid, by),
  getAllocations:(q)            => repo.getAllocations(q),
  getHistory:   (id)           => repo.getHistory(id),
  getTypes:     ()             => repo.getTypes(),
};

// ─────────────────────────────────────────────────────────────
// backend/controllers/assetController.js
// ─────────────────────────────────────────────────────────────
// (Export this as a separate file — shown inline for brevity)
