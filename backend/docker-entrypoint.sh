#!/bin/sh
set -eu

node dist/database/migrate.js
node dist/database/seed.js

exec "$@"
