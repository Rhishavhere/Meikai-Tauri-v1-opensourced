---
description: Clean build artifacts
---

# Clean Build Artifacts

## Clean Rust Only

```bash
cargo clean --manifest-path src-tauri/Cargo.toml
```

## Clean All

```bash
# Remove Rust artifacts
cargo clean --manifest-path src-tauri/Cargo.toml

# Remove Vite build
rm -rf dist

# Remove node modules (optional, for fresh install)
rm -rf node_modules

# Reinstall dependencies
npm install
```

## When to Clean

- After updating Rust dependencies
- After Tauri version upgrade
- When encountering strange build errors
- After changing `tauri.conf.json` significantly
