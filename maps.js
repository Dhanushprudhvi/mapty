'use strict';

// Selection


const form = document.querySelector(".form");
const inputs = document.querySelectorAll(".input");
const username = document.getElementById("username");
const city = document.getElementById("city");
const gender = document.getElementById("gender");
const branch = document.getElementById("branch");
const selects = document.querySelectorAll(".select");
const mapcontent = document.querySelector(".map_content");

function initform() {
  inputs.forEach((input) => {
    input.value = "";
  });
  selects.forEach((select) => {
    select.selectedIndex = 0;
  });
  username.focus();
}
class Person {
  constructor(username, city, gender, branch, coords) {
    this.username = username;
    this.city = city;
    this.gender = gender;
    this.branch = branch;
    this.coords = coords;
    this.id = Math.floor(Math.random() * 100000);
    this.createddate = this.getpersondate();
    
  }
  getpersondate() {
    const date = new Date();
    const datetitle = `(   ${String(date.getDate()).padStart(2, 0)}/${String(
      date.getMonth() + 1
    ).padStart(2, 0)}/${date.getFullYear()},  ${date.toLocaleTimeString()}   )`;
    return datetitle;
  }
}

class App {
  #map;
  #mapevent;
  #persondetails = [];
  #markers=[];
  constructor() {
    //getusers position
    this.getposition();
    //get localstorage
    this.get_localstorage();

    //eventlisteners
    form.addEventListener("submit", this.newperson.bind(this));
    mapcontent.addEventListener("click", this.movemapto.bind(this));
  }
  getposition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadmap.bind(this),
        function () {
          alert("refresh the page and click ok to get ur location");
        }
      );
  }
  loadmap(location) {
    const { latitude } = location.coords;
    const { longitude } = location.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 10);
    // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.#map);
    L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(this.#map);
  
    // on mapclick show form
    this.#map.on("click", this.showform.bind(this));
    //whenever map loaded then getlocalstorage and display marker

    this.#persondetails.forEach((persondata) => {
      this.renderpersonmarker(persondata);
    });
  }
  showform(event) {
    this.#mapevent = event;
    form.classList.remove("hide");
    //reset form
    initform();
  }

  newperson(e) {
    e.preventDefault();

    //getdata from map
    const usernameinput = username.value;
    const cityinput = city.value;
    const genderinput = gender.value;
    const branchinput = branch.value;

    // checking whether input contains number
    if (/\d/.test(usernameinput) || /\d/.test(cityinput))
      return alert("username/city must be string(characters)");

      //create person object and push into app person details
      const { lat, lng } = this.#mapevent.latlng;
      let person = new Person(
          usernameinput,
          cityinput,
          genderinput,
          branchinput,
          [lat, lng],
          );

          //   this.#persondetails.push(person);
          this.#persondetails.push(person);

          //rendering newperson on map as marker and on forms place
          this.renderperson(person);
          this.renderpersonmarker(person);
         
          
             //set localstorage
       this.set_localstorage();
  }

  renderpersonmarker(person) {
   const mark=new L.marker(person.coords);
      mark.addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 400,
          autoClose: false,
          closeOnClick: false,
          //   className : "something.."
        })
      )
      .setPopupContent(`${person.username}`)
      .openPopup();
   this.#markers.push(mark);
   
   
  }
  renderperson(person) {
    let html = `<div class="map_content_rendering" data-id="${person.id}">
           <p class="rendering_person_name">${person.username}
            <span>${person.createddate}</span><p>
           <div class="rendering_person_details">
            <div class="icon">
              <span>${person.city}</span>
              <i class="fa-solid fa-city" style="color:rgb(52, 153, 226);"></i></div>`;
    if (person.gender === "male") {
      html += `
               <div class="icon">
               <span>${person.gender}</span>
               <i class="fa-solid fa-person" style="color:rgb(228, 112, 159);"></i></div>`;
    } else {
      html += `
              <div class="icon">
              <span>${person.gender}</span>
             <i class="fa-solid fa-person-dress" style="color:rgb(47, 203, 68);"></i></div>`;
    }
    html += `
             <div class="icon">
               <span>${person.branch}</span>
              <i class="fa-solid fa-graduation-cap" style="color:rgb(184, 204, 84);"></i></div>
           </div>
           <i class="fa-solid fa-trash-can delete" style="color:rgb(228, 64, 220);"></i>
      </div>
         `;

    //hideform
    form.style.display = "none";
    form.classList.add("hide");
    form.insertAdjacentHTML("afterend", html);
    setTimeout(function () {
      form.style.display = "grid";
    }, 1);
  }
  movemapto(e) {
    const map_content_render = e.target.closest(".map_content_rendering");
    if (!map_content_render) return;
    const present_id = map_content_render.dataset.id;
    const present_person = this.#persondetails.find(
        (person) => person.id === +present_id
        );
  //if u click on delete
        if(e.target.classList.contains('delete'))
        {
            
            this.deletepersonwithmarker(present_person,map_content_render);
            return;
        }
        this.#map.setView(present_person.coords, 8, {
            animate: true,
            pan: {
                duration: 2,
            },
        });
  }
  deletepersonwithmarker(person,map_content_render){ 
    
      const index=this.#persondetails.findIndex(per=>per.id===person.id);
    //delete marker

    this.#map.removeLayer(this.#markers[index]);
    this.#markers.splice(index,1);
    
    //delete person element which is displaying on screen
    map_content_render.remove();

    //delete person in array
    this.#persondetails.splice(index,1);
    this.set_localstorage();
    

    

  }
  set_localstorage() {
  
    localStorage.setItem("persons", JSON.stringify(this.#persondetails));
  }
  get_localstorage() {
    const personsdata = JSON.parse(localStorage.getItem("persons"));
    if (!personsdata) return;
    this.#persondetails = personsdata;
    this.#persondetails.forEach((persondata) => {
      this.renderperson(persondata);
    });
  }
  reset() {
    localStorage.removeItem("persons");
    location.reload();
  }
}

const app = new App();
