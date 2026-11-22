import { CreateModelePlanificationDto } from './create-modele-planification.dto';

/**
 * Corps de la modification d'un modèle (US-02 « Modifier un modèle de
 * planification 2.0 »). La modification remplace tout le modèle (séquence :
 * « Remplacer modèle et blocs ») et suit les mêmes règles qu'à la création :
 * le DTO hérite de celui de création, les règles ne sont écrites qu'une fois.
 * Aucun champ technicien : un modèle ne change jamais de technicien (RG2), et
 * le `ValidationPipe` (whitelist) retire tout champ inconnu.
 */
export class UpdateModelePlanificationDto extends CreateModelePlanificationDto {}
