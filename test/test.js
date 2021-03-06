'use strict';

var Core;

try {
  Core = require('core');
  console.log('\n  requiring Core from component');
} catch(e){
  Core = require('../');
  console.log('\n  requiring Core from filesystem');
  var sinon = require('sinon');
}

describe('Core', function(){
  it('should have private events', function(){
    var core1 = Core.create();
    var core2 = Core.create();
    var data1 = {data: 'mock1'};
    var data2 = {data: 'mock2'};
    var listener = sinon.spy();
    core1.on('event', listener);
    listener.callCount.should.equal(0);
    core1.emit('event', data1);
    listener.callCount.should.equal(1);
    core2.emit('event', data2);
    listener.callCount.should.equal(1);
    listener.calledWithExactly(data1).should.be.true;
  });
  describe('#create()', function(){
    it('should return a stopped Core instance', function(){
      var core = Core.create();
      (core instanceof Core).should.equal(true);
      (core.status).should.equal('stopped');
    });
  });
  describe('#prototype', function(){
    describe('#public', function(){
      it('should expose a publish/subscribe channel to all instances of Core',
      function(){
        var core1 = Core.create();
        var core2 = Core.create();
        var data1 = {data: 'mock1'};
        var data2 = {data: 'mock2'};
        var listener = sinon.spy();
        core1.subscribe('event', listener);
        core1.publish('event', data2);
        core2.publish('event', data1);
        listener.callCount.should.equal(2);
        listener.calledWithExactly(data1).should.be.true;
        listener.calledWithExactly(data2).should.be.true;
      });
    });
    describe('#use()', function(){
      it('should add a module to #modules', function(){
        var core = Core.create();
        var c1 = Core.create('c1');
        core.use(c1);
        core.modules.should.have.property('c1').equal(c1);
      });
    });
    describe('#init()', function(){
      it('should propagate through #modules (dependencies)', function(){
        var c1 = Core.create();
        var c2 = Core.create();
        var c3 = Core.create();
        var core = Core.create('core');
        core.use(c1);
        c1.use(c2);
        c2.use(c3);
        core.init();
        core.status.should.equal('running');
        c1.status.should.equal('running');
        c2.status.should.equal('running');
        c3.status.should.equal('running');
      });
      it('should be executed from dependencies to parents', function(done){
        var app = Core.create('myapp');
        var module = Core.create('mymod');
        var history = [];
        app.on('init', function(){
          history.push(this.id);
        });
        module.on('init', function(){
          history.push(this.id);
        });
        var loop = setInterval(function(){
          if (history.length === 2) {
            clearInterval(loop);
            history[0].should.equal('mymod');
            history[1].should.equal('myapp');
            done();
          }
        }, 1);
        app.use(module);
        app.init();
      });
      var NUM_DIM = 100;
      var MAX_TIME = 0.5 * NUM_DIM;
      it('should propagate in less than ' + MAX_TIME + 'ms through a ' + NUM_DIM
      + 'x' + NUM_DIM + ' structure', function(done){
        var core = Core.create('core');
        var i = NUM_DIM;
        while (i--){
          core.use(Core.create());
        }
        for (var module in core.modules) {
          if (core.modules.hasOwnProperty(module)) {
            var i = NUM_DIM;
            while (i--){
              core.modules[module].use(Core.create());
            }
          }
        }
        var time = {
          preInit: null,
          init: null
        };
        core.on('pre init', function(){
          time.preInit = Date.now();
        });
        core.on('init', function(){
          time.init = Date.now();
          var lapse = (time.init - time.preInit)
          console.log('lapse:', lapse);
          lapse.should.be.lessThan(MAX_TIME);
          done();
        });
        core.init();
      });
    });
  });
});
