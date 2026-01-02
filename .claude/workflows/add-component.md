---
description: How to add a new React component to Meikai Browser
---

# Adding a New Component

## 1. Create the Component File

Create a new `.tsx` file in the appropriate directory:

- `src/components/` - For standalone components
- `src/components/Panel/` - For panel mode views

```tsx
import { motion } from "framer-motion";

interface MyComponentProps {
  // Define props here
}

export default function MyComponent({ }: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="your-tailwind-classes"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

## 2. Use the Component

Import and use in parent component:

```tsx
import MyComponent from "./MyComponent";

// In JSX:
<MyComponent prop1={value} />
```

## 3. Common Patterns

### Using Icons (Lucide React)
```tsx
import { IconName } from "lucide-react";
<IconName className="w-5 h-5" />
```

### Using Animations (Framer Motion)
```tsx
import { motion, AnimatePresence } from "framer-motion";
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
/>
```

### Using Tauri Commands
```tsx
import { invoke } from "@tauri-apps/api/core";
const result = await invoke<ReturnType>("command_name", { args });
```

### Listening to Events
```tsx
import { listen } from "@tauri-apps/api/event";
useEffect(() => {
  const unlisten = listen("event-name", (event) => {
    // Handle event
  });
  return () => { unlisten.then(fn => fn()); };
}, []);
```

## 4. Adding Panel Tab

If adding a new tab to the panel:

1. Create component in `src/components/Panel/YourTab.tsx`
2. Update `src/components/Panel/index.tsx`:
   - Add new tab type to union
   - Add case in render switch
3. Add navigation trigger (e.g., in Home.tsx quick actions)
