const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');

const resolvers = {
    Query: {
        getFlight: async (_, { id }) => {
            return await Flight.findOne({ id }).populate('passengers');
        },
        getPassenger: async (_, { id }) => {
            return await Passenger.findOne({ id }).populate('flights');
        },
    },
    Mutation: {
        createFlight: async (_, { id, origin, destination, departure, arrival }) => {
            const flight = new Flight({ id, origin, destination, departure, arrival });
            return await flight.save();
        },
        createPassenger: async (_, { id, firstName, lastName }) => {
            const passenger = new Passenger({ id, firstName, lastName });
            return await passenger.save();
        },
    },
};

module.exports = resolvers;

const query = `
  query GetFlight($id: String!) {
    getFlight(id: $id) {
      id
      origin
      destination
      departure
      arrival
      passengers {
        id
        firstName
        lastName
      }
    }
  }
`;