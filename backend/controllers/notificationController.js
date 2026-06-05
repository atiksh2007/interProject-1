const svc = require("../services/notificationService");
module.exports = {
  list:    async (req, res) => { try { res.json(await svc.list(req.user.id)); } catch (e) { res.status(500).json({ message: e.message }); } },
  unread:  async (req, res) => { try { res.json({ count: await svc.unread(req.user.id) }); } catch (e) { res.status(500).json({ message: e.message }); } },
  markOne: async (req, res) => { try { await svc.markRead(req.params.id, req.user.id); res.json({ message: "OK" }); } catch (e) { res.status(500).json({ message: e.message }); } },
  markAll: async (req, res) => { try { await svc.markAll(req.user.id); res.json({ message: "OK" }); } catch (e) { res.status(500).json({ message: e.message }); } },
};
