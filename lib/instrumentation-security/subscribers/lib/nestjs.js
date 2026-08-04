/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')

// NestJS itself does not generate injection-type security events — those come
// from the database/HTTP subscribers. This subscriber tracks unhandled exceptions
// for completeness but does not call API.sendEvent().
class NestjsUnknownErrorSubscriber extends ChannelSubscriber {
  constructor() {
    super({ packageName: '@nestjs/core', channelName: 'nr_unknown_error' })
  }

  extractArgs() {
    return null
  }
}

module.exports = { NestjsUnknownErrorSubscriber }
