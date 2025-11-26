 #  spec HcmService v1
---

## 1. ce que je veux
Vous voulez :

* **un HcmService v1 complet**, aligné sur les docs HCM_010 / 011 / 012,
* **en TypeScript**,
* **comme lib interne**, pas comme microservice HTTP,
* avec :

  * toutes les opérations HCM v1,
  * une vraie gestion d’erreurs,
  * des tests qui suivent les scénarios,
  * un Dockerfile pour emballer le tout avec `/hcm` monté.



---

## 2. Spécification HcmService v1 



> **Spéc HcmService v1 – Arka-HCM**
>
> 1. **Forme du service**
>    – HcmService doit être une **lib interne TypeScript**, pas un service HTTP.
>    – Elle sera appelée directement depuis Arka-OS (ou un adapter) via des fonctions exportées.
>    – Le contrat logique est celui de `HcmRequest` / `HcmResponse` décrit dans `HCM_010` + `HCM_012`.
>
> 2. **Stack technique**
>    – Node + TypeScript (ESM ou CJS, à voir, mais clean).
>    – Pas de framework web obligatoire en v1 (on fait une lib).
>    – L’accès au filesystem `/hcm` passe par la config (ex : variable d’env `HCM_ROOT` ou param de constructeur).
>
> 3. **Interface principale**
>
> On veut un module du type :
>
> ```ts
> export interface HcmRequest {
>   op: string; // "HCM_<...>"
>   request_id: string;
>   caller: {
>     type: "agent" | "human" | "system";
>     id: string;
>   };
>   payload: any; // typé en interne par op
> }
>
> export interface HcmError {
>   code: string;      // e.g. "MISSION_NOT_FOUND"
>   message: string;
>   details?: any;
> }
>
> export interface HcmResponse {
>   request_id: string;
>   op: string;
>   status: "ok" | "error";
>   error: HcmError | null;
>   data: any; // typé en interne par op
> }
>
> export interface HcmService {
>   handle(request: HcmRequest): Promise<HcmResponse>;
> }
> ```
>
> – `handle` fait le routing selon `op` et appelle des fonctions internes typées (une par op).
> – Vous pouvez aussi exporter des helpers internes (non obligatoires pour l’OS) :
> – `getMissionContext(...)`, `appendJournal(...)`, etc.
>
> 4. **Ops à couvrir en v1 (pas un sous-ensemble)**
>
> Implémenter **toutes** les opérations suivantes, conformes au contrat de `HCM_010` :
>
> * `HCM_GET_MISSION_CONTEXT`
> * `HCM_APPEND_JOURNAL`
> * `HCM_ADD_EVIDENCE`
> * `HCM_UPDATE_NEXT_ACTIONS`
> * `HCM_GET_DECISIONS`
> * `HCM_LIST_MISSIONS`
> * `HCM_SNAPSHOT_MISSION`
> * `HCM_DAY_ROLLUP`
> * `HCM_PREPARE_DAY_CONTEXT`
>
> Optionnel v1 : prévoir un stub propre pour `HCM_ROTATE_JOURNAL` (même si pas encore utilisé).
>
> 5. **Gestion du filesystem `/hcm`**
>
> – Le chemin racine sera passé par config (par ex `HCM_ROOT`), par défaut `./hcm`.
> – Le mapping fichiers ↔ opérations suit `HCM_001` + `HCM_002` (arbo + schémas JSON).
> – Contrainte :
> – lecture/écriture JSON robuste (parse + stringify),
> – append to `journal.jsonl` en newline JSON par entrée.
>
> 6. **Gestion des erreurs (obligatoire, pas “nice to have”)**
>
> Codes à implémenter au minimum :
>
> * `MISSION_NOT_FOUND`
> * `INVALID_PAYLOAD`
> * `IO_ERROR`
> * `ACCESS_DENIED` (même en version simplifiée)
> * `CONFLICTING_UPDATE` (prévu pour la suite, peut être renvoyé sur cas simples)
>
> – Toute exception interne du FS doit être remontée en `status: "error"` + `error.code = "IO_ERROR"`.
>
> 7. **Tests**
>
> – Traduire les scénarios de `HCM_011-Scenarios-tests-HCM.md` en tests automatisés (Jest ou équivalent).
> – Au minimum, on veut des tests pour :
>
> * création d’une mission de test (`test-mission-001`),
>
> * `HCM_GET_MISSION_CONTEXT`,
>
> * `HCM_APPEND_JOURNAL`,
>
> * `HCM_ADD_EVIDENCE`,
>
> * `HCM_UPDATE_NEXT_ACTIONS`,
>
> * `HCM_DAY_ROLLUP`,
>
> * `HCM_PREPARE_DAY_CONTEXT`,
>
> * erreurs `MISSION_NOT_FOUND`, `INVALID_PAYLOAD`.
>   – Les tests tournent sur un répertoire HCM de test (`./hcm_test` par exemple) pour ne pas polluer le vrai `/hcm`.
>
> 8. **Structure du repo (proposée)**
>
> ```text
> Arka-HCM/
>   docs/
>     ... (inchangé)
>   hcm/
>     ... (squelette de données)
>   src/
>     hcmService/
>       index.ts          // impl principale HcmService
>       ops/
>         getMissionContext.ts
>         appendJournal.ts
>         addEvidence.ts
>         updateNextActions.ts
>         getDecisions.ts
>         listMissions.ts
>         snapshotMission.ts
>         dayRollup.ts
>         prepareDayContext.ts
>       fs/
>         paths.ts        // helpers pour construire les chemins
>         readJson.ts
>         writeJson.ts
>         appendJournalLine.ts
>     cli/
>       index.ts          // futur entrypoint CLI (peut commencer simple)
>   tests/
>     hcmService/
>       getMissionContext.test.ts
>       appendJournal.test.ts
>       ...
>   package.json
>   tsconfig.json
> ```
>
> – `src/hcmService` = logique métier HCM.
> – `src/fs` = accès filesystem, isolé.
> – `tests/` = 1 fichier de tests par op principal.
>
> 9. **Docker (v1)**
>
> – Dockerfile simple qui :
>
> * installe les dépendances,
> * build le projet (TypeScript → JS),
> * expose un `node` avec un petit entrypoint pour :
>
>   * lancer des tests,
>
>   * ou exécuter une commande de démo (ex : lire un `mission_context` sur un HCM de test).
>     – `./hcm` est monté dans le container sur `/hcm`.
>
> 10. **Objectif**
>
> – On ne parle pas de “petit POC HcmService”.
> – On veut une **v1 solide et exploitable** de la couche HCM côté code :
>
> * interface stable,
> * erreurs claires,
> * tests fonctionnels basés sur les scénarios,
> * prête à être branchée à Arka-OS.
