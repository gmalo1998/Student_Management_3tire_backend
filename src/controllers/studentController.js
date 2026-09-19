const Student = require('../models/Student');

// ========================================
// Generate Student ID
// ========================================

const generateStudentId = async () => {
  const lastStudent = await Student
    .findOne()
    .sort({ createdAt: -1 });

  if (!lastStudent) {
    return 'STU001';
  }

  const lastNumber = parseInt(
    lastStudent.studentId.replace('STU', ''),
    10
  );

  return `STU${String(lastNumber + 1).padStart(3, '0')}`;
};

// ========================================
// CREATE STUDENT
// ========================================

const createStudent = async (req, res) => {
  try {
    console.log('CREATE STUDENT REQUEST:', req.body);

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

    // Required fields
    if (!name || !email || !phone || !course || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check duplicate email
    const existingStudent = await Student.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Generate student ID
    const studentId = await generateStudentId();

    // Create student
    const student = await Student.create({
      studentId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      dob: dob || undefined,
      gender: gender || '',
      course,
      year,
      address: address || '',
      status: 'Active'
    });

    console.log('STUDENT CREATED:', student);

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });

  } catch (error) {
    console.error('CREATE STUDENT ERROR:', error);

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
    const students = await Student
      .find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('GET STUDENTS ERROR:', error);

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
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('GET STUDENT ERROR:', error);

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
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    console.error('UPDATE STUDENT ERROR:', error);

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
    const student = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('DELETE STUDENT ERROR:', error);

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