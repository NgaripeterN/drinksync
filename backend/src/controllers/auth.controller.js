const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'customer']
        );
        const user = result.rows[0];
        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error during registration:', error.message);
        if (error.code === '23505') { // Unique violation error code
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ message: 'Logged in successfully', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.user;
    const { name, email, password } = req.body;

    try {
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (name) {
            fields.push(`name = $${queryIndex++}`);
            values.push(name);
        }
        if (email) {
            fields.push(`email = $${queryIndex++}`);
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push(`password = $${queryIndex++}`);
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING id, name, email, role`;

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = result.rows[0];

        const token = jwt.sign(
            { id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, email: updatedUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
            token
        });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        if (error.code === '23505') { // Unique violation on email
            return res.status(409).json({ message: 'This email is already in use.' });
        }
        res.status(500).json({ message: 'Server error during profile update' });
    }
};
