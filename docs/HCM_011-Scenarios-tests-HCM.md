# HCM_011 – Scénarios de tests fonctionnels HCM

Objectif : disposer de scénarios fonctionnels pour valider une implémentation de `HcmService`.

Scénarios principaux :
1. Création d’une mission de test (`test-mission-001`) et appel de `HCM_GET_MISSION_CONTEXT`.
2. Append journal avec `HCM_APPEND_JOURNAL` et vérification de la nouvelle ligne dans `journal.jsonl`.
3. Création d’une evidence avec `HCM_ADD_EVIDENCE` et vérification du fichier `evidence/ev-XXXX.json`.
4. Création et mise à jour d’actions via `HCM_UPDATE_NEXT_ACTIONS` et contrôle de `next_actions.json`.
5. Filtrage de décisions via `HCM_GET_DECISIONS`.
6. Rollup de journée via `HCM_DAY_ROLLUP` et vérification du snapshot `*.day.json`.
7. Préparation d’un `day_context` via `HCM_PREPARE_DAY_CONTEXT`.
8. Gestion des erreurs (`MISSION_NOT_FOUND`, `INVALID_PAYLOAD`, `ACCESS_DENIED`).

Ces scénarios sont pensés pour être transformés en tests automatisés (unitaires / intégration).
