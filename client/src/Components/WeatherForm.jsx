import React, {Component} from "react";
import {Form, Button, Row, Col, ButtonGroup, ToggleButton} from "react-bootstrap";

import axios from 'axios';

import {connect} from "react-redux";
import {saveZipCode, saveWeatherData, saveTemperature, updateHistory} from '../actions';

class WeatherForm extends Component {

    state = {
        tempMetric: "imperial",
        zipCodeInput: "98052"
    }

    componentDidMount() {
        this.refreshSavedWeather();
    }

    // Refreshes the current weather data for the most recent zip code, if it exists
    refreshSavedWeather = () => {
        if (sessionStorage.getItem("zipCode")) {
            axios.post("/api/weather", {
                zipCode: sessionStorage.getItem("zipCode"),
                tempMetric: sessionStorage.getItem("tempMetric")
            }).then(d => {
                sessionStorage.setItem("CurrentWeatherData", JSON.stringify(d.data));
                this.props.saveWeatherData(d.data);
            });
        }
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    saveFormData = (event) => {
        event.preventDefault();

        // Gets the weather data from the weather api and returns it to save into local storage and mongo storage
        axios.post("/api/weather", {
            zipCode: this.state.zipCodeInput,
            tempMetric: this.state.tempMetric
        }).then(response => {
            let weatherData = response.data;
            
            this.saveToStore(weatherData);
            this.saveToSessionStorage(weatherData);
            // this.saveToMongo(weatherData);
        });
    }

    // Save data from form to local storage
    saveToSessionStorage = (weatherData) => {
        sessionStorage.setItem("zipCode", this.state.zipCodeInput);
        sessionStorage.setItem("tempMetric", this.state.tempMetric);
        sessionStorage.setItem("CurrentWeatherData", JSON.stringify(weatherData));
        sessionStorage.setItem("WeatherHistory", JSON.stringify(this.props.history));
    }

    // Save data to the Redux store
    saveToStore = (weatherData) => {
        this.props.saveTemperature(this.state.tempMetric);
        this.props.saveZipCode(this.state.zipCodeInput);
        this.props.saveWeatherData(weatherData);

        this.props.updateHistory({
            timestamp: (new Date()).toLocaleString(),
            city: weatherData.name,
            zipcode: this.state.zipCodeInput,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description
        });
    }

    // saveToMongo = (event) => {
    //     axios.post("/api/weatherMongo", {
    //         zipCode: this.state.zipCodeInput,
    //         tempMetric: this.state.tempMetric
    //     }).then(response => {
    //         let weatherData = response.data;
    //         console.log(weatherData);
    //     });
    // }

    render() {
        return (
            <Form className="weather-form" onSubmit={this.saveFormData}>

                <Row type="flex" justify="center" align="center" className="zipCode">
                    <Col>
                        <span>Zip Code: </span>
                        <Form.Control name="zipCodeInput"
                                      type="text"
                                      placeholder="Enter your zip code"
                                      onChange={this.onChange}
                                      className="zipCodeInput"/>
                    </Col>
                </Row>

                <Row type="flex" justify="center" align="center">
                    <Col span={4}>
                        <ButtonGroup toggle>
                            <ToggleButton
                                key={"C"}
                                type="radio"
                                variant="secondary"
                                name="tempMetric"
                                value={"metric"}
                                checked={this.state.tempMetric === "metric"}
                                onChange={this.onChange}
                            >
                                Celsius (°C)
                            </ToggleButton>
                            <ToggleButton
                                key={"F"}
                                type="radio"
                                variant="secondary"
                                name="tempMetric"
                                value={"imperial"}
                                checked={this.state.tempMetric === "imperial"}
                                onChange={this.onChange}
                            >
                                Fahrenheit (°F)
                            </ToggleButton>
                        </ButtonGroup>
                    </Col>
                </Row>

                <Row type="flex" justify="center" align="center">
                    <Col span={4}>
                        <Button className="save-btn" variant="primary" type="submit">
                            Save
                        </Button>
                    </Col>
                </Row>

            </Form>
        );
    }
}

// Mapping state from the store to props;
// ...if we update these props, it'll update the redux store
const mapStateToProps = (state) => {
    return {
        zipCode: state.zipCode,
        weather: state.weather,
        tempMetric: state.tempMetric,
        history: state.history
    }
};

// These are the actions we can dispatch and just map to props
const mapDispatchToProps = () => {
    return {
        saveZipCode,
        saveWeatherData,
        saveTemperature,
        updateHistory
    }
};

// This connects our mapping the state & dispatch to props to use in WeatherForm
export default connect(mapStateToProps, mapDispatchToProps())(WeatherForm);