# Instrukcje dla agentów AI

Przed pracą przeczytaj `docs/AGENT_PROMPT.md` i `docs/HANDOFF.md`.

**Domyślnie tryb oszczędny (minimalne zużycie zasobów AI):** bez subagentów i niezależnych recenzentów, lokalnie tylko testy celowane, pełne testy wykonuje CI (GitHub Actions), krótkie raporty. Pełna analiza, przeglądarka i agenci tylko na wyraźne polecenie właściciela („pełna analiza”, „wyższe parametry”).

Produkcja to `main`: scalanie tylko na polecenie właściciela. Zwykła praca: gałąź → PR do `demo-homecraft`.
