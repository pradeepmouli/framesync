import Foundation
#if canImport(React)
import React
#else
@objc protocol RCTBridgeModule {}
typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String?, String?, Error?) -> Void
#endif
#if canImport(SwiftSamsungFrame)
import SwiftSamsungFrame
#else
final class TVClient {}
#endif
#if canImport(OSLog)
import OSLog
#endif

@objc(FrameModule)
final class FrameModule: NSObject, RCTBridgeModule {
	private let bridgeActor = FrameNativeBridge()
	private let dateFormatter: ISO8601DateFormatter = {
		let formatter = ISO8601DateFormatter()
		formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
		return formatter
	}()

	#if canImport(OSLog)
	private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.mouli.framesync", category: "FrameModule")
	#endif

	@objc static func moduleName() -> String! {
		"FrameModule"
	}

	@objc static func requiresMainQueueSetup() -> Bool {
		false
	}

	@objc(listMedia:rejecter:)
	func listMedia(_ resolve: @escaping RCTPromiseResolveBlock,
					rejecter reject: @escaping RCTPromiseRejectBlock) {
		perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
			let media = await self.bridgeActor.listMedia()
			let payload = media.map { $0.toDictionary(dateFormatter: dateFormatter) }
			return ["items": payload]
		}
	}

	@objc(uploadPhoto:resolver:rejecter:)
	func uploadPhoto(_ payload: NSDictionary,
					resolver resolve: @escaping RCTPromiseResolveBlock,
					rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
			let request = try UploadPhotoRequest(payload: payload)
				let acceptance = try await self.bridgeActor.uploadPhoto(request: request)
			return acceptance.toDictionary(dateFormatter: dateFormatter)
		}
	}

	@objc(deleteMedia:resolver:rejecter:)
	func deleteMedia(_ mediaId: String,
					resolver resolve: @escaping RCTPromiseResolveBlock,
					rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [self] in
				let result = try await self.bridgeActor.deleteMedia(mediaId: mediaId)
			return result.toDictionary()
		}
	}

	@objc(syncAlbum:resolver:rejecter:)
	func syncAlbum(_ payload: NSDictionary,
				  resolver resolve: @escaping RCTPromiseResolveBlock,
				  rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
			let request = try SyncAlbumRequest(payload: payload)
				let acceptance = try await self.bridgeActor.syncAlbum(request: request)
			return acceptance.toDictionary(dateFormatter: dateFormatter)
		}
	}

	@objc(getSyncJob:resolver:rejecter:)
	func getSyncJob(_ jobId: String,
				   resolver resolve: @escaping RCTPromiseResolveBlock,
				   rejecter reject: @escaping RCTPromiseRejectBlock) {
			perform(resolve: resolve, reject: reject) { [dateFormatter, self] in
				let job = try await self.bridgeActor.getSyncJob(jobId: jobId)
			return job.toDictionary(dateFormatter: dateFormatter)
		}
	}

	private func perform(
		resolve: @escaping RCTPromiseResolveBlock,
		reject: @escaping RCTPromiseRejectBlock,
		operation: @escaping () async throws -> Any
	) {
		Task {
			do {
				let value = try await operation()
				dispatchToMainQueue {
					resolve(value)
				}
			} catch {
				self.handle(error, reject: reject)
			}
		}
	}

	private func handle(_ error: Error, reject: @escaping RCTPromiseRejectBlock) {
		let moduleError: FrameModuleError

		if let frameError = error as? FrameModuleError {
			moduleError = frameError
		} else {
			moduleError = .unexpected(error)
		}

		#if canImport(OSLog)
		logger.error("FrameModule error: \(moduleError.logDescription, privacy: .public)")
		#endif

		dispatchToMainQueue {
			reject(moduleError.code, moduleError.message, moduleError.asNSError())
		}
	}

	private func dispatchToMainQueue(_ work: @escaping () -> Void) {
		if Thread.isMainThread {
			work()
		} else {
			DispatchQueue.main.async(execute: work)
		}
	}
}

