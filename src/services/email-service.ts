import nodemailer from 'nodemailer';
import { MailConfigs } from '../configs';

export class EmailService {
    private static _transporter: nodemailer.Transporter;
    private static _account = {
        user: MailConfigs.account.user,
        pass: MailConfigs.account.pass
    };
    static init() {
        this._transporter = nodemailer.createTransport({
            host: MailConfigs.host,
            port: MailConfigs.port,
            secure: false,
            auth: this._account
        });
    }
    static async sendMail(options: {
        to: string;
        subject: string;
        text: string;
        html: string;
    }) {
        const message = {
            from: `eTutor Admin <${this._account.user}>`,
            ...options
        };
        const info = await this._transporter.sendMail(message);

        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}