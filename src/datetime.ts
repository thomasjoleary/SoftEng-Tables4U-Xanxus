export class Datetime {
    year : Number
    month : Number
    day : Number
    hour : Number
    minute : Number



    constructor( input : string ) {

        this.year = Number(input.substring(0, 4))
        this.month = Number(input.substring(5, 7))
        this.day = Number(input.substring(8, 10))
        this.hour = Number(input.substring(11, 13))
        this.minute = Number(input.substring(14, 16))

    }

}