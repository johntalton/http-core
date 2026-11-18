import {
	HTTP_METHOD_DELETE,
	HTTP_METHOD_GET,
	HTTP_METHOD_HEAD,
	HTTP_METHOD_OPTIONS,
	HTTP_METHOD_PATCH,
	HTTP_METHOD_POST,
	HTTP_METHOD_PUT,
	HTTP_METHOD_QUERY,
	HTTP_METHOD_TRACE,
} from '@johntalton/http-util/response'

/** @import { Http2Stream, ServerHttp2Stream, IncomingHttpHeaders } from 'node:http2' */

/** @import { Metadata, ProblemInstance } from '@johntalton/http-util/response' */
/** @import { BodyFuture } from '@johntalton/http-util/body' */
/** @import {
 AcceptItem,
 EtagItem,
 RateLimitPolicyInfo,
 RateLimitInfo,
 ChallengeItem,
 CacheControlResponseItem,
 RequestPreferences,
 DispositionInput,
 DigestDictionary,
 WantDigestDictionary,
 SelectedDigestResult,
 RangeDirective,
 RangeValue
} from '@johntalton/http-util/headers' */
/** @import { AcceptStyleItem,  IMFFixDate, IMFFixDateInput } from '@johntalton/http-util/util' */
/** @import { SendBody, SendContext, SendDigest, NonEmptyArray, MultipartBytePart, SendSupportedTypes } from '@johntalton/http-util/response' */
/** @import {
	SecFetchSite,
	SecFetchMode,
	SecFetchDest
} from '@johntalton/http-util/headers' */

/** @typedef {'request'} RouteTypeRequest */
/** @typedef {
	'trace' |
	'im-a-teapot' |
	'accepted' |
	'created' |
	'preflight' |
	'no-content' |
	'not-modified' |
	'found' |

	'gone' |
	'moved-permanently' |
	'see-other' |
	'temporary-redirect' |
	'permanent-redirect' |

	'404' |
	'bad-request' |
	'conflict' |
	'content-too-large' |
	'forbidden' |
	'not-acceptable' |
	'not-allowed' |
	'payment-required' |
	'precondition-failed' |
	'not-satisfiable' |
	'timeout' |
	'too-many-requests' |
	'unauthorized' |
	'unprocessable' |
	'unsupported-media' |
	'insufficient-storage' |
	'not-implemented' |
	'unavailable' |

	'sse' |
	'bytes' |
	'partial-bytes' |
	'encoded' |
	'json' |
	'error'
} RouteType */
/** @typedef {'GET'|'HEAD'|'POST'|'PUT'|'PATCH'|'OPTIONS'|'DELETE'|'TRACE'|'QUERY'} RouteMethod */

/** @typedef {string & { readonly _brand: 'sid' }} StreamID */

/**
 * @typedef {Object} Config
 * @property {boolean|undefined} [maintenance_mode]
 */

/**
 * @template {Config} C
 * @typedef {Object} RouteBase
 * @property {RouteTypeRequest|RouteType} type
 * @property {C} config
 * @property {StreamID} streamId
 * @property {ServerHttp2Stream} stream
 * @property {Metadata} meta
 * @property {AbortSignal} shutdownSignal
 */

/**
 * @typedef {Object} RouteRequestAcceptParsed
 * @property {Array<AcceptItem> | undefined} type
 * @property {Array<AcceptStyleItem> | undefined} encoding
 * @property {Array<AcceptStyleItem>} language,
 *
 * @property {Uint8Array|undefined} availableDictionary
 */

/**
 * @typedef {Object} RouteRequestAcceptFn
 * @property {(acceptable?: Array<string>|undefined) => AcceptItem|undefined} type
 * @property {(acceptable?: Array<string>|undefined) => AcceptStyleItem|undefined} encoding
 * @property {(acceptable?: Array<string>|undefined) => AcceptStyleItem|undefined} language
 */

/**
 * @typedef {Object} RouteRequestAccept
 * @property {RouteRequestAcceptParsed} parsed
 * @property {RouteRequestAcceptFn} select
 *
 * @property {string|undefined} availableDictionary
 * @property {string|undefined} dictionaryId
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
 * @typedef {Object} SecFetchMetadata
 * @property {SecFetchSite|undefined} site
 * @property {SecFetchMode|undefined} mode
 * @property {SecFetchDest|undefined} dest
 * @property {boolean} user
 */

/**
 * @typedef {Object} AccessControlRequest
 * @property {string|undefined} method
 * @property {Array<string>|undefined} headers
 */

