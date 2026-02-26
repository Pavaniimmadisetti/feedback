const facultyModel = require('../models/facultyModel');

async function listFaculty(req, res) {
  const data = await facultyModel.list();
  return res.json({ data });
}

async function createFaculty(req, res) {
  const { faculty_code, name, email, department, designation } = req.body;
  if (!faculty_code || !name || !email || !department || !designation) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const id = await facultyModel.create({ faculty_code, name, email, department, designation });
  return res.status(201).json({ message: 'Faculty created', id });
}

async function updateFaculty(req, res) {
  const { faculty_code, name, email, department, designation, is_active } = req.body;
  await facultyModel.update(req.params.id, {
    faculty_code,
    name,
    email,
    department,
    designation,
    is_active: Boolean(is_active)
  });
  return res.json({ message: 'Faculty updated' });
}

async function deleteFaculty(req, res) {
  await facultyModel.remove(req.params.id);
  return res.json({ message: 'Faculty deleted' });
}

module.exports = {
  listFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
