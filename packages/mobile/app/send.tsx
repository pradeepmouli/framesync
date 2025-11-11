import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { frameClient } from '../src/frameClient';
import { activityLog } from '../src/activityLog';

const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

export default function SendScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const [busy, setBusy] = useState(false);
	const [result, setResult] = useState('');
	const [progress, setProgress] = useState(0);

	const onSend = async () => {
		if (!id) {
			Alert.alert('No photo selected');
			return;
		}
		setBusy(true);
		setResult('Sending…');
		setProgress(0);
		try {
			await frameClient.sendPhoto(id, (p) => setProgress(p));
			setResult('Sent successfully!');
			setProgress(100);
			await activityLog.add('upload', 'success', 'Photo uploaded to Frame', { assetId: id });
		} catch (e: any) {
			setResult(`Error: ${e?.message || 'failed'}`);
			setProgress(0);
			await activityLog.add('upload', 'error', `Upload failed: ${e?.message || 'unknown'}`, { assetId: id });
		} finally {
			setBusy(false);
		}
	};

	// iOS SwiftUI version
	if (Platform.OS === 'ios' && SwiftUIComponents) {
		const { Host, List, Section, Button, Text, VStack, ProgressView } = SwiftUIComponents;

		return (
			<Host style={styles.container}>
				<VStack alignment="center" spacing={16}>
					<Text font="title" fontWeight="semibold">
						Send to Frame
					</Text>
					<List inset>
						<Section>
							{id ? (
								<Text>Selected asset: {id}</Text>
							) : (
								<Text foregroundColor="secondary">No photo selected</Text>
							)}
						</Section>
					</List>
					{busy && progress > 0 ? (
						<ProgressView value={progress / 100} />
					) : null}
					<Button
						action={onSend}
						disabled={!id || busy}
					>
						<Text>{busy ? 'Sending…' : 'Send'}</Text>
					</Button>
					{result ? <Text foregroundColor="secondary">{result}</Text> : null}
					{busy && progress > 0 ? (
						<Text foregroundColor="secondary">{Math.round(progress)}%</Text>
					) : null}
				</VStack>
			</Host>
		);
	}

	// Fallback for Android/Web
	const { View, Text, Button } = require('react-native');
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Send to Frame</Text>
			{id ? <Text>Selected asset: {id}</Text> : <Text>No photo selected</Text>}
			{busy && progress > 0 ? <Text>Progress: {Math.round(progress)}%</Text> : null}
			<Button title={busy ? 'Sending…' : 'Send'} onPress={onSend} disabled={!id || busy} />
			<Text style={styles.status}>{result}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 12 },
	title: { fontSize: 18, fontWeight: '600' },
	status: { marginTop: 8, color: '#555' },
});
