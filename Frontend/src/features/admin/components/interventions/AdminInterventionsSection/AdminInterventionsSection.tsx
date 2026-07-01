import { useState, useEffect } from 'react';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '../../../../../shared/components/ui/tabs';
import { adminZonesService } from '../../../services/adminZonesService';
import { adminUsersService } from '../../../services/adminUsersService';
import { useAdminInterventions } from '../../../hooks/useAdminInterventions';
import { AdminInterventionsList } from '../AdminInterventionsList/AdminInterventionsList';
import { AdminInterventionDetailDialog } from '../AdminInterventionDetailDialog/AdminInterventionDetailDialog';
import type { ActiveInterventionTab } from '../../../types/adminIntervention.types';
import type { AdminUser } from '../../../types/admin.types';
import type { Zone } from '../../../types/zones.types';
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
    const [zones, setZones] = useState<Zone[]>([]);
    const [techniciens, setTechniciens] = useState<AdminUser[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        adminZonesService
            .getAll()
            .then(setZones)
            .catch(() => setLoadError('Impossible de charger les zones.'));
        adminUsersService
            .getUsers({ role: 'technicien', limit: 100 })
            .then((result) => setTechniciens(result.data))
            .catch(() => setLoadError('Impossible de charger les techniciens.'));
    }, []);

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
