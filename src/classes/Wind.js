import WindDirection from "./WindDirection";

export default class Wind extends WindDirection{
    year=0;
    month=0;
    sDateTime="";
    constructor() {
        super();
    }
}


// List<string> defaultDirectionList = new List<string> { "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW" };
// List<string> roseDirectionList = new List<string> { "N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW", "S", "SSE", "SE", "ESE", "E", "ENE", "NE", "NNE" };

