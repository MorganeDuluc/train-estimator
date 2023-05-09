import {TrainTicketEstimator} from "./train-estimator";
import {DiscountCard, InvalidTripInputException, Passenger, TripDetails, TripRequest} from "./model/trip.request";

describe("train estimator", function () {
    describe("Information check", function () {
        let trainTicketEstimator: TrainTicketEstimator;
        let departDate: Date;
        beforeEach(() => {
            trainTicketEstimator = new TrainTicketEstimator();
            departDate = new Date(new Date().getFullYear(), new Date().getMonth()+1, new Date().getDay(), 0, 0, 0);
        })

        it("should check if there are no passengers", async () => {
            const details = new TripDetails("Bordeaux", "Biarritz", departDate);
            const passengers: Passenger[] = [];
            const trainDetails = new TripRequest(details, passengers);
            const result = await trainTicketEstimator.estimate(trainDetails);

            expect(result).toBe(0);

        });

        it("should check if there are a city start", async () => {
            const details = new TripDetails("", "Biarritz", departDate);
            const discountCard: DiscountCard[] = [];
            const passenger: Passenger = new Passenger(16, discountCard);
            const passengers: Passenger[] = [];
            passengers.push(passenger);
            const trainDetails = new TripRequest(details, passengers);

            try {
                await trainTicketEstimator.estimate(trainDetails);
            } catch (e) {
                expect(e).toStrictEqual(new InvalidTripInputException("Start city is invalid"));
            }
        });

        it("should check if there are a city end", async () => {
            const details = new TripDetails("Bordeaux", "", departDate);
            const discountCard: DiscountCard[] = [];
            const passenger: Passenger = new Passenger(16, discountCard);
            const passengers: Passenger[] = [];
            passengers.push(passenger);
            const trainDetails = new TripRequest(details, passengers);

            try {
                await trainTicketEstimator.estimate(trainDetails);
            } catch (e) {
                expect(e).toStrictEqual(new InvalidTripInputException("Destination city is invalid"));
            }
        });

        it("should check if te depart date > today", async () => {
            departDate = new Date(new Date().getFullYear(), new Date().getMonth()-1, new Date().getDay(), 0, 0, 0);
            const details = new TripDetails("Bordeaux", "Biarritz", departDate);
            const discountCard: DiscountCard[] = [];
            const passenger: Passenger = new Passenger(16, discountCard);
            const passengers: Passenger[] = [];
            passengers.push(passenger);
            const trainDetails = new TripRequest(details, passengers);

            try {
                await trainTicketEstimator.estimate(trainDetails);
            } catch (e) {
                expect(e).toStrictEqual(new InvalidTripInputException("Date is invalid"));
            }
        });
    });

    describe("estimation train ticket according to the age", function () {
        // mock call SNCF to get the prices
        let trainTicketEstimator: TrainTicketEstimator;

        beforeEach(() => {
            trainTicketEstimator = new TrainTicketEstimator();
        });

        class TrainTicketEstimatorOverload extends TrainTicketEstimator {
            protected async getSncfPrice(trainDetails: TripRequest): Promise<number>{
                return Promise.resolve(10);
            }
        }

        it("should check if the age is less than 4, if that the case the price's travel is 9€ (with overload)", async function() {

            const overload = new TrainTicketEstimatorOverload();

            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };

            const passengerDetails = [{
                age: 3,
                discounts: []
            }];

            const trainDetails = new TripRequest(tripDetails, passengerDetails);

            const trainEstimatorPrice = await overload.estimate(trainDetails)
            expect(trainEstimatorPrice).toEqual(9)
        })

        it("should check if the age is less or egal to 17, if that the case there is 40% of reduction on the basic price (sncf price + scnf price * 0.6) - (with overload)", async function() {

            const overload = new TrainTicketEstimatorOverload();

            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };

            const passengerDetails = [{
                age: 17,
                discounts: []
            }];

            const trainDetails = new TripRequest(tripDetails, passengerDetails);

            const trainEstimatorPrice = await overload.estimate(trainDetails)
            expect(trainEstimatorPrice).toEqual(16)
        })

        it("should check if the age is more or egal to 70, if that the case there is 20% of reduction on the basic price (sncf price + scnf price * 0.8) - (with overload)", async function() {

            const overload = new TrainTicketEstimatorOverload();

            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };

            const passengerDetails = [{
                age: 70,
                discounts: []
            }];

            const trainDetails = new TripRequest(tripDetails, passengerDetails);

            const trainEstimatorPrice = await overload.estimate(trainDetails)
            expect(trainEstimatorPrice).toEqual(18)
        })

        it("should check if the age doesn't enter in the other tests (sncf price + scnf price * 1.2) - (with overload)", async function() {

            const overload = new TrainTicketEstimatorOverload();

            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };

            const passengerDetails = [{
                age: 25,
                discounts: []
            }];

            const trainDetails = new TripRequest(tripDetails, passengerDetails);

            const trainEstimatorPrice = await overload.estimate(trainDetails)
            expect(trainEstimatorPrice).toEqual(22)
        })
    })

// *** PRICES ACCORDING TO THE BOOKING DATE CHECK ***
// should check if the booking date (current date)is 30 days before the starting date
    // --> if that the case 20% of reduction on the price
// Idk how to formulate this = Puis on applique 2% d'augmentation par jour pendant 25 jours (donc de -18% à 29 jours jusqu'à +30% à 5 jours de la date de départ)

    // --> if that the case soustract 2% to the 20% each day till 5 days before the starting date

// should check if the the booking date (current date) is 5 days before the starting date
    // --> if that the case multiple by two the ticket price
    // --> this rules don't apply to the fix price's ticket (kids egal or under to three (9€) and possesors of the TrainStroke discound card (1€))


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
});


