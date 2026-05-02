#!/usr/bin/env bash
# Audita arquivos de documentação que podem estar desatualizados.
# Critério: modificados mais de 90 dias atrás E sem commit recente no mesmo arquivo de código referenciado.

set -euo pipefail

DOCS_DIR="${1:-docs}"
DAYS_STALE="${2:-90}"
NOW=$(date +%s)
THRESHOLD=$(( NOW - DAYS_STALE * 86400 ))
FOUND=0

echo "=== Auditoria de documentação (docs estáticos há mais de ${DAYS_STALE} dias) ==="
echo ""

while IFS= read -r -d '' file; do
  # Obter data do último commit que tocou esse arquivo
  last_commit_date=$(git log -1 --format="%ct" -- "$file" 2>/dev/null || echo "0")

  if [[ -z "$last_commit_date" || "$last_commit_date" == "0" ]]; then
    # Arquivo não rastreado pelo git — usar mtime
    last_commit_date=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null || echo "0")
  fi

  if (( last_commit_date < THRESHOLD )); then
    age_days=$(( (NOW - last_commit_date) / 86400 ))
    echo "⚠️  ${file}  (sem mudança há ${age_days} dias)"
    FOUND=$(( FOUND + 1 ))
  fi
done < <(find "$DOCS_DIR" -type f \( -name "*.md" -o -name "*.txt" \) -print0)

echo ""
if (( FOUND == 0 )); then
  echo "✅ Nenhum arquivo de documentação desatualizado encontrado."
else
  echo "Total: ${FOUND} arquivo(s) desatualizado(s)."
  echo "Revise cada um e atualize ou remova conforme necessário."
  exit 1
fi