private actor FrameNativeBridge {
	private let tvClient = TVClient()
	private var mediaLibrary: [FrameMediaRecord] = []
	private var uploadRequests: [String: UploadRecord] = [:]
	private var syncJobs: [String: SyncJobRecord] = [:]
	private let dateProvider: () -> Date

	#if canImport(OSLog)
	private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.mouli.framesync", category: "FrameNativeBridge")
	#endif

	init(dateProvider: @escaping () -> Date = Date.init) {
		self.dateProvider = dateProvider
	}

	func listMedia() async -> [FrameMediaRecord] {
		#if canImport(OSLog)
		logger.debug("Listing cached media (count=\(self.mediaLibrary.count))")
		#endif
		return mediaLibrary
	}

	func uploadPhoto(request: UploadPhotoRequest) async throws -> UploadAcceptance {
		#if canImport(OSLog)
		logger.info("Queueing upload for assetId=\(request.assetId, privacy: .public)")
		#endif

		let identifier = UUID().uuidString
		let now = dateProvider()
		let record = UploadRecord(id: identifier, status: .pending, requestedAt: now, assetId: request.assetId, convertIfNeeded: request.convertIfNeeded)
		uploadRequests[identifier] = record

		// TODO: Integrate TVClient upload pipeline and progress reporting.
		return UploadAcceptance(uploadId: identifier, status: .pending, acceptedAt: now)
	}

	func deleteMedia(mediaId: String) async throws -> DeleteResult {
		#if canImport(OSLog)
		logger.info("Deleting mediaId=\(mediaId, privacy: .public)")
		#endif

		let initialCount = mediaLibrary.count
		mediaLibrary.removeAll { $0.id == mediaId }
		let deleted = mediaLibrary.count < initialCount
		return DeleteResult(mediaId: mediaId, deleted: deleted)
	}

	func syncAlbum(request: SyncAlbumRequest) async throws -> SyncAcceptance {
		#if canImport(OSLog)
		logger.info("Sync requested for albumId=\(request.albumId, privacy: .public) mode=\(request.deletionMode.rawValue, privacy: .public)")
		#endif

		let jobId = UUID().uuidString
		let now = dateProvider()
		let record = SyncJobRecord(
			id: jobId,
			albumId: request.albumId,
			startedAt: now,
			completedAt: nil,
			addedCount: 0,
			skippedDuplicates: 0,
			failedCount: 0,
			deletionMode: request.deletionMode
		)
		syncJobs[jobId] = record

		// TODO: Perform album diff + upload workflow via TVClient and Photos access.
		return SyncAcceptance(jobId: jobId, status: .pending, acceptedAt: now)
	}

	func getSyncJob(jobId: String) async throws -> SyncJobRecord {
		guard let job = syncJobs[jobId] else {
			throw FrameModuleError.notFound(resource: "syncJob", identifier: jobId)
		}
		return job
	}
}

private struct UploadPhotoRequest {
	let assetId: String
	let convertIfNeeded: Bool

	init(assetId: String, convertIfNeeded: Bool) {
		self.assetId = assetId
		self.convertIfNeeded = convertIfNeeded
	}

	init(payload: NSDictionary) throws {
		guard let assetId = payload["assetId"] as? String, !assetId.isEmpty else {
			throw FrameModuleError.invalidArguments(reason: "`assetId` is required")
		}
		let convert = payload["convertIfNeeded"] as? Bool ?? true
		self.init(assetId: assetId, convertIfNeeded: convert)
	}
}

private struct SyncAlbumRequest {
	let albumId: String
	let deletionMode: SyncDeletionMode

	init(albumId: String, deletionMode: SyncDeletionMode) {
		self.albumId = albumId
		self.deletionMode = deletionMode
	}

	init(payload: NSDictionary) throws {
		guard let albumId = payload["albumId"] as? String, !albumId.isEmpty else {
			throw FrameModuleError.invalidArguments(reason: "`albumId` is required")
		}
		if let deletionModeValue = payload["deletionMode"] as? String,
		   let mode = SyncDeletionMode(rawValue: deletionModeValue) {
			self.init(albumId: albumId, deletionMode: mode)
		} else if payload["deletionMode"] == nil {
			self.init(albumId: albumId, deletionMode: .addOnly)
		} else {
			throw FrameModuleError.invalidArguments(reason: "Unsupported deletionMode value")
		}
	}
}

