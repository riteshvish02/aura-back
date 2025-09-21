const nodemailer = require("nodemailer")

exports.sendmail = (email,url)=>{
 const transport = nodemailer.createTransport({
    service: "gmail",
    host:"smtp.gmail.com",
    post: 465,
    auth: {
        user:process.env.MAIL_EMAIL_ADDRESS,
        pass:process.env.MAIL_EMAIL_PASS
    }
 })
 
 const mailOptions = {
    from:"Syneidesiscorp.com",
    to:email,
    subject: "forget password Link",
    // text: "Don't share this link to anyone"
    html: `
     <h1>click link below to forget password</h1>
     <a href="${url}">Reset Password</a>
     `
 }

 transport.sendMail(mailOptions)
}
