/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

'use strict'

const dc = require('node:diagnostics_channel')
const { tracingChannel } = dc
const requestManager = require('../core/request-manager')
const secUtils = require('../core/sec-utils')
const securityMetaData = require('../core/security-metadata')
const API = require('../../nr-security-api')
const logger = API.getLogger()

const PREFIX = 'orchestrion:'

/**
 * Base class for a single-channel security subscriber.
 *
 * For orchestrion-based channels pass packageName and channelName — the full
 * channel id is constructed as `orchestrion:{packageName}:{channelName}`,
 * mirroring the convention in node-newrelic/lib/subscribers/base.js:
 *
 *   constructor() {
 *     super({ packageName: 'mysql', channelName: 'nr_connectionQuery',
 *             eventType: EVENT_TYPE.DB_COMMAND,
 *             eventCategory: EVENT_CATEGORY.MYSQL })
 *   }
 *
 * For libraries that publish their own native dc channels (undici, fastify)
 * pass `name` directly and set `native: true` — the subscriber receives the
 * raw event message rather than an orchestrion context object:
 *
 *   constructor() {
 *     super({ name: 'undici:request:create', native: true, ... })
 *   }
 *
 * Subclasses override extractArgs(context) to pull security-relevant data out
 * of the context. Return null/undefined to skip event generation. Override
 * _handle(context) when the subscriber needs to do something other than emit a
 * standard security event (e.g. registering a framework-native hook).
 */
class ChannelSubscriber {
  constructor({ packageName, channelName, name, eventType = null, eventCategory = null, native = false }) {
    this._name = name || `${PREFIX}${packageName}:${channelName}`
    this._eventType = eventType
    this._eventCategory = eventCategory
    this._native = native
    this._handler = (ctx) => this._handle(ctx)
  }

  subscribe() {
    try {
      if (this._native) {
        dc.subscribe(this._name, this._handler)
      } else {
        tracingChannel(this._name).start.subscribe(this._handler)
      }
      logger.debug('Security subscriber registered for channel: %s', this._name)
    } catch (err) {
      logger.warn('Failed to subscribe to channel %s: %s', this._name, err.message)
    }
  }

  unsubscribe() {
    try {
      if (this._native) {
        dc.unsubscribe(this._name, this._handler)
      } else {
        tracingChannel(this._name).start.unsubscribe(this._handler)
      }
    } catch (err) {
      logger.debug('Failed to unsubscribe from channel %s: %s', this._name, err.message)
    }
  }

  /**
   * Override in subclasses to extract interceptedArgs from the channel context.
   * Return null to skip security event generation for this invocation.
   */
  extractArgs(context) { // eslint-disable-line no-unused-vars
    return null
  }

  _handle(context) {
    if (!this._eventType) {
      return
    }
    try {
      const request = requestManager.getRequestFromCurrentTransaction()
      if (!request) {
        return
      }

      const interceptedArgs = this.extractArgs(context)
      if (!interceptedArgs) {
        return
      }

      const traceObject = secUtils.getTraceObjectFallback(request)
      const secMetadata = securityMetaData.getSecurityMetaData(
        request,
        interceptedArgs,
        traceObject,
        secUtils.getExecutionId(),
        this._eventType,
        this._eventCategory
      )
      API.sendEvent(API.generateSecEvent(secMetadata))
    } catch (err) {
      logger.debug('Error in security channel subscriber (%s): %s', this._name, err.message)
    }
  }
}

module.exports = ChannelSubscriber
