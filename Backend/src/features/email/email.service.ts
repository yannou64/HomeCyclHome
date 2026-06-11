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

    async sendInterventionConfirmationEmail(
        to: string,
        prenom: string,
        dateCreation: string,
    ): Promise<void> {
        const date = new Date(dateCreation).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        await this.mailerService.sendMail({
            to,
            subject: "Votre intervention est confirmée — HomeCycl'Home",
            text: [
                `Bonjour ${prenom},`,
                ``,
                `Votre intervention a bien été enregistrée le ${date}.`,
                `Notre équipe vous contactera prochainement pour confirmer les détails.`,
                ``,
                `À bientôt,`,
                `L'équipe HomeCycl'Home`,
            ].join('\n'),
        });
    }
}
