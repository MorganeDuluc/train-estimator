import { TripRequest } from "./model/trip.request";
import { TrainTicketEstimator } from "./train-estimator";

describe("estimation train ticket according to the age", function () {
  // mock call SNCF to get the prices
  let trainTicketEstimator: TrainTicketEstimator;

  beforeEach(() => {
    trainTicketEstimator = new TrainTicketEstimator();
  });

  class TrainTicketEstimatorOverload extends TrainTicketEstimator {
    protected async getSncfPrice(trainDetails: TripRequest): Promise<number> {
      return Promise.resolve(10);
    }
  }

  it("should check if the age is less than 4, if that the case the price's travel is 9€ (with overload)", async function () {
    const overload = new TrainTicketEstimatorOverload();

    const tripDetails = {
      from: "Bordeaux",
      to: "Biarritz",
      when: new Date(),
    };

    const passengerDetails = [
      {
        age: 3,
        discounts: [],
      },
    ];

    let trainDetails = new TripRequest(tripDetails, passengerDetails);

    const trainEstimatorPrice = await overload.estimate(trainDetails);
    expect(trainEstimatorPrice).toEqual(9);
  });

  it("should check if the age is less or egal to 17, if that the case there is 40% of reduction on the basic price (sncf price + scnf price * 0.6) - (with overload)", async function () {
    const overload = new TrainTicketEstimatorOverload();

    const tripDetails = {
      from: "Bordeaux",
      to: "Biarritz",
      when: new Date(),
    };

    const passengerDetails = [
      {
        age: 17,
        discounts: [],
      },
    ];

    let trainDetails = new TripRequest(tripDetails, passengerDetails);

    const trainEstimatorPrice = await overload.estimate(trainDetails);
    expect(trainEstimatorPrice).toEqual(16);
  });

  it("should check if the age is more or egal to 70, if that the case there is 20% of reduction on the basic price (sncf price + scnf price * 0.8) - (with overload)", async function () {
    const overload = new TrainTicketEstimatorOverload();

    const tripDetails = {
      from: "Bordeaux",
      to: "Biarritz",
      when: new Date(),
    };

    const passengerDetails = [
      {
        age: 70,
        discounts: [],
      },
    ];

    let trainDetails = new TripRequest(tripDetails, passengerDetails);

    const trainEstimatorPrice = await overload.estimate(trainDetails);
    expect(trainEstimatorPrice).toEqual(18);
  });

  it("should check if the age doesn't enter in the other tests (sncf price + scnf price * 1.2) - (with overload)", async function () {
    const overload = new TrainTicketEstimatorOverload();

    const tripDetails = {
      from: "Bordeaux",
      to: "Biarritz",
      when: new Date(),
    };

    const passengerDetails = [
      {
        age: 25,
        discounts: [],
      },
    ];

    let trainDetails = new TripRequest(tripDetails, passengerDetails);

    const trainEstimatorPrice = await overload.estimate(trainDetails);
    expect(trainEstimatorPrice).toEqual(22);
  });
});

describe("PRICES ACCORDING TO THE BOOKING DATE CHECK", function () {
  // should check if the the booking date (current date) is 5 days before the starting date
  // --> if that the case multiple by two the ticket price
  // --> this rules don't apply to the fix price's ticket (kids egal or under to three (9€) and possesors of the TrainStroke discound card (1€))
});

// *** PRICES ACCORDING TO DISCOUNT CARD ***
// should check if the passenger have no discound card
// should check if he has the TrainStroke staff
// --> if that the case all the ticket are 1€
// should check if he has the Senior card
// --> if that the case check if the age is more than 70
// --> if that the case 20% of reduction again
// should check if the passengers have couple card
// --> check if the age of the two passengers is more than 18 (adult people)
// --> if that the case 20% of reduction for each ticket's passenger
// --> if that the case check if each passenger have a couple card
// ----> if that the case only one couple card can work
// should check if the passenger has a mi-couple card
// --> if that the case check if at least the age of one of the two travellers is more or egal to 18
// ----> if that the case 10% of the reduction for each passenger

// All the discound are cumulative except if the TrainStroke discound card is use !

// Attention partir de la date de commande et pas de la date de départ

// });
