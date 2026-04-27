import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../shared/components/ui/tabs';
import { MarquesTab } from '../MarquesTab/MarquesTab';
import { TypesCyclesTab } from '../TypesCyclesTab/TypesCyclesTab';
import styles from './AdminCyclesSection.module.scss';

export function AdminCyclesSection() {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Cycles</h2>
      <Tabs defaultValue="marques" className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="marques" className={styles.tabsTrigger}>
            Marques
          </TabsTrigger>
          <TabsTrigger value="types" className={styles.tabsTrigger}>
            Types de cycles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="marques">
          <MarquesTab />
        </TabsContent>
        <TabsContent value="types">
          <TypesCyclesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
