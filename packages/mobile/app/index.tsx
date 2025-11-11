import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { ImageBackground, Platform, StyleSheet } from 'react-native';
import { frameClient } from '../src/frameClient';
import { connectionStateAtom, tvIpAtom } from '../src/state';

// Platform-specific UI imports
const SwiftUIComponents = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui')
	: null;

const SwiftUIModifiers = Platform.OS === 'ios'
	? require('@expo/ui/swift-ui/modifiers')
	: null;

export default function ConnectScreen() {
	const [ip, setIp] = useAtom(tvIpAtom);
	const [status, setStatus] = useAtom(connectionStateAtom);
	const [busy, setBusy] = useState(false);

	const onConnect = async () => {
		setBusy(true);
		setStatus('connecting');
		try {
			const res = await frameClient.connect(ip);
			if (res === 'pairing-required') {
				setStatus('pairing-required');
				router.push('/pair');
			} else {
				setStatus('connected');
			}
		} catch {
			setStatus('error');
		} finally {
			setBusy(false);
		}
	};

	// iOS SwiftUI version with liquid glass
	if (Platform.OS === 'ios' && SwiftUIComponents && SwiftUIModifiers) {
		const { Host, List, Section, TextField, Button, Text, Spacer, VStack } = SwiftUIComponents;
		const { glassEffect, padding, cornerRadius } = SwiftUIModifiers;

		return (
			<Host style={styles.container}>
				<VStack alignment="center" spacing={24} modifiers={[
					padding({ all: 20 })
				]}>
					<Spacer />
						<Text
							font="largeTitle"
							fontWeight="bold"
							modifiers={[
								glassEffect({ glass: { variant: 'regular' } }),
								padding({ all: 20 }),
								cornerRadius(16)
							]}
						>
							Connect to Samsung Frame
						</Text>
					<List
						inset
						modifiers={[
							glassEffect({ glass: { variant: 'clear' } }),
							cornerRadius(12)
						]}
					>
						<Section header={<Text>TV Configuration</Text>}>
							<TextField
								text={ip}
								onTextChange={setIp}
								prompt="TV IP (e.g., 192.168.1.50)"
								autocapitalization="none"
								keyboardType="numbersAndPunctuation"
							/>
						</Section>
					</List>
					<Button
						onPress={onConnect}
						disabled={busy || !ip}
						modifiers={[
							glassEffect({ glass: { variant: 'regular' } }),
							padding({ horizontal: 32, vertical: 12 }),
							cornerRadius(12)
						]}
					>
						<Text fontWeight="semibold">{busy ? 'Connecting…' : 'Connect'}</Text>
					</Button>
					<Text
						foregroundColor="secondary"
						modifiers={[
							glassEffect({ glass: { variant: 'clear' } }),
							padding({ all: 12 }),
							cornerRadius(8)
						]}
					>
						Status: {status}
					</Text>
					<Spacer minLength={16} />
					<Button
						onPress={() => router.push('/albums')}
						modifiers={[
							glassEffect({ glass: { variant: 'regular' } }),
							padding({ horizontal: 32, vertical: 12 }),
							cornerRadius(12)
						]}
					>
						<Text fontWeight="semibold">Continue</Text>
					</Button>
					{status === 'connected' ? (
						<Button
							onPress={() => router.push('/manage')}
							modifiers={[
								glassEffect({ glass: { variant: 'clear' } }),
								padding({ horizontal: 32, vertical: 12 }),
								cornerRadius(12)
							]}
						>
							<Text fontWeight="semibold">Manage Frame Media</Text>
						</Button>
					) : null}
					<Spacer />
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
				<Text style={styles.title}>Connect to Samsung Frame</Text>
				<TextInput
					style={styles.input}
					placeholder="TV IP (e.g., 192.168.1.50)"
					autoCapitalize="none"
					autoCorrect={false}
					keyboardType="numbers-and-punctuation"
					value={ip}
					onChangeText={setIp}
				/>
				<Button title={busy ? 'Connecting…' : 'Connect'} disabled={busy || !ip} onPress={onConnect} />
				<Text style={styles.status}>Status: {status}</Text>
				<View style={{ height: 8 }} />
				<Button title="Continue" onPress={() => router.push('/albums')} />
				{status === 'connected' ? (
					<>
						<View style={{ height: 8 }} />
						<Button title="Manage Frame Media" onPress={() => router.push('/manage')} />
					</>
				) : null}
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
