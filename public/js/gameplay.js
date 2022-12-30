var country_name_iso_map = {};
var current_country_name = null;
var coords = {};
// import fs from '../node_modules/fs';
//import myModule from './my-module';
// const { parse } = require("csv-parse");
function calcCrow(a, b) //lat1 lon1, lat2, lon2) 
    {
        var lat1 = a['latitude']
        var lon1 = a['longitude']
        var lat2 = b['latitude']
        var lon2 = b['longitude']

      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }
function distance(guessed_name){
    var guessed_iso = country_name_iso_map[guessed_name];
    var answer_iso = country_name_iso_map[current_country_name];
    //var cities = require('./src/country-by-capital-city.json')
    console.log(coords[guessed_iso], coords[answer_iso])
    var dist = calcCrow(coords[guessed_iso], coords[answer_iso])
   return Math.floor(dist)
}
   
  // Converts from radians to degrees.
  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  
  
  function bearing(a, b) //lat1 lon1, lat2, lon2) 
    {
        var startLat = a['latitude']
        var startLng = a['longitude']
        var destLat = b['latitude']
        var destLng = b['longitude']

    startLat = toRad(startLat);
    startLng = toRad(startLng);
    destLat = toRad(destLat);
    destLng = toRad(destLng);
  
    y = Math.sin(destLng - startLng) * Math.cos(destLat);
    x = Math.cos(startLat) * Math.sin(destLat) -
          Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    brng = Math.atan2(y, x);
    brng = toDegrees(brng);
    return (brng + 360) % 360;
  }
  function getCardinal(angle) {
    /** 
     * Customize by changing the number of directions you have
     * We have 8
     */
    const degreePerDirection = 360 / 8;
  
    /** 
     * Offset the angle by half of the degrees per direction
     * Example: in 4 direction system North (320-45) becomes (0-90)
     */
    const offsetAngle = angle + degreePerDirection / 2;
  
    return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? "n"
      : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "ne"
        : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "e"
          : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "se"
            : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "s"
              : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "sw"
                : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "w"
                  : "nw";
  }

function direction_emoji(guessed_name){
    const emojis = {"e":"&#10145;&#65039;",
    "n":"&#11014;&#65039;",
    "ne":"&#8599;&#65039;",
    "se":"&#8600;&#65039;",
    "s":"&#11015;&#65039;",
    "sw":"&#8601;&#65039;",
    "w":"&#11013;&#65039;",
    "nw":"&#8598;&#65039;"}
    var guessed_iso = country_name_iso_map[guessed_name];
    var answer_iso = country_name_iso_map[current_country_name];
    var b = bearing(coords[guessed_iso], coords[answer_iso])
    var cardinal = getCardinal(b);
    return emojis[cardinal]

}
function guess(e){
    e.preventDefault();
    
    var input = document.getElementById("myInput")
    console.log(input.value)
    console.log("guess!")
    if (current_country_name == input.value){
        console.log("You win")
        toggleModal("You win!");
    
    }
    else {
        console.log("try again")
        var guesses = document.getElementById("guesses")
        var guess = document.createElement("div");
        var distance_str = distance(input.value)
        var dir = direction_emoji(input.value)
;        guess.innerHTML =  "<p class='country'>" +input.value + "</p><p class='distance'>"+ distance_str+" km</p> <p class='arrow'>"+dir+"</p></br>"
        guess.classList= ["guess", ]
        guesses.appendChild(guess)
        var num_guesses = document.getElementsByClassName("guess").length 
        console.log("# of guesses: ",num_guesses)
        if (num_guesses == 5){
            toggleModal("You lost!");

        }
        
    }
}


 async function start(){
        console.log("starting")
        var codes = await fetch("https://datahub.io/core/country-list/r/data.json")
            .then((response) => response.json());
        var country_index =  Math.floor(Math.random() * codes.length);
        var country_code = codes[country_index].Code
        var coords_json = await fetch("https://raw.githubusercontent.com/komsitr/country-centroid/master/country-centroids.json").then((response) => response.json());
       
        coords_json.forEach(e=>{
            coords[e.alpha2] = {
                "latitude":e.latitude,
    "longitude": e.longitude,
            }
        })
        console.log(coords)
        console.log(coords["US"])
    var map = document.getElementById("map")
    map.setAttribute("src", "images/" + country_code + ".svg")
    console.log(codes[country_index])
    console.log(codes.length)
    current_country_name = codes[country_index].Name
    var country_names = [];

    codes.forEach(element => {
        country_names.push(element.Name);
    });
    codes.forEach(element => {
        country_name_iso_map[element.Name] = element.Code;
    });

    autocomplete(document.getElementById("myInput"), country_names);


}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }


function toggleModal(message) {
    modal.classList.toggle("show-modal");
    var msg = document.getElementsByClassName("modal-content")[0];

    msg.innerHTML = "<h1>"+message+"</h1> <a href='/' class='restart'   id='Restart'>Play again</a>"
    var country_msg  = document.createElement("p")
    country_msg.innerText = "The country was "+ current_country_name;
    msg.appendChild(country_msg)


}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}


  window.onload = start;


