///////////////////////////////////////////////////////////////////
//                    Pico & Placa predictor                     //
///////////////////////////////////////////////////////////////////
// Description: a simple web application to predict whether a    //
// car can circulate according to the specified date and time.   //
//                                                               //
// Author: Andrés Vaca                                           //
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
//                            Classes                            //
///////////////////////////////////////////////////////////////////
/**
 * Custom Time class. This class contains the values of the time 
 * defined in hours and minutes (in the 24 hours format).
 */
class CustomTime {
    /**
     * Defines the values of the time. Use the 24 hours format.
     * @param {number} hours 
     * @param {number} minutes 
     */
    constructor(hours, minutes) {
        this.hours = hours;
        this.minutes = minutes;
    }

    /**
     * Returns the value of the hours of the restriction time.
     */
    getHours = function () {
        return this.hours;
    }

    /**
     * Updates the value of the hours of the restriction time.
     */
    setHours = function (value) {
        this.hours = value;
    }

    /**
     * Returns the value of the minutes of the restriction time.
     */
    getMinutes = function () {
        return this.minutes;
    }

    /**
     * Updates the value of the minutes of the restriction time.
     */
    setMinutes = function (value) {
        this.minutes = value;
    }
}

/**
 * Restriction Time class. This class contains the values of the time traffic 
 * restriction defined by the start and end times.
 */
class RestrictionTime {
    /**
     * Defines the start and end time of the restriction time.
     * @param {CustomTime} startTime 
     * @param {CustomTime} endTime 
     */
    constructor(startTime, endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    /**
     * Returns the time when the traffic restriction starts.
     */
    getStartTime = function () {
        return this.startTime;
    }

    /**
     * Returns the time when the traffic restriction ends.
     */
    getEndTime = function () {
        return this.endTime;
    }
}

/**
 * Restriction class. This class contains the properties of the car traffic restriction.
 */
class Restriction {
    /**
     * Defines the values of a restriction.
     * @param {number} digit (Last digit of the license plate number)
     * @param {number} day (Day of the week when the car can't road)
     * @param {RestrictionTime} restrictionTimes (All the restriction times by day)
     */
    constructor(digit, day, restrictionTimes) {
        this.digit = digit;
        this.day = day;
        this.restrictionTimes = restrictionTimes;
    }

    /**
     * Returns the last digit of the license plate number for this restriction.
     */
    getDigit = function () {
        return this.digit;
    }

    /**
     * Returns the day of the week when the car can't road.
     */
    getDay = function () {
        return this.day;
    }

