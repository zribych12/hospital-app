const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    medecin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    heure: { type: String, required: true },
    duree: { type: Number, default: 30 }, // minutes
    motif: { type: String, required: true },
    type: {
      type: String,
      enum: ['consultation', 'urgence', 'suivi'],
      default: 'consultation',
    },
    statut: {
      type: String,
      enum: ['en attente', 'confirmé', 'annulé', 'présent', 'absent'],
      default: 'en attente',
    },
    niveauUrgence: {
      type: String,
      enum: ['faible', 'moyen', 'élevé'],
      default: 'faible',
    },
    reference: { type: String, unique: true },
    // Patient public (prise de RDV sans compte)
    patientPublic: {
      nom: String,
      prenom: String,
      dateNaissance: Date,
      telephone: String,
      email: String,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

rendezVousSchema.pre('save', function (next) {
  if (!this.reference) {
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.reference = `RDV-${Date.now()}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('RendezVous', rendezVousSchema);
