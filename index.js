;(function(){

  'use strict';

  /**
   * Core
   * Use and initialize objects with init function property.
   *
   * @copyright 2013 David Rojas
   * @license MIT
   */

  /*
   * Module dependencies
   */

  var Emitter;

  try {
    Emitter = require('events').EventEmitter;
  } catch (err) {
    Emitter = require('emitter');
  }

  /**
   * @constructor Core
   */

  function Core(id){
    this.id = id || (Math.floor(Math.random() * 256)).toString(16);
    this.modules = {};
    this.status = 'stopped';
  }

  /*
   * Inherit from `EventEmitter.prototype` or `Emitter.prototype`.
   */

  Core.prototype = Emitter.prototype;

  /*
   * PubSub facade.
   */

  Core.prototype.public = new Emitter();
  Core.prototype.publish = function(){
    this.public.emit.apply(this.public, arguments);
    return this;
  };
  Core.prototype.subscribe = function(){
    this.public.on.apply(this.public, arguments);
    return this;
  };
  Core.prototype.subscribeOnce = function(){
    this.public.once.apply(this.public, arguments);
    return this;
  };
  Core.prototype.unsubscribe = function(){
    this.public.off.apply(this.public, arguments);
    return this;
  };

  /**
   * @method init
   * @description
   *   Call the init method on each module.
   *
   * @return {Core} this for chaining
   * @api public
   */

  Core.prototype.init = function(){
    if (this.status === 'stopped') {
      this.emit('pre init');
      var modules = this.modules;
      for (var module in modules) {
        var initFn = modules[module].init;
        if (modules.hasOwnProperty(module) && 'function' === typeof initFn) {
          var mod = modules[module];
          mod.init();
        }
      }
      this.status = 'running';
      this.emit('init');
    }
    return this;
  };

  /**
   * @method use
   * @description
   *   Add a `module` to `this.modules`.
   *
   * @return {Core} this for chaining
   * @api public
   */

  Core.prototype.use = function(module){
    var args = [].slice.call(arguments);
    if (args.length > 1) {
      module = args[1];
      module.id = args[0];
    }
    this.modules[module.id] = module;
    return this;
  };

  /**
   * @method create
   * @description
   *   Create a `Core`.
   *
   * @return {Core} new `Core`
   * @api public
   */

  Core.create = function(id){
    return new Core(id);
  };

  /*
   * Expose `Core`
   */

  module.exports = Core;
})();
