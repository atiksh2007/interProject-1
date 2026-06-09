// backend/controllers/assetController.js
const svc = require("../services/assetService");

const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(400).json({ message: e.message }); }
};

module.exports = {
  list: wrap(async (req) => svc.list({
    page:   parseInt(req.query.page)  || 1,
    limit:  parseInt(req.query.limit) || 10,
    search: req.query.search || "",
    status: req.query.status || "",
    type:   req.query.type   || "",
  })),

  findById: wrap(async (req) => {
    const a = await svc.findById(req.params.id);
    if (!a) throw new Error("Asset not found");
    const history = await svc.getHistory(req.params.id);
    return { asset: a, history };
  }),

  create: wrap(async (req) => svc.create(req.body)),

  update: wrap(async (req) => {
    const a = await svc.update(req.params.id, req.body);
    if (!a) throw new Error("Asset not found");
    return a;
  }),

  delete: wrap(async (req) => {
    await svc.delete(req.params.id);
    return { message: "Deleted" };
  }),

  allocate: wrap(async (req) => svc.allocate(
    req.body.asset_id, req.body.employee_id, req.user.id, req.body.notes
  )),

  returnAsset: wrap(async (req) => {
    await svc.returnAsset(req.params.allocationId, req.user.id);
    return { message: "Asset returned" };
  }),

  allocations: wrap(async (req) => svc.getAllocations({
    employee_id: req.query.employee_id || null,
    status:      req.query.status      || null,
  })),

  myAllocations: wrap(async (req) => {
    const pool = require("../config/db");
    const ep = await pool.query("SELECT id FROM employee_profiles WHERE user_id=$1", [req.user.id]);
    if (!ep.rows[0]) return [];
    return svc.getAllocations({ employee_id: ep.rows[0].id });
  }),

  types: wrap(async () => svc.getTypes()),
};
