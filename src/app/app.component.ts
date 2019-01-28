import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormControl, FormGroup, NgForm ,Validators } from '@angular/forms';
import { StarRatingControlComponent } from 'angular-star-rating';
import { StarRatingModule } from 'angular-rating-star';
import { RatingModule } from "ngx-rating";
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';
import { IntlService } from '@progress/kendo-angular-intl';


// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/first';

declare let L;
declare let tomtom: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

    public map: any = {};
    public currLocObj: any = {};
    public currPosition;
    public currPosLayer;
    public agentsPosLayer;
    public resultsList;
    public markersLayer;
    public agentDetailss;
    public commentslist;
    public starsCount;
    public dataSet: any = {};
    public imageLink;

    public inputMapForm: FormGroup;
    public dateElem;
    public agentAddress;
    public agentName;


    constructor(private httpClient: HttpClient, private formBuilder: FormBuilder) {
        this.inputMapForm = this.formBuilder.group({
            standAloneDatepicker: [''],
        });
    }


    ngAfterViewInit() {
        this.initMap();
    }

    initMap = async () => {
        var newGeoValue = {};
        newGeoValue = await this.getCurrentGeoPosition();
        this.currLocObj = newGeoValue["coords"];
        this.currPosition = [ this.currLocObj["latitude"].toFixed(7), this.currLocObj["longitude"].toFixed(7) ];
        this.showMap();
        this.drawCurrentPosition();
        this.getAgentDetails();
    }

    submitForm(){
        alert('Appointment successfully booked!!!');
    }

    showMap(){
      this.map = tomtom.L.map('map', {
          key: 'FPM16D61wnehiNcf7YdljWR2RtMRZxjG',
          basePath: '/assets/sdk',
          center: this.currPosition,
          zoom: 15,
          source : 'vector'
        });

      this.currPosLayer = L.tomTomMarkersLayer().addTo(this.map);
      this.agentsPosLayer = L.tomTomMarkersLayer().addTo(this.map);
      this.markersLayer = L.tomTomMarkersLayer().addTo(this.map);
      this.resultsList = tomtom.resultsList().addTo(this.map)

    }

    async getCurrentGeoPosition(){
        var geopromise = new Promise(function(resolve, reject) {
        // the function is executed automatically when the promise is constructed

        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                resolve(position)
            })}
        });

        var promiseVal = await geopromise;
        return promiseVal;
    }

    /*
    * Draw current positon
    */
      drawCurrentPosition() {
        this.currPosLayer.clearLayers();
        var currentLocation = this.currPosition;
        var markerOptions = {
            title: 'Search Center\nLatitude: ' + currentLocation[0] +
            '\nLongitude: ' + currentLocation[1],
            icon: tomtom.L.icon({
                iconUrl: '../assets/img/center_marker.svg',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        };

        this.currPosLayer.addLayer(
            tomtom.L.marker([currentLocation[0], currentLocation[1]], markerOptions)
        );

        //map.fitBounds(currPosLayer.getBounds());
    }

    getAgentDetails(){
        this.httpClient.get('../assets/mock-data/agent-details.json').subscribe(
          (agentsdetails)=>{
            console.log(agentsdetails);
            var placeResults = this.searchPlaces(agentsdetails);
            this.getSearchResults(placeResults, agentsdetails);
          } 
        )
    }

    searchPlaces(agentsdetails){
       var searchCallArr = [];
       agentsdetails.forEach(elem => {
         searchCallArr.push(this.prepareServiceCall('poiSearch', elem.Address));
       });

       return searchCallArr;
    }


    public getSearchResults(searchCallArr, agentsdetails){
         for(var i=0; i<searchCallArr.length; i++){
          let ageDetailsss = {};
          ageDetailsss = agentsdetails[i];
          searchCallArr[i].go((geoResponses) =>{
                if (geoResponses.length > 0) {
                  console.log(geoResponses[0]); 
                  this.drawAgentsPosition(geoResponses[0]);
                  this.draw(geoResponses[0], ageDetailsss);
                }
            })
         }
    }


    /*
    * Draw Agents positon
    */
      drawAgentsPosition = (coords) =>{
        //this.agentsPosLayer.clearLayers();
        var agentCoords = coords.position;
        var markerOptions = {
            title: 'Search Center\nLatitude: ' + agentCoords.lat +
            '\nLongitude: ' + agentCoords.lon,
            icon: tomtom.L.icon({
                iconUrl: '../assets/img/waypoint.png',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        };

        this.agentsPosLayer.addLayer(
            tomtom.L.marker([agentCoords.lat, agentCoords.lon], markerOptions)
        );

        //map.fitBounds(currPosLayer.getBounds());
    }

    prepareServiceCall = (searchName, queryValue) => {
          var selectedLangCode = 'en-US';
          var queryValue = queryValue; //'important tourist attraction';
          var minFuzzyValue = '1';
          var maxFuzzyValue = '2';
          var limitValue = '5';
          var viewValue = 'IN'
          var currentLocation = this.map.getCenter();
          var defaultOpts = {unwrapBbox: true};
          var call;

          call = tomtom[searchName](defaultOpts).query(queryValue).radius('1000000');
          call = call.language(selectedLangCode);

          if (!this.configureServiceCall(searchName, call)) {
              return null;
          }

          return call
              .limit(limitValue)
              .view(viewValue);
      }

      configureServiceCall(searchType, call) {
          var coordinates = this.currPosition;
          if (coordinates) {
              call.center(coordinates);
          } else {
              return false;
          }

          if (searchType === 'nearbySearch') {
              call.radius(10000);
          } else {
              call.radius(200000);
          }
          return true;
      };

            /*
            * Get result distance from search center
            */
            getResultDistance(result) {
                if (typeof result.dist !== 'undefined') {
                    return result.dist;
                } else if (typeof result.ps !== 'undefined') {
                    return this.getDistance(result.ps.split(' '));
                }
                return '';
            }

                        /*
            * Calculate distance between map center and point
            */
             getDistance(point) {
                var currentLocation = this.map.getCenter();
                var mapCenterPoint = tomtom.L.latLng([this.currPosition[0], this.currPosition[1]]);
                return mapCenterPoint.distanceTo(point);
            }

            /*
            * Prepare result element for popup and result list
            */
             prepareResultElement = (result, agentsdetails) =>{
                var resultElement = new tomtom.L.DomUtil.create('div', 'geoResponse-result');
                var name = agentsdetails.Name;
                var adress = agentsdetails.Address;
                var distance = this.getResultDistance(result);
                var designation = agentsdetails.Position;

                let reslink = 'for more details...';


                if (typeof name !== 'undefined') {
                    var nameWrapper = tomtom.L.DomUtil.create('div', 'geoResponse-result-name');
                    nameWrapper.innerHTML = name;
                    resultElement.appendChild(nameWrapper);
                }

                if (typeof designation !== 'undefined') {
                    var designationWrapper = tomtom.L.DomUtil.create('div', 'geoResponse-result-designation');
                    designationWrapper.innerHTML = designation;
                    resultElement.appendChild(designationWrapper);
                }

                if (typeof adress !== 'undefined') {
                    var addressWrapper = tomtom.L.DomUtil.create('div', 'geoResponse-result-address');
                    addressWrapper.innerHTML = adress;
                    resultElement.appendChild(addressWrapper);
                }

                if (typeof distance !== 'undefined') {
                    var distanceElement = tomtom.L.DomUtil.create('div', 'geoResponse-result-distance');
                    distanceElement.innerHTML = tomtom.unitFormatConverter.formatDistance(distance);
                    resultElement.appendChild(distanceElement);
                }


                if (typeof reslink !== 'undefined') {
                    let linkWrapper = tomtom.L.DomUtil.create('a');
                    linkWrapper.title = reslink;
                    linkWrapper.innerHTML = reslink;
                    linkWrapper.dataset.toggle = 'modal';
                    linkWrapper.href = '#overlayval';
                    linkWrapper.onclick = () => {
                        this.sendMessage(result, agentsdetails);
                    }
                    resultElement.appendChild(linkWrapper);
                }

                return resultElement;
            }

            sendMessage(result, agentsdetails){
                this.commentslist = agentsdetails.Comments;
                this.starsCount = parseInt(agentsdetails.Rating);
                this.imageLink = agentsdetails.imagePath;
                this.agentAddress = agentsdetails.Address;
                this.agentName = agentsdetails.Name;
            }

            draw(searchResponses, agentsdetails) {
                var markerOpt = {
                    noMarkerClustering: true
                };

                //this.resultsList.clear().unfold();
                var point = searchResponses;
                    var geoResponseWrapper = this.prepareResultElement(point, agentsdetails);
                    var viewport = point.viewport;
                    this.resultsList.addContent(geoResponseWrapper);
                    geoResponseWrapper.onclick = () =>{
                        if (viewport) {
                            this.map.fitBounds([viewport.topLeftPoint, viewport.btmRightPoint]);
                        } else {
                            this.map.panTo(this.currPosition);
                        }
                    }
            }

}