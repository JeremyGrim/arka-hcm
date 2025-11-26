# les règles d’accès et le contrat d’utilisation du HCM par les agents

Objectif : que ce soit clair “qui touche quoi, comment, et dans quel sens”.

logique :

* HCM = connaissance
* OS = méthode / orchestration
* les LLM n’accèdent **jamais** directement au HCM → toujours via l’OS.

---

## 1. Principes généraux d’accès au HCM

Trois idées simples :

1. **Accès indirect**

   * Un agent LLM ne lit/écrit jamais directement dans les fichiers.
   * C’est **l’OS** (ou un service “arka_hcm”) qui :

     * lit les fichiers,
     * applique les règles,
     * fournit au LLM un contexte JSON pré-filtré,
     * enregistre les mises à jour validées.

2. **Lecture large, écriture étroite**

   * Lecture : assez large (stables, domain, state) mais **filtrée par mission / rôle**.
   * Écriture : limitée à certains fichiers et champs :

     * `journal.jsonl` (append-only),
     * `evidence/*.json` (nouveaux fichiers, pas d’édition libre),
     * `next_actions.json` (création / mise à jour contrôlée),
     * éventuellement `decisions.json` sous gouvernance stricte.

3. **Toujours déterministe et explicite**

   * Pas de “va chercher ce qui te semble utile dans le HCM”.
   * Mais : “donne-moi les décisions de la mission X” / “append telle entrée au journal Y”.
   * Chaque opération est **typée** et **loggée**.

---

## 2. Matrice simple lecture / écriture

Acteurs logiques (pas techniques) :

* `OS_CORE` : le moteur Arka OS / orchestrateur.
* `AGENT` : l’agent logique (via OS).
* `HUMAN` : humain (via UI / CLI).
* `INFRA` : scripts de maintenance.

Résumé (simplifié) :

| Zone                     | OS_CORE | AGENT (via OS)  | HUMAN (via UI)    | INFRA        |
| ------------------------ | ------- | --------------- | ----------------- | ------------ |
| `/hcm/meta.json`         | R/W     | R               | R                 | R/W (maint.) |
| `/hcm/stable/**`         | R       | R               | R                 | R/W (admin)  |
| `/hcm/domain/**`         | R       | R (filtré)      | R/W (selon droit) | R/W          |
| `/hcm/state/missions/**` | R/W     | R + W restreint | R + W restreint   | backup only  |
| `/hcm/state/team/**`     | R/W     | R (agents.json) | R/W (humans)      | R/W          |
| `/hcm/hindex/**`         | R/W     | jamais direct   | jamais direct     | R/W          |

Règle clé :
**AGENT ne fait que des “actions métiers”**, jamais d’I/O brut.
C’est l’OS qui traduit ces actions en opérations HCM.

---

## 3. Contrat d’accès : opérations HCM

On peut définir un petit “langage d’API interne” HCM, même si derrière c’est du fichier.

Je vous propose un set de **7 opérations** v1 :

1. `HCM_GET_MISSION_CONTEXT`
2. `HCM_APPEND_JOURNAL`
3. `HCM_ADD_EVIDENCE`
4. `HCM_UPDATE_NEXT_ACTIONS`
5. `HCM_GET_DECISIONS`
6. `HCM_LIST_MISSIONS`
7. `HCM_SNAPSHOT_MISSION`

C’est **suffisant** pour donner l’illusion, côté agent, d’une mémoire d’équipe vivante.

---

### 3.1. `HCM_GET_MISSION_CONTEXT`

But : donner à un agent **le contexte structuré** d’une mission à l’instant N.

Entrée (côté OS → HCM) :

```json
{
  "op": "HCM_GET_MISSION_CONTEXT",
  "mission_id": "acme-2025-q1-transform",
  "options": {
    "include_decisions": true,
    "include_next_actions": true,
    "include_last_entries": 10
  }
}
```

Sortie (OS → agent) – **exemple simplifié** :

```json
{
  "mission_id": "acme-2025-q1-transform",
  "meta": { ... },
  "status": { ... },
  "last_journal_entries": [ ... ],
  "decisions": [ ... ],
  "next_actions": [ ... ]
}
```

L’agent n’a pas à connaître la structure interne du HCM :
il travaille sur ce “mission_context”.

---

### 3.2. `HCM_APPEND_JOURNAL`

But : append une entrée au journal **sans jamais écraser l’existant**.

Entrée (agent → OS) :