private enum SyncDeletionMode: String {
	case addOnly = "add-only"
	case mirror = "mirror"
}

private struct FrameMediaRecord: Hashable {
	let id: String
	var title: String?
	var createdAt: Date?
	var width: Int?
	var height: Int?
	var sizeBytes: Int?
	var fingerprint: String?

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		var dictionary: [String: Any] = ["id": id]
		if let title {
			dictionary["title"] = title
		}
		if let createdAt {
			dictionary["createdAt"] = dateFormatter.string(from: createdAt)
		}
		if let width {
			dictionary["width"] = width
		}
		if let height {
			dictionary["height"] = height
		}
		if let sizeBytes {
			dictionary["sizeBytes"] = sizeBytes
		}
		if let fingerprint {
			dictionary["fingerprint"] = fingerprint
		}
		return dictionary
	}
}

private struct UploadRecord {
	let id: String
	var status: UploadStatus
	let requestedAt: Date
	let assetId: String
	let convertIfNeeded: Bool
}

private enum UploadStatus: String {
	case pending
	case started
	case completed
	case failed
}

private struct UploadAcceptance {
	let uploadId: String
	let status: UploadStatus
	let acceptedAt: Date

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		[
			"uploadId": uploadId,
			"status": status.rawValue,
			"acceptedAt": dateFormatter.string(from: acceptedAt)
		]
	}
}

private struct DeleteResult {
	let mediaId: String
	let deleted: Bool

	func toDictionary() -> [String: Any] {
		[
			"mediaId": mediaId,
			"deleted": deleted
		]
	}
}

private struct SyncAcceptance {
	let jobId: String
	let status: SyncStatus
	let acceptedAt: Date

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		[
			"jobId": jobId,
			"status": status.rawValue,
			"acceptedAt": dateFormatter.string(from: acceptedAt)
		]
	}
}

private enum SyncStatus: String {
	case pending
	case running
	case completed
	case failed
}

private struct SyncJobRecord {
	let id: String
	let albumId: String
	let startedAt: Date
	var completedAt: Date?
	var addedCount: Int
	var skippedDuplicates: Int
	var failedCount: Int
	let deletionMode: SyncDeletionMode

	func toDictionary(dateFormatter: ISO8601DateFormatter) -> [String: Any] {
		var dictionary: [String: Any] = [
			"id": id,
			"albumId": albumId,
			"startedAt": dateFormatter.string(from: startedAt),
			"addedCount": addedCount,
			"skippedDuplicates": skippedDuplicates,
			"failedCount": failedCount,
			"deletionMode": deletionMode.rawValue
		]
		if let completedAt {
			dictionary["completedAt"] = dateFormatter.string(from: completedAt)
		}
		return dictionary
	}
}

private enum FrameModuleError: Error {
	case invalidArguments(reason: String)
	case notFound(resource: String, identifier: String)
	case unexpected(Error)

	var code: String {
		switch self {
		case .invalidArguments:
			return "FRAME_INVALID_ARGUMENTS"
		case .notFound:
			return "FRAME_NOT_FOUND"
		case .unexpected:
			return "FRAME_UNEXPECTED_ERROR"
		}
	}

	var message: String {
		switch self {
		case let .invalidArguments(reason):
			return reason
		case let .notFound(resource, identifier):
			return "\(resource) with id \(identifier) was not found"
		case let .unexpected(error):
			return error.localizedDescription
		}
	}

	#if canImport(OSLog)
	var logDescription: String {
		switch self {
		case let .invalidArguments(reason):
			return "invalidArguments(\(reason))"
		case let .notFound(resource, identifier):
			return "notFound(resource=\(resource), id=\(identifier))"
		case let .unexpected(error):
			return "unexpected(\(String(describing: error)))"
		}
	}
	#endif

	func asNSError() -> NSError {
		switch self {
		case let .unexpected(error):
			return error as NSError
		default:
			return NSError(domain: "FrameModule", code: 0, userInfo: [NSLocalizedDescriptionKey: message])
		}
	}
}
