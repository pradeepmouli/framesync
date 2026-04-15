---
name: react-native-expo
description: React Native and Expo development including setup, navigation, state management, platform-specific code, and EAS builds
---

# React Native & Expo Development

Use this skill when building React Native apps with Expo, configuring EAS builds, or working with cross-platform mobile development.

## Project Setup

### New Expo Project

```bash
# Create new Expo project
npx create-expo-app my-app --template blank-typescript

# Navigate to project
cd my-app

# Start development server
npx expo start
```

### Expo Router Setup (Recommended Navigation)

```bash
# Install Expo Router
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Update package.json
```

Add to `package.json`:

```json
{
  "main": "expo-router/entry"
}
```

### Project Structure with Expo Router

```
app/
├── (tabs)/           # Tab-based navigation
│   ├── index.tsx     # Home tab
│   ├── explore.tsx   # Explore tab
│   └── _layout.tsx   # Tab layout
├── modal.tsx         # Modal screen
├── +not-found.tsx    # 404 screen
└── _layout.tsx       # Root layout
```

## Expo Router Navigation

### File-Based Routing

```typescript
// app/index.tsx - Home screen
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View>
      <Text>Home Screen</Text>
    </View>
  );
}
```

### Layouts

```typescript
// app/_layout.tsx - Root layout
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

### Tab Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Navigation Between Screens

```typescript
import { Link, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function Screen() {
  const router = useRouter();

  return (
    <>
      {/* Using Link component */}
      <Link href="/details">Go to Details</Link>

      {/* Programmatic navigation */}
      <Pressable onPress={() => router.push('/details')}>
        <Text>Navigate</Text>
      </Pressable>

      {/* With parameters */}
      <Link href={{ pathname: '/user/[id]', params: { id: '123' } }}>
        User Profile
      </Link>
    </>
  );
}
```

### Dynamic Routes

```typescript
// app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function UserProfile() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>User ID: {id}</Text>
    </View>
  );
}
```

## State Management

### React Context (Simple State)

```typescript
// context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

### Zustand (Recommended for Complex State)

```bash
npx expo install zustand
```

```typescript
// store/useStore.ts
import { create } from 'zustand';

interface AppStore {
  count: number;
  user: User | null;
  increment: () => void;
  setUser: (user: User | null) => void;
}

export const useStore = create<AppStore>((set) => ({
  count: 0,
  user: null,
  increment: () => set((state) => ({ count: state.count + 1 })),
  setUser: (user) => set({ user }),
}));

// Usage
import { useStore } from '@/store/useStore';

function Component() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return <Button onPress={increment} title={`Count: ${count}`} />;
}
```

## Platform-Specific Code

### Using Platform Module

```typescript
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 20 : 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Platform-Specific Files

```
components/
├── Button.tsx          # Shared code
├── Button.ios.tsx      # iOS-specific
└── Button.android.tsx  # Android-specific
```

```typescript
// Automatically imports the correct file
import Button from "@/components/Button";
```

## Styling

### StyleSheet (Recommended)

```typescript
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}
```

### Design Tokens (Best Practice)

```typescript
// constants/tokens.ts
export const tokens = {
  colors: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#C6C6C8",
    error: "#FF3B30",
    success: "#34C759",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
    },
    weights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
};

// Usage
import { tokens } from "@/constants/tokens";

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background,
  },
  title: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text,
  },
});
```

## API Integration

### Fetch with Error Handling

```typescript
// api/client.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchData<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage with async/await
import { fetchData } from '@/api/client';

export default function Screen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result = await fetchData('/users');
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return <Text>{JSON.stringify(data)}</Text>;
}
```

### Using React Query (Recommended)

```bash
npx expo install @tanstack/react-query
```

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}

// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchData<User[]>('/users'),
  });
}

// Usage
function UserList() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <UserItem user={item} />}
    />
  );
}
```

## EAS Build & Deployment

### Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure
```

### Build Profiles (eas.json)

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.production.com"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build Commands

```bash
# Development build (for testing on device)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (for internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Install development build
npx expo install expo-dev-client
```

### Environment Variables

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_APP_VERSION=1.0.0
```

```typescript
// Access in code
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

### Submit to App Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## Over-The-Air (OTA) Updates

```bash
# Install expo-updates
npx expo install expo-updates

# Publish update
eas update --branch production --message "Bug fixes"

# Configure channels
eas channel:create production
eas channel:create staging
```

## Common Patterns

### Loading States

```typescript
function Screen() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Content />;
}
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
          <Button
            title="Try again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Performance Optimization

### FlatList Best Practices

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <Item item={item} />}
  keyExtractor={(item) => item.id}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize component
const ItemComponent = memo(({ item }: { item: Item }) => {
  return <Text>{item.name}</Text>;
});

// Memoize expensive calculations
function Screen() {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  // Memoize callbacks
  const handlePress = useCallback(() => {
    console.log('Pressed');
  }, []);

  return <Button onPress={handlePress} />;
}
```

## Testing

### Jest Setup

```typescript
// app/button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Press me" />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press" onPress={onPress} />);

    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Accessibility

```typescript
import { View, Text, Pressable } from 'react-native';

<Pressable
  accessible={true}
  accessibilityLabel="Submit button"
  accessibilityHint="Double tap to submit the form"
  accessibilityRole="button"
  onPress={handleSubmit}
>
  <Text>Submit</Text>
</Pressable>
```

## Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native Documentation**: https://reactnative.dev
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **React Native Community**: https://github.com/react-native-community

---

**Sources**:

- [senaiverse/claude-code-reactnative-expo-agent-system](https://github.com/senaiverse/claude-code-reactnative-expo-agent-system)
- [Building Mobile Apps with Claude Code](https://caritos.com/posts/building-mobile-apps-with-claude-code/)
- [Expo Development Patterns](https://developertoolkit.ai/en/cookbook/mobile-development/expo/)
- [Design+Code React Native AI Course](https://designcode.io/react-native-ai/)
