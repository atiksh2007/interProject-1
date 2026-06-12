// backend/repositories/assetRepository.js
const pool = require("../config/db");

module.exports = {
  // ── List assets with pagination, search, and status filter ──
  async list({ page = 1, limit = 10, search = "", status = "", type = "" }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(a.asset_code ILIKE $${params.length} OR a.asset_name ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`a.asset_type = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM assets a ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit);
    params.push(offset);
    const dataRes = await pool.query(
      `SELECT a.* FROM assets a ${where}
       ORDER BY a.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      data: dataRes.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Find a single asset by ID ──
  async findById(id) {
    const r = await pool.query(`SELECT * FROM assets WHERE id = $1`, [id]);
    return r.rows[0] || null;
  },

  // ── Create a new asset ──
  async create(d) {
    const r = await pool.query(
      `INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [d.asset_code, d.asset_name, d.asset_type, d.purchase_date || null, d.purchase_cost || null, d.status || "available"]
    );
    return r.rows[0];
  },

  // ── Update an existing asset ──
  async update(id, d) {
    const r = await pool.query(
      `UPDATE assets
       SET asset_code = $1, asset_name = $2, asset_type = $3,
           purchase_date = $4, purchase_cost = $5, status = $6
       WHERE id = $7
       RETURNING *`,
      [d.asset_code, d.asset_name, d.asset_type, d.purchase_date || null, d.purchase_cost || null, d.status, id]
    );
    return r.rows[0] || null;
  },

  // ── Delete an asset ──
  async delete(id) {
    await pool.query(`DELETE FROM assets WHERE id = $1`, [id]);
  },

  // ── Allocate an asset to an employee ──
  async allocate(assetId, employeeId, allocatedBy, notes) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check asset is available
      const ar = await client.query(
        `SELECT * FROM assets WHERE id = $1 FOR UPDATE`, [assetId]
      );
      if (!ar.rows[0]) throw new Error("Asset not found");
      if (ar.rows[0].status !== "available") throw new Error("Asset is not available for allocation");

      const er = await client.query(
        `SELECT ep.user_id, u.name
         FROM employee_profiles ep
         JOIN users u ON ep.user_id = u.id
         WHERE ep.id = $1`,
        [employeeId]
      );
      if (!er.rows[0]) throw new Error("Employee not found");

      // Create allocation record
      const alloc = await client.query(
        `INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, allocated_date, status, notes)
         VALUES ($1, $2, $3, CURRENT_DATE, 'allocated', $4)
         RETURNING *`,
        [assetId, employeeId, allocatedBy, notes || null]
      );

      // Mark asset as allocated
      await client.query(
        `UPDATE assets SET status = 'allocated' WHERE id = $1`,
        [assetId]
      );

      // Log history
      await client.query(
        `INSERT INTO asset_history (asset_id, action, created_by, remarks)
         VALUES ($1, 'allocated', $2, $3)`,
        [assetId, allocatedBy, notes || "Allocated to employee"]
      );

      await client.query(
        `INSERT INTO notifications(user_id, title, message, type, link)
         VALUES($1, $2, $3, 'info', '/my-assets')`,
        [
          er.rows[0].user_id,
          "Asset Assigned",
          `You have been assigned ${ar.rows[0].asset_name} (${ar.rows[0].asset_code})`,
        ]
      );

      await client.query("COMMIT");
      return alloc.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  // ── Return an allocated asset ──
  async returnAsset(allocationId, returnedBy) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ar = await client.query(
        `SELECT * FROM asset_allocations WHERE id = $1 FOR UPDATE`, [allocationId]
      );
      if (!ar.rows[0]) throw new Error("Allocation not found");

      const assetId = ar.rows[0].asset_id;

      // Mark allocation as returned
      await client.query(
        `UPDATE asset_allocations SET return_date = CURRENT_DATE, status = 'returned' WHERE id = $1`,
        [allocationId]
      );

      // Mark asset as available
      await client.query(
        `UPDATE assets SET status = 'available' WHERE id = $1`,
        [assetId]
      );

      // Log history
      await client.query(
        `INSERT INTO asset_history (asset_id, action, created_by, remarks)
         VALUES ($1, 'returned', $2, 'Returned by employee')`,
        [assetId, returnedBy]
      );

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  // ── Get all allocations, optionally filtered ──
  async getAllocations({ employee_id = null, status = null }) {
    const params = [];
    const conditions = [];

    if (employee_id) {
      params.push(employee_id);
      conditions.push(`aa.employee_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`aa.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const r = await pool.query(
      `SELECT aa.*, a.asset_code, a.asset_name, a.asset_type,
              ep.id AS emp_profile_id, u.name AS employee_name
       FROM asset_allocations aa
       JOIN assets a ON aa.asset_id = a.id
       JOIN employee_profiles ep ON aa.employee_id = ep.id
       JOIN users u ON ep.user_id = u.id
       ${where}
       ORDER BY aa.created_at DESC`,
      params
    );
    return r.rows;
  },

  // ── Get allocation/return history for an asset ──
  async getHistory(assetId) {
    const r = await pool.query(
      `SELECT ah.*, u.name AS performed_by_name
       FROM asset_history ah
       LEFT JOIN users u ON ah.created_by = u.id
       WHERE ah.asset_id = $1
       ORDER BY ah.created_at DESC`,
      [assetId]
    );
    return r.rows;
  },

  // ── Get distinct asset types ──
  async getTypes() {
    const r = await pool.query(
      `SELECT DISTINCT asset_type FROM assets WHERE asset_type IS NOT NULL ORDER BY asset_type`
    );
    return r.rows.map((row) => row.asset_type);
  },
};