/**
 * @typedef {Object} DigestWantInfo
 * @property {WantDigestDictionary|undefined} repr
 * @property {WantDigestDictionary|undefined} content
 * @property {WantDigestDictionary|undefined} unencoded
 */

/**
 * @typedef {Object} DigestSelectFn
 * @property {(supportedAlgorithms: Array<string>) => Array<SelectedDigestResult>|undefined} repr
 * @property {(supportedAlgorithms: Array<string>) => Array<SelectedDigestResult>|undefined} content
 * @property {(supportedAlgorithms: Array<string>) => Array<SelectedDigestResult>|undefined} unencoded
 */

/**
 * @typedef {Object} DigestInfo
 * @property {DigestWantInfo} want
 * @property {DigestDictionary|undefined} repr
 * @property {DigestDictionary|undefined} content
 * @property {DigestDictionary|undefined} unencoded
 * @property {DigestSelectFn} select
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
 * @property {RangeDirective<RangeValue>|undefined} range
 * @property {SecFetchMetadata} secFetchMetadata
 * @property {RequestPreferences} preferences
 * @property {AccessControlRequest} accessControlRequest
 * @property {string} SNI
 * @property {string|undefined} serviceWorker
 * @property {DigestInfo} digestInfo
 */
/**
 * @template {Config} C
 * @typedef {RouteBase<C> & RouteRequestBase} RouteRequest
 */

/**
 * @typedef {Object} RouteResponseBase
 * @property {Omit<SendContext, 'problem'>|undefined} [context]
 * @property {ProblemInstance|undefined} [problem]
 */

/**
 * @template {Config} C
 * @typedef {RouteBase<C> & RouteResponseBase} RouteResponse
 */

/**
 * @typedef {Object} RouteTraceBase
 * @property {'trace'} type
 * @property {RouteMethod} method
 * @property {URL} url
 * @property {IncomingHttpHeaders} headers
 * @property {number} maxForwards
*/
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteTraceBase} RouteTrace
 */

/**
 * @typedef {Object} RouteAcceptedBase
 * @property {'accepted'} type
 * @property {URL|string|undefined} [location]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteAcceptedBase} RouteAccepted
 */

/**
 * @typedef {Object} RouteCreatedBase
 * @property {'created'} type
 * @property {URL|string} location
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteCreatedBase} RouteCreated
 */

/**
 * @typedef {Object} RoutePreflightBase
 * @property {'preflight'} type
 * @property {URL} url
 * @property {Array<RouteMethod>} methods list of methods supported by this route
 * @property {Array<string>} supportedHeaders list of additional allowed headers
 * @property {SendSupportedTypes} supportedTypes mime-types supported for post/put/patch
 * @property {Array<string>|undefined} [supportedQueryTypes] mime-types supported for query
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RoutePreflightBase} RoutePreflight
 */

/**
 * @typedef {Object} RouteNoContentBase
 * @property {'no-content'} type
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteNoContentBase} RouteNoContent
 */

/**
 * @typedef {Object} RouteNotModifiedBase
 * @property {'not-modified'} type
 * @property {number} age
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlResponseItem|undefined} [cacheControl]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteNotModifiedBase} RouteNotModified
 */

/**
 * @typedef {Object} RouteFoundBase
 * @property {'found'} type
 * @property {URL|string} location
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteFoundBase} RouteFound
 */



/**
 * @typedef {Object} RouteGoneBase
 * @property {'gone'} type
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteGoneBase} RouteGone
 */

/**
 * @typedef {Object} RouteMovedPermanentlyBase
 * @property {'moved-permanently'} type
 * @property {URL|string} location
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteMovedPermanentlyBase} RouteMovedPermanently
 */

/**
 * @typedef {Object} RouteSeeOtherBase
 * @property {'see-other'} type
 * @property {URL|string} location
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteSeeOtherBase} RouteSeeOther
 */

/**
 * @typedef {Object} RouteTemporaryRedirectBase
 * @property {'temporary-redirect'} type
 * @property {URL|string} location
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteTemporaryRedirectBase} RouteTemporaryRedirect
 */

/**
 * @typedef {Object} RoutePermanentRedirectBase
 * @property {'permanent-redirect'} type
 * @property {URL|string} location
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RoutePermanentRedirectBase} RoutePermanentRedirect
 */




/**
 * @typedef {Object} Route404Base
 * @property {'404'} type
 * @property {string} method
 * @property {string} message
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & Route404Base} Route404
 */


