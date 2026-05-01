import {
    LegalPageLayout,
    LegalSection,
    LegalText,
} from '../shared/components/LegalPageLayout/LegalPageLayout';

export default function MentionsLegalesPage() {
    return (
        <LegalPageLayout
            title="Mentions légales"
            updated="Dernière mise à jour : mai 2026"
        >
            <LegalSection title="Éditeur du site">
                <LegalText>
                    <strong>LeCycleLyonnais</strong>
                    <br />
                    Adresse : à compléter
                    <br />
                    SIRET : à compléter
                    <br />
                    Email : contact@lecyclelyonnais.fr
                </LegalText>
            </LegalSection>

            <LegalSection title="Directeur de publication">
                <LegalText>
                    Le directeur de publication est le représentant légal de
                    LeCycleLyonnais.
                </LegalText>
            </LegalSection>

            <LegalSection title="Hébergement">
                <LegalText>
                    Le site HomeCycl'Home est hébergé sur un VPS Linux Ubuntu.
                    <br />
                    Hébergeur : à compléter (nom, adresse, contact)
                </LegalText>
            </LegalSection>

            <LegalSection title="Propriété intellectuelle">
                <LegalText>
                    L'ensemble du contenu de ce site (textes, images, logo, code source)
                    est la propriété exclusive de LeCycleLyonnais et est protégé par les
                    lois françaises et internationales relatives à la propriété
                    intellectuelle. Toute reproduction totale ou partielle est strictement
                    interdite sans autorisation préalable écrite.
                </LegalText>
            </LegalSection>

            <LegalSection title="Limitation de responsabilité">
                <LegalText>
                    LeCycleLyonnais s'efforce de fournir des informations exactes et à
                    jour, mais ne peut garantir l'exactitude, l'exhaustivité ou
                    l'actualité des informations diffusées sur ce site. LeCycleLyonnais
                    décline toute responsabilité pour tout dommage résultant de
                    l'utilisation du site.
                </LegalText>
            </LegalSection>

            <LegalSection title="Données personnelles">
                <LegalText>
                    Pour toute information sur le traitement de vos données personnelles,
                    consultez notre{' '}
                    <a href="/confidentialite">Politique de confidentialité</a>.
                </LegalText>
            </LegalSection>
        </LegalPageLayout>
    );
}
