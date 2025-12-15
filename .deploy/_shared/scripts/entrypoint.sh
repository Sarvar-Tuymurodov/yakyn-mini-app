#!/bin/sh
set -e

# Install dependencies
npm install

# Run dev server with hot reload
npm run dev -- --host 0.0.0.0
