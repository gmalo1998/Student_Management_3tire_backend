const Student = require('../models/Student');

const logger = require('../utils/logger');

// ========================================
// Generate Student ID
// ========================================

const generateStudentId = async () => {
  logger.debug('Generating next student ID');

  const lastStudent = await Student
    .findOne({
      studentId: /^STU\d+$/
    })
    .sort({ createdAt: -1 });

  if (!lastStudent) {
    logger.debug(
      'No existing students found. Starting student ID sequence at STU001'
    );

    return 'STU001';
  }

  const lastNumber = parseInt(
    lastStudent.studentId.replace('STU', ''),
    10
  );

  const nextStudentId = `STU${String(
    lastNumber + 1
  ).padStart(3, '0')}`;

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

      department,
      stream,
      course,
      specialization,
      batch,
      year,
      semester,
      section,

      admissionNumber,
      rollNumber,
      admissionDate,
      joiningDate,
      graduationYear,

      guardianName,
      guardianRelationship,
      guardianPhone,

      address
    } = req.body;

    const normalizedEmail = email
      ? email.toLowerCase().trim()
      : '';

    logger.info(
      `Create student request received email=${normalizedEmail || 'missing'} department=${department || 'missing'} course=${course || 'missing'} batch=${batch || 'missing'}`
    );

    // ========================================
    // REQUIRED FIELD VALIDATION
    // ========================================

    if (
      !name ||
      !email ||
      !phone ||
      !department ||
      !stream ||
      !course ||
      !batch ||
      !year
    ) {
      logger.warn(
        `Student creation validation failed reason=missing_required_fields email=${normalizedEmail || 'missing'}`
      );

      return res.status(400).json({
        success: false,
        message:
          'Name, email, phone, department, stream, course, batch and academic year are required'
      });
    }

    // ========================================
    // CHECK DUPLICATE EMAIL
    // ========================================

    logger.debug(
      `Checking existing student email=${normalizedEmail}`
    );

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

    // ========================================
    // CHECK DUPLICATE ADMISSION NUMBER
    // ========================================

    if (admissionNumber?.trim()) {
      const existingAdmission = await Student.findOne({
        admissionNumber: admissionNumber.trim()
      });

      if (existingAdmission) {
        logger.warn(
          `Student creation rejected reason=duplicate_admission_number admissionNumber=${admissionNumber.trim()}`
        );

        return res.status(409).json({
          success: false,
          message: 'Admission number already exists'
        });
      }
    }

    // ========================================
    // CHECK DUPLICATE ROLL NUMBER
    // ========================================

    if (rollNumber?.trim()) {
      const existingRollNumber = await Student.findOne({
        rollNumber: rollNumber.trim()
      });

      if (existingRollNumber) {
        logger.warn(
          `Student creation rejected reason=duplicate_roll_number rollNumber=${rollNumber.trim()}`
        );

        return res.status(409).json({
          success: false,
          message: 'Roll number already exists'
        });
      }
    }

    // ========================================
    // GENERATE STUDENT ID
    // ========================================

    const studentId = await generateStudentId();

    logger.debug(
      `Creating student record studentId=${studentId}`
    );

    // ========================================
    // CREATE STUDENT
    // ========================================

    const student = await Student.create({
      studentId,

      // Personal
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      dob: dob || undefined,
      gender: gender || '',

      // Academic
      department: department.trim(),
      stream: stream.trim(),
      course: course.trim(),
      specialization: specialization?.trim() || '',
      batch: batch.trim(),
      year: year.trim(),
      semester: semester || '',
      section: section || '',

      // Enrollment
      admissionNumber:
        admissionNumber?.trim() || '',
      rollNumber:
        rollNumber?.trim() || '',
      admissionDate:
        admissionDate || undefined,
      joiningDate:
        joiningDate || undefined,
      graduationYear:
        graduationYear || '',

      // Guardian
      guardianName:
        guardianName?.trim() || '',
      guardianRelationship:
        guardianRelationship || '',
      guardianPhone:
        guardianPhone?.trim() || '',

      // Address
      address: address?.trim() || '',

      // Default status
      status: 'Active'
    });

    logger.info(
      `Student created successfully studentId=${student.studentId} department=${student.department} course=${student.course} batch=${student.batch}`
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

    // MongoDB duplicate key
    if (error.code === 11000) {
      logger.warn(
        'Student creation rejected reason=duplicate_unique_field'
      );

      return res.status(409).json({
        success: false,
        message:
          'Student record already exists with the provided unique information'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create student'
    });
  }
};

