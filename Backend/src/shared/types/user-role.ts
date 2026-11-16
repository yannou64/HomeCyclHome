// Rôles d'un utilisateur, socle du contrôle d'accès (RBAC). Type transverse :
// utilisé par le guard et le décorateur @Roles de shared/, et par les DTO des
// modules. Il reprend les valeurs de l'énumération Role du schéma Prisma, sans
// en dépendre : Prisma reste confiné aux repositories.
export type UserRole = 'client' | 'technicien' | 'admin';
