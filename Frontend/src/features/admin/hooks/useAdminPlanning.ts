import { useCallback, useEffect, useState } from 'react';
import { adminPlanningService } from '../services/adminPlanningService';
import type {
  CreateIndisponibilitePayload,
  CreateModelePlanificationPayload,
  CreatePauseRecurrentePayload,
  Indisponibilite,
  ModelePlanification,
  PauseRecurrente,
  UpdateModelePlanificationPayload,
} from '../types/planning.types';
import type { AdminUser } from '../types/admin.types';

export function useAdminPlanning() {
  const [techniciens, setTechniciens] = useState<AdminUser[]>([]);
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<string>('');

  const [modeles, setModeles] = useState<ModelePlanification[]>([]);
  const [pauses, setPauses] = useState<PauseRecurrente[]>([]);
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial : liste des techniciens
  useEffect(() => {
    adminPlanningService
      .getTechniciens()
      .then(setTechniciens)
      .catch(() => setError('Impossible de charger la liste des techniciens.'));
  }, []);

  // Rechargement réactif : quand le technicien sélectionné change
  const fetchAllForTechnicien = useCallback(async (technicienId: string) => {
    if (!technicienId) {
      setModeles([]);
      setPauses([]);
      setIndisponibilites([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [m, p, i] = await Promise.all([
        adminPlanningService.getModeles(technicienId),
        adminPlanningService.getPauses(technicienId),
        adminPlanningService.getIndisponibilites(technicienId),
      ]);
      setModeles(m);
      setPauses(p);
      setIndisponibilites(i);
    } catch {
      setError('Impossible de charger les données de planification.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllForTechnicien(selectedTechnicienId);
  }, [selectedTechnicienId, fetchAllForTechnicien]);

  // ── Mutations modèles ───────────────────────────────────────────────────────

  const createModele = async (payload: CreateModelePlanificationPayload) => {
    await adminPlanningService.createModele(payload);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  const updateModele = async (id: string, payload: UpdateModelePlanificationPayload) => {
    await adminPlanningService.updateModele(id, payload);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  const deleteModele = async (id: string) => {
    await adminPlanningService.deleteModele(id);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  // ── Mutations pauses ────────────────────────────────────────────────────────

  const createPause = async (payload: CreatePauseRecurrentePayload) => {
    await adminPlanningService.createPause(payload);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  const deletePause = async (id: string) => {
    await adminPlanningService.deletePause(id);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  // ── Mutations indisponibilités ──────────────────────────────────────────────

  const createIndisponibilite = async (payload: CreateIndisponibilitePayload) => {
    await adminPlanningService.createIndisponibilite(payload);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  const deleteIndisponibilite = async (id: string) => {
    await adminPlanningService.deleteIndisponibilite(id);
    await fetchAllForTechnicien(selectedTechnicienId);
  };

  return {
    techniciens,
    selectedTechnicienId,
    setSelectedTechnicienId,
    modeles,
    pauses,
    indisponibilites,
    isLoading,
    error,
    createModele,
    updateModele,
    deleteModele,
    createPause,
    deletePause,
    createIndisponibilite,
    deleteIndisponibilite,
  };
}