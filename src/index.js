import http2 from 'node:http2'
import fs from 'node:fs'
import crypto from 'node:crypto'

import { HTTP_METHOD_QUERY } from '@johntalton/http-util/response'

import { preamble } from './preamble.js'
import { epilogue } from './epilogue.js'

const {
	HTTP2_METHOD_GET,
	HTTP2_METHOD_HEAD,
	HTTP2_METHOD_POST,
	HTTP2_METHOD_PUT,
	HTTP2_METHOD_PATCH,
	HTTP2_METHOD_OPTIONS,
	HTTP2_METHOD_DELETE,
	HTTP2_METHOD_TRACE
} = http2.constants

export const KNOWN_METHODS = [
	HTTP2_METHOD_GET,
	HTTP2_METHOD_HEAD,
	HTTP2_METHOD_POST,
	HTTP2_METHOD_PUT,
	HTTP2_METHOD_PATCH,
	HTTP2_METHOD_OPTIONS,
	HTTP2_METHOD_DELETE,
	HTTP2_METHOD_TRACE,
	HTTP_METHOD_QUERY
]

/** @import { Http2Stream, ServerHttp2Stream, IncomingHttpHeaders } from 'node:http2' */
/** @import { SecureServerOptions } from 'node:http2' */

/** @import { Metadata } from '@johntalton/http-util/response' */
/** @import { BodyFuture } from '@johntalton/http-util/body' */
/** @import { EtagItem, IMFFixDate, ContentRangeDirective } from '@johntalton/http-util/headers' */
/** @import { SendBody } from '@johntalton/http-util/response' */

/** @typedef {(state: RouteRequest|RouteAction) => Promise<RouteAction>} Router */

/** @typedef {'request'} RouteTypeRequest */
/** @typedef {'partial-bytes'|'bytes'|'json'|'404'|'sse'|'error'|'preflight'|'not-allowed'|'trace'|'created'|'unsupported-media'|'not-modified'|'precondition-failed'|'unprocessable'|'not-acceptable'|'conflict'|'not-implemented'|'unavailable'|'not-satisfiable'} RouteType */
/** @typedef {'GET'|'HEAD'|'POST'|'PUT'|'OPTIONS'|'DELETE'|'TRACE'} RouteMethod */

/** @typedef {string & { readonly _brand: 'sid' }} StreamID */

/**
 * @typedef {Object} Config
 * @property {boolean|undefined} [maintenance_mode]
 */

/**
 * @typedef {Object} RouteBase
 * @property {RouteTypeRequest|RouteType} type
 * @property {Config} config
 * @property {StreamID} streamId
 * @property {ServerHttp2Stream} stream
 * @property {Metadata} meta
 * @property {AbortSignal} shutdownSignal
 */

/**
 * @typedef {Object} RouteRequestBase
 * @property {'request'} type
 * @property {RouteMethod} method
 * @property {URL} url
 * @property {IncomingHttpHeaders} headers
 * @property {BodyFuture} body
 * @property {RouteRequestAccept} accept
 * @property {RouteRemoteClient} client
 * @property {RouteConditions} conditions
 * @property {string} SNI
 */
/** @typedef {RouteBase & RouteRequestBase} RouteRequest */

/**
 * @typedef {Object} RouteErrorBase
 * @property {'error'} type
 * @property {string} cause
 * @property {Error|undefined} [error]
 */
/** @typedef {RouteBase & RouteErrorBase } RouteError */

/**
 * @typedef {Object} RouteNotAllowedBase
 * @property {'not-allowed'} type
 * @property {RouteMethod} method
 * @property {URL} url
 * @property {Array<RouteMethod>} methods
 */
/** @typedef {RouteBase & RouteNotAllowedBase} RouteNotAllowed */

/**
 * @typedef {Object} RouteTraceBase
 * @property {'trace'} type
 * @property {RouteMethod} method
 * @property {URL} url
 * @property {IncomingHttpHeaders} headers
 * @property {number} maxForwards
 * @property {RouteRequestAccept} accept
 */
/** @typedef {RouteBase & RouteTraceBase} RouteTrace */

/**
 * @typedef {Object} RouteRequestAccept
 * @property {string|undefined} type
 * @property {string|undefined} encoding
 * @property {string|undefined} language
 */

/**
 * @typedef {Object} RouteRemoteClient
 * @property {string|undefined} family
 * @property {string|undefined} ip
 * @property {number|undefined} port
 */