```json
{
  "op": "HCM_APPEND_JOURNAL",
  "mission_id": "acme-2025-q1-transform",
  "entry": {
    "author_type": "agent",
    "author_id": "arka_pmo_01",
    "entry_type": "analysis",
    "message": "Synthèse de la réunion du 26/11 intégrée. Actions mises à jour.",
    "context": {
      "meeting_id": "mtg-2025-11-26-01",
      "updated_actions": [
        "act-0001",
        "act-0002"
      ]
    }
  }
}
```

L’OS :

* ajoute `timestamp`,
* sérialise en JSON,
* append dans `journal.jsonl`.

---

### 3.3. `HCM_ADD_EVIDENCE`

But : enregistrer une nouvelle preuve.

Entrée :

```json
{
  "op": "HCM_ADD_EVIDENCE",
  "mission_id": "acme-2025-q1-transform",
  "evidence": {
    "type": "interview_synthesis",
    "title": "Synthèse atelier Produit du 26/11",
    "source": {
      "origin": "workshop",
      "details": "Atelier Produit avec 5 PM."
    },
    "confidence": "medium",
    "summary": "Les PM confirment le besoin de centraliser la documentation et l'historique des décisions de roadmap.",
    "highlights": [
      "Problème récurrent d'historique de décisions",
      "Les outils actuels sont éparpillés (Notion, Slack, mails)"
    ],
    "tags": [
      "product",
      "knowledge",
      "decision_history"
    ]
  }
}
```

L’OS :

* génère `evidence_id`,
* ajoute `created_at`, `created_by_*`,
* crée un fichier `ev_XXXX.json` dans `evidence/`.

---

### 3.4. `HCM_UPDATE_NEXT_ACTIONS`

But : créer / mettre à jour des actions.

Entrée :

```json
{
  "op": "HCM_UPDATE_NEXT_ACTIONS",
  "mission_id": "acme-2025-q1-transform",
  "actions": [
    {
      "action_id": "act-0001",
      "status": "done"
    },
    {
      "action_id": null,
      "title": "Préparer un premier plan de communication HCM pour le client",
      "description": "Proposer une manière d'expliquer la mémoire collective hybride aux sponsors.",
      "owner_type": "agent",
      "owner_id": "arka_pmo_01",
      "priority": "medium",
      "related_phase": "design"
    }
  ]
}
```

Règle :

* si `action_id` est `null` → création,
* sinon → update partiel sur l’action existante.

---

### 3.5. `HCM_GET_DECISIONS`

But : laisser un agent raisonner sur les décisions existantes.

Entrée :

```json
{
  "op": "HCM_GET_DECISIONS",
  "mission_id": "acme-2025-q1-transform",
  "filters": {
    "status": "validated",
    "related_phase": "cadrage"
  }
}
```

Sortie : liste des décisions filtrées, dans un format déjà prêt à l’usage.

---

### 3.6. `HCM_LIST_MISSIONS`

But : permettre à un agent “manager” ou à l’OS de voir les missions actives.

Entrée :

```json
{
  "op": "HCM_LIST_MISSIONS",
  "filters": {
    "status": "in_progress",
    "client_id": "acme-corp"
  }
}
```

Sortie :

```json
{
  "missions": [
    {
      "mission_id": "acme-2025-q1-transform",
      "title": "Programme de transformation Q1 2025",
      "status": "in_progress",
      "phase": "design",
      "health": "at_risk"
    }
  ]
}
```

---

### 3.7. `HCM_SNAPSHOT_MISSION`

But : créer un snapshot d’état.

Entrée :

```json
{
  "op": "HCM_SNAPSHOT_MISSION",
  "mission_id": "acme-2025-q1-transform",
  "reason": "daily_snapshot"
}
```

L’OS :

* lit `meta`, `status`, etc.,
* écrit un snapshot dans `snapshots/`.

---

## 4. Ce que voit réellement un agent Arka (côté LLM)

Important : **un agent ne voit jamais “le HCM brut”**.
Il voit :

* un `mission_context` structuré,
* la liste d’actions,
* les décisions,
* les preuves,
* et il émet des “intents HCM” du type :

  * `APPEND_JOURNAL`,
  * `ADD_EVIDENCE`,
  * `UPDATE_NEXT_ACTIONS`.

L’OS :

* traduit ces intents en appels HCM,
* applique les règles d’accès,
* rejette ce qui n’est pas permis,
* loggue tout.

---

## 5. Résumé très court

* HCM = fichiers JSON, mais **jamais manipulés brut par les LLM**.
* Il y a une petite **API interne HCM** avec des opérations typées.
* Les agents ne “naviguent” pas dans le HCM, ils **demandent** des contextes et **proposent** des updates.
* L’OS garde le contrôle complet :

  * sécurité,
  * cohérence,
  * audit,
  * non-régression.

