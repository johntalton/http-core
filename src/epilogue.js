import { MIME_TYPE_JSON } from '@johntalton/http-util/headers'
import { Response } from '@johntalton/http-util/response/object'
import { ServerSentEvents } from '@johntalton/sse-util'

/** @import { ServerHttp2Stream } from 'node:http2' */
/** @import { RouteAction, StreamID } from './index.js' */

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

	stream.once('close', (() => {
		console.log('stream close in sse handler', streamId)
		shutdownSignal.removeEventListener('abort', signalHandler)
		port.close()
	}))

	shutdownSignal.addEventListener('abort', signalHandler)

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

	meta.customHeaders.push([ 'X-Request-Id', streamId ])

	switch(type) {
		//
		case 'trace': { Response.trace(stream, state.method, state.url, state.headers, meta) } break
		//
		case 'preflight': { Response.preflight(stream, state.methods, state.supportedQueryTypes, undefined, meta) } break
		case 'no-content': { Response.noContent(stream, state.etag, meta)} break
		// case 'accepted': { Response.accepted(stream, meta) } break
		case 'created': { Response.created(stream, new URL(state.location, meta.origin), state.etag, meta) } break
		case 'not-modified': { Response.notModified(stream, state.etag, state.age, { priv: true, maxAge: 60 }, meta) } break

		//
		// case 'multiple-choices': { Response.multipleChoices(stream, meta) } break
		case 'gone': { Response.gone(stream, meta) } break
		case 'moved-permanently': { Response.movedPermanently(stream, state.location, meta) } break
		case 'see-other': { Response.seeOther(stream, state.location, meta) } break
		case 'temporary-redirect': { Response.temporaryRedirect(stream, state.location, meta) } break
		case 'permanent-redirect': { Response.permanentRedirect(stream, state.location, meta) } break

		//
		case '404': { Response.notFound(stream, state.message, meta) } break
		case 'conflict': { Response.conflict(stream, meta) } break
		case 'not-allowed': { Response.notAllowed(stream, state.methods, meta) } break
		case 'not-acceptable': { Response.notAcceptable(stream, state.acceptableMediaTypes ?? [], meta)} break
		case 'unsupported-media': { Response.unsupportedMediaType(stream, state.acceptableMediaTypes, state.supportedQueryTypes, meta) } break
		case 'unprocessable': { Response.unprocessable(stream, meta) } break
		case 'precondition-failed': { Response.preconditionFailed(stream, meta) } break
		case 'not-satisfiable': { Response.rangeNotSatisfiable(stream, { size: state.contentLength }, meta) } break
		case 'content-too-large': { Response.contentTooLarge(stream, meta) } break
		case 'insufficient-storage': { Response.insufficientStorage(stream, meta) } break
		case 'too-many-requests': { Response.tooManyRequests(stream, state.limit, state.policies, meta) } break
		case 'unauthorized': { Response.unauthorized(stream, state.challenge, meta) } break
		case 'forbidden': { Response.forbidden(stream, meta) } break
		case 'unavailable': { Response.unavailable(stream, state.message, state.retryAfter, meta)} break
		case 'not-implemented': { Response.notImplemented(stream, state.message, meta)} break
		case 'timeout': { Response.timeout(stream, meta) } break

		//
		case 'sse': {
			const { active, bom, port } = state

			Response.sse(stream, { ...meta, active, bom })
			if(active) { addSSEPortHandler(stream, port, state.streamId, state.shutdownSignal) }
		}
		break
		case 'json': {
			const { obj, accept, etag } = state

			if(accept.type === MIME_TYPE_JSON) {
				Response.json(stream, obj, accept.encoding, etag, state.age, { priv: true, maxAge: 60 }, state.supportedQueryTypes, meta)
			}
			else {
				// todo: but we did process the request - is that ok?
				Response.notAcceptable(stream, [ MIME_TYPE_JSON ], meta)
			}
		}
		break
		case 'partial-bytes': { Response.partialContent(stream, state.contentType, state.objs, state.contentLength, undefined, state.etag, state.age, { maxAge: state.maxAge }, meta) } break
		case 'bytes': { Response.bytes(stream, state.contentType, state.obj, state.contentLength, 'identity', state.etag, state.age, { maxAge: state.maxAge }, state.acceptRanges, meta) } break

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