import {
    LegalPageLayout,
    LegalList,
    LegalSection,
    LegalText,
} from '../shared/components/LegalPageLayout/LegalPageLayout';

export default function CguPage() {
    return (
        <LegalPageLayout
            title="Conditions Générales d'Utilisation"
            updated="Dernière mise à jour : mai 2026"
        >
            <LegalSection title="1. Objet">
                <LegalText>
                    Les présentes Conditions Générales d'Utilisation (CGU) régissent
                    l'utilisation de la plateforme <strong>HomeCycl'Home</strong>,
                    service de réservation d'interventions de réparation et d'entretien
                    de vélos à domicile, édité par LeCycleLyonnais.
                </LegalText>
                <LegalText>
                    En accédant au service et en créant un compte, vous acceptez sans
                    réserve les présentes CGU.
                </LegalText>
            </LegalSection>

            <LegalSection title="2. Accès au service">
                <LegalText>
                    L'utilisation du service est réservée aux personnes physiques
                    majeures disposant d'un vélo et résidant dans une zone
                    d'intervention couverte par LeCycleLyonnais.
                </LegalText>
                <LegalText>
                    La création d'un compte est obligatoire pour effectuer une
                    réservation. Vous devez fournir des informations exactes, complètes
                    et à jour lors de votre inscription.
                </LegalText>
            </LegalSection>

            <LegalSection title="3. Description du service">
                <LegalText>HomeCycl'Home permet aux utilisateurs de :</LegalText>
                <LegalList>
                    <li>Enregistrer leurs vélos (marque, type, caractéristiques)</li>
                    <li>
                        Réserver une intervention de réparation ou d'entretien à domicile
                    </li>
                    <li>Sélectionner un forfait et un créneau disponible</li>
                    <li>Suivre le statut de leurs interventions</li>
                </LegalList>
                <LegalText>
                    Le paiement s'effectue exclusivement en espèces, par chèque ou par
                    carte bancaire directement auprès du technicien lors de
                    l'intervention. Aucune donnée bancaire n'est collectée ou stockée
                    par LeCycleLyonnais.
                </LegalText>
            </LegalSection>

            <LegalSection title="4. Obligations de l'utilisateur">
                <LegalText>L'utilisateur s'engage à :</LegalText>
                <LegalList>
                    <li>Fournir une adresse d'intervention exacte et accessible</li>
                    <li>Être présent ou représenté lors du créneau réservé</li>
                    <li>Ne pas détourner le service de son usage prévu</li>
                    <li>
                        Ne pas créer plusieurs comptes ou usurper l'identité d'un tiers
                    </li>
                    <li>
                        Signaler toute anomalie ou utilisation frauduleuse de son compte
                    </li>
                </LegalList>
            </LegalSection>

            <LegalSection title="5. Responsabilités">
                <LegalText>
                    LeCycleLyonnais s'engage à mettre en œuvre tous les moyens
                    raisonnables pour assurer la disponibilité du service. Toutefois,
                    la responsabilité de LeCycleLyonnais ne pourra être engagée en cas
                    d'interruption du service pour maintenance, incident technique ou
                    cas de force majeure.
                </LegalText>
                <LegalText>
                    LeCycleLyonnais ne saurait être tenu responsable des dommages
                    indirects résultant de l'utilisation ou de l'impossibilité
                    d'utiliser le service.
                </LegalText>
            </LegalSection>

            <LegalSection title="6. Résiliation">
                <LegalText>
                    L'utilisateur peut supprimer son compte à tout moment depuis la
                    page de son profil. La suppression entraîne l'effacement définitif
                    de toutes ses données personnelles et de ses vélos enregistrés.
                </LegalText>
                <LegalText>
                    LeCycleLyonnais se réserve le droit de suspendre ou supprimer tout
                    compte en cas de non-respect des présentes CGU.
                </LegalText>
            </LegalSection>

            <LegalSection title="7. Modifications">
                <LegalText>
                    LeCycleLyonnais se réserve le droit de modifier les présentes CGU
                    à tout moment. Les utilisateurs seront informés des modifications
                    par tout moyen approprié. L'utilisation continue du service après
                    modification vaut acceptation des nouvelles CGU.
                </LegalText>
            </LegalSection>

            <LegalSection title="8. Droit applicable">
                <LegalText>
                    Les présentes CGU sont soumises au droit français. Tout litige sera
                    soumis à la compétence exclusive des tribunaux français.
                </LegalText>
            </LegalSection>
        </LegalPageLayout>
    );
}
