import { useState } from 'react';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '../../../../../shared/components/ui/tabs';
import { useAdminInterventions } from '../../../hooks/useAdminInterventions';
import { useAdminInterventionFilters } from '../../../hooks/useAdminInterventionFilters';
import { AdminInterventionsList } from '../AdminInterventionsList/AdminInterventionsList';
import { AdminInterventionDetailDialog } from '../AdminInterventionDetailDialog/AdminInterventionDetailDialog';
import type { ActiveInterventionTab } from '../../../types/adminIntervention.types';
import styles from './AdminInterventionsSection.module.scss';

export function AdminInterventionsSection() {
    const {
        interventions,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        zoneId,
        setZoneId,
        technicienId,
        setTechnicienId,
    } = useAdminInterventions();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { zones, techniciens, loadError } = useAdminInterventionFilters();

    const listProps = {
        interventions,
        isLoading,
        error,
        zones,
        techniciens,
        zoneId,
        technicienId,
        onZoneFilter: setZoneId,
        onTechnicienFilter: setTechnicienId,
        onRowClick: setSelectedId,
    };

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Interventions</h2>

            {loadError && <p className={styles.error}>{loadError}</p>}

            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as ActiveInterventionTab)}
                className={styles.tabs}
            >
                <TabsList className={styles.tabsList}>
                    <TabsTrigger value="planifiees" className={styles.tabsTrigger}>
                        Planifiées
                    </TabsTrigger>
                    <TabsTrigger value="archivees" className={styles.tabsTrigger}>
                        Archivées
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="planifiees">
                    <AdminInterventionsList {...listProps} />
                </TabsContent>

                <TabsContent value="archivees">
                    <AdminInterventionsList {...listProps} />
                </TabsContent>
            </Tabs>

            <AdminInterventionDetailDialog
                id={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
}
