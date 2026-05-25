const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const getMedecins = () =>
  User.find({ role: 'medecin' }).select('-passwordHash').sort({ createdAt: -1 });

const getMedecinById = (id) =>
  User.findOne({ _id: id, role: 'medecin' }).select('-passwordHash');

const createMedecin = async (data) => {
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const medecin = await User.create({
    email: data.email,
    passwordHash,
    role: 'medecin',
    nom: data.nom,
    prenom: data.prenom,
    specialite: data.specialite,
    actif: true,
  });

  const medecinObj = medecin.toObject();
  delete medecinObj.passwordHash;
  return { medecin: medecinObj, tempPassword };
};

const toggleStatus = async (id) => {
  const user = await User.findOne({ _id: id, role: 'medecin' });
  if (!user) {
    const err = new Error('Médecin non trouvé');
    err.status = 404;
    throw err;
  }
  user.actif = !user.actif;
  await user.save();
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
};

const resetPassword = async (id) => {
  const user = await User.findOne({ _id: id, role: 'medecin' });
  if (!user) {
    const err = new Error('Médecin non trouvé');
    err.status = 404;
    throw err;
  }
  const tempPassword = generateTempPassword();
  user.passwordHash = await bcrypt.hash(tempPassword, 12);
  await user.save();

  return { tempPassword };
};

module.exports = { getMedecins, getMedecinById, createMedecin, toggleStatus, resetPassword };
