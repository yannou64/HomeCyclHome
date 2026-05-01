import {
    LegalPageLayout,
    LegalList,
    LegalSection,
    LegalText,
} from '../shared/components/LegalPageLayout/LegalPageLayout';

export default function ConfidentialitePage() {
    return (
        <LegalPageLayout
            title="Politique de confidentialité"
            updated="Dernière mise à jour : mai 2026"
        >
            <LegalSection title="1. Responsable du traitement">
                <LegalText>
                    <strong>LeCycleLyonnais</strong>
                    <br />
                    Adresse : à compléter
                    <br />
                    Email : contact@lecyclelyonnais.fr
                </LegalText>
                <LegalText>
                    Pour toute question relative à vos données personnelles, vous pouvez
                    nous contacter à l'adresse ci-dessus.
                </LegalText>
            </LegalSection>

            <LegalSection title="2. Données collectées">
                <LegalText>
                    Dans le cadre de l'utilisation de HomeCycl'Home, nous collectons
                    les données suivantes :
                </LegalText>
                <LegalList>
                    <li>
                        <strong>Données d'identité :</strong> nom, prénom
                    </li>
                    <li>
                        <strong>Données de contact :</strong> adresse email, numéro de
                        téléphone
                    </li>
                    <li>
                        <strong>Données de localisation :</strong> adresse d'intervention
                        (lors de la réservation)
                    </li>
                    <li>
                        <strong>Données relatives au vélo :</strong> marque, type, libellé
                        et caractéristiques optionnelles
                    </li>
                    <li>
                        <strong>Données de connexion :</strong> date de dernière connexion,
                        tokens de session (stockés de manière sécurisée)
                    </li>
                </LegalList>
                <LegalText>
                    <strong>Aucune donnée bancaire n'est collectée.</strong> Le paiement
                    s'effectue exclusivement en espèces, par chèque ou par carte bancaire
                    directement auprès du technicien.
                </LegalText>
            </LegalSection>

            <LegalSection title="3. Finalités du traitement">
                <LegalText>Vos données sont collectées pour les finalités suivantes :</LegalText>
                <LegalList>
                    <li>Création et gestion de votre compte utilisateur</li>
                    <li>Réservation et suivi des interventions à domicile</li>
                    <li>
                        Vérification de la couverture géographique de votre adresse
                    </li>
                    <li>
                        Communication relative à vos interventions (confirmation, rappels)
                    </li>
                    <li>Respect de nos obligations légales et contractuelles</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="4. Base légale du traitement">
                <LegalText>Le traitement de vos données repose sur :</LegalText>
                <LegalList>
                    <li>
                        <strong>L'exécution du contrat</strong> : traitement nécessaire
                        à la fourniture du service de réservation (art. 6.1.b RGPD)
                    </li>
                    <li>
                        <strong>Votre consentement</strong> : pour les communications
                        non contractuelles (art. 6.1.a RGPD)
                    </li>
                    <li>
                        <strong>Le respect d'obligations légales</strong> : conservation
                        de certaines données imposée par la loi (art. 6.1.c RGPD)
                    </li>
                </LegalList>
            </LegalSection>

            <LegalSection title="5. Durée de conservation">
                <LegalText>
                    Vos données sont conservées pendant toute la durée de vie de votre
                    compte. En cas de suppression de compte, vos données personnelles et
                    vos vélos enregistrés sont supprimés immédiatement et définitivement.
                </LegalText>
                <LegalText>
                    Certaines données peuvent être conservées au-delà, dans les limites
                    imposées par la loi (obligations comptables, archivage légal).
                </LegalText>
            </LegalSection>

            <LegalSection title="6. Cookies et tokens de session">
                <LegalText>
                    HomeCycl'Home utilise des cookies techniques nécessaires au
                    fonctionnement du service :
                </LegalText>
                <LegalList>
                    <li>
                        <strong>Cookie de session (access_token) :</strong> token JWT
                        stocké en cookie HttpOnly sécurisé, durée de vie 15 minutes
                    </li>
                    <li>
                        <strong>Cookie de renouvellement (refresh_token) :</strong> token
                        de renouvellement stocké en cookie HttpOnly sécurisé, durée de
                        vie 7 jours
                    </li>
                </LegalList>
                <LegalText>
                    Ces cookies sont strictement nécessaires à l'authentification et ne
                    peuvent pas être désactivés. Ils sont automatiquement supprimés à la
                    déconnexion. Aucun cookie de traçage, analytique ou publicitaire
                    n'est utilisé.
                </LegalText>
            </LegalSection>

            <LegalSection title="7. Vos droits RGPD">
                <LegalText>
                    Conformément au RGPD (Règlement UE 2016/679), vous disposez des
                    droits suivants :
                </LegalText>
                <LegalList>
                    <li>
                        <strong>Droit d'accès :</strong> consulter vos données depuis
                        votre page de profil
                    </li>
                    <li>
                        <strong>Droit de rectification :</strong> modifier vos
                        informations depuis votre page de profil
                    </li>
                    <li>
                        <strong>Droit à l'effacement :</strong> supprimer votre compte
                        (et toutes les données associées) depuis votre page de profil
                    </li>
                    <li>
                        <strong>Droit à la portabilité :</strong> obtenir une copie de
                        vos données en nous contactant
                    </li>
                    <li>
                        <strong>Droit d'opposition :</strong> vous opposer à certains
                        traitements en nous contactant
                    </li>
                </LegalList>
                <LegalText>
                    Pour exercer vos droits, contactez-nous à :{' '}
                    <strong>contact@lecyclelyonnais.fr</strong>
                </LegalText>
                <LegalText>
                    En cas de réclamation, vous pouvez saisir la{' '}
                    <strong>CNIL</strong> (Commission Nationale de l'Informatique et
                    des Libertés) — www.cnil.fr.
                </LegalText>
            </LegalSection>
        </LegalPageLayout>
    );
}
