import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../shared/components/ui/tabs';
import { useAdminPlanning } from '../../../hooks/useAdminPlanning';
import { CreneauxTab } from '../CreneauxTab/CreneauxTab';
import { IndisponibiliteList } from '../IndisponibiliteList/IndisponibiliteList';
import { ModelePlanificationList } from '../ModelePlanificationList/ModelePlanificationList';
import { PauseRecurrenteList } from '../PauseRecurrenteList/PauseRecurrenteList';
import styles from './AdminPlanningSection.module.scss';

export function AdminPlanningSection() {
  const {
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
  } = useAdminPlanning();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Planification</h2>
        <div className={styles.selectorWrapper}>
          <label className={styles.selectorLabel} htmlFor="planning-technicien">
            Technicien
          </label>
          <select
            id="planning-technicien"
            className={styles.selector}
            value={selectedTechnicienId}
            onChange={(e) => setSelectedTechnicienId(e.target.value)}
          >
            <option value="">— Sélectionner un technicien —</option>
            {techniciens.map((t) => (
              <option key={t.id} value={t.id}>
                {t.prenom} {t.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTechnicienId ? (
        <p className={styles.placeholder}>
          Sélectionnez un technicien pour gérer sa planification.
        </p>
      ) : (
        <Tabs defaultValue="modeles" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="modeles" className={styles.tabsTrigger}>
              Modèles
            </TabsTrigger>
            <TabsTrigger value="pauses" className={styles.tabsTrigger}>
              Pauses
            </TabsTrigger>
            <TabsTrigger value="indisponibilites" className={styles.tabsTrigger}>
              Indisponibilités
            </TabsTrigger>
            <TabsTrigger value="creneaux" className={styles.tabsTrigger}>
              Créneaux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modeles">
            <ModelePlanificationList
              modeles={modeles}
              technicienId={selectedTechnicienId}
              isLoading={isLoading}
              error={error}
              onCreate={createModele}
              onUpdate={updateModele}
              onDelete={deleteModele}
            />
          </TabsContent>

          <TabsContent value="pauses">
            <PauseRecurrenteList
              pauses={pauses}
              technicienId={selectedTechnicienId}
              isLoading={isLoading}
              error={error}
              onCreate={createPause}
              onDelete={deletePause}
            />
          </TabsContent>

          <TabsContent value="indisponibilites">
            <IndisponibiliteList
              indisponibilites={indisponibilites}
              technicienId={selectedTechnicienId}
              isLoading={isLoading}
              error={error}
              onCreate={createIndisponibilite}
              onDelete={deleteIndisponibilite}
            />
          </TabsContent>

          <TabsContent value="creneaux">
            <CreneauxTab
              modeles={modeles}
              creneaux={creneaux}
              isLoading={isLoadingCreneaux}
              error={creneauxError}
              onGenerate={generateCreneaux}
              onGenerateAll={generateAllCreneaux}
              onLoad={loadCreneaux}
              onDelete={deleteCreneau}
              onDeleteDisponibles={deleteCreneauxDisponibles}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