/**
 * @typedef {Object} RouteConditions
 * @property {Array<EtagItem>} match
 * @property {Array<EtagItem>} noneMatch
 * @property {IMFFixDate|undefined} modifiedSince
 * @property {IMFFixDate|undefined} unmodifiedSince
 * @property {IMFFixDate|EtagItem|undefined} [range]
 */

/**
 * @typedef {Object} RoutePreflightBase
 * @property {'preflight'} type
 * @property {RouteMethod} method
 * @property {URL} url
 * @property {Array<RouteMethod>} methods
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/** @typedef {RouteBase & RoutePreflightBase} RoutePreflight */

/**
 * @typedef {Object} RouteJSONBase
 * @property {'json'} type
 * @property {RouteRequestAccept} accept
 * @property {Record<any, any>} obj
 * @property {IMFFixDate|string|undefined} [lastModified]
 * @property {EtagItem|undefined} [etag]
 * @property {number|undefined} [age]
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/** @typedef {RouteBase & RouteJSONBase} RouteJSON */

/**
 * @typedef {Object} Route404Base
 * @property {'404'} type
 * @property {string} method
 * @property {URL} url
 * @property {string} message
 */
/** @typedef {RouteBase & Route404Base} Route404 */

/**
 * @typedef {Object} RouteCreatedBase
 * @property {'created'} type
 * @property {URL|string} location
 * @property {EtagItem|undefined} [etag]
 */
/** @typedef {RouteBase & RouteCreatedBase} RouteCreated */

/**
 * @typedef {Object} RouteUnsupportedMediaTypeBase
 * @property {'unsupported-media'} type
 * @property {Array<string>|string} acceptableMediaTypes
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/** @typedef {RouteBase & RouteUnsupportedMediaTypeBase} RouteUnsupportedMediaType */

/**
 * @typedef {Object} RouteNotModifiedBase
 * @property {'not-modified'} type
 * @property {number} age
 * @property {EtagItem|undefined} [etag]
 * @property {number|undefined} [age]
 */
/** @typedef {RouteBase & RouteNotModifiedBase} RouteNotModified */

/**
 * @typedef {Object} RoutePreconditionFailedBase
 * @property {'precondition-failed'} type
 * @property {EtagItem|undefined} [etag]
 */
/** @typedef {RouteBase & RoutePreconditionFailedBase} RoutePreconditionFailed */

/**
 * @typedef {Object} RouteNotAcceptableBase
 * @property {'not-acceptable'} type
 * @property {Array<string>|undefined} [acceptableMediaTypes]
 * @property {Array<string>|undefined} [acceptableEncodings]
 * @property {Array<string>|undefined} [acceptableLanguages]
 */
/** @typedef {RouteBase & RouteNotAcceptableBase} RouteNotAcceptable */

/**
 * @typedef {Object} RouteUnprocessableBase
 * @property {'unprocessable'} type
 * @property {string} message
 */
/** @typedef {RouteBase & RouteUnprocessableBase} RouteUnprocessable */

/**
 * @typedef {Object} RouteConflictBase
 * @property {'conflict'} type
 * @property {string|undefined} [message]
 */
/** @typedef {RouteBase & RouteConflictBase} RouteConflict */

/**
 * @typedef {Object} RouteNotImplementedBase
 * @property {'not-implemented'} type
 * @property {string|undefined} [message]
 */
/** @typedef {RouteBase & RouteNotImplementedBase} RouteNotImplemented */

/**
 * @typedef {Object} RouteUnavailableBase
 * @property {'unavailable'} type
 * @property {string|undefined} [message]
 * @property {number|undefined} [retryAfter]
 */
/** @typedef {RouteBase & RouteUnavailableBase} RouteUnavailable */

/**
 * @typedef {Object} RouteBytesBase
 * @property {'bytes'} type
 * @property {string} contentType
 * @property {number|undefined} [contentLength]
 * @property {SendBody|undefined} obj
 * @property {IMFFixDate|string|undefined} [lastModified]
 * @property {EtagItem|undefined} [etag]
 * @property {number|undefined} [age]
 * @property {number|undefined} [maxAge]
 * @property {'bytes'|'none'|undefined} [acceptRanges]
 */
/** @typedef {RouteBase & RouteBytesBase} RouteBytes */

/**
 * @typedef {Object} PartialBytes
 * @property {SendBody} obj
 * @property {ContentRangeDirective} range
 */

/**
 * @template T
 * @typedef {[ T, ...T[] ]} NonEmptyArray
 */

