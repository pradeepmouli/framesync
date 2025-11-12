import { useState } from 'react';
import {
	View,
	Text,
	Button,
	StyleSheet,
	ActivityIndicator,
	Alert,
	TextInput,
} from 'react-native';

import { FrameApiClient } from '../api/client';
import type { SyncJob } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function AlbumSyncScreen() {
	const [albumId, setAlbumId] = useState('');
	const [syncing, setSyncing] = useState(false);
	const [lastJob, setLastJob] = useState<SyncJob | null>(null);

	const client = new FrameApiClient(API_BASE_URL);

	const handleSync = async () => {
		if (!albumId.trim()) {
			Alert.alert('Missing Album', 'Please enter an album ID');
			return;
		}

		try {
			setSyncing(true);

			const acceptance = await client.triggerSync({
				albumId: albumId.trim(),
				deletionMode: 'add-only',
			});

			// Poll for job completion (simplified for MVP)
			const job = await client.getSyncJob(acceptance.jobId);
			setLastJob(job);

			Alert.alert(
				'Sync Started',
				`Job ID: ${job.id}\nAdded: ${job.addedCount}\nSkipped: ${job.skippedDuplicates}`
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			Alert.alert('Sync Failed', message);
		} finally {
			setSyncing(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sync Album to Frame</Text>

			<TextInput
				style={styles.input}
				placeholder="Enter Album ID"
				value={albumId}
				onChangeText={setAlbumId}
				editable={!syncing}
			/>

			{syncing && <ActivityIndicator size="large" style={styles.loader} />}

			{lastJob && (
				<View style={styles.jobSummary}>
					<Text style={styles.jobTitle}>Last Sync Job</Text>
					<Text>Job ID: {lastJob.id}</Text>
					<Text>Album: {lastJob.albumId}</Text>
					<Text>Added: {lastJob.addedCount}</Text>
					<Text>Skipped (duplicates): {lastJob.skippedDuplicates}</Text>
					<Text>Failed: {lastJob.failedCount}</Text>
					<Text>Mode: {lastJob.deletionMode}</Text>
				</View>
			)}

			<Button
				title="Sync Now"
				onPress={() => { void handleSync(); }}
				disabled={syncing || !albumId.trim()}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		padding: 12,
		marginBottom: 16,
		fontSize: 16,
	},
	loader: {
		marginVertical: 16,
	},
	jobSummary: {
		padding: 12,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		marginVertical: 16,
		backgroundColor: '#f9f9f9',
	},
	jobTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
	},
});
