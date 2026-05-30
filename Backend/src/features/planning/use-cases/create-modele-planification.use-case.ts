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
        if (dto.heure_fin <= dto.heure_debut) {
            throw new BadRequestException(
                "L'heure de fin doit être strictement supérieure à l'heure de début.",
            );
        }

        // 2. Le technicien doit exister avec le rôle approprié
        const technicienExiste = await this.repo.technicienExists(
            dto.technicien_id,
        );
        if (!technicienExiste) {
            throw new NotFoundException(
                `Technicien introuvable : ${dto.technicien_id}`,
            );
        }

        // 3. Le technicien doit être affecté à cette zone
        const estAffecte = await this.repo.isAffecteAZone(
            dto.technicien_id,
            dto.zone_id,
        );
        if (!estAffecte) {
            throw new BadRequestException(
                `Le technicien ${dto.technicien_id} n'est pas affecté à la zone ${dto.zone_id}.`,
            );
        }

        // 4. Détection de chevauchement : même technicien + même jour + horaires qui se recoupent
        const dateDebut = new Date(dto.date_debut_validite);
        const dateFin = dto.date_fin_validite
            ? new Date(dto.date_fin_validite)
            : null;

        const chevauchements = await this.repo.findModelesChevauchants(
            dto.technicien_id,
            dto.jour_semaine,
            dto.heure_debut,
            dto.heure_fin,
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
            technicien_id: dto.technicien_id,
            zone_id: dto.zone_id,
            jour_semaine: dto.jour_semaine,
            heure_debut: dto.heure_debut,
            heure_fin: dto.heure_fin,
            intervalle_minutes: dto.intervalle_minutes,
            is_actif: dto.is_actif ?? true,
            date_debut_validite: dateDebut,
            date_fin_validite: dateFin,
        });
    }
}
