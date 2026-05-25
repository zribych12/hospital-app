const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    dateNaissance: { type: Date, required: true },
    telephone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    adresse: { type: String, trim: true },
    pathologie: { type: String, trim: true },
    statut: {
      type: String,
      enum: ['stable', 'en observation', 'critique', 'guéri'],
      default: 'stable',
    },
    notesMedicales: { type: String, default: '' },
    medecin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Virtual: âge
patientSchema.virtual('age').get(function () {
  if (!this.dateNaissance) return null;
  const today = new Date();
  const birth = new Date(this.dateNaissance);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
