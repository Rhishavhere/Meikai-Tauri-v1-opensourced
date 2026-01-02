---
description: Build production executable
---

# Build for Production

```bash
npm run tauri build
```

This command:
1. Runs TypeScript compiler
2. Builds Vite production bundle
3. Compiles Rust in release mode
4. Creates Windows executable and installers

## Output Locations

- **Executable:** `src-tauri/target/release/Meikai.exe`
- **MSI Installer:** `src-tauri/target/release/bundle/msi/`
- **NSIS Installer:** `src-tauri/target/release/bundle/nsis/`
