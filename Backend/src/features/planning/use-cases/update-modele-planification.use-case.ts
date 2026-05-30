import {
    BadRequestException,
    ConflictException,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { UpdateModelePlanificationDto } from '../dto/update-modele-planification.dto';
import { ModelePlanificationDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class UpdateModelePlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        id: string,
        dto: UpdateModelePlanificationDto,
    ): Promise<ModelePlanificationDto> {
        // 1. Le modèle doit exister
        const existant = await this.repo.findModeleById(id);
        if (!existant) {
            throw new NotFoundException(
                `Modèle de planification introuvable : ${id}`,
            );
        }

        // 2. Fusionner les valeurs pour valider l'état final
        const heureDebut = dto.heure_debut ?? existant.heure_debut;
        const heureFin = dto.heure_fin ?? existant.heure_fin;

        if (heureFin <= heureDebut) {
            throw new BadRequestException(
                "L'heure de fin doit être strictement supérieure à l'heure de début.",
            );
        }

        // 3. Vérifier l'absence de chevauchement en excluant ce modèle lui-même
        const jourSemaine = dto.jour_semaine ?? existant.jour_semaine;
        const dateDebut = dto.date_debut_validite
            ? new Date(dto.date_debut_validite)
            : new Date(existant.date_debut_validite);
        const dateFin =
            dto.date_fin_validite !== undefined
                ? dto.date_fin_validite
                    ? new Date(dto.date_fin_validite)
                    : null
                : existant.date_fin_validite
                  ? new Date(existant.date_fin_validite)
                  : null;

        const chevauchements = await this.repo.findModelesChevauchants(
            existant.technicien_id,
            jourSemaine,
            heureDebut,
            heureFin,
            dateDebut,
            dateFin,
            id, // excludeId : on s'exclut soi-même de la détection
        );

        if (chevauchements.length > 0) {
            throw new ConflictException(
                `Ce technicien a déjà un modèle de planification qui chevauche ces horaires ce jour.`,
            );
        }

        return this.repo.updateModele(id, {
            ...(dto.jour_semaine !== undefined && {
                jour_semaine: dto.jour_semaine,
            }),
            ...(dto.heure_debut !== undefined && {
                heure_debut: dto.heure_debut,
            }),
            ...(dto.heure_fin !== undefined && { heure_fin: dto.heure_fin }),
            ...(dto.intervalle_minutes !== undefined && {
                intervalle_minutes: dto.intervalle_minutes,
            }),
            ...(dto.is_actif !== undefined && { is_actif: dto.is_actif }),
            ...(dto.date_debut_validite !== undefined && {
                date_debut_validite: new Date(dto.date_debut_validite),
            }),
            ...(dto.date_fin_validite !== undefined && {
                date_fin_validite: dto.date_fin_validite
                    ? new Date(dto.date_fin_validite)
                    : null,
            }),
        });
    }
}
