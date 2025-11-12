import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

import { FrameApiClient } from '../api/client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function UploadScreen() {
	const [uploading, setUploading] = useState(false);
	const [uploadId, setUploadId] = useState<string | null>(null);

	const handleUpload = async () => {
		try {
			setUploading(true);

			// TODO: Integrate expo-image-picker or expo-media-library to select asset
			const mockAssetId = 'mock-asset-id';

			const client = new FrameApiClient(API_BASE_URL);
			const acceptance = await client.uploadPhoto({
				assetId: mockAssetId,
				convertIfNeeded: true,
			});

			setUploadId(acceptance.uploadId);
			Alert.alert('Success', `Upload queued with ID: ${acceptance.uploadId}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			Alert.alert('Upload Failed', message);
		} finally {
			setUploading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Upload Photo to Frame</Text>

			{uploading && <ActivityIndicator size="large" style={styles.loader} />}

			{uploadId && (
				<Text style={styles.status}>Last upload ID: {uploadId}</Text>
			)}

			<Button
				title="Select and Upload Photo"
				onPress={handleUpload}
				disabled={uploading}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 24,
	},
	loader: {
		marginVertical: 16,
	},
	status: {
		marginVertical: 12,
		color: '#666',
	},
});
