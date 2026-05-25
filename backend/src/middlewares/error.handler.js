// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Erreur de validation', errors: messages });
  }

  // Duplicata (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    return res.status(400).json({ message: `${field} déjà utilisé` });
  }

  // Cast error (id invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
  });
};

module.exports = errorHandler;
