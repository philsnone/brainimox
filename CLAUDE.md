# Hinweise für Claude

## Arbeitsweise
- Niemals direkt auf `main` pushen. Immer einen Branch anlegen und einen Pull Request öffnen.
- Jeder Merge nach `main` geht SOFORT live auf brainimox.pschau.de (keine Test-Stufe).
- Den Workflow "Deploy" nie selbst von Hand auslösen.
- Keine Secrets, Passwörter oder Schlüssel in den Code schreiben.
- Die App lauscht im Container auf Port 3000 und braucht den Endpunkt `/health`.
- PR-Beschreibungen auf Deutsch, kurz: was geändert wurde und wie man es testet.
