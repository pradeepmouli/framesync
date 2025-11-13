import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button,
	FlatList,
	NativeModules,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const { FrameModule } = NativeModules;

interface FrameDevice {
	id: string;
	name: string;
	reachable: boolean;
	storageTotalMB?: number;
	storageFreeMB?: number;
}

export function PairFrameScreen() {
	const [discovering, setDiscovering] = useState(false);
	const [pairing, setPairing] = useState(false);
	const [devices, setDevices] = useState<FrameDevice[]>([]);
	const [pairedDevice, setPairedDevice] = useState<FrameDevice | null>(null);

	useEffect(() => {
		void checkPairedDevice();
	}, []);

	const handleDiscover = async () => {
		try {
			setDiscovering(true);
			const result = await FrameModule.discoverFrames();
			setDevices(result.devices || []);

			if (result.devices.length === 0) {
				Alert.alert('No Devices Found', 'Make sure your Samsung Frame is on the same network.');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			Alert.alert('Discovery Failed', message);
		} finally {
			setDiscovering(false);
		}
	};

	const handlePair = async (deviceId: string) => {
		try {
			setPairing(true);
			const result = await FrameModule.pairFrame(deviceId);

			if (result.paired) {
				const device = devices.find((d) => d.id === deviceId);
				setPairedDevice(device || null);
				Alert.alert('Pairing Successful', `Connected to ${device?.name || 'Frame'}`);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			Alert.alert('Pairing Failed', message);
		} finally {
			setPairing(false);
		}
	};

	const handleUnpair = async () => {
		Alert.alert(
			'Unpair Frame',
			'Are you sure you want to unpair this device?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Unpair',
					style: 'destructive',
					onPress: async () => {
						try {
							await FrameModule.unpairFrame();
							setPairedDevice(null);
							Alert.alert('Unpaired', 'Frame device has been unpaired');
						} catch (error) {
							const message = error instanceof Error ? error.message : 'Unknown error';
							Alert.alert('Unpair Failed', message);
						}
					},
				},
			]
		);
	};

	const checkPairedDevice = async () => {
		try {
			const device = await FrameModule.getPairedFrame();
			setPairedDevice(device);
		} catch (error) {
			console.error('Failed to check paired device:', error);
		}
	};

	const renderDevice = ({ item }: { item: FrameDevice }) => (
		<TouchableOpacity
			style={styles.deviceItem}
			onPress={() => { void handlePair(item.id); }}
			disabled={pairing}
		>
			<View style={styles.deviceInfo}>
				<Text style={styles.deviceName}>{item.name}</Text>
				<Text style={styles.deviceId}>ID: {item.id}</Text>
				{item.storageTotalMB && (
					<Text style={styles.deviceStorage}>
						Storage: {item.storageFreeMB} / {item.storageTotalMB} MB free
					</Text>
				)}
			</View>
			<View style={[styles.statusDot, item.reachable && styles.statusDotActive]} />
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Frame Pairing</Text>

			{pairedDevice ? (
				<View style={styles.pairedSection}>
					<Text style={styles.sectionTitle}>Paired Device</Text>
					<View style={styles.pairedDevice}>
						<Text style={styles.deviceName}>{pairedDevice.name}</Text>
						<Text style={styles.deviceId}>{pairedDevice.id}</Text>
					</View>
					<Button title="Unpair Frame" onPress={() => { void handleUnpair(); }} color="#dc3545" />
				</View>
			) : (
				<>
					<View style={styles.section}>
						<Button
							title="Discover Frames"
							onPress={() => { void handleDiscover(); }}
							disabled={discovering}
						/>
						{discovering && <ActivityIndicator size="large" style={styles.loader} />}
					</View>

					{devices.length > 0 && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Available Devices</Text>
							{pairing && <ActivityIndicator size="large" style={styles.loader} />}
							<FlatList
								data={devices}
								keyExtractor={(item) => item.id}
								renderItem={renderDevice}
								style={styles.deviceList}
							/>
						</View>
					)}
				</>
			)}
		</View>
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
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 12,
	},
	loader: {
		marginVertical: 16,
	},
	deviceList: {
		maxHeight: 400,
	},
	deviceItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		marginBottom: 8,
		backgroundColor: '#fff',
	},
	deviceInfo: {
		flex: 1,
	},
	deviceName: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	deviceId: {
		fontSize: 12,
		color: '#666',
		marginBottom: 2,
	},
	deviceStorage: {
		fontSize: 12,
		color: '#999',
	},
	statusDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: '#ccc',
	},
	statusDotActive: {
		backgroundColor: '#28a745',
	},
	pairedSection: {
		marginBottom: 24,
	},
	pairedDevice: {
		padding: 16,
		borderWidth: 1,
		borderColor: '#28a745',
		borderRadius: 8,
		marginBottom: 16,
		backgroundColor: '#f0fff0',
	},
});
