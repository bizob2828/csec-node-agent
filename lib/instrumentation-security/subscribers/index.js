/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const API = require('../../nr-security-api')
const logger = API.getLogger()

const { MysqlConnectionQuerySubscriber } = require('./lib/mysql')
const { Mysql2ConnectionQuerySubscriber, Mysql2ConnectionExecuteSubscriber } = require('./lib/mysql2')
const { PgQuerySubscriber, PgNativeQuerySubscriber } = require('./lib/pg')
const { UndiciRequestCreateSubscriber } = require('./lib/undici')
const { MongodbCollectionSubscriber, MongodbCursorSubscriber, MongodbBulkSubscriber } = require('./lib/mongodb')
const { ExpressRenderSubscriber, ExpressRouteSubscriber } = require('./lib/express')
const { FastifyInitializationSubscriber } = require('./lib/fastify')
const { HapiRouteSubscriber, HapiExtSubscriber } = require('./lib/hapi')
const { GrpcResolvingSubscriber, GrpcStreamSubscriber } = require('./lib/grpc')
const { NestjsUnknownErrorSubscriber } = require('./lib/nestjs')

const subscribers = [
  new MysqlConnectionQuerySubscriber(),
  new Mysql2ConnectionQuerySubscriber(),
  new Mysql2ConnectionExecuteSubscriber(),
  new PgQuerySubscriber(),
  new PgNativeQuerySubscriber(),
  new UndiciRequestCreateSubscriber(),
  new MongodbCollectionSubscriber(),
  new MongodbCursorSubscriber(),
  new MongodbBulkSubscriber(),
  new ExpressRenderSubscriber(),
  new ExpressRouteSubscriber(),
  new FastifyInitializationSubscriber(),
  new HapiRouteSubscriber(),
  new HapiExtSubscriber(),
  new GrpcResolvingSubscriber(),
  new GrpcStreamSubscriber(),
  new NestjsUnknownErrorSubscriber()
]

function register() {
  logger.info('Registering security channel subscribers for overlapping instrumentation libraries')
  for (const subscriber of subscribers) {
    subscriber.subscribe()
  }
}

function deregister() {
  for (const subscriber of subscribers) {
    subscriber.unsubscribe()
  }
}

module.exports = { register, deregister }
