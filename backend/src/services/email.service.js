const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendCredentials = async (email, prenom, nom, tempPassword) => {
  if (!process.env.EMAIL_USER) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Hôpital' <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vos identifiants de connexion — Système Hospitalier',
    html: `
      <h2>Bienvenue, Dr. ${prenom} ${nom}</h2>
      <p>Votre compte médecin a été créé sur la plateforme hospitalière.</p>
      <table>
        <tr><td><strong>Email :</strong></td><td>${email}</td></tr>
        <tr><td><strong>Mot de passe temporaire :</strong></td><td>${tempPassword}</td></tr>
      </table>
      <p>Connectez-vous dès que possible et modifiez votre mot de passe.</p>
      <a href='${process.env.FRONTEND_URL || 'http://localhost:4200'}/login">Se connecter</a>
    `,
  });
};

const sendPasswordReset = async (email, prenom, nom, tempPassword) => {
  if (!process.env.EMAIL_USER) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Hôpital' <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <h2>Dr. ${prenom} ${nom}</h2>
      <p>Votre mot de passe a été réinitialisé par l'administrateur.</p>
      <p><strong>Nouveau mot de passe temporaire :</strong> ${tempPassword}</p>
    `,
  });
};

module.exports = { sendCredentials, sendPasswordReset };
