import { useCallback, useEffect, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
  Creneau,
  CreateIndisponibilitePayload,
  CreateModelePlanificationPayload,
  CreatePauseRecurrentePayload,
  GenerateCreneauxPayload,
  GenerationRapport,
  Indisponibilite,
  ModelePlanification,
  PauseRecurrente,
  UpdateModelePlanificationPayload,
} from '../types/planning.types';
import type { AdminUser } from '../types/admin.types';

// Données de planification d'un technicien, chargées ensemble.
interface DonneesTechnicien {
  modeles: ModelePlanification[];
  pauses: PauseRecurrente[];
  indisponibilites: Indisponibilite[];
}

const AUCUNE_DONNEE: DonneesTechnicien = { modeles: [], pauses: [], indisponibilites: [] };

export function useAdminPlanning() {
  const [techniciens, setTechniciens] = useState<AdminUser[]>([]);
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<string>('');

  const [creneaux, setCreneaux] = useState<Creneau[]>([]);

  const [techniciensError, setTechniciensError] = useState<string | null>(null);
  const [isLoadingCreneaux, setIsLoadingCreneaux] = useState(false);
  const [creneauxError, setCreneauxError] = useState<string | null>(null);

  // Chargement initial : liste des techniciens. Le setState a lieu après
  // l'await, dans l'effet lui-même : autorisé par set-state-in-effect.
  useEffect(() => {
    void (async () => {
      try {
        const data = await adminPlanningService.getTechniciens();
        setTechniciens(data);
      } catch {
        setTechniciensError('Impossible de charger la liste des techniciens.');
      }
    })();
  }, []);

  // Le loader dépend du technicien sélectionné : useCallback ne le recrée que
  // lorsqu'il change, ce qui déclenche le rechargement de ses données.
  const loadDonnees = useCallback(async (): Promise<DonneesTechnicien> => {
    if (!selectedTechnicienId) return AUCUNE_DONNEE;
    const [modeles, pauses, indisponibilites] = await Promise.all([
      adminPlanningService.getModeles(selectedTechnicienId),
      adminPlanningService.getPauses(selectedTechnicienId),
      adminPlanningService.getIndisponibilites(selectedTechnicienId),
    ]);
    return { modeles, pauses, indisponibilites };
  }, [selectedTechnicienId]);

  const {
    data: { modeles, pauses, indisponibilites },
    isLoading,
    error: donneesError,
    reload,
  } = useAsyncData(
    loadDonnees,
    AUCUNE_DONNEE,
    'Impossible de charger les données de planification.',
  );

  // Une seule erreur exposée, comme avant : celle des techniciens d'abord.
  const error = techniciensError ?? donneesError;

  // ── Mutations modèles ───────────────────────────────────────────────────────

  const createModele = async (payload: CreateModelePlanificationPayload) => {
    await adminPlanningService.createModele(payload);
    reload();
  };

  const updateModele = async (id: string, payload: UpdateModelePlanificationPayload) => {
    await adminPlanningService.updateModele(id, payload);
    reload();
  };

  const deleteModele = async (id: string) => {
    await adminPlanningService.deleteModele(id);
    reload();
  };

  // ── Mutations pauses ────────────────────────────────────────────────────────

  const createPause = async (payload: CreatePauseRecurrentePayload) => {
    await adminPlanningService.createPause(payload);
    reload();
  };

  const deletePause = async (id: string) => {
    await adminPlanningService.deletePause(id);
    reload();
  };

  // ── Mutations indisponibilités ──────────────────────────────────────────────

  const createIndisponibilite = async (payload: CreateIndisponibilitePayload) => {
    await adminPlanningService.createIndisponibilite(payload);
    reload();
  };

  const deleteIndisponibilite = async (id: string) => {
    await adminPlanningService.deleteIndisponibilite(id);
    reload();
  };

  // ── Créneaux ────────────────────────────────────────────────────────────────

  const loadCreneaux = async (dateDebut: string, dateFin: string) => {
    if (!selectedTechnicienId) return;
    setIsLoadingCreneaux(true);
    setCreneauxError(null);
    try {
      const result = await adminPlanningService.getCreneaux(selectedTechnicienId, dateDebut, dateFin);
      setCreneaux(result);
    } catch {
      setCreneauxError('Impossible de charger les créneaux.');
    } finally {
      setIsLoadingCreneaux(false);
    }
  };

  const generateCreneaux = async (payload: GenerateCreneauxPayload): Promise<GenerationRapport> => {
    return adminPlanningService.generateCreneaux(payload);
  };

  const generateAllCreneaux = async (dateFinGeneration?: string): Promise<GenerationRapport> => {
    return adminPlanningService.generateAllCreneaux({
      technicienId: selectedTechnicienId,
      dateFinGeneration: dateFinGeneration,
    });
  };

  const deleteCreneau = async (id: string, dateDebut: string, dateFin: string) => {
    await adminPlanningService.deleteCreneau(id);
    await loadCreneaux(dateDebut, dateFin);
  };

  const deleteCreneauxDisponibles = async (
    dateDebut: string,
    dateFin: string,
  ): Promise<{ deleted: number }> => {
    const result = await adminPlanningService.deleteCreneauxDisponibles(
      selectedTechnicienId,
      dateDebut,
      dateFin,
    );
    await loadCreneaux(dateDebut, dateFin);
    return result;
  };

  return {
    techniciens,
    selectedTechnicienId,
    setSelectedTechnicienId,
    modeles,
    pauses,
    indisponibilites,
    creneaux,
    isLoading,
    error,
    isLoadingCreneaux,
    creneauxError,
    createModele,
    updateModele,
    deleteModele,
    createPause,
    deletePause,
    createIndisponibilite,
    deleteIndisponibilite,
    loadCreneaux,
    generateCreneaux,
    generateAllCreneaux,
    deleteCreneau,
    deleteCreneauxDisponibles,
  };
}