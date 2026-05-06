import { useState } from 'react';
import { useAdminZones } from '../../../hooks/useAdminZones';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '../../../types/zones.types';
import { ZoneDeleteDialog } from '../ZoneDeleteDialog/ZoneDeleteDialog';
import { ZoneForm } from '../ZoneForm/ZoneForm';
import { ZonesList } from '../ZonesList/ZonesList';

type View = 'list' | 'form';

export function AdminZonesSection() {
  const { items, isLoading, error, createZone, updateZone, deleteZone } = useAdminZones();
  const [view, setView] = useState<View>('list');
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);

  const handleAdd = () => {
    setEditingZone(null);
    setView('form');
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setView('form');
  };

  const handleCancel = () => {
    setEditingZone(null);
    setView('list');
  };

  const handleSubmit = async (payload: CreateZonePayload | UpdateZonePayload) => {
    if (editingZone) {
      await updateZone(editingZone.id, payload as UpdateZonePayload);
    } else {
      await createZone(payload as CreateZonePayload);
    }
  };

  return (
    <>
      {view === 'list' ? (
        <ZonesList
          zones={items}
          isLoading={isLoading}
          error={error}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={setDeletingZone}
        />
      ) : (
        <ZoneForm
          zone={editingZone ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <ZoneDeleteDialog
        isOpen={!!deletingZone}
        onClose={() => setDeletingZone(null)}
        onConfirm={() => deleteZone(deletingZone!.id)}
        zone={deletingZone}
      />
    </>
  );
}
