/** biome-ignore-all lint/style/noExcessiveLinesPerFile: does all the work */

import http2 from 'node:http2'
import { TLSSocket } from 'node:tls'

import { requestBody } from '@johntalton/http-util/body'
import {
	Accept,
	AcceptEncoding,
	AcceptLanguage,

	Conditional,
	ContentType,
	ETag,

	FORWARDED_KEY_FOR,
	Forwarded,
	KNOWN_FORWARDED_KEYS,

	MIME_TYPE_EVENT_STREAM,
	MIME_TYPE_JSON,
	MIME_TYPE_MESSAGE_HTTP,
	MIME_TYPE_TEXT,
	MIME_TYPE_XML,
	SecFetch
} from '@johntalton/http-util/headers'
import {
	ENCODER_MAP,
	HTTP_HEADER_FORWARDED,
	HTTP_HEADER_ORIGIN,
	HTTP_HEADER_SEC_FETCH_DEST,
	HTTP_HEADER_SEC_FETCH_MODE,
	HTTP_HEADER_SEC_FETCH_SITE,
	HTTP_METHOD_QUERY
} from '@johntalton/http-util/response'


/** @import { ServerHttp2Stream, IncomingHttpHeaders } from 'node:http2' */
/** @import { Config, RouteRequest, RouteAction, RouteMethod, StreamID, RouteConditions, SecFetchMetadata, RouteRequestAccept } from './index.js' */

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

const {
	HTTP2_HEADER_AUTHORITY,
	HTTP2_HEADER_METHOD,
	HTTP2_HEADER_SCHEME,
	HTTP2_HEADER_PATH,
	HTTP2_HEADER_AUTHORIZATION,
	HTTP2_HEADER_CONTENT_TYPE,
	HTTP2_HEADER_CONTENT_LENGTH,
	HTTP2_HEADER_ACCEPT,
	HTTP2_HEADER_ACCEPT_ENCODING,
	HTTP2_HEADER_ACCEPT_LANGUAGE,
	// HTTP2_HEADER_REFERER,
	// HTTP2_HEADER_HOST,
	// HTTP2_HEADER_VIA,
	// HTTP2_HEADER_CACHE_CONTROL,
	HTTP2_HEADER_IF_MATCH,
	HTTP2_HEADER_IF_MODIFIED_SINCE,
	HTTP2_HEADER_IF_NONE_MATCH,
	HTTP2_HEADER_IF_RANGE,
	HTTP2_HEADER_IF_UNMODIFIED_SINCE,
	// HTTP2_HEADER_LAST_MODIFIED,
	HTTP2_HEADER_MAX_FORWARDS,
	// HTTP2_HEADER_FROM
} = http2.constants

const DEFAULT_SUPPORTED_LANGUAGES = [ 'en-US', 'en' ]
const DEFAULT_SUPPORTED_MIME_TYPES = [
	MIME_TYPE_JSON,
	MIME_TYPE_XML,
	MIME_TYPE_TEXT,
	MIME_TYPE_EVENT_STREAM,
	MIME_TYPE_MESSAGE_HTTP
]
const DEFAULT_SUPPORTED_ENCODINGS = [ ...ENCODER_MAP.keys() ]

const FORWARDED_KEY_SECRET = 'secret'
const FORWARDED_ACCEPTABLE_KEYS = [ ...KNOWN_FORWARDED_KEYS, FORWARDED_KEY_SECRET ]
const FORWARDED_REQUIRED = process.env['FORWARDED_REQUIRED'] === 'true'
const FORWARDED_DROP_RIGHTMOST = (process.env['FORWARDED_SKIP_LIST'] ?? '').split(',').map(s => s.trim()).filter(s => s.length > 0)
const FORWARDED_SECRET = process.env['FORWARDED_SECRET']

const ALLOWED_ORIGINS = (process.env['ALLOWED_ORIGINS'] ?? '').split(',').map(s => s.trim()).filter(s => s.length > 0)

const ALLOW_TRACE = process.env['ALLOW_TRACE'] === 'true'

