import { ApiProperty } from '@nestjs/swagger';
import { ModelePlanificationResponseDto } from './modele-planification-response.dto';

/**
 * Un modèle ouvert pour être modifié (US-02 « Modifier un modèle de
 * planification 2.0 ») : toutes ses valeurs, et s'il est encore valide.
 */
export class ModeleDetailResponseDto extends ModelePlanificationResponseDto {
    // RG11 : faux si la zone n'est plus affectée au technicien ou est
    // inactive. Le modèle se lit, mais sa modification est refusée.
    @ApiProperty()
    valide!: boolean;
}
