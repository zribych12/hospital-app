const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }
    const result = await authService.refreshAccessToken(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logout = (_req, res) => res.json({ message: 'Déconnexion réussie' });

const getMe = (req, res) => res.json({ user: req.user });

module.exports = { login, refreshToken, logout, getMe };
