const mongoose = require('mongoose');

const consultationNoteSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    medecin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rendezVous: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RendezVous',
    },
    date: { type: Date, default: Date.now },
    diagnostic: { type: String, required: true },
    traitement: { type: String },
    notes: { type: String },
    statutPatient: {
      type: String,
      enum: ['stable', 'en observation', 'critique', 'guéri'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConsultationNote', consultationNoteSchema);
