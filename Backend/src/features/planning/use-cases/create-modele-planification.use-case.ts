import {
    BadRequestException,
    ConflictException,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { CreateModelePlanificationDto } from '../dto/create-modele-planification.dto';
import { ModelePlanificationDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class CreateModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        dto: CreateModelePlanificationDto,
    ): Promise<ModelePlanificationDto> {
        // 1. Validation métier : les heures doivent former une plage valide
        if (dto.heureFin <= dto.heureDebut) {
            throw new BadRequestException(
                "L'heure de fin doit être strictement supérieure à l'heure de début.",
            );
        }

        // 2. Le technicien doit exister avec le rôle approprié
        const technicienExiste = await this.repo.technicienExists(
            dto.technicienId,
        );
        if (!technicienExiste) {
            throw new NotFoundException(
                `Technicien introuvable : ${dto.technicienId}`,
            );
        }

        // 3. Le technicien doit être affecté à cette zone
        const estAffecte = await this.repo.isAffecteAZone(
            dto.technicienId,
            dto.zoneId,
        );
        if (!estAffecte) {
            throw new BadRequestException(
                `Le technicien ${dto.technicienId} n'est pas affecté à la zone ${dto.zoneId}.`,
            );
        }

        // 4. Détection de chevauchement : même technicien + même jour + horaires qui se recoupent
        const dateDebut = new Date(dto.dateDebutValidite);
        const dateFin = dto.dateFinValidite
            ? new Date(dto.dateFinValidite)
            : null;

        const chevauchements = await this.repo.findModelesChevauchants(
            dto.technicienId,
            dto.jourSemaine,
            dto.heureDebut,
            dto.heureFin,
            dateDebut,
            dateFin,
        );

        if (chevauchements.length > 0) {
            throw new ConflictException(
                `Ce technicien a déjà un modèle de planification qui chevauche ces horaires ce jour.`,
            );
        }

        // 5. Toutes les règles sont respectées — on crée
        return this.repo.createModele({
            technicienId: dto.technicienId,
            zoneId: dto.zoneId,
            jourSemaine: dto.jourSemaine,
            heureDebut: dto.heureDebut,
            heureFin: dto.heureFin,
            intervalleMinutes: dto.intervalleMinutes,
            isActif: dto.isActif ?? true,
            dateDebutValidite: dateDebut,
            dateFinValidite: dateFin,
        });
    }
}
