const bcrypt = require('bcryptjs');

const User = require('../models/User');
const logger = require('../utils/logger');

// ==============================
// REGISTER
// ==============================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    logger.debug(
      `Registration request received email=${email ? email.toLowerCase().trim() : 'missing'}`
    );

    // Validate required fields
    if (!name || !email || !password) {
      logger.warn(
        `Registration validation failed reason=missing_required_fields email=${email || 'missing'}`
      );

      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      logger.warn(
        `Registration validation failed reason=weak_password email=${email.toLowerCase().trim()}`
      );

      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    logger.debug(
      `Checking existing user email=${normalizedEmail}`
    );

    // Check existing user
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
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    logger.info(
      `User registration successful userId=${user._id} email=${normalizedEmail}`
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
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

// ==============================
// LOGIN
// ==============================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.debug(
      `Login request received email=${email ? email.toLowerCase().trim() : 'missing'}`
    );

    // Validate required fields
    if (!email || !password) {
      logger.warn(
        `Login validation failed reason=missing_credentials email=${email || 'missing'}`
      );

      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    logger.debug(
      `Searching user for login email=${normalizedEmail}`
    );

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // User does not exist
    if (!user) {
      logger.warn(
        `Login failed reason=user_not_found email=${normalizedEmail}`
      );

      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
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
        `Login failed reason=invalid_password userId=${user._id}`
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    logger.info(
      `User login successful userId=${user._id} email=${normalizedEmail}`
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
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