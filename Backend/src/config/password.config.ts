// Coût bcrypt des mots de passe : 2^12 itérations. Une seule valeur pour tous
// les comptes, qu'ils soient créés par inscription ou par un administrateur.
// Les hachages déjà stockés avec un autre coût restent vérifiables : bcrypt
// lit le coût dans le hash lui-même.
export const PASSWORD_HASH_ROUNDS = 12;
