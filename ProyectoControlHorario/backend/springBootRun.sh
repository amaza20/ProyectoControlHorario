#!/bin/bash

echo "Cargando variables desde .env ..."

# Comprobar si .env existe
if [ ! -f ".env" ]; then
    echo "No se encontró el archivo .env"
    exit 1
fi

# Cargar las variables del archivo .env
set -a
source .env
set +a

echo "Variables cargadas correctamente."
echo "Lanzando mvn spring-boot:run..."
echo

mvn spring-boot:run
