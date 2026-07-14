#!/bin/bash
# EcoTrueque Venezuela — Setup Script
# Uso: bash scripts/setup.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║   🌿 EcoTrueque Venezuela Setup       ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instala Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ requerido. Versión actual: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Instalar dependencias globales
echo -e "${YELLOW}📦 Instalando Expo CLI y EAS CLI...${NC}"
npm install -g expo-cli eas-cli 2>/dev/null || true

# Instalar dependencias del proyecto
echo -e "${YELLOW}📦 Instalando dependencias del proyecto...${NC}"
npm install

# Configurar .env si no existe
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Archivo .env creado. Por favor edítalo con tus credenciales.${NC}"
fi

# Verificar assets
echo -e "${YELLOW}🎨 Verificando assets...${NC}"
for asset in "icon.png" "splash.png" "adaptive-icon.png"; do
    if [ ! -f "assets/$asset" ]; then
        echo -e "${YELLOW}⚠️  assets/$asset no encontrado (requerido para build)${NC}"
    fi
done

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup completado                          ║${NC}"
echo -e "${GREEN}║                                               ║${NC}"
echo -e "${GREEN}║  Próximos pasos:                              ║${NC}"
echo -e "${GREEN}║  1. Edita .env con tus credenciales           ║${NC}"
echo -e "${GREEN}║  2. Ejecuta migraciones en Supabase           ║${NC}"
echo -e "${GREEN}║  3. npx expo start                            ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
