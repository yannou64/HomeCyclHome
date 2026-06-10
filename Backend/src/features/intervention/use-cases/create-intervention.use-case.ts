import {
    BadRequestException,
    ConflictException,
    UnprocessableEntityException,
} from '@nestjs/common';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';

// Type plat compatible avec CreateInterventionDto (class-validator).
// Les champs conditionnels sont optionnels ici — les gardes runtime dans execute()
// lèvent BadRequestException si un champ requis selon source est absent.
export type CreateInterventionInput = {
    adresse: {
        source: 'saved' | 'autocomplete';
        adresseId?: string;
        rue?: string;
        codePostal?: string;
        ville?: string;
        latitude?: number;
        longitude?: number;
        googlePlaceId?: string;
        numero?: string;
        pays?: string;
    };
    cycle: {
        source: 'existing' | 'new';
        cycleId?: string;
        typeCycleId?: string;
        marqueId?: string;
    };
    forfaitId: string;
    creneauId: string;
    commentaire?: string;
};

export class CreateInterventionUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

    async execute(
        utilisateurId: string,
        dto: CreateInterventionInput,
    ): Promise<InterventionCreatedDto> {
        // 1. Vérifier la disponibilité du créneau — garde critique contre les double-réservations
        const disponible = await this.repo.isCreneauDisponible(dto.creneauId);
        if (!disponible) {
            throw new ConflictException('Ce créneau n\'est plus disponible.');
        }

        // 2. Résoudre le cycleId selon la source
        const cycleId = await this.resoudreCycleId(utilisateurId, dto.cycle);

        // 3. Résoudre l'adresseId selon la source
        const adresseId = await this.resoudreAdresseId(dto.adresse);

        // 4. Snapshot prix actif du forfait au moment de la réservation
        const prix = await this.repo.getPrixActuelForfait(dto.forfaitId);
        if (!prix) {
            throw new UnprocessableEntityException(
                'Ce forfait ne possède pas de prix actif.',
            );
        }

        // 5. Snapshot technicien depuis le modèle du créneau (null si créneau manuel)
        const technicienId = await this.repo.getTechnicienFromCreneau(dto.creneauId);

        // 6. Snapshot durée du forfait
        const dureeMinutesSnapshot = await this.repo.getForfaitDuree(dto.forfaitId);

        // 7. Transaction atomique : INSERT Intervention + UPDATE Creneau.is_disponible = false
        return this.repo.createInterventionTransaction({
            clientId: utilisateurId,
            cycleId,
            forfaitId: dto.forfaitId,
            creneauId: dto.creneauId,
            adresseId,
            historiquePrixForfaitId: prix.id,
            dureeMinutesSnapshot,
            technicienId,
            commentaire: dto.commentaire,
        });
    }

    private async resoudreCycleId(
        utilisateurId: string,
        cycle: CreateInterventionInput['cycle'],
    ): Promise<string> {
        if (cycle.source === 'existing') {
            if (!cycle.cycleId) {
                throw new BadRequestException(
                    'cycleId est requis pour un cycle existant.',
                );
            }
            return cycle.cycleId;
        }
        // source === 'new'
        if (!cycle.typeCycleId || !cycle.marqueId) {
            throw new BadRequestException(
                'typeCycleId et marqueId sont requis pour créer un nouveau cycle.',
            );
        }
        return this.repo.createCycle(utilisateurId, {
            typeCycleId: cycle.typeCycleId,
            marqueId: cycle.marqueId,
        });
    }

    private async resoudreAdresseId(
        adresse: CreateInterventionInput['adresse'],
    ): Promise<string> {
        if (adresse.source === 'saved') {
            if (!adresse.adresseId) {
                throw new BadRequestException(
                    'adresseId est requis pour une adresse sauvegardée.',
                );
            }
            return adresse.adresseId;
        }
        // source === 'autocomplete' — upsert sur google_place_id (idempotent)
        if (
            !adresse.rue ||
            !adresse.codePostal ||
            !adresse.ville ||
            adresse.latitude === undefined ||
            adresse.longitude === undefined ||
            !adresse.googlePlaceId
        ) {
            throw new BadRequestException(
                'rue, codePostal, ville, latitude, longitude et googlePlaceId sont requis pour une adresse autocomplete.',
            );
        }
        return this.repo.upsertAdresse({
            rue: adresse.rue,
            codePostal: adresse.codePostal,
            ville: adresse.ville,
            latitude: adresse.latitude,
            longitude: adresse.longitude,
            googlePlaceId: adresse.googlePlaceId,
            numero: adresse.numero,
            pays: adresse.pays,
        });
    }
}