/**
 * @typedef {Object} RouteBadRequestBase
 * @property {'bad-request'} type
 * @property {string|undefined} message
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteBadRequestBase} RouteBadRequest
 */

/**
 * @typedef {Object} RouteConflictBase
 * @property {'conflict'} type
 * @property {string|undefined} [message]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteConflictBase} RouteConflict
 */

/**
 * @typedef {Object} RouteContentTooLargeBase
 * @property {'content-too-large'} type
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteContentTooLargeBase} RouteContentTooLarge
 */

/**
 * @typedef {Object} RouteForbiddenBase
 * @property {'forbidden'} type
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteForbiddenBase} RouteForbidden
 */

/**
 * @typedef {Object} RouteNotAcceptableBase
 * @property {'not-acceptable'} type
 * @property {Array<string>|string|undefined} [acceptableTypes]
 * @property {Array<string>|undefined} [acceptableEncodings]
 * @property {Array<string>|undefined} [acceptableLanguages]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteNotAcceptableBase} RouteNotAcceptable
 */

/**
 * @typedef {Object} RouteNotAllowedBase
 * @property {'not-allowed'} type
 * @property {RouteMethod} method
 * @property {Array<RouteMethod>} methods
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteNotAllowedBase} RouteNotAllowed
 */

/**
 * @typedef {Object} RoutePreconditionFailedBase
 * @property {'precondition-failed'} type
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RoutePreconditionFailedBase} RoutePreconditionFailed
 */

/**
 * @typedef {Object} RouteNotSatisfiableBase
 * @property {'not-satisfiable'} type
 * @property {number} contentLength
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteNotSatisfiableBase} RouteNotSatisfiable
 */

/**
 * @typedef {Object} RouteTimeoutBase
 * @property {'timeout'} type
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteTimeoutBase} RouteTimeout
 */

/**
 * @typedef {Object} RouteTooManyRequestsBase
 * @property {'too-many-requests'} type
 * @property {RateLimitInfo} limit
 * @property {Array<RateLimitPolicyInfo>} policies
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteTooManyRequestsBase} RouteTooManyRequests
 */

/**
 * @typedef {Object} RouteUnauthorizedBase
 * @property {'unauthorized'} type
 * @property {Array<ChallengeItem>} challenge
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteUnauthorizedBase} RouteUnauthorized
 */

/**
 * @typedef {Object} RouteUnprocessableBase
 * @property {'unprocessable'} type
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteUnprocessableBase} RouteUnprocessable
 */

/**
 * @typedef {Object} RouteUnsupportedMediaTypeBase
 * @property {'unsupported-media'} type
 * @property {RouteMethod|undefined} method
 * @property {SendSupportedTypes} supportedTypes
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteUnsupportedMediaTypeBase} RouteUnsupportedMediaType
 */

/**
 * @typedef {Object} RouteInsufficientStorageBase
 * @property {'insufficient-storage'} type
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteInsufficientStorageBase} RouteInsufficientStorage
 */

/**
 * @typedef {Object} RouteNotImplementedBase
 * @property {'not-implemented'} type
 * @property {string|undefined} [message]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteNotImplementedBase} RouteNotImplemented
 */

/**
 * @typedef {Object} RouteUnavailableBase
 * @property {'unavailable'} type
 * @property {string|undefined} [message]
 * @property {number|undefined} [retryAfter]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteUnavailableBase} RouteUnavailable
 */



/**
 * @typedef {Object} RouteSSEBase
 * @property {'sse'} type
 * @property {boolean} active
 * @property {boolean} bom
 * @property {MessagePort} port
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteSSEBase} RouteSSE
 */

/**
 * @typedef {Object} RouteBytesBase
 * @property {'bytes'} type
 * @property {string} contentType
 * @property {SendBody|undefined} obj
 * @property {DispositionInput|undefined} [contentDisposition]
 * @property {number|undefined} [contentLength]
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlResponseItem|undefined} [cacheControl]
 * @property {SendDigest|undefined} [digest]
 * @property {'bytes'|'none'|undefined} [acceptRanges]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteBytesBase} RouteBytes
 */

 /**
 * @typedef {Object} RoutePartialBytesBase
 * @property {'partial-bytes'} type
 * @property {NonEmptyArray<MultipartBytePart>} objs
 * @property {string} contentType
 * @property {DispositionInput|undefined} [contentDisposition]
 * @property {number|undefined} [contentLength]
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlResponseItem|undefined} [cacheControl]
 * @property {SendDigest|undefined} [digest]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RoutePartialBytesBase} RoutePartialBytes
 */

