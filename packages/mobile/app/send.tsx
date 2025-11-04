import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SendScreen() {
  const [result, setResult] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload to Frame</Text>
      <Button title="Upload (stub)" onPress={() => setResult('TODO: Select image and upload')} />
      <Text>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '600' }
});
