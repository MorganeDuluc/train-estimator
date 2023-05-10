import {TrainTicketEstimator} from "./train-estimator";
import {DiscountCard, InvalidTripInputException, Passenger, TripDetails, TripRequest} from "./model/trip.request";

describe("Train estimator", function () {
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

    describe("Estimation train ticket  price's according to the age", function () {
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
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(9);
        });

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
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(16);
        });

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
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(18);
        });

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
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(22);
        });
    });

    describe("Estimation train ticket price's according to the discount card", function () {
        let trainTicketEstimator: TrainTicketEstimator;
    
        beforeEach(() => {
            trainTicketEstimator = new TrainTicketEstimator();
            });
        
        class TrainTicketEstimatorOverload extends TrainTicketEstimator {           
            protected async getSncfPrice(trainDetails: TripRequest): Promise<number>{
                return Promise.resolve(10);
            }
        }
    
        it("should check if he has the TrainStroke staff if that the case the ticket are 1€", async function() { 
            const overload = new TrainTicketEstimatorOverload();
            
            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };
    
            const passengerDetails = [{
                age: 19,
                discounts: [DiscountCard.TrainStroke]
            }];
            
            const trainDetails = new TripRequest(tripDetails, passengerDetails);
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(1);
        });

        it("should check if he has the Senior card (age is more than 70) if that the case 20% of reduction again based on the basic price (sncf price + scnf price * 0.8) - (with overload)", async function() { 
            const overload = new TrainTicketEstimatorOverload();
            
            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };
    
            const passengerDetails = [{
                age: 70,
                discounts: [DiscountCard.Senior]
            }];
            
            const trainDetails = new TripRequest(tripDetails, passengerDetails);
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(16);
        });

        it("should check if the passengers have couple card (two passengers have more than 18) if that the case 20% of reduction for each ticket's passenger based on the basic price. Note : if each passenger have a couple card only one couple card can work - (with overload)", async function() { 
            const overload = new TrainTicketEstimatorOverload();
            
            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };
    
            const passengerDetails = [
                {
                    age: 18,
                    discounts: [DiscountCard.Couple]
                },
                {
                    age: 20,
                    discounts: [DiscountCard.Couple]
                }
            ];
            
            const trainDetails = new TripRequest(tripDetails, passengerDetails);
            const trainEstimatorPrice = await overload.estimate(trainDetails);
            const expectedPrice = ((22 - 2) + (22 - 2)); // 40

            expect(trainEstimatorPrice).toEqual(expectedPrice);
        });

        it("should check if the passenger has a mi-couple card (age of one of the two passengers have to be more than 17) if that the case 10% of the reduction for each passenger - (with overload)", async function() { 
            const overload = new TrainTicketEstimatorOverload();
            
            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };
    
            const passengerDetails = [
                {
                    age: 16,
                    discounts: [DiscountCard.HalfCouple]
                },
                {
                    age: 20,
                    discounts: [DiscountCard.HalfCouple]
                }
            ];
            
            const trainDetails = new TripRequest(tripDetails, passengerDetails);
            const trainEstimatorPrice = await overload.estimate(trainDetails);
            const expectedPrice = ((16 - 1) + (22 - 1)); // 36
            // Monsieur, je ne comprends pas :
            // un passager de 16 ans à 40% de réducion donc le billet revient à 16€ - 1€ des 10% de la carte mi-couple on est à 15€
            // plus passager de 20 ans c'est plus 20% donc le billet revient à 22€ - 1€ des 10% de la carte mi-couple on est à 21€
            // 15 + 21 = 36€ mais le code m'indique qu'il reçoit 38€ je ne suis pas !!

            expect(trainEstimatorPrice).toEqual(expectedPrice);
        });

        it("should check if all the discound are cumulative except if the TrainStroke discound card is use ! - (with overload)", async function() { 
            const overload = new TrainTicketEstimatorOverload();
            
            const tripDetails = {
                from: 'Bordeaux',
                to: 'Biarritz',
                when: new Date()
            };
    
            const passengerDetails = [
                {
                    age: 70,
                    discounts: [DiscountCard.TrainStroke]
                }
            ];
            
            const trainDetails = new TripRequest(tripDetails, passengerDetails);
            const trainEstimatorPrice = await overload.estimate(trainDetails);

            expect(trainEstimatorPrice).toEqual(1);
        });
    });

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

            const tripDetails = new TripDetails("Paris", "Marseille", date);
            const passengers = [new Passenger(25, [])];
            const tripRequest = new TripRequest(tripDetails, passengers);

            const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
            const expectedPrice = currentPrice * 2 + 1.2;
            const actualPrice = await trainTicketEstimator.estimate(tripRequest);
            expect(expectedPrice).toEqual(actualPrice);
        });

        it("should don't apply to the fix price's ticket for kids", async () => {
            const date = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + 3
            );

            const tripDetails = new TripDetails("Paris", "Marseille", date);
            const passengers = [new Passenger(2, [])];
            const tripRequest = new TripRequest(tripDetails, passengers);

            const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
            const expectedPrice = currentPrice * 2 + 1.2;
            const actualPrice = await trainTicketEstimator.estimate(tripRequest);
            expect(expectedPrice).not.toEqual(actualPrice);
        });

        it("should don't apply to the fix price's ticket for TrainStroke", async () => {
            const date = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + 3
            );

            const tripDetails = new TripDetails("Paris", "Marseille", date);
            const passengers = [new Passenger(30, [DiscountCard.TrainStroke])];
            const tripRequest = new TripRequest(tripDetails, passengers);

            const currentPrice = await trainTicketEstimator.getSncfPrice(tripRequest);
            const expectedPrice = currentPrice * 2 + 1.2;
            const actualPrice = await trainTicketEstimator.estimate(tripRequest);
            expect(expectedPrice).not.toEqual(actualPrice);
        });
    });
});
