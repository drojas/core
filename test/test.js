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
    var data = {data: 'mock'};
    var listener = sinon.spy();
    core1.on('event', listener);
    core2.emit('event', data);
    core1.emit('event', data);
    listener.calledOnce.should.be.true;
    listener.calledWithExactly(data).should.be.true;
  });
  
  describe('#public', function(){
    it('should expose a publish/subscribe channel to all instances of Core',
    function(){
      var core1 = Core.create();
      var core2 = Core.create();
      var data = {data: 'mock'};
      var listener = sinon.spy();
      core1.subscribe('event', listener);
      core2.publish('event', data);
      listener.calledOnce.should.be.true;
      listener.calledWithExactly(data).should.be.true
    });
  });
  describe('#create()', function(){
    it('should return a stopped Core instance', function(){
      var core = Core.create();
      (core instanceof Core).should.equal(true);
      (core.status).should.equal('stopped');
    });
  });
  describe('#prototype', function(){
    describe('#init()', function(){
      it('should return a running Core instance', function(){
        var core = Core.create();
        core.init();
        (core.status).should.equal('running');
      });
      it('should fail on running instances', function(){
        var core = Core.create();
        core.init();
        core.init.should.throw();
      });
      describe('when multiple instances are initialized', function(){
        it('should emit a single `change status` event for instance', function(){
          var core = Core.create();
          var listener = sinon.spy();
          core.subscribe('change status', function(data){
            if (data.target === core) {
              listener(data);
            }
          });
          core.init();
          listener.callCount.should.equal(1);
        });
      });
    });
    describe('#stop()', function(){
      it('should return a stopped Core instance', function(){
        var core = Core.create();
        core.init();
        core.stop();
        (core.status).should.equal('stopped');
      });
      it('should fail on new instances', function(){
        var core = Core.create();
        core.stop.should.throw();
      });
      it('should fail on stopped instances', function(){
        var core = Core.create();
        core.init();
        core.stop();
        core.stop.should.throw();
      });
    });
    describe('#use()', function(){
      it('should add a module to `this.modules`', function(){
        var context = this;
        var core = new Core();
        context.Mock = function(){};
        context.Mock.prototype = Core.prototype;
        context.mock = new context.Mock();
        context.mock.publish('change status', function(event) {
          if (event.target instanceof Mock) {
            switch (event.data.success) {
              case 'running':
                console.log('initialized', event.target);
                break;
              case 'stopped':
                console.log('stopped', event.target);
                break;
            }
          }
        });
        var mock = new this.Mock();
        core.use('mock', mock);
        core.modules.should.have.property('mock').equal(mock);
      });
    });
  });
});
