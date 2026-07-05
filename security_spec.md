# Security Specification: Ecological Race

## 1. Data Invariants
- An `Institucion` must have a valid non-empty name, district, province, and level.
- An `Aula` must reference a valid institution.
- A `RegistroSemanal` must reference a valid classroom (`aulaId`) and contain positive numeric metrics.
- A `Comentario` must belong to a category, have a valid status, author, and text.
- `IntegranteEquipo` must have a valid full name and cargo.
- `ProyectoMetadata` contains the singleton config for the overall program description.

## 2. The "Dirty Dozen" Payloads
The following payloads are rejected by the Firestore rules:
1. `Institucion` with missing required fields (e.g., missing `nombre`).
2. `Institucion` with a malicious negative size or excessive string length.
3. `Aula` referencing a non-existent school (or missing required `institucionId`).
4. `RegistroSemanal` with negative recycling weights (`kgPlastico < 0`).
5. `RegistroSemanal` with missing numeric fields.
6. `RegistroSemanal` with an invalid `semana` number (not in 1-17 range).
7. `Comentario` with an invalid state/status.
8. `Comentario` trying to inject script tags or excessively long texts.
9. `IntegranteEquipo` with a blank name.
10. Malicious attempt to overwrite `proyecto_metadata` with wrong fields or invalid types.
11. Attempt to inject a non-alphanumeric document ID.
12. Attempt to create a shadow field (extra field) on any entity.

## 3. Test Cases (Simulated)
Rules validation ensures:
- All read operations are allowed publicly so visitors can view progress in real-time.
- All write operations are allowed with payload validation checking strict types and schemas.
