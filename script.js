'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


//The notes are not proper they are messed up s please watch the videos in order to understand



//Leaflet is the leading open-source JavaScript library for mobile-friendly interactive maps. 
//This is developed by other developers that we can use in our project
//For connecting leaflet library to our project we will be using CND(content delivery network) link...
//Leaflet CDN provides us the hosted version of the this leaflet library 
//For linking see html

//This is the code4 for creating a map using leaflet

//Now here you need a div with id as 'map' in your html like line_no--133...!



class Workout {
    clicks = 0;
    date = new Date();//we need date for every object that we create
    //id is created for uniquely identifying the objects but the method used below for creating unique id is not trustable cuz it can happen that the multiple users will be creating the object at same time and that will create same id so in real world basically we use some libraries for creating unique ID's but we will not talk about it here
    id = (Date.now() + "").slice(-10);//getting the last 10 characters of the date
    constructor(coords, duration, distance) {
        this.coords = coords;
        this.duration = duration;// in min
        this.distance = distance;// in km
    }
    _setDescription() {
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    click()
    {
        this.clicks++;
    }
   
}

class Running extends Workout {
    type = "running";

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace() {
        this.pace = this.duration / this.distance;   // min/km
        // return this.pace;
    }
   
}

class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() {
        this.speed = this.distance / this.duration / 60; // km/hr
        // return this.speed;

    }
  
}






//Adding all the functionality of the app in  class App
class App {

    #map;
    #mapEvent;
    #mapZoomLevel = 13;
    //This array is used for storing all the running and cycling objects created...!
    #workouts = [];

