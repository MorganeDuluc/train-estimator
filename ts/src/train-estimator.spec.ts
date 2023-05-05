
describe("train estimator", function () {
    it("should work", () => {
        expect(1 + 2).toBe(3);
    });
});

// *** INFORMATIONS CHECK ***
// should check if there is no passenger
// should check if there are a city start and a city end
// should check if there is the date of the departure
// should check if there is no age


// mock call SNCF to get the prices

// *** PRICES ACCORDING TO THE AGE CHECK ***
// should check if the age is under one
    // --> if that the case so the travel is free
// should check if the age is egal or under three
    // --> if that the case the price's travel is 9€
// should check if the age is egal or under 18
    // --> if that the case there is 40% of reduction on the basic price
// should check if the age is egal or under 70
    // --> if that the case there is 20% of reduction on the basic price
    // --> in other case +20% on the basic price

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