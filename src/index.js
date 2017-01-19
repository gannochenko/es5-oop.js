(function(){
	"use strict";

	window.OOP = function(){};

	OOP.isPlainObject = function(item)
	{
		return typeof item == 'object' && typeof item.constructor == 'function';
	};

	OOP.inherit = function(proto, properties){

		var f = function(){};
		f.prototype = proto;

		return OOP.attachProperties(properties, new f);
	};

	OOP.attachProperties = function(from, to)
	{
		if(OOP.isPlainObject(from))
		{
			for(var k in from)
			{
				if(from.hasOwnProperty(k))
				{
					to[k] = from[k];
				}
			}
		}

		return to;
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

		runParentConstructor: function(owner)
		{
			if(owner.super)
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
			return this.sys && this.sys.initialized;
		}
	};
	OOP.extend = function(parameters){

		// here "this" refers to the class constructor function

		parameters = parameters || {};

		var child = function(opts, middle){

			// here "this" refers to the object instance to be created
			this.runParentConstructor(child); // apply all parent constructors

			if(!middle) // in the last constructor we run this
			{
				// final version of opts array should be ready before "post-constructors" are called
				this.opts = OOP.inherit(child.prototype.opts, opts || {});

				this.construct(); // run the top-level constructor

				this.sys = {
					initialized: true // todo: fire event here?
				};
			}
		};

		OOP.extendClass(child, this);
		child.extend = OOP.extend; // just a short-cut to extend() function

		var methods = parameters.methods || {};

		child.prototype.opts = OOP.inherit(child.super.opts || {}, parameters.options || {});
		OOP.attachProperties(methods, child.prototype);

		if(typeof methods.construct != 'function') // "virtual" constructor to prevent constructor chain break
		{
			var parent = this;
			child.prototype.construct = function(){
				parent.prototype.construct.call(this);
			};
		}
		if(typeof methods.destruct != 'function')
		{
			child.prototype.destruct = function(){};
		}

		return child;
	};

}).call(this);