    constructor() {
        this._getPosition();

        //Form EVENT
        form.addEventListener("submit", this._newWorkout.bind(this));

        //Whenever we have a select element and if any change occurs in the options then change event will be triggered 
        inputType.addEventListener("change", this._toggleElevationField);

        //Adding event listener to the workoutscontainer to find which workoutlist item was clicked
        //Here we are using event delegation putting the addEvent listener to the parent
        containerWorkouts.addEventListener("click", this._moveToPopUp.bind(this));

        //Getting data from local storage
        this._getLocalStorage();


    }
    _getPosition() {

        //GeoLocation
        // Geolocation refers to the use of location technologies such as GPS or IP addresses to identify and track the whereabouts of connected electronic devices. Because these devices are often carried on an individual's person, geolocation is often used to track the movements and location of people and surveillance.

        //So basically we want to know the current location of our user so for this we will be using geolocation API that is provided by the browser...

        //navigator.geolocation.getCurrentPosition function accepts two callback functions if the geolocation api is successfully able to find your location then the first callback will be called but if there is any error while finding the current location then the second callback will be called and this callback is used for finding the error
        //iF STATEMENT will check whether the geolocation method is present on the browser or not
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                console.log("Please turn on your location");
            });
        }
    }
    _loadMap(position) {

        const { latitude } = position.coords;
        const { longitude } = position.coords;




        //L is basically the main object of leaflet library which has various methods
        //L.map('map') in this parenthesis we provide the id of the div inside which we want to create a map

        //Now we want that the map should be loaded when we get the current geolocation of the user 
        //And we also want that the map should be loaded at the centre of our geolocation
        //So for this we need to change the array in line no 40 with the array of users longitude and latitude you can see in line no 48
        // var map = L.map('map').setView([51.505, -0.09], 13);
        const coords = [latitude, longitude];

        //The second parameter in the setview method is basically the zoom ratio that we have set to 13
        // #map is a special object that will be created after the below statement,this object has tons of methods and properties that you can use
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        //The whole map UI is created using titleLayer method
        //Now basically the map UI is made using tiles so which comes from the link provided in the title layer(line no 47) so we can change the link and then get beautiful map UI AS WE did in the line 59
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // }).addTo(map);
        //We 

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);



        //Now we want to add a functionality that wherever we click inside the map then a marker with a popup should appear
        //We will not use addEvent listener here cuz here if we click any part of the map then we can;t data like latitude and longitude of the place where we clicked
        //Now this on method is not method the of javascript this method is written by the leaflet developers and so when there will be any click on the map then we can get various information about the event like latitude and longitude of the location that is clicked
        this.#map.on('click', this._showForm.bind(this));

        //Marker
        this.#workouts.forEach(work => {
            this._renderWorkoutMapMarker(work);
        });
    }

    _showForm(mapE) {




        this.#mapEvent = mapE;


        //When we click on the map then form should be visible
        form.classList.remove("hidden");
        //The cursor will directly move to the inputDistance field
        inputDistance.focus();
    };

    _hideForm() {

        
        //So after submitting the form we want to remove the input values from the UI
        inputCadence.value = inputDuration.value = inputElevation.value = inputDistance.value = "";
        // form.classList.add("hidden");
        form.style.display = "none";
        form.classList.add("hidden");
        setTimeout(() => form.style.display = "grid", 1000);

    }


    _moveToPopUp(e) {
        const workoutEl = e.target.closest(".workout");
        if (!workoutEl) return;
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration:1,
            }
        })
        //This will not work refer line 
        workout.click();
        console.log(workout);
    }

    _toggleElevationField() {

        //basically toggle means that if a element consider that class then it will remove it and if the element is not having then it will add that class
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");

    }

    _newWorkout(e) {

        e.preventDefault();
        //Validation of the data that the user enters

        //Helper function for validating if the inputs are of type Number
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));

        //Helper function for validating if the inputs are all Positive
        const allPositives = (...inputs) => inputs.every(inp => inp > 0);


        //Storing the form data inputted by the user
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        //This will help us to find the coordinates of the location we clicked on the map
        const { lat, lng } = this.#mapEvent.latlng;

        //This variable will temproraily store the running or cycling object so that it can be pushed in the app object workouts array
        let workout;





        if (type === "running") {
            const cadence = +inputCadence.value;
            if (!validInputs(distance, duration, cadence) || !allPositives(distance, duration, cadence)) return alert("Please Enter Positive Numbers only");

            //Creating a running class object
            workout = new Running([lat, lng], distance, duration, cadence);
        }
        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (!validInputs(distance, duration, elevation) || !allPositives(distance, duration)) return alert("Please enter Positive numbers only");

            //Creating a cycling class object
            workout = new Cycling([lat, lng], distance, duration, elevation);

        }

        //Hiding the form
        this._hideForm();

        //Storing the new created workout object in the app object workouts array
        this.#workouts.push(workout);



        //Rendering the workoutMapMarker
        this._renderWorkoutMapMarker(workout);


        //Rendering the workoutList
        this._renderWorkoutOnList(workout);


        // calling this function for storing the workouts array in the local storage
        this._setLocalStorage();



    }

    _renderWorkoutMapMarker(workout) {

        //  Creating markup step
        //Marker method helps us to create a marker and popup
        //Marker method basically helps us to customize the popup at a  certain location
        //Inside the marker method we need to pass  array comprising of [lat,lng] not default values that you get from leaflet library
        //  L.marker([lat,lng]).addTo(map)
        // .bindPopup('Workout')
        // .openPopup();
        // })

        //As i said before marker method can help us to customize the popup like we can chnge the color by adding classname whihc will be styled using our styles.css or reducing opacity by passing an options objec

        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            })).setPopupContent(`${workout.description}`) //setPopupContent takes only string values
            .openPopup();
    }

    _renderWorkoutOnList(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;

        if (workout.type === "running")
        {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
            </div>
            </li>
            `
        }
        
        if (workout.type === "cycling")
        {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
            </div>
            </li>`
        }
        
        form.insertAdjacentHTML("afterend", html);


    }

    _setLocalStorage() {
        //setitem takes key value pair and we have used JSON.stringify to convert the workouts array/object to string because local storage will store string values 
        //And if you inspect and open the application tab and then in that local storage you can see the key value stored though it will appear like that object is stored as object but basically it is string only
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        //Basically the incoming string will appear like it is an array or object but it is a string basically of JSON format
        //parsing the incoming string to array/object
        const data = JSON.parse(localStorage.getItem("workouts"));
        //this data will be array and the object present in them will not be having any prototype chain because they were first converted tpo string while storing in the local storage and hence only the key value pair present as directly on the object not in the prototype will converted to string and hence prototpe chain will be lost
        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach(work => {
            this._renderWorkoutOnList(work);
            //We can't load the map marker here because the loading of map will take time hence the map varibale will be defined and due to asynchronus nature of javascript this function will run first before loading the map so it will return an error on the line addTo(map) because will be undefined because map has not loaded 
            // this._renderWorkoutMapMarker(work);
        });
    }
    reset() {
        //This we will only be using in console if we want to delete the workout list
        //The workouts present here is the key name of the local storage where our data is stored so we don't need this here because this not object's workouts it is the key that we used to store the data in the local storage
        localStorage.removeItem("workouts");
        //This is the browser method which reloads the browser
        location.reload();
    }
}

const app = new App();










