var NUMBER_TYPE = 'number';
var STRING_TYPE = 'string';
var HAT_BLOCK_TYPE = 'hat';
var REPORTER_BLOCK_TYPE = 'reporter';
var API_URL = "http://localhost:5000/";

class Scratch3CO2Sensor {

    constructor (runtime, extensionId) {
        this.runtime = runtime;
        this._extensionId = extensionId;

        this._temperature = 0;
        this._pressure = 0;
        this._co2 = 0;

        setInterval( this.getSensorData.bind(this), 1000 )
    }

    toNumber (value) {
        // If value is already a number we don't need to coerce it with
        // Number().
        if (typeof value === NUMBER_TYPE) {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            if (Number.isNaN(value)) {
                return 0;
            }
            return value;
        }
        const n = Number(value);
        if (Number.isNaN(n)) {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            return 0;
        }
        return n;
    }

    getSensorData(num) {
        const thisRef = this;
        return new Promise(function(resolve, reject) {
            const getAPIData = new XMLHttpRequest();
            const url = API_URL;
            getAPIData.open("GET", url);
            getAPIData.send();
            getAPIData.onload = function() {
                const APIData = JSON.parse(getAPIData.responseText);

                thisRef._temperature = APIData.temperature_c;
                thisRef._pressure = APIData.pressure_mbar;
                thisRef._co2 = APIData.co2_ppm;
                
                resolve(APIData);
            };

            getAPIData.onerror = function () {
                document.getElementById("error").innerText = "Error!"
            }

            
        });
    }

    getTemperature() {
        return this._temperature;
    }

    whenTemperature (args) {
        const temperature = this.toNumber(args.TEMPERATURE);

        switch ( args.OP ){
            case "<=":
                return this._temperature <= temperature;
            case ">":
                return this._temperature > temperature;
        }

        return false;
    }


    whenCO2 (args) {
        const co2 = this.toNumber(args.CO2);

        switch ( args.OP ){
            case "<=":
                return this._co2 <= co2;
            case ">":
                return this._co2 > co2;
        }

        return false;
    }

    getCO2() {
        return this._co2;
    }

    getInfo () {
        return {
            id: 'co2sensor',
            name: 'CO2 Sensor',
            blocks: [
                {
                    opcode: 'getCO2',
                    text: 'co2 ppm from the sensor',
                    blockType: REPORTER_BLOCK_TYPE
                },
                {
                    opcode: 'whenCO2',
                    text: 'when CO2 ppm [OP] [CO2]',
                    blockType: HAT_BLOCK_TYPE,
                    arguments: {
                        OP: {
                            type: STRING_TYPE,
                            menu: 'OP',
                            defaultValue: '<='
                        },
                        CO2: {
                            type: NUMBER_TYPE,
                            defaultValue: 1000
                        }
                    }
                },
                {
                    opcode: 'getTemperature',
                    text: 'temperature from the sensor',
                    blockType: REPORTER_BLOCK_TYPE
                },
                {
                    opcode: 'whenTemperature',
                    text: 'when temperature [OP] [TEMPERATURE]',
                    blockType: HAT_BLOCK_TYPE,
                    arguments: {
                        OP: {
                            type: STRING_TYPE,
                            menu: 'OP',
                            defaultValue: '<='
                        },
                        TEMPERATURE: {
                            type: NUMBER_TYPE,
                            defaultValue: 17
                        }
                    }
                }
            ],
            menus: {
                OP: {
                    acceptReporters: true,
                    items: ['<=', '>']
                }
            }
        };
    }

}

// This code is for when it runs in SheepTester
if(window.vm) {
    (function() {
        var extensionInstance = new Scratch3CO2Sensor(window.vm.extensionManager.runtime)
        var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
        window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
    })()
}

// This code is for when it runs in the Scratch development environment
module.exports = Scratch3CO2Sensor;