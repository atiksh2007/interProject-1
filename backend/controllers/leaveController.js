const svc = require("../services/leaveService");
const repo = require("../repositories/leaveRepository");

module.exports = {
  apply: async (req, res) => {
    try {
      res.status(201).json({
        message: "Applied",
        leave: await svc.applyLeave(req.user.id, req.body)
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  myLeaves: async (req, res) => {
    try {
      res.json(await svc.myLeaves(req.user.id));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  balance: async (req, res) => {
    try {
      res.json(await svc.balance(req.user.id));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  // ADD THIS
  types: async (req, res) => {
    try {
      res.json(await repo.leaveTypes());
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  details: async (req, res) => {
    try {
      res.json(await svc.details(req.params.id));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  pendingManager: async (req, res) => {
    try {
      res.json(await svc.pendingManager(req.user.id));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  pendingHR: async (req, res) => {
    try {
      res.json(await repo.pendingForHR());
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  approve: async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role === "manager")
        await svc.approveByManager(id, req.user.id);
      else if (["hr", "admin"].includes(req.user.role))
        await svc.approveByHR(id, req.user.id, req.user.role);
      else
        return res.status(403).json({ message: "Not allowed" });

      res.json({ message: "Approved" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  reject: async (req, res) => {
    try {
      await svc.reject(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body.remarks
      );
      res.json({ message: "Rejected" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  cancel: async (req, res) => {
    try {
      await svc.cancel(req.params.id, req.user.id);
      res.json({ message: "Cancelled" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};