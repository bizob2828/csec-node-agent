/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const { EVENT_TYPE, EVENT_CATEGORY } = require('../../core/event-constants')
const API = require('../../../nr-security-api')

// Subscribes to undici's own native dc channel — context is the raw event
// message { request } rather than an orchestrion context object.
//
// Note: dc subscribers are read-only observers. The shimmer-based hook was
// able to inject NR-CSEC-TRACING-DATA headers into outbound requests; that
// is not possible here.
class UndiciRequestCreateSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      name: 'undici:request:create',
      eventType: EVENT_TYPE.HTTP_REQUEST,
      eventCategory: EVENT_CATEGORY.HTTP,
      native: true
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.ssrf) {
      return null
    }

    const req = context.request
    if (!req) {
      return null
    }

    try {
      const origin = new URL(req.origin)
      return {
        headers: { host: origin.host },
        method: req.method || '',
        path: req.path || '/',
        protocol: origin.protocol,
        port: origin.port || ''
      }
    } catch (err) {
      return null
    }
  }
}

module.exports = { UndiciRequestCreateSubscriber }
