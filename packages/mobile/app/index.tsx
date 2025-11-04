import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ConnectScreen() {
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:4000');
  const [status, setStatus] = useState<string>('');

  const testConnection = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/status`);
      setStatus(`OK: ${JSON.stringify(res.data)}`);
      await AsyncStorage.setItem('serverUrl', serverUrl);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect to FrameSync Server</Text>
      <TextInput
        style={styles.input}
        value={serverUrl}
        onChangeText={setServerUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://<server-ip>:4000"
      />
      <Button title="Test Connection" onPress={testConnection} />
      <View style={{ height: 8 }} />
      <Button title="Continue" onPress={() => router.push('/albums')} />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
  status: { marginTop: 12, color: '#555' },
});