/**
 * @typedef {Object} RoutePartialBytesBase
 * @property {'partial-bytes'} type
 * @property {NonEmptyArray<PartialBytes>} objs
 * @property {string} contentType
 * @property {number|undefined} [contentLength]
 * @property {EtagItem|undefined} [etag]
 * @property {number|undefined} [age]
 * @property {number|undefined} [maxAge]
 */
/** @typedef {RouteBase & RoutePartialBytesBase} RoutePartialBytes */

/**
 * @typedef {Object} RouteNotSatisfiableBase
 * @property {'not-satisfiable'} type
 * @property {number} contentLength
 */
/** @typedef {RouteBase & RouteNotSatisfiableBase} RouteNotSatisfiable */


/**
 * @typedef {Object} RouteSSEBase
 * @property {'sse'} type
 * @property {boolean} active
 * @property {boolean} bom
 * @property {MessagePort} port
 * @property {RouteRequestAccept} accept
 */
/** @typedef {RouteBase & RouteSSEBase} RouteSSE */

/** @typedef {
	RouteError |
	RouteNotAllowed |
	RoutePreflight |
	RouteBytes |
	RouteJSON |
	Route404 |
	RouteSSE |
	RouteTrace |
	RouteCreated |
	RouteUnsupportedMediaType |
	RouteNotModified |
	RoutePreconditionFailed |
	RouteUnprocessable |
	RouteNotAcceptable |
	RouteConflict |
	RouteNotImplemented |
	RouteUnavailable |
	RoutePartialBytes |
	RouteNotSatisfiable
} RouteAction */

/** @typedef {Record<string, string|undefined>} RouteMatches */
/** @typedef {(matches: RouteMatches, state: RouteRequest) => Promise<RouteAction>} RouteFunction */

/**
 * @param {Http2Stream} stream
 * @returns {stream is ServerHttp2Stream}
 */
function isServerStream(stream) {
	if(stream === null) { return false }
	return true
}

/**
 * @param {string|undefined|Array<string>} header
 * @returns {header is string}
 */
export function isValidHeader(header) {
	return header !== undefined && isValidLikeHeader(header)
}

/**
 * @param {string|undefined|Array<string>} header
 * @returns {header is string|undefined}
 */
export function isValidLikeHeader(header) {
	return !Array.isArray(header)
}

/**
 * @param {string|undefined|Array<string>} method
 * @returns {method is RouteMethod}
 */
export function isValidMethod(method) {
	if(!isValidHeader(method)) { return false }

	return KNOWN_METHODS.includes(method)
}

/**
 * @param {number} rstCode
 */
export function closeCodeToString(rstCode) {
	if(rstCode === http2.constants.NGHTTP2_NO_ERROR) { return '(No Error)' }
	else if(rstCode === http2.constants.NGHTTP2_PROTOCOL_ERROR) { return '(Protocol Error)' }
	else if(rstCode === http2.constants.NGHTTP2_INTERNAL_ERROR) { return '(Internal Error)' }
	else if(rstCode === http2.constants.NGHTTP2_FLOW_CONTROL_ERROR) { return '(Flow Control Error)' }
	else if(rstCode === http2.constants.NGHTTP2_SETTINGS_TIMEOUT) { return '(Settings Timeout)' }
	else if(rstCode === http2.constants.NGHTTP2_STREAM_CLOSED) { return '(Closed)' }
	else if(rstCode === http2.constants.NGHTTP2_FRAME_SIZE_ERROR) { return '(Frame Size Error)' }
	else if(rstCode === http2.constants.NGHTTP2_REFUSED_STREAM) { return '(Refused)' }
	else if(rstCode === http2.constants.NGHTTP2_CANCEL) { return '(Cancel)' }
	else if(rstCode === http2.constants.NGHTTP2_COMPRESSION_ERROR) { return '(Compression Error)' }
	else if(rstCode === http2.constants.NGHTTP2_CONNECT_ERROR) { return '(Connect Error)' }
	else if(rstCode === http2.constants.NGHTTP2_ENHANCE_YOUR_CALM) { return '(Chill)' }
	else if(rstCode === http2.constants.NGHTTP2_INADEQUATE_SECURITY) { return '(Inadequate Security)' }
	else if(rstCode === http2.constants.NGHTTP2_HTTP_1_1_REQUIRED) { return '(HTTP 1.1 Requested)' }

	return `(${rstCode})`
}

export const REQUEST_ID_SIZE = 5

/**
 * @returns {StreamID}
 */
export function requestId() {
	const buffer = new Uint8Array(REQUEST_ID_SIZE)
	crypto.getRandomValues(buffer)
	// @ts-ignore
	return buffer.toHex()
}

