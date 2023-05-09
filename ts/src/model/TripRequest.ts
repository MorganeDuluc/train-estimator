import { Passenger } from "./Passenger";
import { TripDetails } from "./TripDetails";

export class TripRequest {
  constructor(
    readonly details: TripDetails,
    readonly passengers: Passenger[]
  ) {}
}
