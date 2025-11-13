import { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	Linking,
	NativeModules,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from 'react-native';

const { FrameModule } = NativeModules;

interface FrameDevice {
	id: string;
	name: string;
	reachable: boolean;
}

export function SettingsScreen() {
	const [pairedDevice, setPairedDevice] = useState<FrameDevice | null>(null);
	const [photosPermissionGranted, setPhotosPermissionGranted] = useState(false);

	useEffect(() => {
		void loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const device = await FrameModule.getPairedFrame();
			setPairedDevice(device);

			// TODO: Check Photos permission status when available
			setPhotosPermissionGranted(true);
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
	};

	const handleUnpairFrame = () => {
		Alert.alert(
			'Unpair Frame',
			'This will remove the connection to your Samsung Frame. You can pair again anytime.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Unpair',
					style: 'destructive',
					onPress: async () => {
						try {
							await FrameModule.unpairFrame();
							setPairedDevice(null);
							Alert.alert('Success', 'Frame has been unpaired');
						} catch (error) {
							const message = error instanceof Error ? error.message : 'Unknown error';
							Alert.alert('Error', `Failed to unpair: ${message}`);
						}
					},
				},
			]
		);
	};

	const handleManagePhotosPermission = () => {
		Alert.alert(
			'Photos Permission',
			'Photo Library access is managed in iOS Settings. Would you like to open Settings?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Open Settings',
					onPress: () => {
						void Linking.openSettings();
					},
				},
			]
		);
	};

	const handleManageNetworkPermission = () => {
		Alert.alert(
			'Local Network Permission',
			'Local Network access is managed in iOS Settings. Would you like to open Settings?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Open Settings',
					onPress: () => {
						void Linking.openSettings();
					},
				},
			]
		);
	};

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Settings</Text>

			{/* Frame Device Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Frame Device</Text>

				{pairedDevice ? (
					<View style={styles.card}>
						<View style={styles.row}>
							<Text style={styles.label}>Device Name</Text>
							<Text style={styles.value}>{pairedDevice.name}</Text>
						</View>
						<View style={styles.row}>
							<Text style={styles.label}>Device ID</Text>
							<Text style={styles.valueSmall}>{pairedDevice.id}</Text>
						</View>
						<View style={styles.row}>
							<Text style={styles.label}>Status</Text>
							<View style={styles.statusContainer}>
								<View style={[styles.statusDot, pairedDevice.reachable && styles.statusDotActive]} />
								<Text style={styles.value}>
									{pairedDevice.reachable ? 'Connected' : 'Offline'}
								</Text>
							</View>
						</View>

						<View style={styles.buttonContainer}>
							<Button
								title="Unpair Frame"
								onPress={handleUnpairFrame}
								color="#dc3545"
							/>
						</View>
					</View>
				) : (
					<View style={styles.card}>
						<Text style={styles.emptyText}>No Frame paired</Text>
						<Text style={styles.helpText}>Go to Pairing screen to connect a Frame</Text>
					</View>
				)}
			</View>

			{/* Permissions Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Permissions</Text>

				<View style={styles.card}>
					<View style={styles.permissionRow}>
						<View style={styles.permissionInfo}>
							<Text style={styles.permissionTitle}>Photo Library Access</Text>
							<Text style={styles.permissionDesc}>Required to upload photos to Frame</Text>
						</View>
						<Switch
							value={photosPermissionGranted}
							disabled={true}
							onValueChange={() => {}}
						/>
					</View>
					<View style={styles.buttonContainer}>
						<Button
							title="Manage in Settings"
							onPress={handleManagePhotosPermission}
						/>
					</View>
				</View>

				<View style={styles.card}>
					<View style={styles.permissionRow}>
						<View style={styles.permissionInfo}>
							<Text style={styles.permissionTitle}>Local Network Access</Text>
							<Text style={styles.permissionDesc}>Required to connect to Frame on your network</Text>
						</View>
					</View>
					<View style={styles.buttonContainer}>
						<Button
							title="Manage in Settings"
							onPress={handleManageNetworkPermission}
						/>
					</View>
				</View>
			</View>

			{/* App Info Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>About</Text>
				<View style={styles.card}>
					<View style={styles.row}>
						<Text style={styles.label}>Version</Text>
						<Text style={styles.value}>0.1.0</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Privacy</Text>
						<Text style={styles.valueSmall}>
							FrameSync only accesses photos you select and stores no data on external servers.
						</Text>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 24,
	},
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 12,
		color: '#333',
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 16,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#666',
		flex: 1,
	},
	value: {
		fontSize: 14,
		color: '#333',
		flex: 2,
		textAlign: 'right',
	},
	valueSmall: {
		fontSize: 12,
		color: '#666',
		flex: 2,
		textAlign: 'right',
	},
	statusContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flex: 2,
		justifyContent: 'flex-end',
	},
	statusDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#ccc',
	},
	statusDotActive: {
		backgroundColor: '#28a745',
	},
	buttonContainer: {
		marginTop: 16,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
	},
	emptyText: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		marginBottom: 8,
	},
	helpText: {
		fontSize: 12,
		color: '#999',
		textAlign: 'center',
	},
	permissionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	permissionInfo: {
		flex: 1,
		marginRight: 16,
	},
	permissionTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	permissionDesc: {
		fontSize: 12,
		color: '#666',
	},
});
