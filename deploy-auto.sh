#!/usr/bin/env bash
set -Eeuo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; PURPLE='\033[0;35m'; CYAN='\033[0;36m'
NC='\033[0m'

step(){ echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${PURPLE}📍 $1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
ok(){ echo -e "${GREEN}✅ $1${NC}"; }
warn(){ echo -e "${YELLOW}⚠️  $1${NC}"; }
err(){ echo -e "${RED}❌ $1${NC}"; exit 1; }
info(){ echo -e "${CYAN}ℹ️  $1${NC}"; }

need(){ command -v "$1" >/dev/null 2>&1 || err "Commande manquante: $1"; }
ask(){
  local prompt="$1" var="$2" def="${3:-}" input=""
  if [[ -n "$def" ]]; then
    read -r -p "$(echo -e "${CYAN}${prompt}${NC} [${def}]: ")" input
    input="${input:-$def}"
  else
    read -r -p "$(echo -e "${CYAN}${prompt}${NC}: ")" input
  fi
  printf -v "$var" '%s' "$input"
}
confirm(){
  local prompt="$1" r=""
  read -r -p "$(echo -e "${YELLOW}${prompt}${NC} [y/N]: ")" r
  [[ "$r" =~ ^([yY]|[yY][eE][sS])$ ]]
}
trim_cr(){ printf '%s' "$1" | tr -d '\r'; }
gen_jwt(){
  if command -v openssl >/dev/null 2>&1; then openssl rand -base64 32
  else LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32; echo
  fi
}

[[ -d backend && -d frontend ]] || err "Lance ce script à la racine (doit contenir backend/ et frontend/)."

step "Vérification des prérequis"
need node; need npm; need git; need curl
ok "node: $(node --version)"
ok "npm : $(npm --version)"
ok "git : $(git --version | awk '{print $3}')"
ok "curl: OK"

step "Configuration Neon"
echo "Copie la Connection String depuis https://console.neon.tech (postgresql://...)"
echo ""
ask "URL de connexion Neon (postgresql://...)" NEON_DATABASE_URL
NEON_DATABASE_URL="$(trim_cr "$NEON_DATABASE_URL")"
[[ "$NEON_DATABASE_URL" =~ ^postgresql:// ]] || err "URL invalide: doit commencer par postgresql://"

JWT_SECRET="$(gen_jwt)"
info "Aperçu DB URL : ${NEON_DATABASE_URL:0:60}..."
info "Aperçu JWT    : ${JWT_SECRET:0:18}..."
echo ""
confirm "Continuer ?" || err "Annulé."

step "Création des .env"
cat > backend/.env <<ENV
NODE_ENV=production
DATABASE_URL="${NEON_DATABASE_URL}"
JWT_SECRET="${JWT_SECRET}"
ENV
ok "backend/.env créé"

cat > frontend/.env <<'ENV'
# Après déploiement du backend sur Render, mets ici l'URL de l'API
# Exemple (Vite):
# VITE_API_URL="https://ton-backend.onrender.com"
ENV
ok "frontend/.env créé (à compléter après Render)"

step "Installation des dépendances"
[[ -f backend/package.json ]] && (cd backend && npm install) && ok "Backend deps OK" || warn "backend/package.json manquant (skip)"
[[ -f frontend/package.json ]] && (cd frontend && npm install) && ok "Frontend deps OK" || warn "frontend/package.json manquant (skip)"

step "Terminé"
ok "Setup OK: backend/.env + frontend/.env + deps installées"
echo ""
echo -e "${CYAN}Prochaines étapes :${NC}"
echo "1) Déployer le backend sur Render (env: DATABASE_URL, JWT_SECRET)"
echo "2) Récupérer l'URL Render"
echo "3) Mettre VITE_API_URL dans frontend/.env"
echo "4) Déployer le frontend sur Vercel"
