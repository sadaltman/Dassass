const nodemailer = require('nodemailer');
const sendEmail = async(toEmail, userName, eventName, ticketId, qrCode) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
        const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');
    const mail = {
        from: `Felicity <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Your ticket for ${eventName}`,
        html: `
            <h1>Registration Confirmed!</h1>
            <p>Hi ${userName},</p>
            <p>You are registered for <strong>${eventName}</strong></p>
            <p><strong>Ticket Id:</strong> ${ticketId}</p>
            <p><img src="cid:qrcode@felicity" width="200" height="200" alt="QR Code"/></p>
            <p>Show this QR at the venue</p>
            <p><em>If QR code doesn't display, please find it attached below.</em></p>
        `,
        attachments: [{
            filename: 'ticket-qr.png',
            content: qrBuffer,
            contentType: 'image/png',
            cid: 'qrcode@felicity',
            contentDisposition: 'inline'
        }]
    };
    try {
        const response = await transporter.sendMail(mail);
        console.log('Email sent:', response.messageId);
        return { success: true, data: response };
    } catch (err) {
        console.log('Email error:', err);
        return { success: false, error: err };
    }
};

module.exports = { sendEmail };