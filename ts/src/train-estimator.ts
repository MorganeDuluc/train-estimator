import {ApiException, DiscountCard, InvalidTripInputException, TripRequest} from "./model/trip.request";

export class TrainTicketEstimator {
    protected async getSncfPrice(trainDetails: TripRequest): Promise<number> {
        return (await(await fetch(`https://sncf.com/api/train/estimate/price?from=${trainDetails.details.from}&to=${trainDetails.details.to}&date=${trainDetails.details.when}`)).json())?.price || -1;

    }

    async estimate(trainDetails: TripRequest): Promise<number> {
        if (trainDetails.passengers.length === 0) {
            return 0;
        }

        if (trainDetails.details.from.trim().length === 0) {
            throw new InvalidTripInputException("Start city is invalid");
        }

        if (trainDetails.details.to.trim().length === 0) {
            throw new InvalidTripInputException("Destination city is invalid");
        }

        if (trainDetails.details.when < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), 0, 0, 0)) {
            throw new InvalidTripInputException("Date is invalid");
        }

        const sncfPrice = await this.getSncfPrice(trainDetails);

        if (sncfPrice === -1) {
            throw new ApiException();
        }

        const passengers = trainDetails.passengers;
        let total = 0;
        let trainEstimatorPriceByPassenger = sncfPrice;

        for (let i=0; i < passengers.length; i++) {
            if (passengers[i].age < 0) {
                throw new InvalidTripInputException("Age is invalid");
            }

            if (passengers[i].age < 1) {
                trainEstimatorPriceByPassenger = 0;
            }

            else if (passengers[i].age <= 17) {
                trainEstimatorPriceByPassenger = sncfPrice * 0.6;
            }

            else if(passengers[i].age >= 70) {
                trainEstimatorPriceByPassenger = sncfPrice * 0.8;
                if (passengers[i].discounts.includes(DiscountCard.Senior)) {
                    trainEstimatorPriceByPassenger -= sncfPrice * 0.2;
                }
            } else {
                trainEstimatorPriceByPassenger = sncfPrice * 1.2;
            }

            const date = new Date();
            if (trainDetails.details.when.getTime() >= date.setDate(date.getDate() +30)) {
                trainEstimatorPriceByPassenger -= sncfPrice * 0.2;
            } else if (trainDetails.details.when.getTime() > date.setDate(date.getDate() -30 + 5)) {
                const date1 = trainDetails.details.when;
                const date2 = new Date();
                const diff = Math.abs(date1.getTime() - date2.getTime());
                const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

                trainEstimatorPriceByPassenger += (20 - diffDays) * 0.02 * sncfPrice;
            } else {
                trainEstimatorPriceByPassenger += sncfPrice;
            }

            if (passengers[i].age > 0 && passengers[i].age < 4) {
                trainEstimatorPriceByPassenger = 9;
            }

            if (passengers[i].discounts.includes(DiscountCard.TrainStroke)) {
                trainEstimatorPriceByPassenger = 1;
            }

            total += trainEstimatorPriceByPassenger;
            trainEstimatorPriceByPassenger = sncfPrice;
        }

        if (passengers.length == 2) {
            let cp = false;
            let mn = false;
            for (let i=0; i < passengers.length;i++) {
                if (passengers[i].discounts.includes(DiscountCard.Couple)) {
                    cp = true;
                }
                if (passengers[i].age < 18) {
                    mn = true;
                }
            }
            if (cp && !mn) {
                total -= sncfPrice * 0.2 * 2;
            }
        }

        if (passengers.length == 1) {
            let cp = false;
            let mn = false;
            for (let i=0; i < passengers.length;i++) {
                if (passengers[i].discounts.includes(DiscountCard.HalfCouple)) {
                    cp = true;
                }
                if (passengers[i].age < 18) {
                    mn = true;
                }
            }
            if (cp && !mn) {
                total -= sncfPrice * 0.1;
            }
        }

        return total;
    }
}