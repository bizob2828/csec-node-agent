/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const { EVENT_TYPE, EVENT_CATEGORY } = require('../../core/event-constants')
const API = require('../../../nr-security-api')

function extractPgArgs(args) {
  if (!args || !args[0]) {
    return null
  }

  const sqlArgs = []
  const first = args[0]

  if (typeof first === 'object') {
    const ctorName = first.constructor && first.constructor.name
    if (ctorName === 'Cursor' || (first.text && first.values)) {
      sqlArgs.push(first.text)
      if (Array.isArray(first.values)) {
        sqlArgs.push(first.values)
      }
    } else if (ctorName === 'QueryStream' && first.cursor) {
      sqlArgs.push(first.cursor.text)
      if (Array.isArray(first.cursor.values)) {
        sqlArgs.push(first.cursor.values)
      }
    } else if (first.text) {
      sqlArgs.push(first.text)
    }
  } else {
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] !== 'function') {
        sqlArgs.push(args[i])
      }
    }
  }

  return sqlArgs.length > 0 ? sqlArgs : null
}

class PgQuerySubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'pg',
      channelName: 'nr_query',
      eventType: EVENT_TYPE.DB_COMMAND,
      eventCategory: EVENT_CATEGORY.POSTGRES
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.sql_injection) {
      return null
    }
    return extractPgArgs(context.arguments)
  }
}

class PgNativeQuerySubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'pg',
      channelName: 'nr_nativeQuery',
      eventType: EVENT_TYPE.DB_COMMAND,
      eventCategory: EVENT_CATEGORY.POSTGRES
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.sql_injection) {
      return null
    }
    return extractPgArgs(context.arguments)
  }
}

module.exports = { PgQuerySubscriber, PgNativeQuerySubscriber }
