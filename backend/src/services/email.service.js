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

const sendRendezVousDecision = async ({
  email,
  patientPrenom,
  patientNom,
  statut,
  date,
  heure,
  medecinPrenom,
  medecinNom,
  motif,
  reference,
}) => {
  if (!process.env.EMAIL_USER) {
    return { skipped: true, reason: 'EMAIL_USER manquant' };
  }
  if (!email) {
    return { skipped: true, reason: 'email patient manquant' };
  }

  const isAccepted = statut === 'confirmé';
  if (!isAccepted && statut !== 'annulé') {
    return { skipped: true, reason: `statut non notif: ${statut}` };
  }

  const decisionLabel = isAccepted ? 'accepté' : 'refusé';
  const subject = isAccepted
    ? 'Votre rendez-vous a été accepté'
    : 'Votre rendez-vous a été refusé';

  const parsedDate = date ? new Date(date) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const rdvDate = hasValidDate
    ? parsedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"Hôpital' <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <h2>Bonjour ${patientPrenom || ''} ${patientNom || ''},</h2>
      <p>Votre demande de rendez-vous a été <strong>${decisionLabel}</strong> par le médecin.</p>
      <table>
        <tr><td><strong>Référence :</strong></td><td>${reference || '-'}</td></tr>
        <tr><td><strong>Date :</strong></td><td>${rdvDate}</td></tr>
        <tr><td><strong>Heure :</strong></td><td>${heure || '-'}</td></tr>
        <tr><td><strong>Médecin :</strong></td><td>${medecinPrenom || ''} ${medecinNom || ''}</td></tr>
        <tr><td><strong>Motif :</strong></td><td>${motif || '-'}</td></tr>
      </table>
      <p>Merci de votre confiance.</p>
    `,
  });

  return {
    skipped: false,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  };
};

module.exports = { sendCredentials, sendPasswordReset, sendRendezVousDecision };
