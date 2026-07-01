const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generatedToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findByEmail(email);

        if (userExists) {
            return res.status(400).json({ success: false, message: "User Already Exists" });
        }
        
        const user = await User.create({ name, email, password, role });
        res.status(201).json({ 
            success: true, 
            token: generatedToken(user.id),
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user || !(await User.comparePassword(password, user.password))) {
            return res.status(401).json({
                success: false, message: "Invalid Credentials"
            });
        }
        res.status(200).json({
            success: true, 
            token: generatedToken(user.id),
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
}
