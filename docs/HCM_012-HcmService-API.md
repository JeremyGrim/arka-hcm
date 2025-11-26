# HCM_012 – Design d’API interne `HcmService`

Objectif : fournir un design d’API clair pour l’implémentation d’un service interne `HcmService`
qui encapsule toute la logique d’accès au HCM (lecture/écriture de fichiers, validation, erreurs),
en se basant sur `HCM_010-Contract-OS-HCM.md`.

## 1. Rôle de `HcmService`

- Point d’entrée unique pour toutes les opérations HCM.
- Abstraction du filesystem (`/hcm`) pour le reste d’Arka-OS.
- Application des règles :
  - chemins valides,
  - validation de payload,
  - gestion des erreurs,
  - sérialisation/désérialisation JSON.

Le reste d’Arka-OS ne manipule jamais directement les fichiers du HCM.

## 2. Interface logique (pseudo-code)

En pseudo-code (langage-agnostique) :

```text
interface HcmService {
  HcmResponse handle(HcmRequest request);

  HcmResponse getMissionContext(String missionId, MissionContextOptions options);
  HcmResponse appendJournal(String missionId, JournalEntry entry);
  HcmResponse addEvidence(String missionId, EvidenceInput evidence);
  HcmResponse updateNextActions(String missionId, List<NextActionUpdate> actions);
  HcmResponse getDecisions(String missionId, DecisionFilters filters);
  HcmResponse listMissions(MissionFilters filters);
  HcmResponse snapshotMission(String missionId, String reason);
  HcmResponse dayRollup(String missionId, String date);
  HcmResponse prepareDayContext(String missionId, String date);
}
```

Où `handle()` est la méthode générique pour router selon `request.op`, et les autres méthodes
sont des helpers internes pouvant être appelés directement par l’OS.

## 3. Structures de données recommandées

### 3.1. HcmRequest

```json
{
  "op": "HCM_<NOM_OPERATION>",
  "request_id": "string",
  "caller": {
    "type": "agent | human | system",
    "id": "string"
  },
  "payload": {}
}
```

### 3.2. HcmResponse

```json
{
  "request_id": "string",
  "op": "HCM_<NOM_OPERATION>",
  "status": "ok | error",
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  },
  "data": {}
}
```

Ces structures sont logiques : en code, elles peuvent être mappées sur des classes/structures.

## 4. Mapping opérations → fichiers

Exemple pour quelques opérations :

- `HCM_GET_MISSION_CONTEXT` :
  - lit `state/missions/<mission_id>/meta.json`
  - lit `state/missions/<mission_id>/status.json`
  - lit les N dernières lignes de `journal.jsonl`
  - lit `decisions.json` (si demandé)
  - lit `next_actions.json` (si demandé)

- `HCM_APPEND_JOURNAL` :
  - valide la présence de `mission_id` et `entry`
  - ouvre (ou crée) `journal.jsonl` en append
  - écrit une ligne JSON avec `timestamp` ajouté

- `HCM_ADD_EVIDENCE` :
  - valide la structure `evidence`
  - génère un `evidence_id`
  - écrit un fichier `evidence/<evidence_id>.json`

Chaque opération HCM doit être implémentée comme une fonction interne claire,
appelée soit via `handle()`, soit directement par l’OS.

## 5. Gestion des erreurs

`HcmService` doit normaliser les erreurs selon les codes définis dans HCM_010 :

- `MISSION_NOT_FOUND`
- `INVALID_PAYLOAD`
- `IO_ERROR`
- `ACCESS_DENIED`
- `CONFLICTING_UPDATE`

Toute exception interne (filesystem, parsing JSON, etc.) doit être traduite en `status = "error"`
avec un `error.code` approprié.

## 6. Logging et observabilité

Il est recommandé que `HcmService` :

- loggue chaque requête (op, request_id, caller),
- loggue les erreurs avec détails,
- éventuellement mesure le temps de traitement (latence).

Ces logs peuvent être écrits dans `/logs/` côté container Arka-OS.

## 7. Implémentations multiples

Le design est fait pour permettre plusieurs implémentations :

- Implémentation filesystem (HCM sur disque, comme dans ce dépôt).
- Implémentation base de données (Postgres, etc.) si un jour le HCM est porté sur un backend DB.
- Implémentation mock pour tests unitaires.

Tant que l’interface `HcmService` reste stable, Arka-OS et les agents n’ont pas besoin de savoir
comment les données sont stockées physiquement.
