import { IsArray, IsUUID } from 'class-validator';

export class SetTechnicienZonesDto {
    @IsArray()
    @IsUUID('4', { each: true })
    zone_ids: string[];
}
