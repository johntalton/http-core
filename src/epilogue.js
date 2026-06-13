import { Response } from '@johntalton/http-util/response/object'
import { ServerSentEvents } from '@johntalton/sse-util'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { RouteAction, StreamID } from './defs.js' */

/**
 * @param {ServerHttp2Stream} stream
 * @param {MessagePort} port
 * @param {StreamID} streamId
 * @param {AbortSignal} shutdownSignal
 */
function addSSEPortHandler(stream, port, streamId, shutdownSignal) {
	const signalHandler = () => {
		console.log('shutdown of SSE requested (shutdown signal)', streamId, shutdownSignal.reason)
		port.close()
		stream.end()
	}

	stream.once('close', () => {
		console.log('stream close in sse handler', streamId)
		shutdownSignal.removeEventListener('abort', signalHandler)
		port.close()
	})

	shutdownSignal.addEventListener('abort', signalHandler, { once: true })

	// ServerSentEvents.messageToEventStreamLines({
	// 		comment: 'Welcome',
	// 		retryMs: 1000 * 60,
	// 	}).forEach(line => stream.write(line))

	port.onmessage = message => {
		const { data } = message
		console.log('sending sse data', streamId, data)

		for(const line of ServerSentEvents.lineGen(data)) {
			stream.write(line)
		}
	}
}

/**
 * @param {RouteAction} state
 */
export function epilogue(state) {
	const { type, stream, meta, streamId } = state

	meta.customHeaders?.push([ 'X-Request-Id', streamId ])

	switch(type) {
		//
		case 'trace': { Response.trace(stream, state.method, state.url, state.headers, meta) } break
		// case 'im-a-teapot': { Response.imATeapot(stream, meta) } break
		//
		// case 'accepted': { Response.accepted(stream, state.location, meta) } break
		case 'created': { Response.created(stream, new URL(state.location, meta.origin), { etag: state.etag, lastModified: state.lastModified }, meta) } break
		case 'preflight': { Response.preflight(stream, { supportedTypes: state.supportedTypes, supportedMethods: state.methods, supportedQueryTypes: state.supportedQueryTypes, acceptRanges: undefined }, meta) } break
		case 'no-content': { Response.noContent(stream, { etag: state.etag, lastModified: state.lastModified }, meta)} break
		case 'not-modified': { Response.notModified(stream, { etag: state.etag, lastModified: state.lastModified, age: state.age, cacheControl: state.cacheControl ?? {} }, meta) } break
		case 'found': { Response.found(stream, state.location, meta) } break

		//
		// case 'multiple-choices': { Response.multipleChoices(stream, meta) } break
		case 'gone': { Response.gone(stream, meta) } break
		case 'moved-permanently': { Response.movedPermanently(stream, state.location, meta) } break
		case 'see-other': { Response.seeOther(stream, state.location, meta) } break
		case 'temporary-redirect': { Response.temporaryRedirect(stream, state.location, meta) } break
		case 'permanent-redirect': { Response.permanentRedirect(stream, state.location, meta) } break

		//
		case '404': { Response.notFound(stream, state.message, meta) } break
		// case 'bad-request': { Response.badRequest(stream, meta) } break
		case 'conflict': { Response.conflict(stream, meta) } break
		case 'content-too-large': { Response.contentTooLarge(stream, meta) } break
		case 'forbidden': { Response.forbidden(stream, meta) } break
		case 'not-acceptable': { Response.notAcceptable(stream, { acceptableTypes: state.acceptableTypes ?? [] }, meta) } break
		case 'not-allowed': { Response.notAllowed(stream, { supportedMethods: state.methods }, meta) } break
		// case 'payment-required': {} break
		case 'precondition-failed': { Response.preconditionFailed(stream, { etag: state.etag, lastModified: state.lastModified }, meta) } break
		case 'not-satisfiable': { Response.rangeNotSatisfiable(stream, { rangeDirective: { size: state.contentLength } }, meta) } break
		case 'timeout': { Response.timeout(stream, meta) } break
		case 'too-many-requests': { Response.tooManyRequests(stream, { limitInfo: state.limit, policies: state.policies }, meta) } break
		case 'unauthorized': { Response.unauthorized(stream, state.challenge, meta) } break
		case 'unprocessable': { Response.unprocessable(stream, meta) } break
		case 'unsupported-media': { Response.unsupportedMediaType(stream, state.method, { supportedTypes: state.supportedTypes, supportedQueryTypes: state.supportedQueryTypes }, meta) } break
		case 'insufficient-storage': { Response.insufficientStorage(stream, meta) } break
		case 'not-implemented': { Response.notImplemented(stream, state.message, meta) } break
		case 'unavailable': { Response.unavailable(stream, state.message, { retryAfter: state.retryAfter }, meta) } break

		//
		case 'sse': {
			const { active, bom, port } = state

			Response.sse(stream, { ...meta, active, bom })
			if(active) { addSSEPortHandler(stream, port, state.streamId, state.shutdownSignal) }
		} break
		case 'json': {
			const { obj, encoding, etag, lastModified, age, supportedQueryTypes } = state
			Response.json(stream, obj, { encoding, etag, lastModified, age, cacheControl: state.cacheControl ?? {} }, { supportedQueryTypes }, meta)
		} break
		case 'encoded': {
			const { contentType, encoding, etag, lastModified, age, supportedQueryTypes } = state

			Response.encoded(stream, state.obj, {
				contentType,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl: state.cacheControl ?? {}
			}, {
				supportedQueryTypes
			}, meta)
		} break
		case 'partial-bytes': {
			const { contentType, contentLength, etag, lastModified, age } = state

			Response.partialContent(stream, state.objs, {
			contentType,
			contentLength,
			encoding: undefined,
			etag,
			lastModified,
			age,
			cacheControl: state.cacheControl ?? {} }, meta)
		} break
		case 'bytes': {
			const { contentType, contentLength, etag, lastModified, age, acceptRanges } = state

			Response.bytes(stream, state.obj, {
				contentType,
				contentLength,
				etag,
				lastModified,
				age,
				cacheControl: state.cacheControl ?? {}
			}, {
				acceptRanges
			}, meta)
		} break

		//
		case 'error': {
			const { cause, error } = state
			console.log('send error', state.streamId, cause)
			if(error !== undefined) { console.log(error) }
			Response.error(stream, cause, meta)
		} break

		//
		// case 'void': {} break
		// case 'request' : { throw new Error('unhandled request') } break
		default: {
			/** @type {never} */
			const neverType = type
			Response.error(stream, `unknown type ${neverType}`, meta)
		} break
	}
}