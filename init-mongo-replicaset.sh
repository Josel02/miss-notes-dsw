#!/bin/bash

# Función para iniciar la aplicación
start_app() {
  echo "Iniciando la aplicación con nodemon..."
  nodemon ./bin/www
}

# Función para verificar si MongoDB ya está configurado como replica set
is_replica_set_configured() {
  echo "Verificando si MongoDB está configurado como un replica set..."
  IS_REPLICA_SET=$(mongosh --quiet --eval "db.isMaster().setName" | grep -v "Using" | grep -v "exit")
  if [ -n "$IS_REPLICA_SET" ]; then
    echo "MongoDB ya está configurado como un replica set."
    return 0
  else
    echo "MongoDB no está configurado como un replica set."
    return 1
  fi
}

# Configurar MongoDB como replica set si aún no lo está
configure_replica_set() {
  echo "Configurando MongoDB como un replica set..."
  sudo sed -i '/^#replication:/a replication:\n  replSetName: "rs0"' /etc/mongod.conf
  echo "Reiniciando MongoDB..."
  sudo systemctl restart mongod
  echo "Esperando a que MongoDB se reinicie..."
  sleep 5
  echo "Inicializando replica set..."
  mongosh --eval 'rs.initiate()'
}

# Verificar si MongoDB está configurado como replica set y configurarlo si es necesario
if is_replica_set_configured; then
  start_app
else
  configure_replica_set
  # Verificar nuevamente después de la configuración
  if is_replica_set_configured; then
    start_app
  else
    echo "Hubo un error configurando el replica set de MongoDB."
    exit 1
  fi
fi
