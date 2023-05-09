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
    const thirtyDaysAdvance = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 31
    );

    const tripDetails = new TripDetails(
      "Paris",
      "Marseille",
      thirtyDaysAdvance
    );
    const passengers = [new Passenger(30, [])];
    const tripRequest = new TripRequest(tripDetails, passengers);

    const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
    const expectedPrice = Math.round(currentPrice * 0.8);
    const actualPrice = await trainTicketEstimator.estimate(tripRequest);
    expect(expectedPrice).toEqual(actualPrice);
  });
});
