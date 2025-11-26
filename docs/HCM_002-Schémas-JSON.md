Mode: 3

# schémas JSON v1 clés du HCM :

* déterministe
* lisible
* exploitable par un LLM
* pas de complexité inutile.

**hypothèses générales** (v1) :

* Dates au format ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`).
* Identifiants en `snake_case` ou `kebab-case`, mais stables.
* Tous les fichiers sont en UTF-8, JSON “plat” (pas de commentaires dans les fichiers, juste dans la doc).
* On privilégie des structures simples, quitte à enrichir en v2.

**couverture :**

1. `hcm/meta.json` (racine)
2. Bloc `state/missions/<mission_id>/` (meta, status, journal, decisions, next_actions, evidence, snapshot)
3. Bloc `state/team/` (agents, humans)
4. Bloc `stable/glossary` + `stable/referentials` (formes simples mais robustes)

- (patterns, procedures, etc.) ensuite.

---

## 1. `hcm/meta.json`

But : identifier clairement le HCM, le tenant, la version, les timestamps.

```json
{
  "hcm_version": "1.0.0",
  "tenant_id": "acme-corp",
  "tenant_name": "ACME Corp",
  "environment": "production",
  "description": "Hybrid Collective Memory pour ACME Corp.",
  "created_at": "2025-11-26T09:00:00Z",
  "updated_at": "2025-11-26T09:00:00Z"
}
```

Champs clés :

* `hcm_version` : version du schéma HCM (pas produit).
* `tenant_id` / `tenant_name` : identifiant interne + label humain.
* `environment` : `dev` / `staging` / `production`.
* `description` : libre mais court.
* `created_at`, `updated_at` : timestamps HCM, pas mission.

---

## 2. Bloc `state/missions/<mission_id>/`

### 2.1. `meta.json`

Identité de la mission, contexte fixe.

```json
{
  "mission_id": "acme-2025-q1-transform",
  "title": "Programme de transformation Q1 2025",
  "client_id": "acme-corp",
  "client_name": "ACME Corp",
  "mission_type": "transformation",
  "created_at": "2025-11-20T08:30:00Z",
  "updated_at": "2025-11-26T09:12:00Z",
  "owner_human_id": "jeremy.grimonpont",
  "owner_agent_id": "arka_pmo_01",
  "tags": [
    "transformation",
    "genai",
    "pilot"
  ]
}
```

Notes :

* `mission_type` doit être conforme à `stable/referentials/mission_types.json`.
* `owner_human_id` / `owner_agent_id` : optionnels, mais utiles.

---

### 2.2. `status.json`

État courant, phase, avancement, santé.

```json
{
  "phase": "design",
  "phase_label": "Conception détaillée",
  "status": "in_progress",
  "progress": 0.45,
  "last_update": "2025-11-26T09:12:00Z",
  "health": "at_risk",
  "risks": [
    {
      "risk_id": "risk-001",
      "severity": "high",
      "summary": "Dépendance forte à l'équipe data interne.",
      "owner": "arka_pmo_01"
    }
  ],
  "summary": "La mission est en phase de conception, avec des dépendances critiques côté data non encore sécurisées."
}
```

* `phase` : code interne (enum).
* `status` : `planned` / `in_progress` / `on_hold` / `done` / `cancelled`.
* `progress` : float 0–1.
* `health` : `ok` / `warning` / `at_risk`.
* `risks` : optionnel mais déjà structurant.

---

### 2.3. `journal.jsonl`

Journal append-only, une entrée JSON par ligne.
Chaque ligne est un objet isolé :

```json
{"timestamp":"2025-11-25T14:03:00Z","author_type":"agent","author_id":"arka_pmo_01","entry_type":"event","message":"Phase de cadrage validée par le sponsor.","context":{"phase":"cadrage","related_decision_id":"dec-0003"}}
{"timestamp":"2025-11-25T16:20:00Z","author_type":"human","author_id":"jeremy.grimonpont","entry_type":"note","message":"Clarifier le périmètre des systèmes concernés avant la prochaine itération.","context":{"action_required":true}}
{"timestamp":"2025-11-26T08:45:00Z","author_type":"agent","author_id":"arka_analyst_01","entry_type":"analysis","message":"Synthèse des entretiens utilisateurs déposée dans evidence ev-0004.","context":{"evidence_id":"ev-0004"}}
```

Schéma implicite :

```json
{
  "timestamp": "ISO-8601",
  "author_type": "agent | human | system",
  "author_id": "string",
  "entry_type": "event | note | analysis | warning | error | info",
  "message": "string",
  "context": {
    "...": "clé/valeur optionnelles selon le type"
  }
}
```

---

### 2.4. `decisions.json`

Liste des décisions structurées, pas un journal libre.

```json
{
  "decisions": [
    {
      "decision_id": "dec-0001",
      "timestamp": "2025-11-24T10:15:00Z",
      "made_by_type": "human",
      "made_by_id": "jeremy.grimonpont",
      "title": "Validation du périmètre de la première vague",
      "description": "Le périmètre de la première vague inclut les équipes Support et Produit, hors Finance.",
      "status": "validated",
      "applies_from": "2025-11-24T00:00:00Z",
      "applies_to": null,
      "related_phase": "cadrage",
      "impacts": [
        "Exclusion des processus Finance de la phase pilote",
        "Priorisation des workflows Support et Produit dans les ateliers"
      ],
      "linked_evidence_ids": [
        "ev-0001",
        "ev-0002"
      ]
    }
  ]
}
```

Enums possibles :

* `status` : `draft` / `proposed` / `validated` / `deprecated`.

---

### 2.5. `next_actions.json`

Tâches/action items pour humains + agents.

```json
{
  "next_actions": [
    {
      "action_id": "act-0001",
      "title": "Consolider la liste des systèmes impactés",
      "description": "Recenser l'ensemble des applications utilisées par les équipes Support et Produit.",
      "owner_type": "agent",
      "owner_id": "arka_analyst_01",
      "created_at": "2025-11-25T09:00:00Z",
      "due_date": "2025-11-27T18:00:00Z",
      "status": "in_progress",
      "priority": "high",
      "related_phase": "design"
    },
    {
      "action_id": "act-0002",
      "title": "Valider le plan de communication interne",
      "description": "Préparer et valider le message d'annonce pour les équipes pilotes.",
      "owner_type": "human",
      "owner_id": "comms.lead",
      "created_at": "2025-11-25T11:30:00Z",
      "due_date": null,
      "status": "todo",
      "priority": "medium",
      "related_phase": "delivery"
    }
  ]
}
```

Enums :

* `status` : `todo` / `in_progress` / `blocked` / `done`.
* `priority` : `low` / `medium` / `high` / `critical`.

---

### 2.6. `evidence/ev_0001.json`

Une preuve atomique, lisible par humain et agent.

```json
{
  "evidence_id": "ev-0001",
  "type": "interview_synthesis",
  "title": "Synthèse des entretiens Support - Vague 1",
  "source": {
    "origin": "interviews",
    "details": "3 entretiens individuels avec des agents Support niveau 1."
  },
  "created_at": "2025-11-24T15:20:00Z",
  "created_by_type": "agent",
  "created_by_id": "arka_analyst_01",
  "confidence": "high",
  "summary": "Les agents support passent en moyenne 30% de leur temps à rechercher des informations dans plusieurs outils. Les principaux irritants identifiés sont la duplication d'information et le manque de moteur de recherche unifié.",
  "highlights": [
    "Temps de recherche d'information très élevé (~30%)",
    "Multiplicité d'outils (3 à 5 par cas)",
    "Demande explicite d'un point d'accès unifié à la connaissance"
  ],
  "attachments": [
    {
      "type": "file",
      "path": "raw/interviews/support_wave1_notes.pdf"
    }
  ],
  "tags": [
    "support",
    "pain_points",
    "knowledge_management"
  ]
}
```

Enums :

* `type` : défini dans `stable/referentials/evidence_types.json`.
* `confidence` : `low` / `medium` / `high`.

---

### 2.7. `snapshots/2025-11-26T09-00-00Z.snapshot.json`

Un snapshot d’état global de la mission, utile pour audit ou “reboot” logique.

```json
{
  "snapshot_id": "snap-2025-11-26T09-00-00Z",
  "timestamp": "2025-11-26T09:00:00Z",
  "mission_id": "acme-2025-q1-transform",
  "status": {
    "phase": "design",
    "status": "in_progress",
    "progress": 0.45,
    "health": "at_risk"
  },
  "decisions_count": 4,
  "open_actions_count": 6,
  "last_journal_entry_at": "2025-11-26T08:45:00Z"
}
```

On ne met pas tout dedans, juste un résumé compact.

---

## 3. Bloc `state/team/`

### 3.1. `agents.json`

État logique des agents Arka.

```json
{
  "agents": [
    {
      "agent_id": "arka_pmo_01",
      "role": "pmo",
      "display_name": "Arka PMO",
      "status": "active",
      "capabilities": [
        "mission_planning",
        "workflow_design",
        "risk_tracking"
      ],
      "assigned_missions": [
        "acme-2025-q1-transform"
      ],
      "last_active_at": "2025-11-26T09:05:00Z"
    },
    {
      "agent_id": "arka_analyst_01",
      "role": "analyst",
      "display_name": "Arka Analyst",
      "status": "active",
      "capabilities": [
        "data_synthesis",
        "interview_analysis",
        "evidence_pack_building"
      ],
      "assigned_missions": [],
      "last_active_at": "2025-11-25T17:40:00Z"
    }
  ]
}
```

Enums :

* `status` : `active` / `paused` / `disabled`.

---

### 3.2. `humans.json`

Référentiel des humains dans le périmètre Arka.

```json
{
  "humans": [
    {
      "human_id": "jeremy.grimonpont",
      "display_name": "Jérémy Grimonpont",
      "email": "jeremy@example.com",
      "role": "product_manager",
      "department": "Product",
      "time_zone": "Europe/Paris",
      "preferred_language": "fr",
      "notes": "Owner Arka-Labs."
    },
    {
      "human_id": "sponsor.acme",
      "display_name": "Sponsor ACME",
      "email": "sponsor@acme.com",
      "role": "executive_sponsor",
      "department": "Direction",
      "time_zone": "Europe/Paris",
      "preferred_language": "fr",
      "notes": ""
    }
  ]
}
```

---

## 4. Bloc `stable/` — Schéma générique simple

### 4.1. `stable/glossary/core.glossary.json`

Glossaire de base.

```json
{
  "entries": [
    {
      "term": "mission",
      "definition": "Un ensemble structuré d'objectifs, de tâches et de livrables suivis dans Arka OS.",
      "category": "core",
      "aliases": [
        "projet",
        "engagement"
      ]
    },
    {
      "term": "evidence_pack",
      "definition": "Un regroupement structuré de preuves qui supportent une décision ou une analyse donnée.",
      "category": "evidence",
      "aliases": []
    }
  ]
}
```

---

### 4.2. `stable/referentials/mission_types.json`

Simple, mais typé.

```json
{
  "mission_types": [
    {
      "code": "discovery",
      "label": "Mission de découverte",
      "description": "Compréhension du contexte, des enjeux et des acteurs."
    },
    {
      "code": "audit",
      "label": "Mission d'audit",
      "description": "Évaluation d'un système, d'un process ou d'une organisation."
    },
    {
      "code": "transformation",
      "label": "Mission de transformation",
      "description": "Conception et pilotage d'un changement significatif."
    }
  ]
}
```

Même logique pour :

* `status_codes.json`
* `severity_levels.json`
* `evidence_types.json`
* `roles_taxonomy.json`

Chacun avec un `{ "…_list": [ { "code", "label", "description" } ] }`.

---

Si cette première passe de **schémas JSON** vous convient, on pourra :

* soit les affiner (en fonction d’un cas concret),
* soit passer à l’étape suivante :
  **règles d’accès + lecture/écriture par les agents (API/pseudo-contrat)**.
