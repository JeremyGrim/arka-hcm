# HCM_008 – Architecture globale OS + HCM + RAO-RAG

Objectif : décrire l’architecture globale telle qu’attendue autour de la HCM,
pour qu’une équipe technique visualise clairement les rôles et flux.

## 1. Composants principaux

- **Arka-OS**  
  - Orchestrateur RAO (Raisonnement, Arbitrage, Organisation).
  - Gère les missions, les agents, les transitions, la gouvernance.

- **HCM (Hybrid Collective Memory)**  
  - Répertoire `/hcm/` structuré (stable, domain, state, hindex).
  - Contient la connaissance et l’état des missions.

- **HcmService**  
  - Service interne qui encapsule les accès à `/hcm`.
  - Implémente le contrat décrit dans `HCM_010` et l’API `HCM_012`.

- **Agents Arka (LLM-based)**  
  - Reçoivent des `mission_context` et `day_context` préparés par l’OS.
  - Proposent des actions HCM (append journal, add evidence, update actions).

- **RAO-RAG (pré-couche RAG hybride)**  
  - Utilise `hindex/` pour router et filtrer les requêtes de connaissance.
  - Peut s’appuyer sur du vectoriel (optionnel) dans un cadre gouverné.

## 2. Vue logique des flux

1. Un humain ou un système déclenche une action (ex. “lancer une mission”, “demander un état”).  
2. Arka-OS identifie l’agent concerné et construit un `mission_context` (via HcmService).  
3. Si besoin de connaissance, l’OS passe par RAO-RAG :
   - classification de la requête,
   - définition des scopes,
   - application des règles de visibilité,
   - éventuelle recherche documentaire (vectorielle ou non),
   - constitution d’un `context_pack`.

4. Le LLM/agent reçoit : `mission_context` + `day_context` + éventuellement `context_pack`.  
5. L’agent produit une réponse + des **intents HCM** (ex : “ajouter cette note au journal”).  
6. Arka-OS traduit ces intents en appels `HCM_*` via `HcmService`.  
7. HcmService lit/écrit dans `/hcm/` et renvoie un statut à l’OS.

La HCM est donc toujours manipulée de manière indirecte, via HcmService.

## 3. Rôles des sous-arborescences /hcm

- `stable/` : support des référentiels et patterns partagés entre missions.
- `domain/` : contextualisation métier par client/organisation.
- `state/` : mémoire d’état par mission + état de l’équipe.
- `hindex/` : configuration RAO-RAG (classifications, scopes, routing, sources).

## 4. Points d’intégration externes

- Sources documentaires (Notion, Confluence, etc.) : alimentent potentiellement `domain/` ou un backend RAG.
- Observabilité/logging : fichiers /logs du container Arka-OS (hors HCM).
- Sécurité/identity : l’OS récupère les infos de rôle/profil pour appliquer les règles d’accès.

Cette doc sert de référence d’architecture pour toute implémentation autour d’Arka-HCM.
