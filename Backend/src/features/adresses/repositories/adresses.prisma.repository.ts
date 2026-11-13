import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type { IAdressesRepository } from './adresses.repository.interface';
import type { AdresseResponseDto } from '../dto/output/adresse-response.dto';
import type { CreateAdresseInput } from '../dto/input/create-adresse.dto';
import type { UpdateAdresseInput } from '../dto/input/update-adresse.dto';
import type { Adresse, PeutSeSituer } from '../../../generated/prisma/client';

type LiaisonWithAdresse = PeutSeSituer & { adresse: Adresse };

@Injectable()
export class AdressesPrismaRepository implements IAdressesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAllByUser(utilisateurId: string): Promise<AdresseResponseDto[]> {
        const liaisons = await this.prisma.peutSeSituer.findMany({
            where: { utilisateur_id: utilisateurId, is_valide: true },
            include: { adresse: true },
            orderBy: { date_creation: 'asc' },
        });
        return liaisons.map((l) => this.toDto(l));
    }

    async findByIdAndUser(
        id: string,
        utilisateurId: string,
    ): Promise<AdresseResponseDto | null> {
        const liaison = await this.prisma.peutSeSituer.findFirst({
            where: { id, utilisateur_id: utilisateurId, is_valide: true },
            include: { adresse: true },
        });
        return liaison ? this.toDto(liaison) : null;
    }

    async findAdresseByGooglePlaceId(
        googlePlaceId: string,
    ): Promise<{ id: string } | null> {
        return this.prisma.adresse.findUnique({
            where: { google_place_id: googlePlaceId },
            select: { id: true },
        });
    }

    async create(
        utilisateurId: string,
        data: CreateAdresseInput,
    ): Promise<AdresseResponseDto> {
        // Upsert sur Adresse (déduplication via google_place_id) puis création de la liaison
        const liaison = await this.prisma.$transaction(async (tx) => {
            const adresse = await tx.adresse.upsert({
                where: { google_place_id: data.googlePlaceId },
                update: {},
                create: {
                    numero: data.numero ?? null,
                    rue: data.rue,
                    code_postal: data.codePostal,
                    ville: data.ville,
                    pays: data.pays ?? 'France',
                    latitude: data.latitude,
                    longitude: data.longitude,
                    google_place_id: data.googlePlaceId,
                },
            });

            return tx.peutSeSituer.create({
                data: {
                    utilisateur_id: utilisateurId,
                    adresse_id: adresse.id,
                    titre_description: data.titreDescription ?? null,
                },
                include: { adresse: true },
            });
        });

        return this.toDto(liaison);
    }

    async updateMetadata(
        id: string,
        data: Pick<UpdateAdresseInput, 'titreDescription'>,
    ): Promise<AdresseResponseDto> {
        const liaison = await this.prisma.peutSeSituer.update({
            where: { id },
            data: { titre_description: data.titreDescription },
            include: { adresse: true },
        });
        return this.toDto(liaison);
    }

    async setPrincipal(
        id: string,
        utilisateurId: string,
    ): Promise<AdresseResponseDto> {
        // Transaction atomique : une seule adresse principale possible par client
        const liaison = await this.prisma.$transaction(async (tx) => {
            await tx.peutSeSituer.updateMany({
                where: { utilisateur_id: utilisateurId, is_valide: true },
                data: { adresse_principal: false },
            });

            return tx.peutSeSituer.update({
                where: { id },
                data: { adresse_principal: true },
                include: { adresse: true },
            });
        });

        return this.toDto(liaison);
    }

    async unsetPrincipal(id: string): Promise<AdresseResponseDto> {
        const liaison = await this.prisma.peutSeSituer.update({
            where: { id },
            data: { adresse_principal: false },
            include: { adresse: true },
        });
        return this.toDto(liaison);
    }

    async softDelete(id: string): Promise<void> {
        await this.prisma.peutSeSituer.update({
            where: { id },
            data: { is_valide: false, date_invalidite: new Date() },
        });
    }

    private toDto(liaison: LiaisonWithAdresse): AdresseResponseDto {
        return {
            id: liaison.id,
            adresseId: liaison.adresse_id,
            numero: liaison.adresse.numero,
            rue: liaison.adresse.rue,
            codePostal: liaison.adresse.code_postal,
            ville: liaison.adresse.ville,
            pays: liaison.adresse.pays,
            latitude: Number(liaison.adresse.latitude),
            longitude: Number(liaison.adresse.longitude),
            googlePlaceId: liaison.adresse.google_place_id,
            titreDescription: liaison.titre_description,
            adressePrincipal: liaison.adresse_principal,
            isValide: liaison.is_valide,
            dateCreation: liaison.date_creation,
        };
    }
}
