/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const { EVENT_TYPE, EVENT_CATEGORY } = require('../../core/event-constants')
const API = require('../../../nr-security-api')

// LIMITATION: response.download() and response.sendFile() have no NR orchestrion
// channels — file-access path-traversal detection for those methods is not
// available in channel-only mode.

class ExpressRenderSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'express',
      channelName: 'nr_render',
      eventType: EVENT_TYPE.FILE_OPERATION,
      eventCategory: EVENT_CATEGORY.FILE
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.invalid_file_access) {
      return null
    }
    // args = [view, options?, callback?]
    const args = context.arguments
    if (!args || typeof args[0] !== 'string') {
      return null
    }
    return [args[0]]
  }
}

// Route registration tracking — no security event generated.
class ExpressRouteSubscriber extends ChannelSubscriber {
  constructor() {
    super({ packageName: 'express', channelName: 'nr_route' })
  }

  extractArgs() {
    return null
  }
}

module.exports = { ExpressRenderSubscriber, ExpressRouteSubscriber }
