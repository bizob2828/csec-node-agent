/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const ChannelSubscriber = require('../channel-base')
const { EVENT_TYPE, EVENT_CATEGORY } = require('../../core/event-constants')
const API = require('../../../nr-security-api')

// LIMITATION: NR's mongodb orchestrion channels fire at Class construction
// time (Collection, AbstractCursor, BulkOperationBase), not at individual CRUD
// operation execution. Individual find/insert/update/delete calls are wrapped
// silently by NR without publishing additional channels.
//
// Query payloads are NOT available — NoSQL injection detection (which requires
// the query document) cannot be performed from these channels. These subscribers
// capture collection/cursor access events for audit logging only.

class MongodbCollectionSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'mongodb',
      channelName: 'nr_collection',
      eventType: EVENT_TYPE.NOSQL_DB_COMMAND,
      eventCategory: EVENT_CATEGORY.MONGO
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.nosql_injection) {
      return null
    }
    // args = [dbInstance, collectionName]
    const args = context.arguments
    if (!args) return null
    return { collection: args[1], db: args[0] && args[0].databaseName, operation: 'access' }
  }
}

class MongodbCursorSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'mongodb',
      channelName: 'nr_cursor',
      eventType: EVENT_TYPE.NOSQL_DB_COMMAND,
      eventCategory: EVENT_CATEGORY.MONGO
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.nosql_injection) {
      return null
    }
    // args = [mongoClient, dbNamespace]  dbNamespace = { collection, db }
    const args = context.arguments
    if (!args) return null
    return { collection: args[1] && args[1].collection, db: args[1] && args[1].db, operation: 'cursor' }
  }
}

class MongodbBulkSubscriber extends ChannelSubscriber {
  constructor() {
    super({
      packageName: 'mongodb',
      channelName: 'nr_bulk',
      eventType: EVENT_TYPE.NOSQL_DB_COMMAND,
      eventCategory: EVENT_CATEGORY.MONGO
    })
  }

  extractArgs(context) {
    if (API.getNRAgent() && API.getNRAgent().config.security.exclude_from_iast_scan.iast_detection_category.nosql_injection) {
      return null
    }
    // args = [collection]
    const args = context.arguments
    if (!args) return null
    return { collection: args[0] && args[0].collectionName, operation: 'bulk' }
  }
}

module.exports = { MongodbCollectionSubscriber, MongodbCursorSubscriber, MongodbBulkSubscriber }
