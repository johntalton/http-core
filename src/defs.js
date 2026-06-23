import http2 from 'node:http2'

import { HTTP_METHOD_QUERY } from '@johntalton/http-util/response'

/** @import { Http2Stream, ServerHttp2Stream, IncomingHttpHeaders } from 'node:http2' */
/** @import { SecureServerOptions } from 'node:http2' */

/** @import { Metadata } from '@johntalton/http-util/response' */
/** @import { BodyFuture } from '@johntalton/http-util/body' */
/** @import {
 AcceptItem,
 EtagItem,
 IMFFixDate,
 IMFFixDateInput,
 ContentRangeDirective,
 RateLimitPolicyInfo,
 RateLimitInfo,
 ChallengeItem,
 CacheControlOptions
} from '@johntalton/http-util/headers' */
/** @import { AcceptStyleItem } from '@johntalton/http-util/util' */
/** @import { SendBody, NonEmptyArray, SendSupportedTypes } from '@johntalton/http-util/response' */
/** @import { SecFetchSite, SecFetchMode, SecFetchDest } from '@johntalton/http-util/headers' */



/** @typedef {(state: RouteRequest|RouteAction) => Promise<RouteAction>} Router */

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
 * @typedef {Object} RouteBase
 * @property {RouteTypeRequest|RouteType} type
 * @property {Config} config
 * @property {StreamID} streamId
 * @property {ServerHttp2Stream} stream
 * @property {Metadata} meta
 * @property {AbortSignal} shutdownSignal
 */

/**
 * @typedef {Object} RouteRequestAcceptParsed
 * @property {Array<AcceptItem> | undefined} type
 * @property {Array<AcceptStyleItem> | undefined} encoding
 * @property {Array<AcceptStyleItem>} language
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
 * @typedef {Object} SecFetchMetadata
 * @property {SecFetchSite|undefined} site
 * @property {SecFetchMode|undefined} mode
 * @property {SecFetchDest|undefined} dest
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
 * @property {SecFetchMetadata} secFetchMetadata
 * @property {string} SNI
 */
/** @typedef {RouteBase & RouteRequestBase} RouteRequest */

/**
 * @typedef {Object} PartialBytes
 * @property {SendBody} obj
 * @property {ContentRangeDirective} range
 */






/**
 * @typedef {Object} RouteTraceBase
 * @property {'trace'} type
 * @property {RouteMethod} method
 * @property {URL} url
 * @property {IncomingHttpHeaders} headers
 * @property {number} maxForwards
*/
/** @typedef {RouteBase & RouteTraceBase} RouteTrace */

/**
 * @typedef {Object} RouteCreatedBase
 * @property {'created'} type
 * @property {URL|string} location
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 */
/** @typedef {RouteBase & RouteCreatedBase} RouteCreated */

/**
 * @typedef {Object} RoutePreflightBase
 * @property {'preflight'} type
 * @property {RouteMethod} method verb used in request
 * @property {URL} url
 * @property {Array<RouteMethod>} methods list of methods supported by this route
 * @property {SendSupportedTypes} supportedTypes mime-types supported for post/put/patch
 * @property {Array<string>|undefined} [supportedQueryTypes] mime-types supported for query
 */
/** @typedef {RouteBase & RoutePreflightBase} RoutePreflight */

/**
 * @typedef {Object} RouteNoContentBase
 * @property {'no-content'} type
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 */
/** @typedef {RouteBase & RouteNoContentBase} RouteNoContent */

/**
 * @typedef {Object} RouteNotModifiedBase
 * @property {'not-modified'} type
 * @property {number} age
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlOptions|undefined} [cacheControl]
 */
/** @typedef {RouteBase & RouteNotModifiedBase} RouteNotModified */

/**
 * @typedef {Object} RouteFoundBase
 * @property {'found'} type
 * @property {URL|string} location
 */
/** @typedef {RouteBase & RouteFoundBase} RouteFound */



/**
 * @typedef {Object} RouteGoneBase
 * @property {'gone'} type
 */
/** @typedef {RouteBase & RouteGoneBase} RouteGone */

/**
 * @typedef {Object} RouteMovedPermanentlyBase
 * @property {'moved-permanently'} type
 * @property {URL|string} location
 */