const {
	SSL_OP_NO_TLSv1,
	SSL_OP_NO_TLSv1_1,
	SSL_OP_NO_TLSv1_2,
} = crypto.constants

/**
 * @typedef {Object} H2CoreOptions
 * @property {Config} config
 * @property {boolean} ipv6Only
 * @property {string} host
 * @property {number} port
 * @property {Array<string>} credentials
 * @property {string|undefined} serverName
 */

export class H2CoreServer {
	#server
	#controller

	/** @type {H2CoreOptions} */
	#h2Options

	/**
	 * @param {Router} router
	 * @param {Partial<H2CoreOptions>|undefined} [h2Options]
	 */
	constructor(router, h2Options) {
		this.#h2Options = {
			config: h2Options?.config ?? {},
			ipv6Only: h2Options?.ipv6Only ?? true,
			host: h2Options?.host ?? '',
			port: h2Options?.port ?? 0,
			credentials: h2Options?.credentials ?? [],
			serverName: h2Options?.serverName
		}

		/** @type {SecureServerOptions} */
		const options = {
			allowHTTP1: false,
			secureOptions: SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_TLSv1_2,
			minVersion: 'TLSv1.3',
			settings: {
				enablePush: false
			},
			ALPNProtocols: [ 'h2' ]
		}

		const server = http2.createSecureServer(options)
		this.#server = server

		this.#controller = new AbortController()

		for(const credentialHost of this.#h2Options.credentials) {
			server.addContext(credentialHost, {
				key: fs.readFileSync(`./certificates/${credentialHost}-privkey.pem`, 'utf-8'),
				cert: fs.readFileSync(`./certificates/${credentialHost}-cert.pem`, 'utf-8')
			})
		}

		// server.setTimeout(5 * 1000)

		// server.on('request', (req, res) => res.end('hello'))
		server.on('drop', data => console.log('Drop', data))
		server.on('connection', socket => console.log('new connection', socket.remoteAddress))
		// server.on('secureConnection', socket => console.log('new secure connection'))
		// server.on('keylog', (data) => console.log('key log', data))
		server.on('unknownProtocol', socket => { console.log('Unknown Protocol', socket.getProtocol()) ; socket.end() })
		server.on('tlsClientError', (error, _socket) => {
			if('code' in error) {
				if(error.code === 'ERR_SSL_SSL/TLS_ALERT_CERTIFICATE_UNKNOWN') { return }
				if(error.code === 'ERR_SSL_NO_SUITABLE_SIGNATURE_ALGORITHM') { return }
				// ERR_SSL_SSL/TLS_ALERT_BAD_CERTIFICATE
			}
			console.log('TLS Error', error)
		})
		server.on('error', error => console.log('Server Error', error))
		server.on('sessionError', error => { console.log('session error', error) })
		server.on('listening', () => console.log('Server Up', this.#h2Options.serverName, server.address()))
		server.on('close', () => console.log('End of Line'))
		server.on('session', session => {
			console.log('new session')
			session.on('close', () => console.log('session close'))
			session.on('error', () => console.log('session error'))
			session.on('frameError', () => console.log('session frameError'))
			session.on('goaway', () => console.log('session goAway'))
		})
		server.on('stream', (stream, headers) => {
			const streamId = requestId()

			console.log('new stream', streamId, stream.id)
			stream.on('aborted', () => console.log('stream aborted', streamId))
			stream.on('close', () => {
				// if(stream.rstCode !== http2.constants.NGHTTP2_NO_ERROR) {
					console.log('stream close', streamId, closeCodeToString(stream.rstCode))
				// }
			})
			stream.on('error', error => console.log('stream error', streamId, error.message))
			stream.on('frameError', (type, code, id) => console.log('stream frameError', streamId, type, code, id))

			// tickle the type
			if(!isServerStream(stream)) { return }

			// const start = performance.now()
			const state = preamble(this.#h2Options.config, streamId, stream, headers, this.#h2Options.serverName, this.#controller.signal)
			router(state)
				.then(epilogue)
				.catch(e => epilogue({ ...state, type: 'error', cause: e.message, error: e }))
				.catch(e => console.error('Top Level Error:', streamId, e))
				// .finally(() => console.log('perf', streamId, performance.now() - start))
		})
	}

	listen() {
		this.#server.listen({
			ipv6Only: this.#h2Options.ipv6Only,
			port: this.#h2Options.port,
			host: this.#h2Options.host,
			signal: this.#controller.signal
		})
	}

	get closed() { return this.#controller.signal.aborted }

	close() {
		this.#controller.abort('close')
		this.#server.close()
	}
}
