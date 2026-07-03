import { ApiProperty } from '@nestjs/swagger';
import { AdminInterventionListItemDto } from './admin-intervention-list-item.dto';

class ClientSnapshotDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    prenom: string;

    @ApiProperty()
    nom: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    telephone: string;
}

class AdresseSnapshotDto {
    @ApiProperty({ nullable: true, type: String })
    numero: string | null;

    @ApiProperty()
    rue: string;

    @ApiProperty()
    codePostal: string;

    @ApiProperty()
    ville: string;
}

class CycleSnapshotDto {
    @ApiProperty()
    libelle: string;

    @ApiProperty()
    marque: string;

    @ApiProperty()
    type: string;
}

class PhotoDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    urlS3: string;
}

export class AdminInterventionDetailDto extends AdminInterventionListItemDto {
    @ApiProperty()
    dateCreation: string;

    @ApiProperty({ nullable: true, type: String })
    dateFin: string | null;

    @ApiProperty()
    dureeMinutesSnapshot: number;

    @ApiProperty({ nullable: true, type: String })
    commentaire: string | null;

    @ApiProperty({ type: () => ClientSnapshotDto })
    client: ClientSnapshotDto;

    @ApiProperty({ type: () => AdresseSnapshotDto })
    adresse: AdresseSnapshotDto;

    @ApiProperty({ type: () => CycleSnapshotDto })
    cycle: CycleSnapshotDto;

    @ApiProperty({ type: () => [PhotoDto] })
    photosClient: PhotoDto[];

    @ApiProperty({ type: () => [PhotoDto] })
    photosTechnicien: PhotoDto[];
}