const MSEC_PER_SEC = 1000
const BODY_TIMEOUT_MSEC = 2 * MSEC_PER_SEC
const BYTE_PER_K = 1024
const BODY_BYTE_LENGTH = BYTE_PER_K * BYTE_PER_K

// const ipRateLimitStore = new Map()
// const ipRateLimitPolicy = {
// 	name: 'ip',
// 	quota: 25,
// 	windowSeconds: 15,
// 	size: 50,
// 	quotaUnits: 1
// }


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
 * @typedef {Object} PreState
 * @property {Config} config
 * @property {StreamID} streamId
 * @property {ServerHttp2Stream} stream
 * @property {AbortSignal} shutdownSignal
 */

/**
 * @param {PreState} preState
 * @param {IncomingHttpHeaders} headers
 * @param {string|undefined} servername
 * @returns {RouteRequest|RouteAction}
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: work horse
export  function preamble(preState, headers, servername) {
	const preambleStart = performance.now()
	const { stream, shutdownSignal } = preState

	//
	const method = headers[HTTP2_HEADER_METHOD]
	const fullPathAndQuery = headers[HTTP2_HEADER_PATH]
	const authority = headers[HTTP2_HEADER_AUTHORITY]
	const scheme = headers[HTTP2_HEADER_SCHEME]
	//
	const authorization = headers[HTTP2_HEADER_AUTHORIZATION]
	//
	const fullForwarded = headers[HTTP_HEADER_FORWARDED]
	//
	const maxForwards = headers[HTTP2_HEADER_MAX_FORWARDS]
	//
	const fullContentType = headers[HTTP2_HEADER_CONTENT_TYPE]
	const fullContentLength = headers[HTTP2_HEADER_CONTENT_LENGTH]
	const fullAccept = headers[HTTP2_HEADER_ACCEPT]
	const fullAcceptEncoding = headers[HTTP2_HEADER_ACCEPT_ENCODING]
	const fullAcceptLanguage = headers[HTTP2_HEADER_ACCEPT_LANGUAGE]
	//
	const origin = headers[HTTP_HEADER_ORIGIN]
	// const host = header[HTTP2_HEADER_HOST]
	// const referer = header[HTTP2_HEADER_REFERER]
	// const UA = header[HTTP_HEADER_USER_AGENT]

	//
	// const from = headers[HTTP2_HEADER_FROM]

	// Conditions
	const conditionIfMatch = headers[HTTP2_HEADER_IF_MATCH]
	const conditionIfNoneMatch = headers[HTTP2_HEADER_IF_NONE_MATCH]
	const conditionIfModifiedSince = headers[HTTP2_HEADER_IF_MODIFIED_SINCE]
	const conditionIfUnmodifiedSince = headers[HTTP2_HEADER_IF_UNMODIFIED_SINCE]
	const conditionIfRange = headers[HTTP2_HEADER_IF_RANGE]

	// // SEC Client Hints
	// const secUA = header[HTTP_HEADER_SEC_CH_UA]
	// const secPlatform = header[HTTP_HEADER_SEC_CH_PLATFORM]
	// const secMobile = header[HTTP_HEADER_SEC_CH_MOBILE]
	const secFetchSite = headers[HTTP_HEADER_SEC_FETCH_SITE]
	const secFetchMode = headers[HTTP_HEADER_SEC_FETCH_MODE]
	const secFetchDest = headers[HTTP_HEADER_SEC_FETCH_DEST]

	//
	const allowedOrigin = (ALLOWED_ORIGINS.includes('*') || ((origin !== undefined) && URL.canParse(origin) && ALLOWED_ORIGINS.includes(origin))) ? origin : undefined

	/** @type {RouteRequest|RouteAction} */
	const state = {
		type: 'error',
		cause: 'initialize',
		...preState,
		meta: {
			servername,
			performance: [],
			origin: allowedOrigin,
			customHeaders: []
		}
	}

	if(shutdownSignal.aborted) {
		return { ...state, type: 'unavailable', retryAfter: 60 }
	}

	if(stream.session === undefined) { return { ...state, type: 'error', cause: 'undefined session' } }
	if(!(stream.session.socket instanceof TLSSocket)) { return { ...state, type: 'error', cause: 'not a TLSSocket' }}

	const family = stream.session.socket.remoteFamily
	const ip = stream.session.socket.remoteAddress
	const port = stream.session.socket.remotePort

	const SNI = stream.session.socket.servername // TLS SNI
	if(SNI === null || SNI === false) { return { ...state, type: 'error', cause: 'invalid or unknown SNI' }}

	//
	if(!isValidHeader(fullPathAndQuery)) { return { ...state, type: 'error', cause: 'improper path' }}
	if(!isValidMethod(method)) { return { ...state, type: 'not-implemented', message: 'unknown or invalid method' }}

	if(!isValidLikeHeader(fullContentType)) { return { ...state, type: 'error', cause: 'improper header (content type)' }}
	if(!isValidLikeHeader(fullContentLength)) { return { ...state, type: 'error', cause: 'improper header (content length)' }}
	if(!isValidLikeHeader(fullAccept)) { return { ...state, type: 'error', cause: 'improper header (accept)' }}
	if(!isValidLikeHeader(fullAcceptEncoding)) { return { ...state, type: 'error', cause: 'improper header (accept encoding)' }}
	if(!isValidLikeHeader(fullAcceptLanguage)) { return { ...state, type: 'error', cause: 'improper header (accept language)' }}
	if(!isValidLikeHeader(authorization)) { return { ...state, type: 'error', cause: 'improper header (authorization)' }}
	if(!isValidLikeHeader(maxForwards)) { return { ...state, type: 'error', cause: 'improper header (max forwards)' } }
	if(!isValidLikeHeader(conditionIfMatch)) { return { ...state, type: 'error', cause: 'improper header (if match)' } }
	if(!isValidLikeHeader(conditionIfNoneMatch)) { return { ...state, type: 'error', cause: 'improper header (if none match)' } }
	if(!isValidLikeHeader(conditionIfModifiedSince)) { return { ...state, type: 'error', cause: 'improper header (if modified since)' } }
	if(!isValidLikeHeader(conditionIfUnmodifiedSince)) { return { ...state, type: 'error', cause: 'improper header (if unmodified since)' } }
	if(!isValidLikeHeader(conditionIfRange)) { return { ...state, type: 'error', cause: 'improper header (if range)' } }

	//
	const requestUrl = new URL(fullPathAndQuery, `${scheme}://${authority}`)

	// Sec Fetch Metadata
	/** @type {SecFetchMetadata} */
	const secFetchMetadata = {
		site: SecFetch.parseSite(secFetchSite),
		mode: SecFetch.parseMode(secFetchMode),
		dest: SecFetch.parseDestination(secFetchDest)
	}


	//
	/** @type {RouteConditions} */
	const conditions = {
		match: Conditional.parseEtagList(conditionIfMatch),
		noneMatch: Conditional.parseEtagList(conditionIfNoneMatch),
		modifiedSince: Conditional.parseFixDate(conditionIfModifiedSince),
		unmodifiedSince: Conditional.parseFixDate(conditionIfUnmodifiedSince),
		range: Conditional.parseFixDate(conditionIfRange) ?? ETag.parse(conditionIfRange)
	}

	//
	// Forwarded
	//
	const forwardedList = Forwarded.parse(fullForwarded, FORWARDED_ACCEPTABLE_KEYS)
	const forwarded = Forwarded.selectRightMost(forwardedList, FORWARDED_DROP_RIGHTMOST)
	const forwardedFor = forwarded?.get(FORWARDED_KEY_FOR)
	const forwardedSecret = forwarded?.get(FORWARDED_KEY_SECRET)

	if(FORWARDED_REQUIRED && forwarded === undefined) { return { ...state, type: 'error', cause: 'forwarded required' } }
	if(FORWARDED_REQUIRED && forwardedFor === undefined) { return { ...state, type: 'error', cause: 'forwarded for required' } }
	if(FORWARDED_REQUIRED && forwardedSecret !== FORWARDED_SECRET) { return { ...state, type: 'error', cause: 'forwarded invalid' } }

	//
	// Options
	//
	if(method === HTTP2_METHOD_OPTIONS) {
		const preambleEnd = performance.now()
		state.meta.performance.push({ name: 'preamble-preflight', duration: preambleEnd - preambleStart })
		return { ...state, type: 'preflight', method, methods: [], url: requestUrl }
	}

	//
	// rate limit
	//
	// const ipRateLimitKey = `${ip}`
	// if(!RateLimiter.test(ipRateLimitStore, ipRateLimitKey, ipRateLimitPolicy)) { return { type: 'limit', url: requestUrl, policy: ipRateLimitPolicy, ...defaultReturn } }

	//
	// content negotiation
	//
	const acceptItem = Accept.parse(fullAccept)
	const acceptEncodingItem = AcceptEncoding.parse(fullAcceptEncoding)
	const acceptLanguageItem = AcceptLanguage.parse(fullAcceptLanguage)

	/** @type {RouteRequestAccept} */
	const acceptObject = {
		parsed: {
			type: acceptItem,
			encoding: acceptEncodingItem,
			language: acceptLanguageItem,
		},

		get type() { return Accept.selectFrom(acceptItem, DEFAULT_SUPPORTED_MIME_TYPES) },
		get encoding() { return AcceptEncoding.selectFrom(acceptEncodingItem, DEFAULT_SUPPORTED_ENCODINGS) },
		get language() { return AcceptLanguage.selectFrom(acceptLanguageItem, DEFAULT_SUPPORTED_LANGUAGES) },

		select: {
			type: acceptableTypes => Accept.selectItemFrom(acceptItem, acceptableTypes ?? DEFAULT_SUPPORTED_MIME_TYPES),
			encoding: acceptableEncodings => AcceptEncoding.selectItemFrom(acceptEncodingItem, acceptableEncodings ?? DEFAULT_SUPPORTED_ENCODINGS),
			language: acceptableLanguages => AcceptLanguage.selectItemFrom(acceptLanguageItem, acceptableLanguages ?? DEFAULT_SUPPORTED_LANGUAGES)
		}
	}

	//
	// Trace
	//
	if(method === HTTP2_METHOD_TRACE) {
		if(!ALLOW_TRACE) { return { ...state, type: 'not-allowed', method, methods: [] }}
		const maxForwardsValue = maxForwards === undefined ? 0 : Number.parseInt(maxForwards, 10)
		const preambleEnd = performance.now()
		state.meta.performance.push({ name: 'preamble-trace', duration: preambleEnd - preambleStart })
		if(acceptObject.type !== MIME_TYPE_MESSAGE_HTTP) { return { ...state, type: 'not-acceptable', acceptableMediaTypes: [ MIME_TYPE_MESSAGE_HTTP ] } }
		return { ...state, type: 'trace', method, headers, url: requestUrl, maxForwards: maxForwardsValue }
	}

	//
	// setup future body
	//
	const contentType = ContentType.parse(fullContentType)
	const contentLength = fullContentLength === undefined ? undefined : Number.parseInt(fullContentLength, 10)
	const body = requestBody(stream, {
		byteLimit: BODY_BYTE_LENGTH,
		contentLength,
		contentType,
		signal: AbortSignal.any([
			shutdownSignal,
			AbortSignal.timeout(BODY_TIMEOUT_MSEC)
		])
	})

	//
	// token
	//
	// const tokens = getTokens(authorization, requestUrl.searchParams)

	//
	const preambleEnd = performance.now()
	state.meta.performance.push({ name: 'preamble', duration: preambleEnd - preambleStart })

	return {
		...state,
		type: 'request',
		method,
		url: requestUrl,
		headers,
		body,
		// tokens,
		conditions,
		secFetchMetadata,
		accept: acceptObject,
		client: { family, ip, port },
		SNI
	}
}