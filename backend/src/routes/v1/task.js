const express = require('express');
const { getTasks, createTask, updateTask, deleteTask } = require('../../controllers/task.controller');
const { protect } = require('../../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management pipeline operations
 */

// All task routes require authentication
router.use(protect);

/**
 * @swagger
 * /task:
 *   get:
 *     summary: Retrieve list of tasks
 *     description: Retrieve tasks. Normal users get their owned tasks; administrators fetch all tasks across the system.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *       401:
 *         description: Unauthorized session
 *   post:
 *     summary: Provision a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Database Migration Audit
 *               description:
 *                 type: string
 *                 example: Perform DDL check against production constraints.
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, completed]
 *                 example: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *     responses:
 *       201:
 *         description: Task successfully provisioned
 *       401:
 *         description: Unauthorized session
 */
router.route('/')
  .get(getTasks)
  .post(createTask);

/**
 * @swagger
 * /task/{id}:
 *   put:
 *     summary: Update an existing task payload
 *     description: Update status, priority, title or description. Allowed for owners and administrators only.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numerical ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Forbidden (not the task owner or admin)
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numerical ID of the task
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
