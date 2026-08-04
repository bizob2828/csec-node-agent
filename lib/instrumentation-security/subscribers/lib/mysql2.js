/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const { EVENT_TYPE, EVENT_CATEGORY } = require('../../core/event-constants')
const API = require('../../../nr-security-api')
const logger = API.getLogger()

function extractMysql2Args(args) {
  if (!args || !args[0]) {
    return null
  }

  let rawQuery = ''
  let param = []

  if (typeof args[0] === 'string') {
    rawQuery = args[0]
  } else {
    rawQuery = args[0].sql || ''
    try {
      if (args[0].values && typeof args[0].values === 'object') {
        param = Object.values(args[0].values)
      }
    } catch (err) {
      logger.warn('Could not extract mysql2 params: %s', err.message)
    }
  }

  if (Array.isArray(args[1])) {
    param = args[1]
  } else if (args[1] && typeof args[1] === 'object') {
    param = Object.values(args[1])
  }

  param = param.map((p) => (typeof p !== 'string' ? String(p) : p))

  return { rawQuery, param }
}

class Mysql2ConnectionQuerySubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'mysql2',
      channelName: 'nr_connectionQuery',
      eventType: EVENT_TYPE.DB_COMMAND,
      eventCategory: EVENT_CATEGORY.MYSQL
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.sql_injection) {
      return null
    }
    return extractMysql2Args(context.arguments)
  }
}

class Mysql2ConnectionExecuteSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'mysql2',
      channelName: 'nr_connectionExecute',
      eventType: EVENT_TYPE.DB_COMMAND,
      eventCategory: EVENT_CATEGORY.MYSQL
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.sql_injection) {
      return null
    }
    return extractMysql2Args(context.arguments)
  }
}

module.exports = { Mysql2ConnectionQuerySubscriber, Mysql2ConnectionExecuteSubscriber }
