// backend/src/services/emailService.js
// Service d'envoi d'emails

// IMPORTANT: Pour un environnement de production, utilisez un vrai service d'email
// comme SendGrid, Mailgun, AWS SES, etc.

// Pour le développement, ce service simule l'envoi d'email et log dans la console

const sendWelcomeEmail = async (userEmail, userName, userPassword) => {
  const emailContent = `
==============================================
BIENVENUE SUR SPORT TRACKER PRO
==============================================

Bonjour ${userName},

Votre compte a été créé avec succès !

VOS IDENTIFIANTS :
------------------
Email    : ${userEmail}
Mot de passe : ${userPassword}

IMPORTANT :
- Conservez ces identifiants en lieu sûr
- Nous vous recommandons de changer votre mot de passe
  dès votre première connexion (Onglet Profil)

COMMENCER :
-----------
1. Rendez-vous sur : https://sport-tracker-pro.vercel.app
2. Connectez-vous avec vos identifiants
3. Explorez les fonctionnalités :
   - Cardio : Suivez vos activités cardiovasculaires
   - Muscu : Enregistrez vos séances de musculation
   - Poids : Suivez l'évolution de votre poids
   - Stats : Visualisez vos progrès
   - Profil : Personnalisez votre expérience

BESOIN D'AIDE ?
---------------
Contactez notre support : support@sporttracker.com

Merci de votre confiance !

L'équipe Sport Tracker Pro
==============================================
  `

  // DÉVELOPPEMENT : Log dans la console
  console.log('\n' + '='.repeat(60))
  console.log('📧 EMAIL ENVOYÉ')
  console.log('='.repeat(60))
  console.log(`To: ${userEmail}`)
  console.log(`Subject: Bienvenue sur Sport Tracker Pro`)
  console.log('='.repeat(60))
  console.log(emailContent)
  console.log('='.repeat(60) + '\n')

  // PRODUCTION : Décommentez le code ci-dessous et configurez votre service d'email

  /*
  // Exemple avec nodemailer (installer : npm install nodemailer)
  const nodemailer = require('nodemailer')
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  await transporter.sendMail({
    from: '"Sport Tracker Pro" <noreply@sporttracker.com>',
    to: userEmail,
    subject: 'Bienvenue sur Sport Tracker Pro - Vos identifiants',
    text: emailContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Bienvenue sur Sport Tracker Pro</h1>
        <p>Bonjour <strong>${userName}</strong>,</p>
        <p>Votre compte a été créé avec succès !</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Vos identifiants :</h3>
          <p><strong>Email :</strong> ${userEmail}</p>
          <p><strong>Mot de passe :</strong> ${userPassword}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p><strong>Important :</strong> Conservez ces identifiants en lieu sûr et changez votre mot de passe dès votre première connexion.</p>
        </div>
        
        <a href="https://sport-tracker-pro.vercel.app" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Se connecter
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          L'équipe Sport Tracker Pro
        </p>
      </div>
    `
  })
  */

  // PRODUCTION : Exemple avec SendGrid
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  await sgMail.send({
    to: userEmail,
    from: 'noreply@sporttracker.com',
    subject: 'Bienvenue sur Sport Tracker Pro - Vos identifiants',
    text: emailContent,
    html: ... // même HTML que ci-dessus
  })
  */

  return true
}

module.exports = {
  sendWelcomeEmail
}

}
