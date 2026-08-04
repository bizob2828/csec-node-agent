/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: New Relic Software License v1.0
 */

const API = require('../nr-security-api');
const newrelic = API.newrelic;
const logger = API.getLogger();

logger.info("Started instrumentation using shimmer module");

// Libraries that overlap with node-newrelic's own instrumentation are registered
// through the subscriber system, which either taps into newrelic's orchestrion
// diagnostics_channel events (mysql, mysql2, pg) or delegates to shimmer via the
// same unified interface (mongodb, express, fastify, hapi, grpc, nestjs, undici).
require('./subscribers').register();

newrelic.instrument({
  moduleName: 'child_process',
  isEsm: true,
  onRequire: require('./hooks/native/nr-childProcess'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})
newrelic.instrument({
  moduleName: 'http',
  isEsm: true,
  onRequire: require('./hooks/http/nr-http'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'https',
  isEsm: true,
  onRequire: require('./hooks/http/nr-http'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'fs',
  isEsm: true,
  onRequire: require('./hooks/fs/nr-fs'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'ldapjs',
  isEsm: true,
  onRequire: require('./hooks/ldap/nr-ldap'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'ldapts',
  isEsm: true,
  onRequire: require('./hooks/ldap/nr-ldap'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})


newrelic.instrument({
  moduleName: 'xpath',
  isEsm: true,
  onRequire: require('./hooks/xpath/nr-xpath'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})
newrelic.instrument({
  moduleName: 'xpath.js',
  isEsm: true,
  onRequire: require('./hooks/xpath/nr-xpath'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrumentWebframework({
  moduleName: 'restify',
  isEsm: true,
  onRequire: require('./hooks/restify/nr-restify'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrumentWebframework({
  moduleName: '@koa/router',
  isEsm: true,
  onRequire: require('./hooks/koa/@koa/nr-@koa-router'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrumentWebframework({
  moduleName: 'koa-router',
  isEsm: true,
  onRequire: require('./hooks/koa/@koa/nr-@koa-router'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrumentWebframework({
  moduleName: 'director',
  isEsm: true,
  onRequire: require('./hooks/director/nr-director'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'graphql/execution/execute',
  isEsm: true,
  onRequire: require('./hooks/graphql/nr-graphql'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'crypto',
  onRequire: require('./hooks/crypto/nr-crypto'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrumentWebframework({
  moduleName: 'next/dist/server/next-server',
  isEsm: true,
  onRequire: require('./hooks/nextjs/nr-next'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})

newrelic.instrument({
  moduleName: 'vm',
  isEsm: true,
  onRequire: require('./hooks/native/nr-vm'),
  onError: function intrumentErrorHandler(err) {
    logger.error(err.message, err.stack)
  }
})