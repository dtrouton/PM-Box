#!/usr/bin/env bash
set -euo pipefail

DOLT_DIR="${DOLT_DATA_DIR:-.dolt-data}"
DB_NAME="${DOLT_DATABASE:-pmbox}"

# Check if dolt is installed
if ! command -v dolt &> /dev/null; then
  echo "Error: dolt is not installed."
  echo "Install it from: https://docs.dolthub.com/introduction/installation"
  echo ""
  echo "  macOS:  brew install dolt"
  echo "  Linux:  sudo bash -c 'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash'"
  exit 1
fi

echo "Using data directory: $DOLT_DIR"

# Initialize Dolt data directory if needed
if [ ! -d "$DOLT_DIR/$DB_NAME" ]; then
  echo "Initializing Dolt database '$DB_NAME'..."
  mkdir -p "$DOLT_DIR/$DB_NAME"
  cd "$DOLT_DIR/$DB_NAME"
  dolt init
  dolt config --local --add user.name "PM-Box"
  dolt config --local --add user.email "pmbox@local"
  cd - > /dev/null
  echo "Database initialized."
else
  echo "Database '$DB_NAME' already exists."
fi

echo "Starting Dolt SQL server on port ${DOLT_PORT:-3306}..."
echo "Database: $DB_NAME"
echo ""

exec dolt sql-server \
  --host "${DOLT_HOST:-localhost}" \
  --port "${DOLT_PORT:-3306}" \
  --user "${DOLT_USER:-root}" \
  --data-dir "$DOLT_DIR"
