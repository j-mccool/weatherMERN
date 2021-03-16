// Default temperature to use Fahrenheit (imperial, F)
const temperature = (state = "imperial", action) => {
    switch (action.type) {
        case "SAVE_TEMPERATURE":
            return action.payload;
        default:
            return state;
    }
};

export default temperature;