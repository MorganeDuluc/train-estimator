import { TrainTicketEstimator } from "../train-estimator";
import { Passenger, TripDetails, TripRequest } from "../model";

describe("PRICES ACCORDING TO THE BOOKING DATE CHECK", () => {
  class TrainTicketEstimatorOverload extends TrainTicketEstimator {
    public getSncfPrice(trainDetails: TripRequest): Promise<number> {
      return Promise.resolve(6);
    }
  }

  let trainTicketEstimator: TrainTicketEstimatorOverload;

  beforeEach(() => {
    trainTicketEstimator = new TrainTicketEstimatorOverload();
  });

  it("should apply a 20% discount if booking is made 30 days or more in advance", async () => {
    const date = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 31
    );

    const tripDetails = new TripDetails("Paris", "Marseille", date);
    const passengers = [new Passenger(30, [])];
    const tripRequest = new TripRequest(tripDetails, passengers);

    const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
    const expectedPrice = Math.round(currentPrice * 0.8);
    const actualPrice = await trainTicketEstimator.estimate(tripRequest);
    expect(expectedPrice).toEqual(actualPrice);
  });

  it("should not apply a discount if booking is made less than 30 days in advance", async () => {
    const date = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );

    const tripDetails = new TripDetails("Paris", "Marseille", date);
    const passengers = [new Passenger(30, [])];
    const tripRequest = new TripRequest(tripDetails, passengers);

    const expectedPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
    const actualPrice = await trainTicketEstimator.estimate(tripRequest);
    expect(expectedPrice).not.toEqual(actualPrice);
  });

  it("should increase price by 2% per day for 25 days", async () => {
    const date = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 29
    );

    const tripDetails = new TripDetails("Paris", "Marseille", date);
    const passengers = [new Passenger(30, [])];
    const tripRequest = new TripRequest(tripDetails, passengers);

    const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
    const expectedPrice = currentPrice * 1.02;
    const actualPrice = await trainTicketEstimator.estimate(tripRequest);
    expect(expectedPrice).toBeCloseTo(actualPrice);
  });

  it("should check if the the booking date (current date) is 5 days before the starting date", async () => {
    const date = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 3
    );

    console.log({ date });

    const tripDetails = new TripDetails("Paris", "Marseille", date);
    const passengers = [new Passenger(25, [])];
    const tripRequest = new TripRequest(tripDetails, passengers);

    const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
    const expectedPrice = currentPrice * 2 + 1.2;
    const actualPrice = await trainTicketEstimator.estimate(tripRequest);
    expect(expectedPrice).toEqual(actualPrice);
  });
});
