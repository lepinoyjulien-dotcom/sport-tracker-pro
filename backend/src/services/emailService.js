const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email to new user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  // Skip if no API key configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Skipping welcome email.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sport Tracker Pro <onboarding@resend.dev>', // Change this to your domain later
      to: [userEmail],
      subject: '🎉 Bienvenue sur Sport Tracker Pro !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Sport Tracker Pro</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px;">💪</h1>
                      <h2 style="color: white; margin: 10px 0 0 0; font-size: 24px;">Sport Tracker Pro</h2>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h3 style="color: #333; margin: 0 0 20px 0;">Bienvenue ${userName} ! 👋</h3>
                      
                      <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                        Nous sommes ravis de vous accueillir sur <strong>Sport Tracker Pro</strong>, 
                        votre compagnon pour suivre vos performances sportives !
                      </p>
                      
                      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                        <h4 style="color: #333; margin: 0 0 15px 0;">🚀 Pour commencer :</h4>
                        <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Ajoutez vos activités cardio 🏃</li>
                          <li>Suivez vos séances de musculation 💪</li>
                          <li>Trackez votre poids ⚖️</li>
                          <li>Visualisez vos statistiques 📊</li>
                        </ul>
                      </div>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://sport-tracker-pro.vercel.app" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Accéder à l'application
                        </a>
                      </div>
                      
                      <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                        Besoin d'aide ? Répondez simplement à cet email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #999; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Sport Tracker Pro - Tous droits réservés
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('✅ Welcome email sent to:', userEmail);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 * @param {string} userEmail - User's email
 * @param {string} resetToken - Reset token
 */
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Skipping reset email.');
    return { success: false, message: 'Email service not configured' };
  }

  const resetLink = `https://sport-tracker-pro.vercel.app/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sport Tracker Pro <onboarding@resend.dev>',
      to: [userEmail],
      subject: '🔐 Réinitialisation de votre mot de passe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation mot de passe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; padding: 40px;">
                  <tr>
                    <td>
                      <h2 style="color: #333;">🔐 Réinitialisation de mot de passe</h2>
                      <p style="color: #666; line-height: 1.6;">
                        Vous avez demandé à réinitialiser votre mot de passe. 
                        Cliquez sur le bouton ci-dessous pour continuer :
                      </p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="display: inline-block; background-color: #667eea; color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold;">
                          Réinitialiser mon mot de passe
                        </a>
                      </div>
                      <p style="color: #999; font-size: 14px;">
                        Ce lien expire dans 1 heure.<br>
                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error sending reset email:', error);
      return { success: false, error };
    }

    console.log('✅ Reset email sent to:', userEmail);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
};
