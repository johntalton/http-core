# HTTP/2 Core Server

HTTP/2 Server pre-canned to handle preamble and epilogue boundary for custom routing and service.

[![npm Version](http://img.shields.io/npm/v/@johntalton/http-util.svg)](https://www.npmjs.com/package/@johntalton/http-util)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/http-util)
[![CI](https://github.com/johntalton/http-util/actions/workflows/CI.yml/badge.svg)](https://github.com/johntalton/http-util/actions/workflows/CI.yml)

## Motivation

By abstracting the preamble and epilogue phase, this library attempts to simplify the HTTP semantics.

User do not need to parse or handle raw incoming header.

They do not need to specifically generate outgoing header format or know which headers are needed / required for specific outgoing Status codes.

Much of the ceremony of the HTTP protocol is normalized withing the `RouteAction` type definitions and provide guidance for creating well crafted APIs.

Support for Streaming, Encoding, Partial Bytes, JSON, ServerSentEvents, etc can all still be achieved though this abstraction.

## Use By
 - [Settee](https://github.com/johntalton/settee) A no-SQL database with REST API and SPA interface (like couchDB but simplified file storage)
 - [Galerie](https://github.com/johntalton/galerie) A REST API and SPA interface for simple Photo Gallery

## Example

This example shows using the `H2CoreServer` as a configuration wrapper around nodes HTTP/2 secure server.
(credentials are currently stored in the relative './credentials/ directory)

The `route` function must be provided by the user.  It is handed a "baked" `state` object from the `preamble` phase of the service, and it returns a valid outgoing object that is used in `epilogue`.

```js
import process from 'node:process'
import { H2CoreServer } from '@johntalton/http-core'

import { route } from 'my-service/router'

const server = new H2CoreServer(router, {
  config: {},
  credentials: [ 'my-service.internal' ],
  ipv6Only: false,
  host: 'my-service.internal',
  port: 8443,
  serverName: 'MyService/1',
  allowedOrigins: [],
  allowTrace: true
})

// and away we go
server.listen()

// allow for graceful shutdown, but force if needed
process.on('SIGINT', () => {
  if (server.closed) { process.exit(-1) }
  server.close()
})

```

## Router

The `H2CoreServer` does not handle routing or service handler lookup, that is intentionally left to the user so that a variety of methods can be used to suite the needs of the developer.

A basic route handler should use the URL of the incoming request (and the verb/method) to pick the application specific handler function.

There are many ways to implement route lookup (simple `Map` or `URLPattern` usage), as well as external libraries like `find-my-way` (though its api does not match exactly as it expects request/response style which this library does not support).


```js
import { myRouteLookup } from 'my-service/lookup'

/** @import { Router } from '@johntalton/http-core' */

/** @type {Router} */
export async function router(state) {
  // guard against unknown state types
  //  (aka pass 'error' along to epilogue)
  if(state.type !== 'request') { return state }

  // using state values, lookup the appropriate handler
  // for your service
  const { handler, parameters } = myRouteLookup(
    state.method,
    state.url,
    // other info as needed (accept type/encoding etc)
    )
  if(handler === undefined) {
    // return a not found object
    return {
      ...state,
      type: '404',
      message: `Not Found: ${state.url.pathname}`
    }
  }

  // execute your handler. It should return a RouteAction
  //  response such as { type: 'json', ... }
  return Promise.try(handler, state, parameters)
    .catch(err => {
      // some type of exception in native handler code
      // report a 500 server error with cause
      return {
        ...state,
        type: 'error',
        cause: `Handler Error: ${err.message}`,
        error: err
      }
    })
}
```

Because routers are passed the "raw" request, they should proactively guard against unsupported configuration (assuming the route lookup isn't providing unique handlers for each configuration)

The following code guards against invalid method for the handler, this code could be general for your route lookup or as part of the handler itself is they are not one-to-one with VER/URL -> handler.

```js
  // in route handler
  // (in case route lookup returns based on URL,
  //  without considering its method)
  const allowedMethods = [ 'GET', 'HEAD' ]
  if(!allowedMethods.includes(state.method)) {
    // RouteAction notAllowed informs client what Verbs are supported
    return {
      ...state,
      type: 'not-allowed',
      methods: allowedMethods
    }
  }
```


## RouteAction

Route handler return a `RouteAction` which describes the desired response to be end in the epilogue.

A wide range of existing `RouteActions` exist covering the majority of HTTP Stats Codes, as well as several Ok helpers (like `RouteTrace`, `RouteJson`, `RouteSSE`, `RoutePartialBytes`, `RouteEncoded`, etc).

All `RouteActions` defined specific parameters that are relivenet to that Status Code.

Several share some common parameters (like `supportedQueryTypes` to advertize mime-types used in `QUERY` verb support).

Further, most parameters are passed as structured objects (instead of hand-coded header strings).  This allows epilogue (and corresponding `http-util/response` function) to more accurately and consistently generate responses (example: `lastModified` can accept a `Temporal.Instant` as well ad `Date` or structured `IMFFixDate` object, other such as `RouteTooManyRequests` take in `RateLimitInfo` and `RatLimitPolicyInfo`)

A typical response (not JSON or other Ok format) for an object may look like the following:

```js
//
const obj = ReadableStream.from( ... )

return {
  ...state,
  type: 'encoded',
  contentType: negotiatedType?.mimetype,
  obj,
  lastModified: Temporal.Now.instant(),
  cacheControl: { maxAge: 42 },
  encoding: negotiatedEncoding?.name
}

```

## Content Negotiation

Content Negotiation can be achieved using builtin parsed version of the `type`, `encoding`, and `language` accept headers.

The `state.accept.select` object can be used to "pick" which are valid for your route.

```js
import { ENCODER_MAP } from '@johntalton/http-util/response'

// ...
const DEFAULT_SUPPORTED_ENCODINGS = [ ...ENCODER_MAP.keys() ]

// ...
  // in route handler

  // encoding can use the built-in supported types
  // or you can explicitly pass your own custom
  // value .encoding(DEFAULT_SUPPORTED_ENCODINGS)
  // note: ENCODER_MAP used here as default supported
  // is identical to passing no parameter as shown bellow
  const negotiatedEncoding = state.accept.select.encoding()

  // content type negotiation
  // list of MimeTypes that this route can support
  const acceptableTypes = [
    MIME_TYPE_PROTOBUF,
    MIME_TYPE_JSON,
    MIME_TYPE_XML,
    MIME_TYPE_YAML
  ]
  const negotiatedType = state.accept.select.type(acceptableTypes)
  if(negotiatedType === undefined) {
    // unable to match client preferences
    return {
      ...state,
      type: 'not-acceptable',
      acceptableTypes
    }
  }

  if(negotiatedType.mimetype === MIME_TYPE_YAML) {
    // create an object or stream that is supported by
    // your service and return (in this case in YAML format)

    return {
      ...state,
      type: 'encoded',
      contentType: MIME_TYPE_YAML,
      encoding: negotiatedEncoding?.name,
      obj: ...
      // etag, lastModified, etc
    }
  }
  // else if( ... ) { ... }

```

## Conditional Requests - Last Modified

The `state` holds many of the incoming header in a parsed format that can be used directly (with [`http-util`](https://github.com/johntalton/http-util) helper functions) to quickly support Conditional Request.

```js
  // in route handler
  const { modifiedSince, unmodifiedSince } = state.conditions

  const hasModHeader = modifiedSince !== undefined
  const hasUnModHeader = unmodifiedSince !== undefined

  if(hasUnModHeader && FixDate.isAfter(unmodifiedSince, lastModified)) {
    return {
      ...state,
      type: 'precondition-failed',
      lastModified
      }
  }
  if(hasModHeader && !FixDate.isAfter(modifiedSince, lastModified)) {
    return {
      ...state,
      type: 'not-modified',
      lastModified
    }
  }
```

## Server Sent Events

The epilogue phase support Server Sent Events (SSE) streams.
In this case the HTTP/2 Stream will not be closed and any message sent to the `port` will be forwarded (and formatted) to the ['EventSource'](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) client on the browser.

```js

  // in handler for SSE endpoint
  // setup MessagePort via MessageChannel or BroadcastChannel
  const { port1, port2 } = new MessageChannel()

  // hold onto port1 or set binding etc here
  //  so that it can be used at a later time
  //  outside this route handler function

  return {
    ...state,
    type: 'sse',
    active: true,
    bom: true,
    port: port2
  }
```

In some later code, the above created `port` can be used to send SSE message to the client ['EventSource'](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) handler.

The messages format is from [`sse-utils`](https://github.com/johntalton/sse-util) [`SSEMessage`](https://github.com/johntalton/sse-util/blob/main/src/sse.ts#L30) type.

```js

  port1.postMessage({
    data: [ 'Hello World 🌎' ]
  })

```