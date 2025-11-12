import { Alert } from 'react-native';

export class FrameError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly statusCode?: number
	) {
		super(message);
		this.name = 'FrameError';
	}
}

export function mapErrorToMessage(error: unknown): string {
	if (error instanceof FrameError) {
		switch (error.code) {
			case 'NETWORK_ERROR':
				return 'Network connection failed. Check your connection and try again.';
			case 'SERVER_ERROR':
				return 'Server error occurred. Please try again later.';
			case 'VALIDATION_ERROR':
				return 'Invalid request. Please check your input.';
			case 'NOT_FOUND':
				return 'Resource not found.';
			default:
				return error.message;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'An unexpected error occurred';
}

export function showErrorAlert(error: unknown, title = 'Error') {
	const message = mapErrorToMessage(error);
	Alert.alert(title, message);
}
