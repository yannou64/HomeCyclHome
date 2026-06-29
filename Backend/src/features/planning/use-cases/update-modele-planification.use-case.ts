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
        const heureDebut = dto.heureDebut ?? existant.heureDebut;
        const heureFin = dto.heureFin ?? existant.heureFin;

        if (heureFin <= heureDebut) {
            throw new BadRequestException(
                "L'heure de fin doit être strictement supérieure à l'heure de début.",
            );
        }

        // 3. Vérifier l'absence de chevauchement en excluant ce modèle lui-même
        const jourSemaine = dto.jourSemaine ?? existant.jourSemaine;
        const dateDebut = dto.dateDebutValidite
            ? new Date(dto.dateDebutValidite)
            : new Date(existant.dateDebutValidite);
        const dateFin =
            dto.dateFinValidite !== undefined
                ? dto.dateFinValidite
                    ? new Date(dto.dateFinValidite)
                    : null
                : existant.dateFinValidite
                  ? new Date(existant.dateFinValidite)
                  : null;

        const chevauchements = await this.repo.findModelesChevauchants(
            existant.technicienId,
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
            ...(dto.jourSemaine !== undefined && {
                jourSemaine: dto.jourSemaine,
            }),
            ...(dto.heureDebut !== undefined && {
                heureDebut: dto.heureDebut,
            }),
            ...(dto.heureFin !== undefined && { heureFin: dto.heureFin }),
            ...(dto.intervalleMinutes !== undefined && {
                intervalleMinutes: dto.intervalleMinutes,
            }),
            ...(dto.isActif !== undefined && { isActif: dto.isActif }),
            ...(dto.dateDebutValidite !== undefined && {
                dateDebutValidite: new Date(dto.dateDebutValidite),
            }),
            ...(dto.dateFinValidite !== undefined && {
                dateFinValidite: dto.dateFinValidite
                    ? new Date(dto.dateFinValidite)
                    : null,
            }),
        });
    }
}
