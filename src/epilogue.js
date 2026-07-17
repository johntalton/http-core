import { Response } from '@johntalton/http-util/response/object'
import { ServerSentEvents } from '@johntalton/sse-util'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { Config, RouteAction, StreamID } from './defs.js' */

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
 * @template {Config} C
 * @param {RouteAction<C>} state
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: work horse
export function epilogue(state) {
	const { type, stream, meta, streamId } = state

	meta.customHeaders?.push([ 'X-Request-Id', streamId ])

	switch(type) {
		//
		case 'trace': { Response.trace(stream, state.method, state.url, state.headers, state.context ?? {}, meta) } break
		// case 'im-a-teapot': { Response.imATeapot(stream, state.context ?? {}, meta) } break
		//
		case 'accepted': { Response.accepted(stream, state.location, state.context ?? {}, meta) } break
		case 'created': { Response.created(stream, new URL(state.location, meta.origin), { etag: state.etag, lastModified: state.lastModified }, state.context ?? {}, meta) } break
		case 'preflight': { Response.preflight(stream, { supportedTypes: state.supportedTypes, supportedMethods: state.methods, supportedHeaders: state.supportedHeaders, supportedQueryTypes: state.supportedQueryTypes, acceptRanges: undefined }, state.context ?? {}, meta) } break
		case 'no-content': { Response.noContent(stream, { etag: state.etag, lastModified: state.lastModified }, state.context ?? {}, meta) } break
		case 'not-modified': { Response.notModified(stream, { etag: state.etag, lastModified: state.lastModified, age: state.age, cacheControl: state.cacheControl ?? {} }, state.context ?? {}, meta) } break
		case 'found': { Response.found(stream, state.location, state.context ?? {}, meta) } break

		//
		// case 'multiple-choices': { Response.multipleChoices(stream, state.context ?? {}, meta) } break
		case 'gone': { Response.gone(stream, state.context ?? {}, meta) } break
		case 'moved-permanently': { Response.movedPermanently(stream, state.location, state.context ?? {}, meta) } break
		case 'see-other': { Response.seeOther(stream, state.location, state.context ?? {}, meta) } break
		case 'temporary-redirect': { Response.temporaryRedirect(stream, state.location, state.context ?? {}, meta) } break
		case 'permanent-redirect': { Response.permanentRedirect(stream, state.location, state.context ?? {}, meta) } break

		//
		case '404': { Response.notFound(stream, state.message, state.context ?? {}, meta) } break
		case 'bad-request': { Response.badRequest(stream, state.message, state.context ?? {}, meta) } break
		case 'conflict': { Response.conflict(stream, state.context ?? {}, meta) } break
		case 'content-too-large': { Response.contentTooLarge(stream, state.context ?? {}, meta) } break
		case 'forbidden': { Response.forbidden(stream, state.context ?? {}, meta) } break
		case 'not-acceptable': { Response.notAcceptable(stream, { acceptableTypes: state.acceptableTypes ?? [] }, state.context ?? {}, meta) } break
		case 'not-allowed': { Response.notAllowed(stream, { supportedMethods: state.methods }, state.context ?? {}, meta) } break
		// case 'payment-required': {} break
		case 'precondition-failed': { Response.preconditionFailed(stream, { etag: state.etag, lastModified: state.lastModified }, state.context ?? {}, meta) } break
		case 'not-satisfiable': { Response.rangeNotSatisfiable(stream, { rangeDirective: { size: state.contentLength } }, state.context ?? {}, meta) } break
		case 'timeout': { Response.timeout(stream, state.context ?? {}, meta) } break
		case 'too-many-requests': { Response.tooManyRequests(stream, { limitInfo: state.limit, policies: state.policies }, state.context ?? {}, meta) } break
		case 'unauthorized': { Response.unauthorized(stream, state.challenge, state.context ?? {}, meta) } break
		case 'unprocessable': { Response.unprocessable(stream, state.context ?? {}, meta) } break
		case 'unsupported-media': { Response.unsupportedMediaType(stream, state.method, { supportedTypes: state.supportedTypes, supportedQueryTypes: state.supportedQueryTypes }, state.context ?? {}, meta) } break
		case 'insufficient-storage': { Response.insufficientStorage(stream, state.context ?? {}, meta) } break
		case 'not-implemented': { Response.notImplemented(stream, state.message, state.context ?? {}, meta) } break
		case 'unavailable': { Response.unavailable(stream, state.message, { retryAfter: state.retryAfter }, state.context ?? {}, meta) } break

		//
		case 'sse': {
			const { active, bom, port } = state

			Response.sse(stream, { ...meta, active, bom })
			if(active) { addSSEPortHandler(stream, port, state.streamId, state.shutdownSignal) }
		} break
		case 'json': {
			const { obj, contentDisposition, encoding, etag, lastModified, age, supportedQueryTypes } = state
			Response.json(stream, obj, {
				contentDisposition,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl: state.cacheControl ?? {}
			}, {
					supportedQueryTypes
				},
				state.context ?? {},
				meta)
		} break
		case 'encoded': {
			const { contentType, contentDisposition, encoding, etag, lastModified, age, supportedQueryTypes } = state

			Response.encoded(stream, state.obj, {
				contentDisposition,
				contentType,
				encoding,
				etag,
				lastModified,
				age,
				cacheControl: state.cacheControl ?? {}
			}, {
				supportedQueryTypes
			},
			state.context ?? {},
			meta)
		} break
		case 'partial-bytes': {
			const { contentType, contentDisposition, contentLength, etag, lastModified, age } = state

			Response.partialContent(stream, state.objs, {
				contentDisposition,
				contentType,
				contentLength,
				encoding: undefined,
				etag,
				lastModified,
				age,
				cacheControl: state.cacheControl ?? {}
			},
			state.context ?? {},
			meta)
		} break
		case 'bytes': {
			const { contentType, contentDisposition, contentLength, etag, lastModified, age, acceptRanges } = state

			Response.bytes(stream, state.obj, {
				contentDisposition,
				contentType,
				contentLength,
				etag,
				lastModified,
				age,
				cacheControl: state.cacheControl ?? {}
			}, {
				acceptRanges
			},
			state.context ?? {},
			meta)
		} break

		//
		case 'error': {
			const { cause, error } = state
			console.log('send error', state.streamId, cause)
			if(error !== undefined) { console.log('send error (error)', error) }
			Response.error(stream, cause, state.context ?? {}, meta)
		} break

		//
		// case 'void': {} break
		// case 'request' : { throw new Error('unhandled request') } break
		default: {
			/** @type {never} */
			const neverType = type
			Response.error(stream, `unknown type ${neverType}`, {}, meta)
		} break
	}
}