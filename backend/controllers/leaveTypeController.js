const svc = require("../services/leaveTypeService");
module.exports = {
  list:   async (req, res) => { try { res.json(await svc.list()); } catch (e) { res.status(500).json({ message: e.message }); } },
  create: async (req, res) => { try { res.status(201).json(await svc.create(req.body)); } catch (e) { res.status(400).json({ message: e.message }); } },
  update: async (req, res) => { try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { res.status(400).json({ message: e.message }); } },
  remove: async (req, res) => { try { await svc.remove(req.params.id); res.json({ message: "Deleted" }); } catch (e) { res.status(500).json({ message: e.message }); } },
};