// ========================================
// GET ALL STUDENTS
// ========================================

const getStudents = async (req, res) => {
  try {

    logger.info(
      'Fetching all students'
    );

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
      message: 'Failed to fetch students'
    });
  }
};

// ========================================
// GET SINGLE STUDENT
// ========================================

const getStudent = async (req, res) => {
  try {

    const studentRecordId = req.params.id;

    logger.info(
      `Fetching student studentRecordId=${studentRecordId}`
    );

    const student = await Student.findById(
      studentRecordId
    );

    if (!student) {

      logger.warn(
        `Student lookup failed reason=student_not_found studentRecordId=${studentRecordId}`
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
      message: 'Failed to fetch student'
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

    // ========================================
    // FIND EXISTING STUDENT
    // ========================================

    const existingStudent = await Student.findById(
      studentRecordId
    );

    if (!existingStudent) {

      logger.warn(
        `Student update failed reason=student_not_found studentRecordId=${studentRecordId}`
      );

      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // ========================================
    // LOG UPDATED FIELDS
    // ========================================

    const updatedFields = Object.keys(req.body);

    logger.debug(
      `Updating student studentId=${existingStudent.studentId} fields=${updatedFields.join(',')}`
    );

    // ========================================
    // NORMALIZE EMAIL
    // ========================================

    if (req.body.email) {

      req.body.email =
        req.body.email.toLowerCase().trim();

      const duplicateEmail =
        await Student.findOne({
          email: req.body.email,
          _id: {
            $ne: studentRecordId
          }
        });

      if (duplicateEmail) {

        logger.warn(
          `Student update rejected reason=duplicate_email studentId=${existingStudent.studentId} email=${req.body.email}`
        );

        return res.status(409).json({
          success: false,
          message:
            'Another student is already using this email'
        });
      }
    }

    // ========================================
    // CHECK DUPLICATE ADMISSION NUMBER
    // ========================================

    if (req.body.admissionNumber) {

      req.body.admissionNumber =
        req.body.admissionNumber.trim();

      const duplicateAdmission =
        await Student.findOne({
          admissionNumber:
            req.body.admissionNumber,

          _id: {
            $ne: studentRecordId
          }
        });

      if (duplicateAdmission) {

        logger.warn(
          `Student update rejected reason=duplicate_admission_number studentId=${existingStudent.studentId}`
        );

        return res.status(409).json({
          success: false,
          message:
            'Another student is already using this admission number'
        });
      }
    }

    // ========================================
    // CHECK DUPLICATE ROLL NUMBER
    // ========================================

    if (req.body.rollNumber) {

      req.body.rollNumber =
        req.body.rollNumber.trim();

      const duplicateRollNumber =
        await Student.findOne({
          rollNumber:
            req.body.rollNumber,

          _id: {
            $ne: studentRecordId
          }
        });

      if (duplicateRollNumber) {

        logger.warn(
          `Student update rejected reason=duplicate_roll_number studentId=${existingStudent.studentId}`
        );

        return res.status(409).json({
          success: false,
          message:
            'Another student is already using this roll number'
        });
      }
    }

    // ========================================
    // UPDATE STUDENT
    // ========================================

    const student =
      await Student.findByIdAndUpdate(
        studentRecordId,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    logger.info(
      `Student updated successfully studentId=${student.studentId} fields=${updatedFields.join(',')}`
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

    if (error.code === 11000) {

      logger.warn(
        `Student update rejected reason=duplicate_unique_field studentRecordId=${req.params.id}`
      );

      return res.status(409).json({
        success: false,
        message:
          'Another student already has the same unique information'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update student'
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

    const student =
      await Student.findByIdAndDelete(
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
      `Student deleted successfully studentId=${student.studentId} email=${student.email}`
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
      message: 'Failed to delete student'
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