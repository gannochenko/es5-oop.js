# EcmaScript 5 OOP implementation with built-in option management support

~~~~javascript
var Cow = OOP.extend({
    options: {
      name: 'untitled',
      age: 0,
      tagged: false
    },
    methods: {
      construct: function(){
        console.dir('making cow with name '+this.option('name')+' that is '+(this.option('tagged') ? '' : 'NOT')+' tagged');
      },
      say: function(){console.dir('mooo!');}
    }
});
var MadCow = Cow.extend({
    options: {
      name: 'lilly',
      age: 999
    },
    methods: {
      say: function(){console.dir('tea party!');}
    }
});
var Calf = Cow.extend({
    options: {
      age: 1
    },
    methods: {
      construct: function(){
        this.callConstruct(Calf);
        console.dir('i am a calf!');
      },
      say: function(){
        console.dir('bleat!');
      }
    }
});

var sally = new Cow({
    name: 'sally',
    age: 5,
    tagged: true
});
var lilly = new MadCow({
    name: 'lilly',
    age: 999
});
var franky = new Calf({
    name: 'franky',
    age: 3,
    tagged: true
});

sally.say();
lilly.say();
franky.say();

lilly.option('age', 7);
console.dir(sally.option('age'));
console.dir(lilly.option('age'));
console.dir(franky.option('age'));
~~~~