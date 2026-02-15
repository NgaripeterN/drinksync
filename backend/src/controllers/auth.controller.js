const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const validator = require('validator');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Security Enhancement: Add a list of disposable email domains to block.
// This list is not exhaustive and should be regularly updated or replaced with a dedicated service.
const disposableEmailDomains = [
  'mailinator.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com'
  // Add more domains as needed
];

// Security Best Practice: Implement rate limiting on auth endpoints to prevent brute-force attacks.
// Example using express-rate-limit:
// const rateLimit = require('express-rate-limit');
// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10 requests per 15 minutes
// app.use('/auth/register', authLimiter);
// app.use('/auth/login', authLimiter);

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    // 0. Name Validation
    if (!name || name.trim().length < 1 || name.length > 50) {
        return res.status(400).json({ message: 'Full name must be between 1 and 50 characters.' });
    }

    // 1. Email Validation
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    // Block disposable email providers
    const domain = email.split('@')[1];
    if (disposableEmailDomains.includes(domain)) {
        return res.status(400).json({ message: 'Registrations from temporary email providers are not allowed.' });
    }

    // 2. Password Strength Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password is too weak. It must be at least 10 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            // Sanitize name input to prevent XSS if it's ever rendered without escaping
            [validator.escape(name), email, hashedPassword, role || 'customer']
        );
        const user = result.rows[0];
        // DO NOT return the password hash
        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        // Log detailed error for debugging, but don't expose it to the client
        console.error('Error during registration:', error.message);
        if (error.code === '23505') { // Unique violation error code for email
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration. Please try again later.' });
    }
};

// Security Best Practice: Apply rate limiting here as well.
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            // Use a generic message to prevent email enumeration attacks
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Use a generic message to prevent password timing attacks
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return user info, but explicitly exclude the password
        res.status(200).json({ message: 'Logged in successfully', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Security Best Practice: Apply rate limiting here as well.
exports.updateProfile = async (req, res) => {
    const { id } = req.user;
    const { name, email, password } = req.body;

    try {
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (name) {
            // Name Validation
            if (name.trim().length < 1 || name.length > 50) {
                return res.status(400).json({ message: 'Full name must be between 1 and 50 characters.' });
            }
            fields.push(`name = $${queryIndex++}`);
            // Sanitize name input to prevent XSS
            values.push(validator.escape(name));
        }
        if (email) {
            // Email Validation
            if (!validator.isEmail(email)) {
                return res.status(400).json({ message: 'Please enter a valid email address.' });
            }
            const domain = email.split('@')[1];
            if (disposableEmailDomains.includes(domain)) {
                return res.status(400).json({ message: 'Temporary email providers are not allowed.' });
            }
            fields.push(`email = $${queryIndex++}`);
            values.push(email);
        }
        if (password) {
            // Password Strength Validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message: 'New password is too weak. It must be at least 10 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
                });
            }
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
