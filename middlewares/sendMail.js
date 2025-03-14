const nodemailer = require("nodemailer");

const sendMail = async (email, subject, data) => {
  const trasport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 {
                    color: orange;
                }
                p {
                    margin-bottom: 20px;
                    color: #666;
                }
                .otp {
                    font-size: 36px;
                    color: #7b68ee; /* Purple text */
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>OTP Verification</h1>
                <p>Hello ${data.first_name} your (One-Time Password) for your account verification is.</p>
                <p class="otp">${data.otp}</p> 
            </div>
        </body>
    </html>
`;

  await trasport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

const sendForgotMail = async (subject, data) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const html = `
  <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 {
                    color: orange;
                }
                p {
                    margin-bottom: 20px;
                    color: #666;
                }
                .otp {
                    font-size: 36px;
                    color: #7b68ee; /* Purple text */
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>OTP Verification</h1>
                <p>Hello your (One-Time Password) for Reset Your Password is.</p>
                <p class="otp">${data.otp}</p> 
            </div>
        </body>
    </html>
  `;

  await transport.sendMail({
    from: process.env.Gmail,
    to: data.email,
    subject,
    html,
  });
};

module.exports = {
  sendMail,
  sendForgotMail,
};
