const bcrypt = require('bcryptjs');

const User = require('../models/User');

const logger = require('../utils/logger');

// ========================================
// REGISTER
// ========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email
      ? email.toLowerCase().trim()
      : '';

    logger.debug(
      `Registration request received email=${normalizedEmail || 'missing'}`
    );

    // Validate required fields
    if (!name || !email || !password) {
      logger.warn(
        `Registration validation failed reason=missing_required_fields email=${normalizedEmail || 'missing'}`
      );

      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      logger.warn(
        `Registration validation failed reason=weak_password email=${normalizedEmail}`
      );

      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check existing user
    logger.debug(
      `Checking existing user email=${normalizedEmail}`
    );

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      logger.warn(
        `Registration rejected reason=user_already_exists email=${normalizedEmail}`
      );

      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    logger.debug(
      `Password hashing started email=${normalizedEmail}`
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    logger.debug(
      `Password hashing completed email=${normalizedEmail}`
    );

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      status: 'Active',
    });

    logger.info(
      `User registration successful userId=${user._id} email=${normalizedEmail} role=${user.role}`
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {

    logger.error(
      `Register operation failed message="${error.message}"`,
      error
    );

    // Handle duplicate email race condition
    if (error.code === 11000) {

      logger.warn(
        'Registration rejected reason=duplicate_email_race_condition'
      );

      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ========================================
// LOGIN
// ========================================

const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const normalizedEmail = email
      ? email.toLowerCase().trim()
      : '';

    logger.debug(
      `Login request received email=${normalizedEmail || 'missing'}`
    );

    // Validate required fields
    if (!email || !password) {

      logger.warn(
        `Login validation failed reason=missing_credentials email=${normalizedEmail || 'missing'}`
      );

      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    logger.debug(
      `Searching user for login email=${normalizedEmail}`
    );

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // User does not exist
    if (!user) {

      logger.warn(
        `Login failed reason=invalid_credentials email=${normalizedEmail}`
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check account status
    if (user.status === 'Inactive') {

      logger.warn(
        `Login rejected reason=inactive_account userId=${user._id}`
      );

      return res.status(403).json({
        success: false,
        message: 'Your account is inactive',
      });
    }

    // Validate password
    logger.debug(
      `Password validation started userId=${user._id}`
    );

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {

      logger.warn(
        `Login failed reason=invalid_credentials userId=${user._id}`
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();

    await user.save();

    logger.info(
      `User login successful userId=${user._id} email=${normalizedEmail} role=${user.role}`
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {

    logger.error(
      `Login operation failed message="${error.message}"`,
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};