/**
 * @typedef {Object} RouteEncodedBase
 * @property {'encoded'} type
 * @property {SendBody|undefined} obj
 * @property {string} contentType
 * @property {string|undefined} [encoding]
 * @property {DispositionInput|undefined} [contentDisposition]
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlResponseItem|undefined} [cacheControl]
 * @property {SendDigest|undefined} [digest]
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteEncodedBase} RouteEncoded
 */

/**
 * @typedef {Object} RouteJSONBase
 * @property {'json'} type
 * @property {Record<any, any>} obj
 * @property {string | undefined} [encoding]
 * @property {DispositionInput|undefined} [contentDisposition]
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlResponseItem|undefined} [cacheControl]
 * @property {SendDigest|undefined} [digest]
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteJSONBase} RouteJSON
 */

/**
 * @typedef {Object} RouteErrorBase
 * @property {'error'} type
 * @property {string} cause
 * @property {Error|undefined} [error]
 */
/**
 * @template {Config} C
 * @typedef {RouteResponse<C> & RouteErrorBase } RouteError
 */


/**
 * @template {Config} C
 * @typedef {
	RouteTrace<C> |
	RouteAccepted<C> |
	RouteCreated<C> |
	RoutePreflight<C> |
	RouteNoContent<C> |
	RouteNotModified<C> |
	RouteFound<C> |

	RouteGone<C> |
	RouteMovedPermanently<C> |
	RouteSeeOther<C> |
	RouteTemporaryRedirect<C> |
	RoutePermanentRedirect<C> |

	Route404<C> |
	RouteBadRequest<C> |
	RouteConflict<C> |
	RouteContentTooLarge<C> |
	RouteForbidden<C> |
	RouteNotAcceptable<C> |
	RouteNotAllowed<C> |
	RoutePreconditionFailed<C> |
	RouteNotSatisfiable<C> |
	RouteTimeout<C> |
	RouteTooManyRequests<C> |
	RouteUnauthorized<C> |
	RouteUnprocessable<C> |
	RouteUnsupportedMediaType<C> |
	RouteInsufficientStorage<C> |
	RouteNotImplemented<C> |
	RouteUnavailable<C> |

	RouteSSE<C> |
	RouteBytes<C> |
	RoutePartialBytes<C> |
	RouteEncoded<C> |
	RouteJSON<C> |
	RouteError<C>
} RouteAction */

/**
 * @template {Config} C
 * @typedef {Pick<RouteRequest<C>, 'config'|'streamId'|'stream'|'shutdownSignal'>} PreState
 */

/**
 * @template {Config} C
 * @typedef {RouteRequest<C> | RouteTrace<C> | RouteNotAllowed<C> | RouteNotImplemented<C> | RouteNotAcceptable<C> | RouteUnavailable<C> | RouteError<C> } PreambleRouteResult
 */

/**
 * @template {Config} C
 * @typedef {(state: PreambleRouteResult<C>) => Promise<RouteAction<C>>} Router
 */

/**
 * @typedef {Object} H2CoreOptions
 * @property {boolean} ipv6Only
 * @property {string} host
 * @property {number} port
 * @property {Array<string>} credentials
 * @property {Array<string>} allowedOrigins
 * @property {boolean} allowTrace
 * @property {string|undefined} serverName
 * @property {boolean} debug
 */


/** @typedef {Record<string, string|undefined>} RouteMatches */
/**
 * @template {Config} C
 * @typedef {(matches: RouteMatches, state: RouteRequest<C>) => Promise<RouteAction<C>>} RouteFunction
 */


/**
 * @param {Http2Stream} stream
 * @returns {stream is ServerHttp2Stream}
 */
export function isServerStream(stream) {
	if(stream === null) { return false }
	return true
}

export const KNOWN_METHODS = [
	HTTP_METHOD_GET,
	HTTP_METHOD_HEAD,
	HTTP_METHOD_POST,
	HTTP_METHOD_PUT,
	HTTP_METHOD_PATCH,
	HTTP_METHOD_OPTIONS,
	HTTP_METHOD_DELETE,
	HTTP_METHOD_TRACE,
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
 * @param {string|undefined} origin
 * @param {Array<string>} allowedOrigins
 * @returns {string|undefined}
 */
export function resolveAllowedOrigin(origin, allowedOrigins) {
	if(origin === undefined) { return undefined }
	if(!URL.canParse(origin)) { return undefined }

	if(allowedOrigins.includes('*')) { return origin }
	if(allowedOrigins.includes(origin)) { return origin }

	return undefined
}