/** @typedef {RouteBase & RouteMovedPermanentlyBase} RouteMovedPermanently */

/**
 * @typedef {Object} RouteSeeOtherBase
 * @property {'see-other'} type
 * @property {URL|string} location
 */
/** @typedef {RouteBase & RouteSeeOtherBase} RouteSeeOther */

/**
 * @typedef {Object} RouteTemporaryRedirectBase
 * @property {'temporary-redirect'} type
 * @property {URL|string} location
 */
/** @typedef {RouteBase & RouteTemporaryRedirectBase} RouteTemporaryRedirect */

/**
 * @typedef {Object} RoutePermanentRedirectBase
 * @property {'permanent-redirect'} type
 * @property {URL|string} location
 */
/** @typedef {RouteBase & RoutePermanentRedirectBase} RoutePermanentRedirect */




/**
 * @typedef {Object} Route404Base
 * @property {'404'} type
 * @property {string} method
 * @property {string} message
 */
/** @typedef {RouteBase & Route404Base} Route404 */

/**
 * @typedef {Object} RouteConflictBase
 * @property {'conflict'} type
 * @property {string|undefined} [message]
 */
/** @typedef {RouteBase & RouteConflictBase} RouteConflict */

/**
 * @typedef {Object} RouteContentTooLargeBase
 * @property {'content-too-large'} type
 */
/** @typedef {RouteBase & RouteContentTooLargeBase} RouteContentTooLarge */

/**
 * @typedef {Object} RouteForbiddenBase
 * @property {'forbidden'} type
 */
/** @typedef {RouteBase & RouteForbiddenBase} RouteForbidden */

/**
 * @typedef {Object} RouteNotAcceptableBase
 * @property {'not-acceptable'} type
 * @property {Array<string>|string|undefined} [acceptableTypes]
 * @property {Array<string>|undefined} [acceptableEncodings]
 * @property {Array<string>|undefined} [acceptableLanguages]
 */
/** @typedef {RouteBase & RouteNotAcceptableBase} RouteNotAcceptable */

/**
 * @typedef {Object} RouteNotAllowedBase
 * @property {'not-allowed'} type
 * @property {RouteMethod} method
 * @property {Array<RouteMethod>} methods
 */
/** @typedef {RouteBase & RouteNotAllowedBase} RouteNotAllowed */

/**
 * @typedef {Object} RoutePreconditionFailedBase
 * @property {'precondition-failed'} type
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 */
/** @typedef {RouteBase & RoutePreconditionFailedBase} RoutePreconditionFailed */

/**
 * @typedef {Object} RouteNotSatisfiableBase
 * @property {'not-satisfiable'} type
 * @property {number} contentLength
 */
/** @typedef {RouteBase & RouteNotSatisfiableBase} RouteNotSatisfiable */

/**
 * @typedef {Object} RouteTimeoutBase
 * @property {'timeout'} type
 */
/** @typedef {RouteBase & RouteTimeoutBase} RouteTimeout */

/**
 * @typedef {Object} RouteTooManyRequestsBase
 * @property {'too-many-requests'} type
 * @property {RateLimitInfo} limit
 * @property {Array<RateLimitPolicyInfo>} policies
 */
/** @typedef {RouteBase & RouteTooManyRequestsBase} RouteTooManyRequests */

/**
 * @typedef {Object} RouteUnauthorizedBase
 * @property {'unauthorized'} type
 * @property {Array<ChallengeItem>} challenge
 */
/** @typedef {RouteBase & RouteUnauthorizedBase} RouteUnauthorized */

/**
 * @typedef {Object} RouteUnprocessableBase
 * @property {'unprocessable'} type
 * @property {string} message
 */
/** @typedef {RouteBase & RouteUnprocessableBase} RouteUnprocessable */

/**
 * @typedef {Object} RouteUnsupportedMediaTypeBase
 * @property {'unsupported-media'} type
 * @property {RouteMethod|undefined} method
 * @property {SendSupportedTypes} supportedTypes
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/** @typedef {RouteBase & RouteUnsupportedMediaTypeBase} RouteUnsupportedMediaType */

