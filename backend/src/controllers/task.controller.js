const Task = require("../models/Task");

exports.getTasks = async (req, res, next) => {
    try {
        // RBAC check: Admin sees everything, User sees only own Tasks
        const query = req.user.role === 'admin' ? {} : {
            owner_id: req.user.id
        };
        const tasks = await Task.find(query);
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        next(error);
    }
};

exports.createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority } = req.body;
        const task = await Task.create({
            title,
            description,
            status,
            priority,
            owner_id: req.user.id
        });
        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        
        // RBAC: check ownership or admin
        if (task.owner.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }
        
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // RBAC: check ownership or admin
        if (task.owner.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to delete" });
        }
        
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
