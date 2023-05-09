import { DiscountCard } from "./DiscountCard";

export class Passenger {
  constructor(readonly age: number, readonly discounts: DiscountCard[]) {}
}
