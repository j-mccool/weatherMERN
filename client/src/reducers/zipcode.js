// Default zipcode will be 63132
const zipCode = (state = 63132, action) => {
    switch (action.type) {
        case "SAVE_ZIP":
            return action.payload;
        default:
            return state;
    }
};

export default zipCode;