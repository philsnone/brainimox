# Hinweise für Claude

## Arbeitsweise
- Niemals direkt auf `main` pushen. Immer einen Branch anlegen und einen Pull Request öffnen.
- Jeder Merge nach `main` geht SOFORT live auf brainimox.pschau.de (keine Test-Stufe).
- Den Workflow "Deploy" nie selbst von Hand auslösen.
- Keine Secrets, Passwörter oder Schlüssel in den Code schreiben.
- Die App lauscht im Container auf Port 3000 und braucht den Endpunkt `/health`.
- PR-Beschreibungen auf Deutsch, kurz: was geändert wurde und wie man es testet.

## Live stellen (Mergen macht Claude)
Philipps Sohn (10) gibt die Anweisungen fürs Spiel und mergt nicht selbst in GitHub. Deshalb:
- Nach jedem Pull Request warten, bis der CI-Check `check` grün ist.
- Dann im Chat kindgerecht fragen, z. B.: „Soll ich die Änderung jetzt hochladen, damit du sie auf brainimox.pschau.de spielen kannst?“
- Erst nach einem klaren „Ja“ im Chat den Pull Request mergen (Squash). Ohne Ja nie mergen.
- Nie mergen, wenn CI rot ist oder der PR Konflikte hat. Dann erst reparieren.
- Nach dem Merge den Lauf „Deploy“ abwarten und kurz melden, ob die Seite live ist (bei Fehler das Log ansehen).
