/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const requestManager = require('../../core/request-manager')
const API = require('../../../nr-security-api')
const logger = API.getLogger()

// Subscribes to fastify's native initialization dc event. When fastify fires
// this, the fastify instance is available — we register an onRequest hook using
// fastify's own hook API (not shimmer) to capture request-time route params.
//
// No security events are generated; this supplements the request context in
// requestManager so that downstream subscribers (mysql, pg, etc.) have
// accurate parameterMap data available.
class FastifyInitializationSubscriber extends ChannelSubscriber {
  constructor() {
    super({ name: 'fastify.initialization', native: true })
  }

  _handle(context) {
    try {
      const fastify = context.fastify
      if (!fastify || typeof fastify.addHook !== 'function') {
        return
      }

      fastify.addHook('onRequest', (request, _reply, done) => {
        try {
          const req = requestManager.getRequestFromCurrentTransaction()
          if (req) {
            if (!req.parameterMap) {
              req.parameterMap = {}
            }
            if (request.params) {
              Object.assign(req.parameterMap, request.params)
            }
            if (request.query) {
              Object.assign(req.parameterMap, request.query)
            }
          }
        } catch (err) {
          logger.debug('FastifyInitializationSubscriber onRequest error: %s', err.message)
        }
        done()
      })
    } catch (err) {
      logger.debug('FastifyInitializationSubscriber _handle error: %s', err.message)
    }
  }
}

module.exports = { FastifyInitializationSubscriber }
