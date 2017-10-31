var mongoose = require('mongoose');
var async = require("async");

mongoose.connect('mongodb://localhost/mydb');

var countries = require('./data/countries');
var states = require('./data/states');
var cities = require('./data/cities');

var Schema = mongoose.Schema;

const citySchema = new Schema({
  _id: {
    type: Number
  },
  name: {
    type: String
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: 'State'
  }
});

const stateSchema = new Schema({
  _id: {
    type: Number
  },
  name: {
    type: String
  },
  cities: [
    {
      type: Schema.Types.ObjectId,
      ref: 'City'
    }
  ],
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country'
  }
});

const countrySchema = new Schema({
  _id: {
    type: Number
  },
  sortname: {
    type: String
  },
  name: {
    type: String
  },
  states: [
    {
      type: Schema.Types.ObjectId,
      ref: 'State'
    }
  ]
});

var Country = mongoose.model('Country', countrySchema);
var State = mongoose.model('State', stateSchema);
var City = mongoose.model('City', citySchema);

async function _saveStates() {
  var countries = await Country.find();

  async.each(countries, function iteratee(country, nextCountry) {

    console.log("==========Started " + country.name + "==============")

    async.each(states, function iteratee(state, next) {

      if (state.country_id == (country.id + '')) {
        var st = new State({_id: state.id, name: state.name, country: country})

        st.save(function (err, res) {
          country
            .states
            .push(st)
          country.save(function (er, resp) {
            next()
          })
        })

      } else {
        next();
      }

    }, function () {
      console.log("All States Done")
      console.log("========== Ended " + country.name + "==============")
    })

  }, function () {
    console.log("All Countries Done")
  })
}

async function _saveCities() {
  var states = await State.find()

  async.each(states, function iteratee(state, nextState) {

    console.log("==========Started " + state.name + "==============")

    async.each(cities, function iteratee(city, next) {

      if (city.state_id == (state.id + '')) {
        var ct = new City({_id: city.id, name: city.name, state: state})

        ct.save(function (err, res) {
          state
            .cities
            .push(ct)
          state.save(function (er, resp) {
            next()
          })
        })

      } else {
        next();
      }

    }, function () {
      console.log("All Cities Done")
      console.log("========== Ended " + state.name + "==============")
    })

  }, function () {
    console.log("All States Done")
  })
}

async function _saveCountries() {
  async
    .each(countries, function iteratee(country, next) {
      var cn = new Country({_id: country.id, sortname: country.sortname, name: country.name})

      cn.save(function (err, res) {
        next();
      })
    }, function () {
      console.log("================= All Countries loaded ===================");
    })
}

module.exports = {
  saveStates: function () {
    _saveStates();
  },
  saveCities: function () {
    _saveCities();
  },
  saveCountries: function () {
    _saveCountries()
  },
  Country: Country,
  State: State,
  City: City
}