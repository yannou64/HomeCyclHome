import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendConfirmationEmail(
        to: string,
        prenom: string,
        token: string,
    ): Promise<void> {
        const confirmUrl = `${process.env.FRONTEND_URL}/confirmer-email?token=${token}`;

        await this.mailerService.sendMail({
            to,
            subject: "Confirme ton inscription — HomeCycl'Home",
            text: `Bonjour ${prenom},\n\nClique sur ce lien pour confirmer ton compte :\n${confirmUrl}\n\nCe lien expire dans 48h.`,
        });
    }
}
