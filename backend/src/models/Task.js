const { pool } = require('../config/db');

const Task = {
  // Get all tasks (Admin sees all tasks with owner details, User sees only own tasks)
  find: async (query) => {
    let sql = `
      SELECT t.id, t.title, t.description, t.status, t.priority, t.created_at, t.updated_at,
             u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM tasks t
      JOIN users u ON t.owner_id = u.id
    `;
    const params = [];

    if (query.owner_id) {
      sql += ' WHERE t.owner_id = $1';
      params.push(query.owner_id);
    }

    sql += ' ORDER BY t.created_at DESC';
    const result = await pool.query(sql, params);
    
    // Format response to match original MongoDB populate look
    return result.rows.map(row => ({
      _id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        email: row.owner_email
      }
    }));
  },

  // Find task by ID
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      _id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      owner: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  // Create a task
  create: async ({ title, description, status = 'todo', priority = 'medium', owner_id }) => {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, priority, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, status, priority, owner_id]
    );
    const row = result.rows[0];
    return {
      _id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      owner: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  // Update a task by ID
  findByIdAndUpdate: async (id, fields) => {
    const updates = [];
    const params = [id];
    let index = 2;

    const allowedFields = ['title', 'description', 'status', 'priority'];
    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${index}`);
        params.push(fields[field]);
        index++;
      }
    }

    if (updates.length === 0) return null;

    const sql = `UPDATE tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const result = await pool.query(sql, params);
    const row = result.rows[0];
    if (!row) return null;
    return {
      _id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      owner: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  // Delete a task by ID
  findByIdAndDelete: async (id) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};

module.exports = Task;
