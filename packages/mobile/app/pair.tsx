import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ImageBackground, Platform, StyleSheet } from 'react-native';
import { frameClient } from '../src/frameClient';

const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

const SwiftUIModifiers = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui/modifiers')
	: null;

export default function PairScreen() {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const onPair = async () => {
    if (!pin) {
      Alert.alert('Enter PIN');
      return;
    }
    setBusy(true);
    setStatus('Pairing…');
    try {
      await frameClient.pair(pin);
      setStatus('Paired');
      router.replace('/albums');
    } catch (e: any) {
      setStatus(`Error: ${e?.message || 'failed'}`);
    } finally {
      setBusy(false);
    }
  };

  // iOS SwiftUI version with liquid glass
  if (Platform.OS === 'ios' && SwiftUIComponents && SwiftUIModifiers) {
    const { Host, List, Section, TextField, Button, Text, VStack } = SwiftUIComponents;
    const { glassEffect, padding, cornerRadius } = SwiftUIModifiers;

    return (
      <Host style={styles.container}>
        <VStack alignment="center" spacing={24}>
          <Text
            font="largeTitle"
            fontWeight="bold"
            modifiers={[
              glassEffect({ glass: { variant: 'regular' } }),
              padding({ all: 20 }),
              cornerRadius(16)
            ]}
          >
            Enter TV PIN
          </Text>
          <List
            inset
            modifiers={[
              glassEffect({ glass: { variant: 'clear' } }),
              cornerRadius(12)
            ]}
          >
            <Section>
              <TextField
                text={pin}
                onTextChange={setPin}
                prompt="000000"
                keyboardType="numberPad"
              />
            </Section>
          </List>
          <Button
            onPress={onPair}
            disabled={busy || !pin}
            modifiers={[
              glassEffect({ glass: { variant: 'regular' } }),
              padding({ horizontal: 32, vertical: 12 }),
              cornerRadius(12)
            ]}
          >
            <Text fontWeight="semibold">{busy ? 'Pairing…' : 'Pair'}</Text>
          </Button>
          {status ? (
            <Text
              foregroundColor="secondary"
              modifiers={[
                glassEffect({ glass: { variant: 'clear' } }),
                padding({ all: 12 }),
                cornerRadius(8)
              ]}
            >
              {status}
            </Text>
          ) : null}
        </VStack>
      </Host>
    );
  }

  // Fallback for Android/Web with simple styling
  const { View, Text, TextInput, Button } = require('react-native');
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop' }}
        style={StyleSheet.absoluteFill}
        blurRadius={20}
      />
      <View style={styles.glassCard}>
        <Text style={styles.title}>Enter TV PIN</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={pin}
          onChangeText={setPin}
          placeholder="000000"
        />
        <Button title={busy ? 'Pairing…' : 'Pair'} onPress={onPair} disabled={busy || !pin} />
        <Text style={styles.status}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  glassCard: {
    padding: 24,
    borderRadius: 16,
    gap: 12,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#000' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, backgroundColor: 'rgba(255,255,255,0.5)' },
  status: { marginTop: 12, color: '#333' },
});