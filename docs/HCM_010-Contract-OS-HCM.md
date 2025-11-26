# HCM_010 – Contrat OS ⇄ HCM

Objectif : définir un contrat stable entre Arka-OS et la Hybrid Collective Memory (HCM).
Ce document sert de base à l’implémentation d’un service `HcmService` qui gère toutes les lectures/écritures dans `/hcm`.

Le modèle logique d'appel est le suivant :

- Requête interne OS → HCM :

  ```json
  {
    "op": "HCM_<NOM_OPERATION>",
    "request_id": "req-2025-11-26-00001",
    "caller": {
      "type": "agent",
      "id": "arka_pmo_01"
    },
    "payload": {
      "...": "contenu spécifique à l'opération"
    }
  }
  ```

- Réponse HCM → OS :

  ```json
  {
    "request_id": "req-2025-11-26-00001",
    "op": "HCM_<NOM_OPERATION>",
    "status": "ok",
    "error": null,
    "data": {
      "...": "contenu renvoyé par l'opération"
    }
  }
  ```

Operations v1 :
- HCM_GET_MISSION_CONTEXT
- HCM_APPEND_JOURNAL
- HCM_ADD_EVIDENCE
- HCM_UPDATE_NEXT_ACTIONS
- HCM_GET_DECISIONS
- HCM_LIST_MISSIONS
- HCM_SNAPSHOT_MISSION
- HCM_DAY_ROLLUP
- HCM_PREPARE_DAY_CONTEXT

Les sections détaillées (payload/data attendu) doivent être respectées par l’implémentation. 