    /**
     * Returns an array with all the traffic restriction times.
     */
    getRestrictionTimes = function () {
        return this.restrictionTimes;
    }
}

///////////////////////////////////////////////////////////////////
//                           Constants                           //
///////////////////////////////////////////////////////////////////

/**
 * Traffic restriction time of the morning.
 */
const MORNING_RESTRICTION_TIME = new RestrictionTime(new CustomTime(7, 0), new CustomTime(9, 30));

/**
 * Traffic restriction time of the afternoon.
 */
const AFTERNOON_RESTRICTION_TIME = new RestrictionTime(new CustomTime(16, 0), new CustomTime(19, 30));

/**
 * Minimum number of characters of the first component part of the license plate.
 * This value can change in the future, where it's possible that the A.N.T. can 
 * add another character to the new cars.
 */
const MIN_PLATE_WORD_CHARS = 3;

/**
 * Maximum number of characters of the first component part of the license plate.
 * This value can change in the future, where it's possible that the A.N.T. can 
 * add another character to the new cars.
 */
const MAX_PLATE_WORD_CHARS = 3;

/**
 * Minimum number of characters of the second component part of the license plate.
 * This value can change in the future, where it's possible that the A.N.T. can 
 * add another digit to the new cars.
 */
const MIN_PLATE_DIGIT_CHARS = 3;

/**
 * Maximum number of characters of the second component part of the license plate.
 * This value can change in the future, where it's possible that the A.N.T. can 
 * add another digit to the new cars.
 */
const MAX_PLATE_DIGIT_CHARS = 4;

/**
 * Types of messages that will be displayed in the app.
 */
const InfoType = {
    Valid: "valid-message",
    Warning: "warning-message",
    Error: "error-message",
}

// Array with the restrictions according each day of the week
var restrictions = [
    new Restriction(1, 1, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(2, 1, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(3, 2, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(4, 2, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(5, 3, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(6, 3, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(7, 4, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(8, 4, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(9, 5, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME]),
    new Restriction(0, 5, [MORNING_RESTRICTION_TIME, AFTERNOON_RESTRICTION_TIME])
];

///////////////////////////////////////////////////////////////////
//                              DATA                             //
///////////////////////////////////////////////////////////////////

// The car's license plate input field html element
var txtPlate;

// The date input field html element
var txtDate;

// The time input field html element
var txtTime;

// The message html element
var lblMessage;

// The string value of the specified license plate of the query
var queryPlate = "";

// The Date object representation of the specified date and time of the query
var queryDate;

/**
 * Functions to be called once the html document is fully loaded.
 */
window.addEventListener('DOMContentLoaded', (event) => {
    // Getting the car's license plate input field html element
    txtPlate = document.getElementById('txtPlate');

    // Getting the date input field html element
    txtDate = document.getElementById('txtDate');

    // Getting the time input field html element
    txtTime = document.getElementById('txtTime');

    // Getting the message paragraph html element
    lblMessage = document.getElementById('lblMessage');
});


///////////////////////////////////////////////////////////////////

/**
 * Formats the value of the license plate input field.
 */
function formatLicensePlate() {
    // The regular expression to validate the alphanumeric characters of the string
    let regex = /\W/g;

    // The text value is formatted to upper case
    formattedLicensePlate = txtPlate.value.toUpperCase().replace(regex, "");

    // Formatting the license plate string
    if (formattedLicensePlate.length >= 3) {
        // The word characters of the license plate string
        let letters = formattedLicensePlate.slice(0, 3);

        // The digit characters of the license plate string
        let digits = formattedLicensePlate.slice(3, 7);

        // Adding the hyphen character
        formattedLicensePlate = letters + "-" + digits;
    }

    // Setting the formatted text value to the input field
    txtPlate.value = formattedLicensePlate;

    // Updating the license plate value of the query
    queryPlate = formattedLicensePlate;
}

/**
 * Checks if the car can road on the specified day and time.
 */
function checkRestriction() {
    try {
        // Updating the values of the query date
        updateQueryDateTime();

        if (queryDate != undefined) {
            // Finding the day of the week (First day is sunday: 0)
            let dayOfWeek = queryDate.getDay();

            if (queryPlate.length > 6 && queryPlate.length < 9) {
                // Regular expression to allow only word characters
                let regexWord = /[^A-Z]/g;

                // Regular expression to allow only digit characters
                let regexNumber = /\D/g;

                // Splitting the license plate string into 2 parts: the alpha characters and the numeric characters
                let splittedLicensePlate = queryPlate.split("-");

                // Getting only the word characters of the license plate string
                let letters = splittedLicensePlate[0].replace(regexWord, "");

                // Getting only the numeric characters of the license plate string
                let digits = splittedLicensePlate[1].replace(regexNumber, "");

                // For old license plates the first digit is zero, so the digit part of the license
                // is padded with that character
                if (digits.length >= MIN_PLATE_DIGIT_CHARS) {
                    digits = digits.padStart(MAX_PLATE_DIGIT_CHARS, "0");
                }

                // It's possible in a future that the new license plates can have an extra character.
                // So the word part of the license plate is padded with a space character.
                if (letters.length >= MIN_PLATE_WORD_CHARS) {
                    letters = letters.padStart(MAX_PLATE_WORD_CHARS, " ");
                }

                // Checking if the last part of the string is a filled by numbers only
                if (letters.length == MAX_PLATE_WORD_CHARS && digits.length == MAX_PLATE_DIGIT_CHARS) {
                    // Getting the last character of the license plate string
                    lastCharacter = queryPlate.slice(-1);

                    // Parsing the last character to int
                    let lastDigit = parseInt(lastCharacter);

                    // Tells wheter the car can circulate on the specified date and time
                    let canCirculate = true;

                    for (let i = 0; i < restrictions.length; i++) {
                        // Finding the restriction according the last digit
                        if (restrictions[i].digit == lastDigit) {
                            // Checking if the restriction day is the same as the specified date
                            if (restrictions[i].getDay() == dayOfWeek) {
                                // Checking if the specified time is within any of the restriction times
                                for (let j = 0; j < restrictions[i].restrictionTimes.length; j++) {
                                    if (checkIsWithinRestrictionTime(restrictions[i].restrictionTimes[j].getStartTime(),
                                        restrictions[i].restrictionTimes[j].getEndTime())) {
                                        canCirculate = false;
                                    }
                                }
                            }
                        }
                    }

                    // Displaying the message according the restriction
                    if (canCirculate) {
                        showMessage("Yes. You can drive your car.", InfoType.Valid);
                    } else {
                        showMessage("Nope. You better call an Uber or take the bus.", InfoType.Warning);
                    }
                } else {
                    showMessage("Please enter a valid license plate.", InfoType.Error);
                }
            }
        } else {
            showMessage("Please fill all the fields.", InfoType.Error);
        }
    } catch (ex) {
        showMessage("Please check all the fields are filled.", InfoType.Error);

        console.log("Could not check the traffic restriction of the car's license plate. " + ex);
    }
}

/**
 * Updates the query date instance according the specified input values.
 */
function updateQueryDateTime() {
    try {
        if (txtDate.value != "" && txtDate.value != undefined &&
            txtTime.value != "" && txtTime.value != undefined) {
            // Splitting the time into hours and minutes
            let splittedTime = txtTime.value.split(":");

            // Getting the hours
            let hours = parseInt(splittedTime[0]);

            // Getting the minutes
            let minutes = parseInt(splittedTime[1]);

            // Splitting the date into year, month and day
            let splittedDate = txtDate.value.split("-");

            // Getting the year
            let year = parseInt(splittedDate[0]);

            // Getting the month
            let month = parseInt(splittedDate[1]);

            // Getting the day
            let day = parseInt(splittedDate[2]);

            // Creating a new Date instance with the current values
            // (the month is 0-indexed)
            queryDate = new Date(year, (month - 1), day, hours, minutes, 0, 0);
        }
    } catch (ex) {
        showMessage("Please, enter a valid date.", InfoType.Error);

        console.log("Could not find the day of the week. " + ex);
    }
}

/**
 * Checks if the specified time is within the restriction time.
 * @param {CustomTime} startTime 
 * @param {CustomTime} endTime 
 */
function checkIsWithinRestrictionTime(startTime, endTime) {
    try {
        if (queryDate != null && queryDate != undefined) {
            // Creating the Date instance of the start time
            let startDate = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), startTime.getHours(), startTime.getMinutes(), 0, 0);

            // Creating the Date instance of the end time
            let endDate = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), endTime.getHours(), endTime.getMinutes(), 0, 0);

            // Checking if the query time is within the restriction time
            if (queryDate.getTime() >= startDate.getTime() && queryDate.getTime() <= endDate.getTime()) {
                return true;
            }
        }
    } catch (ex) {
        console.log("Could not check if the specified time is within the restriction time. " + ex);
    }

    return false;
}

/**
 * Displays a message in the web app.
 * @param {string} message 
 * @param {InfoType} messageType 
 */
function showMessage(message, messageType) {
    try {
        // Displaying the message in the web app
        lblMessage.innerHTML = message;

        // Changing the color of the message according the type of information
        switch (messageType) {
            case InfoType.Valid:
                lblMessage.style.color = "#00701a";

                break;
            case InfoType.Warning:
                lblMessage.style.color = "#e69500";

                break;
            case InfoType.Error:
                lblMessage.style.color = "#e60000";

                break;
            default:
                break;
        }
    } catch (ex) {
        console.log("Could not display the message. " + ex);
    }
}