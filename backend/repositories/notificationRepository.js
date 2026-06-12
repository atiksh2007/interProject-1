const pool = require("../config/db");
module.exports = {
  list: async (uid) => (await pool.query(
    `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`, [uid])).rows,
  unread: async (uid) => parseInt((await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false`, [uid])).rows[0].count),
  markRead: async (id, uid) => pool.query(
    `UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2`, [id, uid]),
  markAll: async (uid) => pool.query(
    `UPDATE notifications SET is_read=true WHERE user_id=$1`, [uid]),
};
