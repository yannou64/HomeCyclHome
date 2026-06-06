import { Injectable, NotFoundException } from '@nestjs/common';
import type { IZonesRepository } from '../repositories/zones.repository.interface';
import type { CheckZoneResultDto } from '../dto/check-zone.dto';
import type { ZonePointDto } from '../dto/zone.dto';

@Injectable()
export class CheckZoneUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(latitude: number, longitude: number): Promise<CheckZoneResultDto> {
        const zones = await this.repo.findAllActive();

        for (const zone of zones) {
            if (this.isPointInPolygon(latitude, longitude, zone.points)) {
                return { zoneId: zone.id, nomZone: zone.nom_zone };
            }
        }

        throw new NotFoundException(
            "Aucune zone n'a été trouvée pour cette adresse",
        );
    }

    // Ray Casting (théorème de Jordan) : on lance un rayon vers l'est depuis le point
    // et on compte les intersections avec les arêtes du polygone.
    // Nombre impair d'intersections → point à l'intérieur.
    // latitude = axe Y, longitude = axe X
    private isPointInPolygon(
        lat: number,
        lng: number,
        points: ZonePointDto[],
    ): boolean {
        let inside = false;
        const n = points.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const latI = points[i].latitude;
            const lngI = points[i].longitude;
            const latJ = points[j].latitude;
            const lngJ = points[j].longitude;

            // L'arête (i, j) traverse-t-elle la latitude du point ?
            const crossesLatitude = (latI > lat) !== (latJ > lat);
            // Si oui, l'intersection est-elle à l'est (droite) du point ?
            const intersectionLng =
                ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;

            if (crossesLatitude && lng < intersectionLng) {
                inside = !inside;
            }
        }

        return inside;
    }
}
