import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/ui/table';
import type {
  Creneau,
  GenerateCreneauxPayload,
  GenerationRapport,
  ModelePlanification,
} from '../../../types/planning.types';
import { PlanningDeleteDialog } from '../PlanningDeleteDialog/PlanningDeleteDialog';
import { CreneauGenerationForm } from './CreneauGenerationForm';
import { GenerationRapportDialog } from './GenerationRapportDialog';
import styles from './CreneauxTab.module.scss';

interface CreneauxTabProps {
  modeles: ModelePlanification[];
  creneaux: Creneau[];
  isLoading: boolean;
  error: string | null;
  onGenerate: (payload: GenerateCreneauxPayload) => Promise<GenerationRapport>;
  onGenerateAll: (dateFinGeneration?: string) => Promise<GenerationRapport>;
  onLoad: (dateDebut: string, dateFin: string) => Promise<void>;
  onDelete: (id: string, dateDebut: string, dateFin: string) => Promise<void>;
  onDeleteDisponibles: (dateDebut: string, dateFin: string) => Promise<{ deleted: number }>;
}

function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Groupe les créneaux par jour (clé = date locale YYYY-MM-DD)
function grouperParJour(creneaux: Creneau[]): Map<string, Creneau[]> {
  const map = new Map<string, Creneau[]>();
  for (const c of creneaux) {
    const jour = c.dateDebut.slice(0, 10);
    const existing = map.get(jour) ?? [];
    map.set(jour, [...existing, c]);
  }
  return map;
}

// Dates par défaut : mois courant → mois suivant
function defaultDateRange(): { debut: string; fin: string } {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 2, 0); // dernier jour du mois suivant
  return {
    debut: debut.toISOString().slice(0, 10),
    fin: fin.toISOString().slice(0, 10),
  };
}

export function CreneauxTab({
  modeles,
  creneaux,
  isLoading,
  error,
  onGenerate,
  onGenerateAll,
  onLoad,
  onDelete,
  onDeleteDisponibles,
}: CreneauxTabProps) {
  const defaults = defaultDateRange();
  const [dateDebut, setDateDebut] = useState(defaults.debut);
  const [dateFin, setDateFin] = useState(defaults.fin);

  const [rapport, setRapport] = useState<GenerationRapport | null>(null);
  const [isRapportOpen, setIsRapportOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Creneau | null>(null);
  const [isDeletingDisponibles, setIsDeletingDisponibles] = useState(false);

  const handleLoad = () => {
    void onLoad(dateDebut, dateFin);
  };

  const handleRapport = (r: GenerationRapport) => {
    setRapport(r);
    setIsRapportOpen(true);
    void onLoad(dateDebut, dateFin);
  };

  const nbDisponibles = creneaux.filter((c) => c.isDisponible).length;
  const groupes = grouperParJour(creneaux);

  return (
    <div className={styles.wrapper}>
      <CreneauGenerationForm
        modeles={modeles}
        onGenerate={onGenerate}
        onGenerateAll={onGenerateAll}
        onRapport={handleRapport}
      />

      <div className={styles.filterBar}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="creneaux-debut">Du</label>
          <input
            id="creneaux-debut"
            type="date"
            className={styles.filterInput}
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="creneaux-fin">Au</label>
          <input
            id="creneaux-fin"
            type="date"
            className={styles.filterInput}
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
        <button className={styles.loadButton} onClick={handleLoad}>
          Charger
        </button>

        {nbDisponibles > 0 && (
          <button
            className={styles.deleteDisponiblesButton}
            onClick={() => setIsDeletingDisponibles(true)}
          >
            Supprimer les disponibles ({nbDisponibles})
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : creneaux.length === 0 ? (
        <p className={styles.empty}>
          Aucun créneau sur cette période. Générez-en via le formulaire ci-dessus ou ajustez la plage de dates.
        </p>
      ) : (
        <div className={styles.listWrapper}>
          {Array.from(groupes.entries()).map(([jour, items]) => (
            <div key={jour} className={styles.dayGroup}>
              <h4 className={styles.dayTitle}>{formatDate(items[0].dateDebut)}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Heure</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className={styles.actionsHead}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((creneau) => (
                    <TableRow key={creneau.id}>
                      <TableCell className={styles.heure}>
                        {formatHeure(creneau.dateDebut)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            creneau.isDisponible ? styles.badgeDisponible : styles.badgeReserve
                          }
                        >
                          {creneau.isDisponible ? 'Disponible' : 'Réservé'}
                        </span>
                      </TableCell>
                      <TableCell className={styles.actions}>
                        {creneau.isDisponible && (
                          <button
                            className={styles.deleteButton}
                            onClick={() => setDeletingItem(creneau)}
                            aria-label="Supprimer ce créneau"
                          >
                            🗑️ Supprimer
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}

          <div className={styles.footer}>
            <span className={styles.count}>
              {creneaux.length} créneau{creneaux.length > 1 ? 'x' : ''} —{' '}
              {creneaux.filter((c) => c.isDisponible).length} disponible{creneaux.filter((c) => c.isDisponible).length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <GenerationRapportDialog
        isOpen={isRapportOpen}
        onClose={() => setIsRapportOpen(false)}
        rapport={rapport}
      />

      <PlanningDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => onDelete(deletingItem!.id, dateDebut, dateFin)}
        title="Supprimer le créneau"
        description="Êtes-vous sûr de vouloir supprimer ce créneau disponible ? Cette action est irréversible."
      />

      <PlanningDeleteDialog
        isOpen={isDeletingDisponibles}
        onClose={() => setIsDeletingDisponibles(false)}
        onConfirm={async () => { await onDeleteDisponibles(dateDebut, dateFin); }}
        title="Supprimer les créneaux disponibles"
        description={`Êtes-vous sûr de vouloir supprimer les ${nbDisponibles} créneau${nbDisponibles > 1 ? 'x' : ''} disponible${nbDisponibles > 1 ? 's' : ''} sur cette période ? Cette action est irréversible.`}
      />
    </div>
  );
}