/**
 * @typedef {Object} RouteInsufficientStorageBase
 * @property {'insufficient-storage'} type
 */
/** @typedef {RouteBase & RouteInsufficientStorageBase} RouteInsufficientStorage */

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
 * @typedef {Object} RouteSSEBase
 * @property {'sse'} type
 * @property {boolean} active
 * @property {boolean} bom
 * @property {MessagePort} port
 */
/** @typedef {RouteBase & RouteSSEBase} RouteSSE */

/**
 * @typedef {Object} RouteBytesBase
 * @property {'bytes'} type
 * @property {string} contentType
 * @property {SendBody} obj
 * @property {number|undefined} [contentLength]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {EtagItem|undefined} [etag]
 * @property {number|undefined} [age]
 * @property {CacheControlOptions|undefined} [cacheControl]
 * @property {'bytes'|'none'|undefined} [acceptRanges]
 */
/** @typedef {RouteBase & RouteBytesBase} RouteBytes */

 /**
 * @typedef {Object} RoutePartialBytesBase
 * @property {'partial-bytes'} type
 * @property {NonEmptyArray<PartialBytes>} objs
 * @property {string} contentType
 * @property {number|undefined} [contentLength]
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlOptions|undefined} [cacheControl]
 */
/** @typedef {RouteBase & RoutePartialBytesBase} RoutePartialBytes */

/**
 * @typedef {Object} RouteEncodedBase
 * @property {'encoded'} type
 * @property {SendBody} obj
 * @property {string} contentType
 * @property {string|undefined} [encoding]
 * @property {EtagItem|undefined} [etag]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {number|undefined} [age]
 * @property {CacheControlOptions|undefined} [cacheControl]
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/** @typedef {RouteBase & RouteEncodedBase} RouteEncoded */

/**
 * @typedef {Object} RouteJSONBase
 * @property {'json'} type
 * @property {Record<any, any>} obj
 * @property {string | undefined} [encoding]
 * @property {IMFFixDateInput|string|undefined} [lastModified]
 * @property {EtagItem|undefined} [etag]
 * @property {number|undefined} [age]
 * @property {CacheControlOptions|undefined} [cacheControl]
 * @property {Array<string>|undefined} [supportedQueryTypes]
 */
/** @typedef {RouteBase & RouteJSONBase} RouteJSON */

/**
 * @typedef {Object} RouteErrorBase
 * @property {'error'} type
 * @property {string} cause
 * @property {Error|undefined} [error]
 */
/** @typedef {RouteBase & RouteErrorBase } RouteError */


/** @typedef {
	RouteTrace |
	RouteCreated |
	RoutePreflight |
	RouteNoContent |
	RouteNotModified |
	RouteFound |

	RouteGone |
	RouteMovedPermanently |
	RouteSeeOther |
	RouteTemporaryRedirect |
	RoutePermanentRedirect |

	Route404 |
	RouteConflict |
	RouteContentTooLarge |
	RouteForbidden |
	RouteNotAcceptable |
	RouteNotAllowed |
	RoutePreconditionFailed |
	RouteNotSatisfiable |
	RouteTimeout |
	RouteTooManyRequests |
	RouteUnauthorized |
	RouteUnprocessable |
	RouteUnsupportedMediaType |
	RouteInsufficientStorage |
	RouteNotImplemented |
	RouteUnavailable |

	RouteSSE |
	RouteBytes |
	RoutePartialBytes |
	RouteEncoded |
	RouteJSON |
	RouteError
} RouteAction */

/**
 * @typedef {Object} H2CoreOptions
 * @property {Config} config
 * @property {boolean} ipv6Only
 * @property {string} host
 * @property {number} port
 * @property {Array<string>} credentials
 * @property {Array<string>} allowedOrigins
 * @property {boolean} allowTrace
 * @property {string|undefined} serverName
 */


/** @typedef {Record<string, string|undefined>} RouteMatches */
/** @typedef {(matches: RouteMatches, state: RouteRequest) => Promise<RouteAction>} RouteFunction */

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

/**
 * @param {Http2Stream} stream
 * @returns {stream is ServerHttp2Stream}
 */
export function isServerStream(stream) {
	if(stream === null) { return false }
	return true
}


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