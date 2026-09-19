const Student = require('../models/Student');
const logger = require('../utils/logger');

// ========================================
// Generate Student ID
// ========================================

const generateStudentId = async () => {
  logger.debug('Generating next student ID');

  const lastStudent = await Student
    .findOne()
    .sort({ createdAt: -1 });

  if (!lastStudent) {
    logger.debug('No existing students found. Starting student ID sequence at STU001');
    return 'STU001';
  }

  const lastNumber = parseInt(
    lastStudent.studentId.replace('STU', ''),
    10
  );

  const nextStudentId = `STU${String(lastNumber + 1).padStart(3, '0')}`;

  logger.debug(
    `Student ID generated previousId=${lastStudent.studentId} nextId=${nextStudentId}`
  );

  return nextStudentId;
};

// ========================================
// CREATE STUDENT
// ========================================

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dob,
      gender,
      course,
      year,
      address
    } = req.body;

    logger.info(
      `Create student request received email=${email || 'missing'} course=${course || 'missing'} year=${year || 'missing'}`
    );

    // Required fields
    if (!name || !email || !phone || !course || !year) {
      logger.warn(
        `Student creation validation failed reason=missing_required_fields email=${email || 'missing'}`
      );

      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    logger.debug(
      `Checking existing student email=${normalizedEmail}`
    );

    // Check duplicate email
    const existingStudent = await Student.findOne({
      email: normalizedEmail
    });

    if (existingStudent) {
      logger.warn(
        `Student creation rejected reason=duplicate_email email=${normalizedEmail} studentId=${existingStudent.studentId}`
      );

      return res.status(409).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Generate student ID
    const studentId = await generateStudentId();

    logger.debug(
      `Creating student record studentId=${studentId}`
    );

    // Create student
    const student = await Student.create({
      studentId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      dob: dob || undefined,
      gender: gender || '',
      course,
      year,
      address: address || '',
      status: 'Active'
    });

    logger.info(
      `Student created successfully studentId=${student.studentId} course=${student.course} year=${student.year}`
    );

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });

  } catch (error) {
    logger.error(
      `Create student operation failed message="${error.message}"`,
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
};

// ========================================
// GET ALL STUDENTS
// ========================================

const getStudents = async (req, res) => {
  try {
    logger.info('Fetching all students');

    const students = await Student
      .find()
      .sort({ createdAt: -1 });

    logger.info(
      `Students fetched successfully count=${students.length}`
    );

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    logger.error(
      `Get students operation failed message="${error.message}"`,
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// ========================================
// GET SINGLE STUDENT
// ========================================

const getStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    logger.info(
      `Fetching student studentRecordId=${studentId}`
    );

    const student = await Student.findById(studentId);

    if (!student) {
      logger.warn(
        `Student lookup failed reason=student_not_found studentRecordId=${studentId}`
      );

      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    logger.info(
      `Student fetched successfully studentId=${student.studentId}`
    );

    return res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    logger.error(
      `Get student operation failed studentRecordId=${req.params.id} message="${error.message}"`,
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message
    });
  }
};

// ========================================
// UPDATE STUDENT
// ========================================

const updateStudent = async (req, res) => {
  try {
    const studentRecordId = req.params.id;

    logger.info(
      `Update student request received studentRecordId=${studentRecordId}`
    );

    logger.debug(
      `Updating student record studentRecordId=${studentRecordId} fields=${Object.keys(req.body).join(',')}`
    );

    const student = await Student.findByIdAndUpdate(
      studentRecordId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      logger.warn(
        `Student update failed reason=student_not_found studentRecordId=${studentRecordId}`
      );

      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    logger.info(
      `Student updated successfully studentId=${student.studentId}`
    );

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    logger.error(
      `Update student operation failed studentRecordId=${req.params.id} message="${error.message}"`,
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
};

// ========================================
// DELETE STUDENT
// ========================================

const deleteStudent = async (req, res) => {
  try {
    const studentRecordId = req.params.id;

    logger.info(
      `Delete student request received studentRecordId=${studentRecordId}`
    );

    const student = await Student.findByIdAndDelete(
      studentRecordId
    );

    if (!student) {
      logger.warn(
        `Student deletion failed reason=student_not_found studentRecordId=${studentRecordId}`
      );

      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    logger.info(
      `Student deleted successfully studentId=${student.studentId}`
    );

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    logger.error(
      `Delete student operation failed studentRecordId=${req.params.id} message="${error.message}"`,
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
};