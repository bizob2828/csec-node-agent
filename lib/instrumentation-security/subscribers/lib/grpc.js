/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const { EVENT_TYPE, EVENT_CATEGORY } = require('../../core/event-constants')
const API = require('../../../nr-security-api')
const logger = API.getLogger()

// LIMITATION: gRPC server-side incoming request data is not available via NR
// channels. nr_grpc_server fires at handler registration time only. Server-side
// security monitoring requires shimmer.

function extractGrpcClientArgs(context) {
  // args = [metadata, listener]  self = ResolvingCall or Http2CallStream
  const args = context.arguments
  const call = context.self

  if (!args || !args[0]) {
    return null
  }

  const metadata = args[0]

  try {
    const headers = typeof metadata.toJSON === 'function' ? metadata.toJSON() : {}

    let method = ''
    let host = ''

    if (call) {
      method = call.methodName || ''
      if (call.channel && call.channel.target) {
        host = call.channel.target
      } else if (call.channelTarget) {
        host = call.channelTarget
      }
    }

    return {
      headers: { ...headers, host },
      method,
      path: method,
      protocol: 'grpc:'
    }
  } catch (err) {
    logger.debug('GrpcSubscriber extractArgs error: %s', err.message)
    return null
  }
}

// Fires when ResolvingCall.start(metadata, listener) is called — gRPC >= 1.8.0.
class GrpcResolvingSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: '@grpc/grpc-js',
      channelName: 'nr_grpc_resolving',
      eventType: EVENT_TYPE.HTTP_REQUEST,
      eventCategory: EVENT_CATEGORY.HTTP
    })
  }

  extractArgs(context) {
    return extractGrpcClientArgs(context)
  }
}

// Fires when Http2CallStream.start(metadata, listener) is called — gRPC < 1.8.0.
class GrpcStreamSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: '@grpc/grpc-js',
      channelName: 'nr_grpc_stream',
      eventType: EVENT_TYPE.HTTP_REQUEST,
      eventCategory: EVENT_CATEGORY.HTTP
    })
  }

  extractArgs(context) {
    return extractGrpcClientArgs(context)
  }
}

module.exports = { GrpcResolvingSubscriber, GrpcStreamSubscriber }
