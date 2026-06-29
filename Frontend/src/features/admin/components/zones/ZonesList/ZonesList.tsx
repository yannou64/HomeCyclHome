import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import type { Zone } from '../../../types/zones.types';
import styles from './ZonesList.module.scss';

interface ZonesListProps {
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
}

export function ZonesList({ zones, isLoading, error, onAdd, onEdit, onDelete }: ZonesListProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Zones géographiques</h2>
        <button className={styles.addButton} onClick={onAdd}>
          + Nouvelle zone
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className={styles.actionsHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className={styles.empty}>
                  Aucune zone enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className={styles.nomCell}>{zone.nomZone}</TableCell>
                  <TableCell>{zone.points.length} sommet{zone.points.length > 1 ? 's' : ''}</TableCell>
                  <TableCell>
                    <span className={zone.isActive ? styles.badgeActif : styles.badgeInactif}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => onEdit(zone)}
                      aria-label={`Modifier ${zone.nomZone}`}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => onDelete(zone)}
                      aria-label={`Supprimer ${zone.nomZone}`}
                    >
                      🗑️ Supprimer
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <p className={styles.count}>
        {zones.length} zone{zones.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}