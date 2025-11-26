# l’arborescence réelle du HCM en production**.

**single-tenant** (un client) avec un répertoire racine `hcm/`.
On pourra ensuite le monter dans un container (`/arka/hcm`) sans rien changer.

---

## 1. Racine HCM

```text
/hcm/
  stable/
  domain/
  state/
  hindex/
  meta.json
```

* `meta.json` : méta globale du HCM (version, tenant, timestamps, etc.).

Exemple minimal de `meta.json` :

```json
{
  "hcm_version": "1.0.0",
  "tenant_id": "acme-corp",
  "created_at": "2025-11-26T09:00:00Z",
  "updated_at": "2025-11-26T09:00:00Z",
  "description": "Hybrid Collective Memory pour ACME Corp."
}
```

---

## 2. Bloc A — Connaissance stable `/hcm/stable/`

```text
/hcm/
  stable/
    glossary/
      core.glossary.json
      domain.product.glossary.json
      domain.ops.glossary.json

    referentials/
      status_codes.json
      severity_levels.json
      evidence_types.json
      mission_types.json
      roles_taxonomy.json

    procedures/
      generic/
        incident_response.json
        change_management.json
      product/
        feature_lifecycle.json
        release_checklist.json

    patterns/
      missions/
        generic.discovery.pattern.json
        generic.audit.pattern.json
        generic.delivery.pattern.json
      evidence/
        generic.evidence_pack.pattern.json
        audit.evidence_pack.pattern.json

    examples/
      missions/
        example.mission.discovery.json
        example.mission.audit.json
      outputs/
        example.brief.json
        example.report.json
```

Idée par sous-dossier :

* `glossary/` : définitions et vocabulaire commun.
* `referentials/` : listes fermées, codes, enums partagées par tous.
* `procedures/` : procédures intemporelles (génériques ou spécifiques).
* `patterns/` : modèles de mission, d’evidence, etc.
* `examples/` : exemples canons de “bon travail”.

---

## 3. Bloc B — Connaissance métier contextualisée `/hcm/domain/`

```text
/hcm/
  domain/
    org/
      org_profile.json
      org_structure.json
      org_policies.json

    business/
      products.json
      services.json
      business_capabilities.json
      kpi_definitions.json

    systems/
      applications_inventory.json
      integrations_map.json
      data_sources.json

    constraints/
      legal_regulatory.json
      security_policies.json
      ai_usage_policies.json
```

Rôle :

* `org/` : contexte organisationnel (structure, acteurs, règles internes).
* `business/` : ce que fait l’entreprise (offre, capacités, KPIs).
* `systems/` : paysage SI (apps, flux, sources).
* `constraints/` : contraintes externes (réglementation, sécurité, AI Act, etc.).

Tout ceci évolue peu fréquemment, mais plus que `stable/`.

---

## 4. Bloc C — Mémoire d’état courant `/hcm/state/`

C’est la **mémoire vive**.
Deux niveaux : `missions/` et `team/`.

### 4.1. Missions

```text
/hcm/
  state/
    missions/
      <mission_id>/
        meta.json
        status.json
        journal.jsonl
        decisions.json
        next_actions.json
        evidence/
          ev_0001.json
          ev_0002.json
        snapshots/
          2025-11-26T09-00-00Z.snapshot.json
          2025-11-27T09-00-00Z.snapshot.json
```

Détail des fichiers :

* `meta.json` : identité de la mission, type, client, dates.
* `status.json` : état courant (phase, avancement, santé).
* `journal.jsonl` : journal append-only, une entrée JSON par ligne.
* `decisions.json` : décisions structurées (qui, quoi, pourquoi, quand).
* `next_actions.json` : tâches à venir pour agents + humains.
* `evidence/` : preuves unitaires, chacune dans son JSON.
* `snapshots/` : prises de vue régulières de l’état pour audit / rollback conceptuel.

Exemple d’ID de mission :

* `acme-2025-q1-transform`
* `mission-00123`
* peu importe, du moment que c’est stable et unique.

### 4.2. Équipe (humains + agents)

```text
/hcm/
  state/
    team/
      agents.json
      humans.json
      availability.json
      workload.json
```

* `agents.json` : rôles, scopes, missions assignées, état logique des agents Arka.
* `humans.json` : personnes, rôles, disponibilités, préférences.
* `availability.json` : info dispo (optionnel mais utile).
* `workload.json` : vue agrégée des charges.

---

## 5. Bloc D — Index hybride / Pré-RAG `/hcm/hindex/`

On garde ce bloc optionnel mais structuré pour la suite RAG hybride.

```text
/hcm/
  hindex/
    classification.json
    scopes.json
    meta_rules.json
    routing.json
    sources/
      stable_sources.json
      domain_sources.json
      external_sources.json
```

Rôle des fichiers :

* `classification.json` : catégories de requêtes (support, produit, audit, etc.).
* `scopes.json` : quels dossiers / fichiers sont éligibles selon la classe de requête.
* `meta_rules.json` : règles déterministes sur les meta (qui peut voir quoi, filtres).
* `routing.json` : vers quels moteurs / stacks (LLM interne, LLM externe, moteur vectoriel, etc.).
* `sources/` : listing structuré des sources documentaires indexables (pour un futur RAG).

---

## 6. Récap global de l’arborescence HCM

```text
/hcm/
  meta.json

  stable/
    glossary/
      core.glossary.json
      domain.product.glossary.json
      domain.ops.glossary.json
    referentials/
      status_codes.json
      severity_levels.json
      evidence_types.json
      mission_types.json
      roles_taxonomy.json
    procedures/
      generic/
        incident_response.json
        change_management.json
      product/
        feature_lifecycle.json
        release_checklist.json
    patterns/
      missions/
        generic.discovery.pattern.json
        generic.audit.pattern.json
        generic.delivery.pattern.json
      evidence/
        generic.evidence_pack.pattern.json
        audit.evidence_pack.pattern.json
    examples/
      missions/
        example.mission.discovery.json
        example.mission.audit.json
      outputs/
        example.brief.json
        example.report.json

  domain/
    org/
      org_profile.json
      org_structure.json
      org_policies.json
    business/
      products.json
      services.json
      business_capabilities.json
      kpi_definitions.json
    systems/
      applications_inventory.json
      integrations_map.json
      data_sources.json
    constraints/
      legal_regulatory.json
      security_policies.json
      ai_usage_policies.json

  state/
    missions/
      <mission_id>/
        meta.json
        status.json
        journal.jsonl
        decisions.json
        next_actions.json
        evidence/
          ev_0001.json
          ev_0002.json
        snapshots/
          2025-11-26T09-00-00Z.snapshot.json
    team/
      agents.json
      humans.json
      availability.json
      workload.json

  hindex/
    classification.json
    scopes.json
    meta_rules.json
    routing.json
    sources/
      stable_sources.json
      domain_sources.json
      external_sources.json
```

---

**les schémas JSON** des fichiers clés (`meta.json`, `status.json`, `journal.jsonl`, `decisions.json`, `agents.json`, etc.).

