'use strict';

//koodi alkaa, kun kaikki elementit ovat latautuneet
window.addEventListener('DOMContentLoaded', function(){

const lang = ['af', 'al', 'ar', 'az', 'bg', 'ca', 'cz', 'da', 'de', 'el', 'en', 'eu', 'fa', 'fi', 'fr', 'gl', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'kr', 'la', 'lt', 'mk', 'no', 'nl', 'pl', 'pt', 'pt_br', 'ro', 'ru', 'sv', 'sk', 'sl', 'es', 'sr', 'th', 'tr', 'ua', 'vi', 'zh_cn', 'zh_tw', 'zu'];
const mapTypes = {
        id: [{ map: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', name: 'default'},
             { map: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community', name: 'image'},
             { map: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=2e7702e315ff4495832d450fb467c8b4',  attribution: false, name: 'clouds'},
             { map: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=2e7702e315ff4495832d450fb467c8b4',  attribution: false, name: 'precipitation'},
             { map: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=2e7702e315ff4495832d450fb467c8b4',  attribution: false, name: 'pressure'},
             { map: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=2e7702e315ff4495832d450fb467c8b4',  attribution: false, name: 'wind'},
             { map: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=2e7702e315ff4495832d450fb467c8b4',  attribution: false, name: 'temperature'},
]};

let map;
let selectedLanguage = 'en';
let selectedMap = mapTypes['id'][0];
const dateSortedDay = [];


//asettaa kielet valikkoon
lang.forEach((language) => {
  const p = document.createElement('p');
  const text = document.createTextNode(language);
  p.setAttribute('id', language);
  p.appendChild(text);
  document.getElementById('langStatus').appendChild(p);
});


//asettaa kartan tyypit valikkoon
mapTypes['id'].forEach((id, i) => {
  const p = document.createElement('p');
  const text = document.createTextNode(id.name);
  p.setAttribute('id', i);
  p.appendChild(text);
  document.getElementById('mapType').appendChild(p);
});


//api kutsu
const xhr = new XMLHttpRequest();
function searchLocation(location) {
  const api ='https://api.openweathermap.org/data/2.5/forecast?q='+location+'&units=metric&lang='+selectedLanguage+'&appid=2e7702e315ff4495832d450fb467c8b4&SameSite=strict';
  xhr.open('get', api, true);
  xhr.onreadystatechange = update;
  xhr.send(null);
};

//apin käsittelyfunktio
function update(){
  if (xhr.readyState === 4 && xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    const list = data['list'];
    const city = data['city'];
    let dateCheck = new Date(list[0]['dt_txt']);
    let dateSorterCounter=0;
    let i = 0;
    let dateSorterData = [];
    list.forEach(function (forecast){
      const timeStamp = forecast['dt_txt'];
      const date = new Date(timeStamp);
      let day;
      switch(date.getDay()) {
        case 1: day = "Monday"; break;
        case 2: day = "Tuesday"; break;
        case 3: day = "Wednesday"; break;
        case 4: day = "Thursday"; break;
        case 5: day = "Friday"; break;
        case 6: day = "Saturday"; break;
        case 0: day = "Sunday"; break;
        default: day = "unknown"; break;
      }

      if(date.getDate() !== dateCheck.getDate()) {
        dateCheck=date;
        dateSorterCounter++;
        dateSorterData = [];
        i=0;
      }


      const data = { weather:forecast['weather'][0]['main'], description:forecast['weather'][0]['description'], icon:forecast['weather'][0]['icon'], clouds:forecast['clouds']['all']+"%", wind:forecast['wind']['speed']+" m/s", temperature:forecast['main']['temp'], pressure:forecast['main']['pressure'], pod:forecast['sys']['pod'], time:date.getHours()+':00' };
      dateSorterData[i] = data;
      dateSortedDay[dateSorterCounter] = { day:day, data:dateSorterData};
      i++;
    });


    LokaatioKartalla(city['coord']['lon'], city['coord']['lat'], city['name']+", "+list[0]['weather'][0]['description'], list[0]['weather'][0]['icon']);
    segmentBuilder();
  } else if(xhr.readyState === 4 && xhr.status !== 200){
    console.error(xhr.responseText);
    alert('Please enter a valid input');
  }
};


//asettaa merkin kartalle
function LokaatioKartalla(lon, lat, text, icon){
  if (map != undefined) {
    map.remove();
  };

  map = L.map('map', {minZoom: 2}).setView([lat, lon], 7);
  const img = L.icon({iconUrl: 'http://openweathermap.org/img/wn/'+icon+'.png', iconAnchor:   [25, 20]});
  L.tileLayer(selectedMap.map, { attribution: selectedMap.attribution } ).addTo(map);
  L.marker([lat, lon], {icon: img}).addTo(map).bindPopup(text).openPopup();
};


//rakentaa osion, jossa päivät ja sääennusteet
function segmentBuilder() {

  const list = document.getElementById('blocksList');
  list.innerHTML='';

  for(let e=0; e<dateSortedDay.length;  e++){
    const currentData = dateSortedDay[e];
    const day = document.createTextNode(currentData['day']);
    const segment = document.createElement('li');
    const inSegment = document.createElement('div');
    const p = document.createElement('p');
    const segmentDropdown = document.createElement('div');
    segment.setAttribute('class', 'blockSegment');
    segmentDropdown.setAttribute('class', 'segmentDropdown');
    p.setAttribute('class', 'weekDays');
    p.setAttribute('id', 'tab'+e);
    p.appendChild(day);
    segmentDropdown.appendChild(p);

    for(let i=0; i<dateSortedDay[e].data.length; i++) {
      const inSegmentElement = document.createElement('div');
      inSegmentElement.setAttribute('class', 'inSegmentElement');
      inSegment.setAttribute('class', 'inSegment');
      inSegmentElement.innerHTML = `<img src=http://openweathermap.org/img/wn/${currentData['data'][i]['icon']}@2x.png><img><br><p style='font-size:24px'>${currentData['data'][i]['temperature']}&#8451<p><p>${currentData['data'][i]['time']}</p><p>${currentData['data'][i]['description']}</p><p>Pressure: ${currentData['data'][i]['pressure']} hPa</p><p>Wind: ${currentData['data'][i]['wind']}</p><p>Clouds: ${currentData['data'][i]['clouds']}</p>`;

      inSegment.appendChild(inSegmentElement);
      segment.appendChild(inSegment);


    }
    segmentDropdown.appendChild(segment);
    list.appendChild(segmentDropdown);
  }

};


const insert = document.getElementById('insert');
const search = document.getElementById('search');
const scroll = document.getElementById('scroll');
//kuuntelee klikkausta syöttökentän napille
insert.addEventListener('click', function() {
  searchLocation(search.value);
  scroll.scrollTo(0,0);
});


//kuuntelee syöttökentän Enter painausta
search.addEventListener('keypress', function(e) {
  if(e.key === 'Enter'){
  searchLocation(search.value);
  scroll.scrollTo(0,0);
  }
});


const mapType = document.getElementById('mapType');
//kuntelee klikkausta karttavalikolle ja vastaa sen näkyvyydestä
mapType.addEventListener('click', function(cursor) {
  if(cursor.target.id !== 'mapType'){
    selectedMap = mapTypes['id'][cursor.target.id];
    mapType.setAttribute('style', 'display:none');
  }
});


const langStatus = document.getElementById('langStatus');
//kuntelee klikkausta kielivalikolle ja vastaa sen näkyvyydestä
langStatus.addEventListener('click', function(cursor) {
  if(cursor.target.id !== 'langStatus'){
    selectedLanguage=cursor.target.id;
    langStatus.setAttribute('style', 'display:none');
  }
});


const menu = document.getElementById('menu');
//vastaa kartta- ja kielivalikon näkyvyydestä
menu.addEventListener('mouseover', function() {
  mapType.removeAttribute('style', 'display:none');
  langStatus.removeAttribute('style', 'display:none');
});


searchLocation('London');

});
