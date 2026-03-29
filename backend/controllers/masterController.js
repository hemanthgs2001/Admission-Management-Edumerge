const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Department = require('../models/Department');
const Program = require('../models/Program');

// Institution Controllers
const createInstitution = async (req, res) => {
  try {
    const { name, code } = req.body;
    
    // Check if code already exists
    const existingInstitution = await Institution.findOne({ code });
    if (existingInstitution) {
      return res.status(400).json({ message: 'Institution code already exists' });
    }
    
    const institution = new Institution({ name, code });
    await institution.save();
    res.status(201).json(institution);
  } catch (error) {
    res.status(500).json({ message: 'Error creating institution', error: error.message });
  }
};

const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find().populate('campuses');
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institutions', error: error.message });
  }
};

// Campus Controllers
const createCampus = async (req, res) => {
  try {
    const { name, institutionId } = req.body;
    const campus = new Campus({ name, institution: institutionId });
    await campus.save();
    await Institution.findByIdAndUpdate(institutionId, { $push: { campuses: campus._id } });
    res.status(201).json(campus);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campus', error: error.message });
  }
};

const getCampuses = async (req, res) => {
  try {
    const campuses = await Campus.find().populate('institution departments');
    res.json(campuses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campuses', error: error.message });
  }
};

// Department Controllers
const createDepartment = async (req, res) => {
  try {
    const { name, campusId } = req.body;
    const department = new Department({ name, campus: campusId });
    await department.save();
    await Campus.findByIdAndUpdate(campusId, { $push: { departments: department._id } });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('campus programs');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Program Controllers
const createProgram = async (req, res) => {
  try {
    const { name, code, departmentId, academicYear, courseType, entryType, totalIntake, quotas } = req.body;
    
    // Check if code already exists
    const existingProgram = await Program.findOne({ code });
    if (existingProgram) {
      return res.status(400).json({ message: 'Program code already exists' });
    }
    
    // Validate quota sum equals total intake
    const quotaSum = quotas.reduce((sum, q) => sum + q.seats, 0);
    if (quotaSum !== totalIntake) {
      return res.status(400).json({ message: 'Total quota seats must equal total intake' });
    }
    
    const program = new Program({
      name,
      code,
      department: departmentId,
      academicYear,
      courseType,
      entryType,
      totalIntake,
      quotas,
    });
    
    await program.save();
    await Department.findByIdAndUpdate(departmentId, { $push: { programs: program._id } });
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: 'Error creating program', error: error.message });
  }
};

const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate('department');
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching programs', error: error.message });
  }
};

const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const program = await Program.findByIdAndUpdate(id, updates, { new: true });
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Error updating program', error: error.message });
  }
};

module.exports = {
  createInstitution,
  getInstitutions,
  createCampus,
  getCampuses,
  createDepartment,
  getDepartments,
  createProgram,
  getPrograms,
  updateProgram,
};