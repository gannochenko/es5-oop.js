(function(){
  "use strict";

  window.OOP = function(){};

  OOP.isPlainObject = function(item)
  {
    return typeof item == 'object' && typeof item.constructor == 'function';
  };

  OOP.isString = function(item)
  {
    // scalar type or class instance
    return typeof item == 'string' && item instanceof String;
  };

  OOP.merge = function()
  {
    var arg = Array.prototype.slice.call(arguments);
    if(arg.length < 2)
    {
      return {};
    }

    var result = arg.shift();
    for (var i = 0; i < arg.length; i++)
    {
      for (var k in arg[i])
      {
        if(arg[i].hasOwnProperty(k))
        {
          if (typeof arg[i] == "undefined" || arg[i] == null)
          {
            continue;
          }

          if (this.isPlainObject(arg[i][k]) && this.isPlainObject(result[k]))
          {
            merge(result[k], arg[i][k]);
          }
          else
          {
            result[k] = this.isPlainObject(arg[i][k]) ? this.clone(arg[i][k]) : arg[i][k];
          }
        }
      }
    }

    return result;
  };

  OOP.isArray = function(item)
  {
    return item && Object.prototype.toString.call(item) == '[object Array]';
  };

  OOP.clone = function(obj)
  {
    var objClone, k, m;

    if(obj === null)
    {
      return null;
    }

    if(typeof obj == 'object')
    {
      if(isArray(obj))
      {
        objClone = [];
        for(k = 0, m = obj.length; k < m; k++)
        {
          objClone[k] = obj[k];
        }
      }
      else
      {
        objClone =  {};
        if(obj.constructor)
        {
          objClone = new obj.constructor();
        }

        for(k in obj)
        {
          objClone[k] = obj[k];
        }
      }

    }
    else
    {
      objClone = obj;
    }

    return objClone;
  };

  OOP.inherit = function(proto){
    var f = function(){};
    f.prototype = proto;
    return new f;
  };

  OOP.extendClass = function(child, parent){
    // 1. create empty object with __proto__ = parent.prototype
    // and assign it to the child.prototype (a polyfill for Object.create())
    child.prototype = this.inherit(parent.prototype);
    // 2. fix up broken constructor
    // normally child.prototype.constructor should point to child, but by replacing prototype at step 1 we
    // broke this agreement!
    child.prototype.constructor = child;
    // 3. save pointer to the superclass object, to be able to call parent non-directly, but through child.super
    child.super = parent.prototype;
  };
  OOP.prototype = {

    callParent: function(className, name, args)
    {
      var proto = className.super;
      if(proto)
      {
        return proto[name].apply(this, args);
      }
    },

    callConstruct: function(className)
    {
      this.callParent(className, 'construct');
    },

    runConstructorChain: function(owner)
    {
      if(typeof owner.super == 'object')
      {
        owner.super.constructor.apply(this, [null, true]);
      }
    },

    option: function(name, value)
    {
      if(typeof value != 'undefined')
      {
        this.opts[name] = value;
      }
      else
      {
        return typeof this.opts[name] != 'undefined' ? this.opts[name] : false;
      }
    },

    initialized: function()
    {
      return this.sys.initialized;
    }
  };
  OOP.extend = function(parameters){

    // here "this" refers to the class constructor function

    parameters = parameters || {};

    var child = function(opts, middle){

      // here "this" refers to the object instance to be created
      this.runConstructorChain(child); // apply all parent constructors

      this.opts = this.opts || {};
      OOP.merge(this.opts, parameters.options || {});

      this.sys = this.sys || {
        initialized: false
      };
      OOP.merge(this.sys, parameters.sys || {});

      // in the last constructor we run this
      if(!middle)
      {
        // final version of opts array should be ready before "post-constructors" are called
        OOP.merge(this.opts, opts || {});

        this.construct(); // run the top-level constructor
        this.sys.initialized = true; // todo: fire event here?
      }
    };

    child.extend = window.OOP.extend; // just a short-cut to extend() function
    OOP.extendClass(child, this);

    parameters.methods = parameters.methods || {};

    var k;

    for(k in parameters.methods)
    {
      if(parameters.methods.hasOwnProperty(k))
      {
        child.prototype[k] = parameters.methods[k];
      }
    }

    if(typeof parameters.methods.construct != 'function') // "virtual" constructor to prevent constructor chain break
    {
      var parent = this;
      child.prototype.construct = function(){
        parent.prototype.construct.call(this);
      };
    }
    if(typeof parameters.methods.destruct != 'function')
    {
      child.prototype.destruct = function(){};
    }

    return child;
  };

}).call(this);