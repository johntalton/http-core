import crypto from 'node:crypto'
import fs from 'node:fs'
import http2 from 'node:http2'

import { isServerStream } from './defs.js'
import { epilogue } from './epilogue.js'
import { preamble } from './preamble.js'

/** @import { SecureServerOptions } from 'node:http2' */
/** @import { H2CoreOptions, Router, StreamID } from './defs.js' */

const {
	SSL_OP_NO_TLSv1,
	SSL_OP_NO_TLSv1_1,
	SSL_OP_NO_TLSv1_2,
} = crypto.constants

/**
 * @param {number} rstCode
 */
export function closeCodeToString(rstCode) {
	if(rstCode === http2.constants.NGHTTP2_NO_ERROR) { return '(No Error)' }
	if(rstCode === http2.constants.NGHTTP2_PROTOCOL_ERROR) { return '(Protocol Error)' }
	if(rstCode === http2.constants.NGHTTP2_INTERNAL_ERROR) { return '(Internal Error)' }
	if(rstCode === http2.constants.NGHTTP2_FLOW_CONTROL_ERROR) { return '(Flow Control Error)' }
	if(rstCode === http2.constants.NGHTTP2_SETTINGS_TIMEOUT) { return '(Settings Timeout)' }
	if(rstCode === http2.constants.NGHTTP2_STREAM_CLOSED) { return '(Closed)' }
	if(rstCode === http2.constants.NGHTTP2_FRAME_SIZE_ERROR) { return '(Frame Size Error)' }
	if(rstCode === http2.constants.NGHTTP2_REFUSED_STREAM) { return '(Refused)' }
	if(rstCode === http2.constants.NGHTTP2_CANCEL) { return '(Cancel)' }
	if(rstCode === http2.constants.NGHTTP2_COMPRESSION_ERROR) { return '(Compression Error)' }
	if(rstCode === http2.constants.NGHTTP2_CONNECT_ERROR) { return '(Connect Error)' }
	if(rstCode === http2.constants.NGHTTP2_ENHANCE_YOUR_CALM) { return '(Chill)' }
	if(rstCode === http2.constants.NGHTTP2_INADEQUATE_SECURITY) { return '(Inadequate Security)' }
	if(rstCode === http2.constants.NGHTTP2_HTTP_1_1_REQUIRED) { return '(HTTP 1.1 Requested)' }

	return `(${rstCode})`
}

export const UNIQUE_ID_SIZE = 5

/**
 * @param {string|undefined} str
 * @returns {str is StreamID}
 */
export function isStreamId(str) {
	if(str === undefined) { return false }
	return true
}

/**
 * @param {string} sessionId
 * @param {number|undefined} streamId
 * @returns {StreamID}
 */
export function uniqueStreamId(sessionId, streamId) {
	const id = `${sessionId}-${streamId}`
	if(!isStreamId(id)) { throw new Error('invalid streamId') }
	return id
}

/**
 * @returns {string}
 */
export function uniqueId() {
	return crypto.getRandomValues(new Uint8Array(UNIQUE_ID_SIZE)).toHex()
}

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
			allowedOrigins: h2Options?.allowedOrigins ?? [],
			allowTrace: h2Options?.allowTrace ?? false,
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
		server.on('connection', socket => {
			console.log('new connection', socket.remoteAddress, socket.remotePort)
			socket.on('close', hasError => console.log('closing socket with hasError:', hasError))
		})
		// server.on('secureConnection', socket => console.log('new secure connection'))
		// server.on('keylog', (data) => console.log('key log', data))
		server.on('unknownProtocol', socket => { console.log('Unknown Protocol', socket.getProtocol()) ; socket.end() })
		server.on('tlsClientError', (error, _socket) => {
			if('code' in error) {
				if(error.code === 'ERR_SSL_SSL/TLS_ALERT_CERTIFICATE_UNKNOWN') { return }
				if(error.code === 'ERR_SSL_NO_SUITABLE_SIGNATURE_ALGORITHM') { return }
				// ERR_SSL_SSL/TLS_ALERT_BAD_CERTIFICATE
			}

			// console.log('socket destroyed?', socket.destroyed)
			console.log('TLS Error', error)
		})
		server.on('error', error => console.log('Server Error', error))
		server.on('sessionError', error => { console.log('session error', error) })
		server.on('listening', () => console.log('Server Up', this.#h2Options.serverName, server.address()))
		server.on('close', () => console.log('End of Line'))
		server.on('session', session => {
			const sessionId = uniqueId()

			console.log('new session', session.socket.remoteAddress, sessionId)

			session.on('close', () => console.log('session close', sessionId))
			session.on('error', () => console.log('session error', sessionId))
			session.on('frameError', () => console.log('session frameError', sessionId))
			session.on('goaway', () => console.log('session goAway', sessionId))
			session.on('stream', (stream, headers) => {
				const streamId = uniqueStreamId(sessionId, stream.id)

				console.log('new stream', streamId)

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
				const state = preamble({
						config: this.#h2Options.config,
						streamId,
						stream,
						shutdownSignal: this.#controller.signal
					},
					headers,
					this.#h2Options)
				router(state)
					.then(epilogue)
					.catch(e => epilogue({ ...state, type: 'error', cause: e.message, error: e }))
					.catch(e => console.error('Top Level Error:', streamId, e))
					// .finally(() => console.log('perf', streamId, performance.now() - start))
			})
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
