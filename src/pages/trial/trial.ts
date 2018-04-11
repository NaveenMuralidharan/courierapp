import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert, AlertController } from 'ionic-angular';
import { OrderProvider } from '../../providers/order/order';
import { PolygonProvider } from '../../providers/polygon/polygon';

import ramda from 'ramda';
import firebase from 'firebase';

declare var google;


@IonicPage()
@Component({
  selector: 'page-trial',
  templateUrl: 'trial.html',
})

 
  
export class TrialPage {
  
  public listDetails: any;
  public dateUnderReview: any;
  public stopPosition: string;



  public dateCreated: string;
  public listName: string;
  public newOrdersRef: firebase.database.Reference;
  public listKey: any = '';
  public orderArray: Array<any> = [];
  public datesArray: Array<any> = [];
  public postalsArray: Array<any> = [];
  
  public newPostalsArray: Array<any> = [];
  public newViewArray: Array<any> = [];


  public postalOrdersArray: Array<any> = [];
  public markerArray: Array<any> = [];
  public assignableArray: Array<any> = [];
  public routesArray: Array<any> = [];
  // public zonesArray: Array<any> = [];
  // public zoneCoordinates: Array<any> = [];
  // public zoneMarkers: Array<any> = [];
  public selectedMarkersArray: Array<any> = [];
  // public newPostalsArray: Array<any> = [];
  public sortFailedOrders: Array<any> = [];
  public zoneIndices: Array<any> = [];
  
  public details: any;


  public zoneDetails: any;
  public zoneUnderView: boolean = false;
  public markingZone: boolean = false;
  public showingRoutes: boolean = false;
  public filterOn: boolean = false;
  public markerSelected: boolean = false;
  public searchAddress: boolean = false;
  public addingStop: boolean = false;

  public zone: any;
  
  
  // public zoneBusinessCount: number = 0;
  // // public zoneOsnrCount: number = 0;
  // public zoneHeaviesCount: number = 0;
  // public zoneEnvelopesCount: number = 0;
  // public zoneScreensCount: number = 0;
  
  public trialRoutesArray: Array<any> = [];
  public noRoutes: boolean = false;
  public viewOsnr: boolean = false;
  public viewBusiness: boolean = false;
  public viewRoutes: boolean = false;
  public newPostal: boolean = false;
  public listFilterOn: boolean = false;
  public postalSelected: boolean = false;
  public routeUnderCreation: boolean = false;
  public viewedArea: any;
  
  
  public showBreakdown: boolean = false;

  public showOrders: boolean = false;
  public dateChosen: boolean = false;
  public choosingMarkers: boolean = false;
  public enrichedData: any;
  public postalCode: any;
  public clickedOrder: any;
  // public gCoords: any;
  
  public autoCompleteService: any;
  public cityBounds: any;
  public query: any;
  public places: Array<any> = [];
  
  
  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public orderProvider: OrderProvider, public alertCtrl: AlertController,
              public polygonProvider: PolygonProvider) 
              {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrialPage');

    this.lastFewDays();
    this.loadMap();
    this.autoCompleteService = new google.maps.places.AutocompleteService();
    
    //  
    this.cityBounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng(45.331342, -76.424771),
                        new google.maps.LatLng(45.508702, -75.007534)
                  );
  }

// Generate timestamp

  chooseDate(): void {
  this.dateChosen = false;
}

  currentDate(): string {

    let currentTime = new Date();
    let day = currentTime.getDate();
    let month = currentTime.getMonth()+1;
    let year = currentTime.getFullYear();
    
    let dateStamp = day+'-'+month+'-'+year;

    return dateStamp;
    
  }
  

  lastFewDays(): void {

    let currentTime = new Date();
    let day = currentTime.getDate();
    let month = currentTime.getMonth()+1;
    let year = currentTime.getFullYear();
    
    let daysArray = [day, day-1, day-2];
    
    this.datesArray = daysArray.map((day) => {
     return day+'-'+month+'-'+year;
     
    // this.dateProvider.last5
     
   });
    
  }
  

//RETREIVE ORDERS FOR CHOSEN DATE FROM /ORDERS  
  getNewOrders(dateCreated): void {
   
    this.dateChosen = true;
    
    this.dateUnderReview = dateCreated;
    
    // create reference to orders node for the chosen date
    let listRef = firebase.database().ref(dateCreated+'/orders');

    // Attach a listener for assigned and removed orders 
    
    listRef.on('child_changed', data => {
      let order = data.val();
      let orderKey = data.key;
    
        //If order was assigned, 
          if(order.assigned == true)
          {
            console.log("change - order assigned "+order.address);
            // update order's assigned status and route in postalsArray
            this.updateOrder(order);
            
            // push order into its route
            this.addAssignedOrder(order);  
            return
          } 
          
        // //check if order was unassigned 
          else if(order.assigned == false) 
          {
            console.log("change - order assigned "+ order.address);

            // update order's assigned status and route in postalsArray
            this.updateOrder(order);
            
            console.log("order unassigned");
             
            return

          }
          
        //else 
          else 
          {
            console.log("other change");
          } 
      
    });
    // end of listener
    
    // Child added listener - sort orders after filtering deleted ones 
    listRef.on('child_added', data => {
     
      let order = data.val();
      let orderKey = data.key;
    
    // filter for UNdeleted orders
      if(order.deleted == false){
      // console.log(order);
      
        //if order is assigned 
          if(order.assigned == true)
              {
                console.log("assigned order -225" + order.address);
                // this.addAssignedOrder(order);
                // return
              }
        //else if order is UNassigned      
          else {
                console.log("unassigned order -231" + order.address);
                // order.route = 'none';
                // order.id = orderKey;
                this.addNewOrder(order);
          }
      }
      
    });
    // end of listener
    
  }
  
  // move assigned 
  
  // moveToAssigned(order): void {
    
  //   // console.log("order index "+ order.orderIndex);
  //   //         console.log("postal index "+ order.postalIndex);
  //   // console.log(this.postalsArray[order.postalIndex].unassigned);
    
    
  //   this.postalsArray[order.postalIndex].unassigned = this.postalsArray[order.postalIndex].unassigned - 1;
    
  //   console.log(this.postalsArray[order.postalIndex].unassigned);
    
  //   this.postalsArray[order.postalIndex].orders[order.orderIndex].assigned = true;
    
  //   this.postalsArray[order.postalIndex].assignedOrders.push(order);
    
    
  // }
  
  
  // update order - assigned status and route in postalsArray

  updateOrder(changedOrder): void {
    
    // let increment = -1;
    
  // if order is assigned, update assigned property in orders list, add to route, 
    // if(updatedOrder.assigned == true) {
    //   increment = 1;
    // } else {
    //   increment = -1; 
    // }
      
      console.log("from update order - assigned "+changedOrder.address);
      
      // find postal that order belongs to, 
      // decrease unassigned orders count,
      // change order's assigned to true
      this.postalsArray.forEach((postal, postalIndex) => {
        
        if(changedOrder.postalCode == postal.code){
          
            this.postalsArray[postalIndex].unassigned - 1;
            
            this.postalsArray[postalIndex]
                .orders
                .forEach((order, orderIndex) => {
                  
                  if(order.id == changedOrder.id){
                    
                    this.postalsArray[postalIndex].orders[orderIndex].assigned = changedOrder.assigned;
                    this.postalsArray[postalIndex].orders[orderIndex].route = changedOrder.route;
                    
                  }
                  
                });
        }
        // else, create new postal and push order
        else {
          
          this.addFirstPostalOrder(changedOrder);
          
        }
        
      });
      
      
      
    // // else if order was removed
    if(order.assigned == false) {
      
      console.log("from update order - removed "+order.address);
      
        if(this.postalsArray[order.postalIndex]){
            
          this.postalsArray[order.postalIndex].unassigned 
            = this.postalsArray[order.postalIndex].unassigned + 1;
          
          // find order and set assigned as false
          
          this.postalsArray[order.postalIndex].orders.forEach((listOrder, listOrderIndex) => {
            
            if(order.id == listOrder.id) {
              
              this.postalsArray[order.postalIndex].orders[listOrder.orderIndex].assigned = false;  
              
            }
            
          });
          
          

        } 
        // postal is NA, add new one
        else {
          console.log("from update order - removed and postal NA"+order.address);
          
          this.addNewOrder(order);

        }
      
    }
    
  }
  
  
  // Add new order to its postal
  
  addNewOrder(order) {
    
    let coords = new google.maps.LatLng(order.lat, order.lng);
    
    // add marker to order
    let newMarker = {};
    let icon = "http://www.google.com/mapfiles/marker.png";

    newMarker = new google.maps.Marker({
                                    title: order.address,
                                    // map: this.map,
                                    position: coords,
                                    icon: icon
                                  });
    
    order.marker = newMarker;
    
    // push order into its postal
    let foundPostal = false;
    
    let length = this.postalsArray.length;
    
    // if postalsArray is NOT empty 
    if(length > 0){
      
        // check if postal is already in postalsArray
        for(let i=0; i < length; i++)
      
         {     
              let postal = this.postalsArray[i];
              
              if(postal.code == order.postalCode) {
                
                foundPostal = true;
                  
                // push order into assigned or unassigned based on status
                this.postalsArray[i].orders.push(order);
                // increment unassigned number by 1
                this.postalsArray[i].unassigned += 1;
              }
        
         }
         
        //if postal was not found 
        if(foundPostal == false){
          
          this.addFirstPostalOrder(order);
          return
          
        }
      
      } 
    // if postalsArray is empty 
    else {
        this.addFirstPostalOrder(order);
        return
      
    }
    
  }
  
  // Add assigned order to its postal
  
  addAssignedOrder(order) {
    
    let coords = new google.maps.LatLng(order.lat, order.lng);
    
    // add marker to order
    let newMarker = {};
    let icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
    
    newMarker = new google.maps.Marker({
                                    title: order.address,
                                    map: this.map,
                                    position: coords,
                                    icon: icon
                                  });
    
    order.marker = newMarker;
    
    // push order into its route
    let foundRoute = false;
    
    let length = this.routesArray.length;
    
    if(length > 0){
      
        let foundRoute = false;
      
        for(let i=0; i < length; i++)
      
         {     
              let route = this.routesArray[i];
              
              if(route.name == order.route) {
                console.log("found order's route "+ order.address);
                  foundRoute = true;
                  this.routesArray[i].orders.push(order);
                  return
              }
        
         }
      
        //if postal was not found 
          if(foundRoute == false){
          
          console.log("new route order 456"+ order.address);
            this.addFirstRouteOrder(order);
            return
          }
      
    } else {
      
        console.log("new route order 463"+ order.address);
        this.addFirstRouteOrder(order);
        return
    }
    
  }
  
  // create new postal and push order
  addFirstPostalOrder(order) {
    console.log("Adding first postal order");
    //create new postal obj 
    let newPostal = {
                      code: order.postalCode,
                      selected: false,
                      unassigned: 0,
                      orders: []
                    }  
    
    let length = this.postalsArray.push(newPostal);
    let postalIndex = length - 1;
    
    // push order into postal's orders array 
    this.postalsArray[postalIndex].orders.push(order);
    
    // increase unassigned count
    this.postalsArray[postalIndex].unassigned += 1;

  }
  
  // create new route and push order
  addFirstRouteOrder(order) {
     
    let newRoute = {
                      name: order.route,
                      selected: false,
                      orders: [],
                      stops: []
                    }  
    
    let length = this.routesArray.push(newRoute);
    let routeIndex= length - 1;
    console.log("new route is "+ newRoute.name);
    this.routesArray[routeIndex].orders.push(order);

  }
  
  
 //RETREIVE ORDERS FOR ALL ROUTES /ROUTES
  getAllRoutes(dateCreated, listType): void {
    
    let listRef = firebase.database().ref(dateCreated+'/'+listType);


      listRef.once('value', data => {
        
        let listEntries = data.val();
        
        // console.log("entries in /postal "+listEntries);
        
        for(let entry in listEntries) {
            
            console.log("entry " + entry);          
            if(listEntries.hasOwnProperty(entry)) {
              
                let value = listEntries[entry];
                
                console.log("value " + value.name);          
                
                // do something with each element here
                let newRoute = {
                          name:        value.name,
                          dateCreated: value.dateCreated,
                          selected: false,
                          orders: [],
                          stops: []
                        };
                
                // // this.routesArray[routeIndex] =  newRoute;
                
                let routeIndex = this.routesArray.push(newRoute) - 1;
                
                this.addListListener(dateCreated, value.name, routeIndex, listType);
                this.addStopsListener(dateCreated, value.name, routeIndex, listType);  
        
            }
            
        }
                    
      });
    
  }   
      
// listen for new orders added to route

addListListener(dateCreated, listName,listIndex, listType): void {
    
    
    let listRef = firebase.database()
                          .ref(dateCreated+'/'+listType+'/'+listName+'/orders');
    
  // listen for child added
    listRef.on('child_added', data => {
        
        let order = data.val();
        
        console.log("new order in route " + order);
        
        if(order.assigned == true){
          
        console.log("new order in route " + order);
          
        let newMarker = {};
        let icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
        let title = order.route + order.address; 
        let coords = new google.maps.LatLng(order.lat, order.lng);
        
        newMarker = new google.maps.Marker({
                                    title: title,
                                    map: this.map,
                                    position: coords,
                                    icon: icon
                                  });
    
        order.marker = newMarker;
        order.selected = false;
        
        let length = this.routesArray[listIndex].orders.push(order); 
        let orderIndex = length - 1;
        
      // Attach click listener
          google.maps.event.addListener(order.marker, 'click', () => {
          
          order.selected = !order.selected;
            
          // console.log(order.selected);  
          // if marker was selected, 
            if(order.selected == true){
                 
                  // highlight marker, 
                  let icon = "http://labs.google.com/ridefinder/images/mm_20_yellow.png";
                  order.marker.setIcon(icon);
                  this.routesArray[listIndex].orders[orderIndex].selected = true;
                  // test
                  console.log(this.routesArray[listIndex].orders[orderIndex].selected);
                  
            } 
            else {
              
                  // de-select marker
                  let icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
                  order.marker.setIcon(icon); 
                  this.routesArray[listIndex].orders[orderIndex].selected = false;
                  // test
                  console.log(this.routesArray[listIndex].orders[orderIndex].selected);
                  
            }
    });
      // end of google map listener        
          
}
        

});
    
  // listen for child changed - reassigning of removed orders
    
  // listRef.on('child_changed', data => {
      
  //     let order = data.val();
  //     if(order.assigned == true){
        
  //       let newMarker = {};
  //       let icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
  //       let title = order.route + order.address; 
  //       let coords = new google.maps.LatLng(order.lat, order.lng);
        
  //       newMarker = new google.maps.Marker({
  //                                   title: title,
  //                                   map: this.map,
  //                                   position: coords,
  //                                   icon: icon
  //                                 });
    
  //       order.marker = newMarker;
  //       order.selected = false;
        
  //       let length = this.routesArray[listIndex].orders.push(order); 
  //       let orderIndex = length - 1;
        
  //     // Attach click listener
  //         google.maps.event.addListener(order.marker, 'click', () => {
          
  //         order.selected = !order.selected;
            
  //         // console.log(order.selected);  
  //         // if marker was selected, 
  //           if(order.selected == true){
                 
  //                 // highlight marker, 
  //                 let icon = "http://labs.google.com/ridefinder/images/mm_20_yellow.png";
  //                 order.marker.setIcon(icon);
  //                 this.routesArray[listIndex].orders[orderIndex].selected = true;
  //                 // test
  //                 console.log(this.routesArray[listIndex].orders[orderIndex].selected);
                  
  //           } 
  //           else {
              
  //                 // de-select marker
  //                 let icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
  //                 order.marker.setIcon(icon); 
  //                 this.routesArray[listIndex].orders[orderIndex].selected = false;
  //                 // test
  //                 console.log(this.routesArray[listIndex].orders[orderIndex].selected);
                  
  //           }
  //   });
  //     // end of google map listener        
        
          
  //     }
      
  //   });
    
    
  }  
  
// listen for new stops added to route 
  
addStopsListener(dateCreated, listName, listIndex, listType): void {

    let stopsRef = firebase.database().ref(dateCreated+'/'+listType+'/'+listName+'/stops');
    
    stopsRef.on('child_added', data => {
      
      let stop = data.val();
      
      console.log("new stop added "+ data.val().address + data.val().position);
      
      if(stop.deleted == true){
          
          return
          
      }
      else {
        
        
      // find route the stop belongs to and add it
         this.routesArray.forEach((route, routeIndex) => {
              if(route.name == listName){
          //check if stop is a breakpoint 
                  if(stop.position != 'start' && stop.position != 'end'){
                    
                      let message = "Breakpoint after " + stop.position;
                      stop.message = message;
                      console.log("stop deleted "+ stop.deleted);

                      this.routesArray[routeIndex].stops.push(stop);
                 
                  }
          // else it is a start or end point 
                  else {
                    
                      let message = stop.position;
                      stop.message = message;
                      console.log("stop deleted "+ stop.deleted);
                      this.routesArray[routeIndex].stops.push(stop);
                    
                  }
                  
              }
      });
      
      }
      
    });  
  
} 



// showRoutes() {
  
//   this.showingRoutes = true;
  
// }  
  
hideRoutes() {
  this.showingRoutes = false;
}

      
// method to sort each order into postals
  sortOrder(order) {
  
    //create places service and send to , save in postal
    
      let service = new google.maps.places.PlacesService(this.map);
          
          service.getDetails({placeId: order.placeId}, (place, status) => {
              if(status == "OK") 
              {
                    
                    //Extract postal code from place details result,  
                      let index = place.address_components.length - 1;
                      
                      let postalCodeComponent =  place.address_components[index];
                      let postalCodeLong = postalCodeComponent.long_name;
                      let postalCode = postalCodeLong[0]+postalCodeLong[1]+postalCodeLong[2];

                    //Create latlng object with coordinates from place details result 
                      let lat = place.geometry.location.lat();
                      let lng = place.geometry.location.lng();
                    console.log("place found " + lat + lng+ postalCode);

                    // save order to its postal in db
                      // this.orderProvider.saveToPostal(order.id, order, postalCode, lat, lng);
                      
                      this.orderProvider.savePostalDemo(postalCode, order, lat, lng)
                          .then(() => {
                                
                              console.log("order saved in postal"); 
                            
                          });
                      
                      
                      this.updateDisplay(postalCode);
                      } 
              //place service failed,
              else 
              {
                   
                  
                      this.sortFailed(order);
                      console.log("place lookup failed" + status);
              }

            });
    // end of places service  
  }
  
//start sort failed 
  
sortFailed(order) {
    // show orders that failed sort in view
    this.sortFailedOrders.push(order);
    // have a retry button
    
  }
  
  
retrySort(): void {
  
  this.sortFailedOrders.forEach(order => {
    
    this.sortOrder(order);
    
  });
  
}  
  
  
// UPDAtE Display 

  updateDisplay(postalCode): void {
    
    let foundPostal = false; 
    
    if(this.postalsArray.length > 0) {
      this.postalsArray.forEach((postal, i) => {
          // console.log("comparing" + postalCode +"with "+postal.code);
          
          if(postal.code == postalCode) {
                // console.log("matched "+postal.code);
                this.postalsArray[i].orders += 1; 
                foundPostal = true;
          }
          
        });
    }
    
    if(!foundPostal){
        this.postalsArray.push(
                            {
                              code: postalCode,
                              orders: 1,
                              selected: false
                            }
                          );
    }
    
  }
  
  
// NEW VIEW POStAL

viewPostal(postal, postalIndex): void {
 
//SETUP: 
  //boolean to indicate that a postal is under view 
    // (prevents user from clicking other postals)
   this.postalSelected = true;

  //set selected property of postal to true
   this.postalsArray[postalIndex].selected = true; 
   
  // boolean to setup order selection by clicking markers
   this.markerSelected = false;
   
  // details object which will hold breakdown of orders in postal
   this.details = {};
   
  // setup holding array for orders of selected postal  
   this.postalOrdersArray = [];
   
   this.postalOrdersArray.push({
                                  code: postal.code,
                                  orders: []
                              });
  
  // copy all unassigned orders into view - postal orders array 
   this.postalsArray[postalIndex].orders.forEach((order, orderIndex) => {
     
     if(order.assigned == false){

        // show order on map
          order.marker.setMap(this.map);  
          
        //save orderIndex and postalIndex of order to locate it on assignment 
          order.postalIndex = postalIndex;
          order.orderIndex = orderIndex; 

          // Attach click listener
            google.maps.event.addListener(order.marker, 'click', () => {
          
                order.selected = !order.selected;
            
                // if marker was selected, 
                  if(order.selected == true){
                       
                        this.markerSelected = true;
                        
                        // highlight marker
                        let icon = "http://www.google.com/mapfiles/dd-start.png";
                        order.marker.setIcon(icon);
                        this.postalOrdersArray[0].orders[orderIndex].selected = true;
                        
                        console.log("order selected "+this.postalOrdersArray[0].orders[orderIndex].address);
                        
                    } 
                // if marker was unselected, 
                  else {
                        // de-select marker
                        let icon = "http://www.google.com/mapfiles/marker.png";
                        order.marker.setIcon(icon); 
                        this.postalOrdersArray[0].orders[orderIndex].selected = false;
                        
                        console.log("order un-selected " + this.postalOrdersArray[0].orders[orderIndex].address);
                        
                   }
            });
          // end of click listener

          this.postalOrdersArray[0].orders.push(order);
     }
      
   });
   
}
  
processOrder(order, postalIndex): void {
    
                // push order into postalOrdersArray 
                    let ordersLength = this.postalOrdersArray[postalIndex].orders.push(order);
                    let orderIndex = ordersLength - 1;
              
              console.log("adding marker");
              
                // Create marker with index corresponding to order's index in postalOrdersArray
                    this.addMarker(order, postalIndex, orderIndex);
  
    
  }
               
  
//Listener for orders being assigned - 
    // updates assigned order in postalOrdersArray and markerArray
  attachAssignedListener(listRef) {
    
    // Attach listener
    listRef.on('child_changed', data => {
     
      //if order was assigned,  
      if(data.val().assigned == true){
     
      //loop through postals array
      
       this.postalsArray.forEach((postal, postalIndex) => {
          
          // find postal of assigned order
          // check if it is being viewed currently
          if(postal.code == data.val().postalCode)
          {
            
            // if postal is under view, deal wih markers
            if(postal.selected == true){
              this.postalOrdersArray[0]
                  .orders
                  .forEach((order, orderIndex) => {
                    
                    console.log(order);
                    
                        if(order.id == data.val().id){
                            
                            // this.postalOrdersArray[0].orders[orderIndex] = {}; 
                            let assignedOrderMarker = this.markerArray[0].markers[orderIndex];
                            
                            assignedOrderMarker.setMap(null); 
                            // this.markerArray[0].markers[orderIndex] = null;
                            
                            console.log(this.postalsArray[postalIndex].orders);
                            
                            // decrease  unassigned order count in postals Array
                            let count = this.postalsArray[postalIndex].orders;
                            this.postalsArray[postalIndex].orders = count - 1; 
                        }
                  });
            } 
            
            // else just delete from postals array
            else {
              
              // only delete order in postals Array
              console.log(postal.orders);
              
              postal
                  .orders
                  .forEach((order, orderIndex) => {
                    
                      if(order.id == data.val().id){
                            // decrease  unassigned order count in postals Array
                            let count = this.postalsArray[postalIndex].orders;
                            this.postalsArray[postalIndex].orders = count - 1;  
                        }
                    
                  });
              
              
            }    
            
            
          }
          
        });
      
      }
      
    });
    
  }
  
 
// HIDE VIEW POStAL's orders and markers

  closePostal(): void {

    this.postalSelected = false;

    // set selected property of postal in postalsArray to false
    this.postalsArray.forEach((postal, i) => {
          if(postal.selected == true) {
              this.postalsArray[i].selected = false;
          }
      });
  
    // clear markers
     this.postalOrdersArray[0].orders.forEach((order) => {
       
        order.marker.setMap(null);
       
     });
     
    // clear any polygons
    this.eraseZone();
     
    // clear postalOrdersArray
    this.postalOrdersArray = [];
  

  
  // // refreshview
  // this.refreshView();
  }
  



// LOAD MAP 
  loadMap() {
    
    let coords = new google.maps.LatLng(45.418216, -75.667683);

    let mapOptions = {
          center: coords,
          zoom: 10, 
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    console.log(mapOptions);
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }
 

//  add marker for order
  addMarker(order, postalIndex, orderIndex) {
    
    let coords = new google.maps.LatLng(order.lat, order.lng);
    
              let newMarker = {};
              let icon = "http://www.google.com/mapfiles/marker.png";

              newMarker = new google.maps.Marker({
                                    title: order.address,
                                    map: this.map,
                                    position: coords,
                                    icon: icon
                                  });
          
              // // Save marker To array,
              //   this.addMarkerToArray(newMarker, order);
           
      //     // Attach click listener
      //     google.maps.event.addListener(newMarker, 'click', () => {
            
      //       // console.log("marker clicked");
      //       // // toggle selected property
      //       this.postalOrdersArray[postalIndex].orders[orderIndex].selected 
      //           = !this.postalOrdersArray[postalIndex].orders[orderIndex].selected;
            
      //       let selected = this.postalOrdersArray[postalIndex].orders[orderIndex].selected;
           
      //     // if marker was selected, 
      //       if(selected == true){
              
      //             // highlight marker, 
      //             let icon = "http://www.google.com/mapfiles/dd-start.png";
      //             newMarker.setIcon(icon);
                  
      //             //add selected marker to array and show in view 
      //             this.selectedMarkersArray.push(newMarker);
                      
      //       } else {
      //             // de-select marker
      //             let icon = "http://www.google.com/mapfiles/marker.png";
      //             newMarker.setIcon(icon); 
                      
      //       }
      // });
      // // end of google map listener 
   
   // Save marker To array,
      this.addMarkerToArray(newMarker, order);  
    
  }
  // END OF ADD MARKER 
  
  // ADD MARKER To MARKER ARRAY
  addMarkerToArray(newMarker, order): void {
    // console.log("marker added to array");
        let newPostal = true;
 
            if(this.markerArray.length > 0) {
                      
                      this.markerArray.forEach(marker => {
                          if(marker.postalCode == order.postalCode){
                              newPostal = false;
                              marker.markers.push(newMarker);
                          } 
                      }); 
          
            }
    
    if(newPostal) {
                      let length = this.markerArray.push(
                                  {
                                    postalCode: order.postalCode,
                                    markers: []
                                  }
                            );
                      let index = length - 1;
                      this.markerArray[index].markers.push(newMarker);
                }
                
  // console.log(this.markerArray);
    
  }
      



// refresh  view - empty postal orders and markers,
// and reload selected postal
  refreshView(): void {
    // console.log("refreshing display");
    
    // empty out postalOrders and markerArrays
    this.postalOrdersArray = [];

    // if any markers in ayrray, clear them
    if(this.markerArray.length > 0) {
      
      this.markerArray.forEach((marker, i) => {
          
          this.markerArray[i].markers.forEach(marker => {
            
            if(marker != null) {
              marker.setMap(null);
            }
            
          });
    });
    this.markerArray.length = 0;
    this.markerArray = [];
      
    }
    
    // Repopulate view with selected postals and associated markers
    this.postalsArray.forEach((postal, i) => {
      
      if(postal.selected){
            this.viewPostal(postal, i);
      }
      
    });
    
  }
  
  
  
  
  selectAllOrders(postalIndex): void {
        
        this.markerArray[postalIndex].markers.forEach(marker => {
          marker.setIcon('http://www.google.com/mapfiles/dd-start.png');
        });
    
       this.postalOrdersArray[postalIndex].orders.forEach(order => {
          order.selected = true;
       });
    
  }
  
  // Get induvidually selected orders in postalOrdersArray
  getSelectedOrders() {
    
        // this.assignableArray = [];
      let assignableArray = [];
          this.postalOrdersArray.forEach((postal, postalIndex) => {
              
              postal.orders.forEach((order, orderIndex) => {
 
                  if(order.selected){
                    
                    let assignedOrder = order;
                    assignedOrder.orderIndex = orderIndex;
                    assignedOrder.postalIndex = postalIndex;
                    // this.assignableArray.push(assignedOrder);
                    assignableArray.push(assignedOrder);
                    
                  }
              });
              
          });
        
        
          console.log("Assignable "+ assignableArray);
          return assignableArray;
          // console.log("Assignable "+ this.assignableArray);

  }
   
  
  createRoute(): void {
    
  // Prompt user for route name
    const alert: Alert = this.alertCtrl.create({
          message: "Drop pins to mark a zone and hit Create Zone",
          inputs: [
              { name: 'routeName', placeholder: 'Route name'}
            ],
        buttons: [
                    {text: 'Cancel', role: 'Cancel'},
                    {
                      text: 'OK', 
                      handler: data => {
                        // push new route into routes array
                         
                          let newRoute = {
                                        name: data.routeName,
                                        dateCreated: this.dateUnderReview,
                                        selected: false,
                                        orders: [],
                                        stops: []
                                      };
                          let routeIndex = this.routesArray.push(newRoute) - 1; 

                          
                          this.orderProvider.createRoute(this.dateUnderReview, data.routeName)
                              .then(()=> {
                                
                                  let listType = 'routes';
                                  this.addListListener(this.dateUnderReview, newRoute.name,routeIndex, listType);
                                  this.addStopsListener(this.dateUnderReview, newRoute.name, routeIndex, listType);  

                              });
                            
                      }
            
                    }        
                ]
      
    }); 
    
    alert.present();
  }
  
  
  
//method to allow choosing orders by clicking markers 
allowMarkerChoosing(): void {
  this.choosingMarkers = true;
  // loop markers
  
  this.markerArray[0].markers.forEach((marker, markerIndex) => {
    
    // Attach click listener
          google.maps.event.addListener(marker, 'click', () => {
            console.log("postalOrdersArray "+ this.postalOrdersArray);
            console.log("markerIndex "+ markerIndex);
            
            // // toggle selected property
            this.postalOrdersArray[0].orders[markerIndex].selected 
                = !this.postalOrdersArray[0].orders[markerIndex].selected;
            
            let selected = this.postalOrdersArray[0].orders[markerIndex].selected;
           
          // if marker was selected, 
            if(selected == true){
              
                  // highlight marker, 
                  let icon = "http://www.google.com/mapfiles/dd-start.png";
                  marker.setIcon(icon);
                  
                  //add selected marker to array and show in view 
                  // this.selectedMarkersArray.push(newMarker);
                      
            } else {
                  // de-select marker
                  let icon = "http://www.google.com/mapfiles/marker.png";
                  marker.setIcon(icon); 
                      
            }
      });
      // end of google map listener   
  
    
  });
  
}  

stopMarking(): void {
  console.log("stop marking clicked");
  this.choosingMarkers = false;
  
   // de-select and detach listener on markers and set to normal
  
  this.markerArray[0]
      .markers
      .forEach((marker, markerIndex) => {
        
        // detach listener
          google.maps.event.clearListeners(marker, 'click');
        
        // de-select 
          let icon = "http://www.google.com/mapfiles/marker.png";
          marker.setIcon(icon);
      
      });
  
}

saveChosenMarkers(): void {
  console.log("save chosen marker orders into assignable array");
  // get all selected orders in postal orders array
  let selectedOrders = this.getSelectedOrders();
  // console.log(selectedOrders);
  
  // add selected orders to assignable array
  this.assignableArray = [];
  this.assignableArray = selectedOrders;
  
  // enable choose markers button
  // this.choosingMarkers = false;
}


      
// Method to allow zone markking:

markZone() {
  
  // hide postals details
  this.hideDetails();
  
  // prevent user from clicking mark zone again
  this.markingZone = true;
  
  
  this.zone = {
                markers: [],
                coordinates: [],
                orders: [],
                indices: []
              }
  
  
  // add click listener to map
   google.maps.event.addListener(this.map, 'click', (event) => {
        
        let image = "http://labs.google.com/ridefinder/images/mm_20_purple.png";
        // drop marker at each clicked latlng, 
          let newMarker = new google.maps.Marker({
                                          title: "zone boundary",
                                          map: this.map,
                                          animation: google.maps.Animation.DROP,
                                          position: event.latLng,
                                          icon: image,
                                          draggable: true
                                        });
       
        //save coordinate and correspomding marker in respective arrays  
        this.zone.coordinates.push(event.latLng);
        this.zone.markers.push(newMarker);
                    
    });
  //END of map listener  
}  
//END of mark zone


  
//METHOD TO erase A ZONE  
  
eraseZone(): void {
    
    if(this.zoneUnderView == true) {
        this.zone.zonePolygon.setMap(null);      
      
    }
    
    
  // clear zone coordinates 
    this.zone = {};
    
  // enable mark zone button
    this.markingZone = false;
    
    this.zoneUnderView = false;
    
  // detach click listener from map
  google.maps.event.clearListeners(this.map, 'click');
  
}
  
// METHOD TO SEtup ZONE that was MARKED
setupZone(): void {

  // create and display zone polygon overlay
  console.log(this.zone.coordinates);
  
  let coordinates = this.zone.coordinates;
  
  this.zone.zonePolygon = new google.maps.Polygon({
    paths: coordinates,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#668cff',
    fillOpacity: 0.35,
    map: this.map
  });
  
  
  //delete zone boundary markers 
  this.zone.markers.forEach(marker => {
    marker.setMap(null)
  });
  // this.zone.markers.length = 0;
  // this.zone.markers = [];

  // detach click listener from map
  google.maps.event.clearListeners(this.map, 'click');
  this.zoneUnderView = true;

  
}  
// END Save zone

// 

showZoneDetails(): void {
  
  this.setupZone();
  
  // filter orders in postalOrders that are inside polygon 

  let zoneOrders = {
                          orders: [],
                          orderIndices: []
                        };

  zoneOrders = this.getOrdersInZone(this.zone.coordinates, this.postalOrdersArray[0].orders);

  // this.zone.orders = this.getOrdersInZone(this.zone.coordinates, this.postalOrdersArray[0].orders);

  this.zoneDetails = this.reduceOrderArray(zoneOrders.orders);
  
  this.zoneIndices = zoneOrders.orderIndices;
  console.log("zone order indices are "+this.zoneIndices);
  
  // push into zone holding obj, 
  this.zone.orders = [];
 
console.log(zoneOrders.orders);
  zoneOrders.orders.forEach(order => {
    
    this.zone.orders.push(order);
    
  }); 
  
  console.log("zone.orders afetr show details "+ this.zone.orders[0].address);
  
}
  

// return ORDERS WItHIN POLyGON-
  getOrdersInZone(zoneCoordinates, ordersArray) {
    // console.log("zoneCoordinates before calling inPoly "+ zoneCoordinates)
    
    let ordersInZone = {
                          orders: [],
                          orderIndices: []
                        };
    
    ordersArray.forEach((order, orderIndex) => {
      
         // check if order is inside polygon
          let inPoly = this.polygonProvider.inPoly(zoneCoordinates, order);
    // console.log(inPoly);
    
          // if order is in polygon, push into zone
          if(inPoly == true){

                ordersInZone.orders.push(order);
                ordersInZone.orderIndices.push(orderIndex);
          }  
      
    });
   
   return ordersInZone
  }
  
// Add chosen markers to a route:
  addMarkersToRoute(routeName, routeIndex): void {

      // // get all selected orders in postal orders array

      this.assignableArray.forEach((order) => {
              
          this.routesArray[routeIndex].orders.push(order);
          this.orderProvider.saveToRoute(this.dateUnderReview, routeName, order);
          
          // update order as assigned in db
            
            let updates = [
                            {property: 'assigned', value: true},
                            {property: 'route', value: routeName}
                          ];
            this.orderProvider.updateOrder(order, updates);    
      });
          
      console.log("order makers added to "+ this.routesArray[routeIndex].name);
      // enable choose markers button
      this.choosingMarkers = false;   
      
  }
  
  
// Add zone to a route
  addToRoute(routeName, routeIndex): void {
      
    // save orders in  zone to route in db
       if(this.zoneUnderView == true)  {
         
        this.zone.orders.forEach((order,orderIndex) => {
          
          let assignedOrder = {
                
                id: order.id,
                address: order.address,
                business: order.business,
                dateCreated: order.dateCreated,
                label: order.label,
                listName: order.listName,
                osnr: order.osnr,
                placeId: order.placeId,
                lat: order.lat,
                lng: order.lng,
                postalCode: order.postalCode,
              // updates
                route: routeName,
                assigned: true,
                loaded: false,
                delivered: false,
                orderIndex: order.orderIndex,
                postalIndex: order.postalIndex
                
          };
          
          this.orderProvider.updateOrdersList(assignedOrder)
              .then(() => {this.orderProvider.updateRoutesList(assignedOrder, routeName);})
              .then(() => {
                  
                  this.eraseZone();
                
          // remove markers of assigned orders and delete in postalorders
          if(this.zoneIndices.length > 0)  {
              this.zoneIndices.forEach((orderIndex) => {
          
            // console.log(this.postalOrdersArray[0].orders[orderIndex]);
          
          this.postalOrdersArray[0]
              .orders[orderIndex]
              .marker.setMap(null);
              
          this.postalOrdersArray[0]
              .orders[orderIndex]
              .route = routeName;
              
        }); 
            }     
                
              });
          
          });
         
       } 
       
       
    // save individually selected orders to route in db
        if(this.markerSelected == true)  {
          
           this.postalOrdersArray[0].orders.forEach((order,orderIndex) => {
             
             if(order.selected == true){
                
                // this.orderProvider.saveToRoute(this.dateUnderReview, routeName, order)
                   
                let assignedOrder = {
                
                      id: order.id,
                      address: order.address,
                      business: order.business,
                      dateCreated: order.dateCreated,
                      label: order.label,
                      listName: order.listName,
                      osnr: order.osnr,
                      placeId: order.placeId,
                      lat: order.lat,
                      lng: order.lng,
                      postalCode: order.postalCode,
                    // updates
                      route: routeName,
                      assigned: true,
                      loaded: false,
                      delivered: false,
                    // updates   
                      orderIndex: order.orderIndex,
                      postalIndex: order.postalIndex
                
                };
          
                this.orderProvider.updateOrdersList(assignedOrder)
                    .then(() => {this.orderProvider.updateRoutesList(assignedOrder, routeName);})  
                    .then(() => {
                      console.log("individual order saved in route");
                      
                       this.postalOrdersArray[0]
                            .orders[orderIndex]
                            .marker.setMap(null);
              
                      this.postalOrdersArray[0]
                          .orders[orderIndex]
                          .route = routeName;
                      
                    });
               
             }
             
           });
          this.markerSelected = false;
        }
          
  }
  
// View filters:
  
  applyListFilter(filter) {
    this.listFilterOn = true;
    console.log("filter applied is "+ filter);
    //clear out marker array 
          this.markerArray.forEach(postal => {
            postal.markers.forEach(marker => {
              marker.setMap(null);
            });
            
          });
          this.markerArray.length = 0;
          this.markerArray = [];
    
    // loop through postalOrders and filter orders of list
          this.postalOrdersArray.forEach((postal, postalIndex) => {
            
              postal.orders.forEach((order, orderIndex) => {
                  if(order.listName == filter){
                      this.addMarker(order, postalIndex, orderIndex);
                  }
              });
          
          });
  }
  
  removeAllFilters(){
    this.listFilterOn = false;
    // this.refreshView();
    
    // remake markers for all unassigned orders in postal
    this.postalOrdersArray.forEach((postal, postalIndex) => {
            
              postal.orders.forEach((order, orderIndex) => {
                  if(order.assigned == false){
                      this.addMarker(order, postalIndex, orderIndex);
                  }
              });
          
          });
  
    
  }
  
  showOsnr(){
  // if filter is selected
    if(this.viewOsnr == true) {
        //clear out marker array 
          this.markerArray.forEach(postal => {
            postal.markers.forEach(marker => {
              marker.setMap(null);
            });
            
          });
          this.markerArray.length = 0;
          this.markerArray = [];
          
        // loop tthrough postal orders array and set markers
          this.postalOrdersArray.forEach((postal, postalIndex) => {
              postal.orders.forEach((order, orderIndex) => {
                  if(order.osnr == true){
                      this.addMarker(order, postalIndex, orderIndex);
                  }
              });
          });
    // if filter is not selected, show all   
    } else {
        this.postalOrdersArray.forEach((postal, postalIndex) => {
          postal.orders.forEach((order, orderIndex) => {
                      this.addMarker(order, postalIndex, orderIndex);
              });
        });
    }
    
  }
  
  
  // Business orders view filter
 showBusiness(){
  // if filter is selected
    if(this.viewBusiness == true) {
        //clear out marker array 
          this.markerArray.forEach(postal => {
            postal.markers.forEach(marker => {
              marker.setMap(null);
            });
            
          });
          this.markerArray.length = 0;
          this.markerArray = [];
          
        // loop tthrough postal orders array and set markers
          this.postalOrdersArray.forEach((postal, postalIndex) => {
              postal.orders.forEach((order, orderIndex) => {
                  if(order.business == true){
                      this.addMarker(order, postalIndex, orderIndex);
                  }
              });
          });
    // if filter is not selected, show all   
    } else {
        this.postalOrdersArray.forEach((postal, postalIndex) => {
          postal.orders.forEach((order, orderIndex) => {
                  this.addMarker(order, postalIndex, orderIndex);
              });
        });
    }
    
  }
  
  


// RETRIEVE zones for postals and LISTENER FOR CHANGE 
getAllZones() {
    let zoneListRef = firebase.database().ref(this.dateUnderReview+'/zones');
    
    zoneListRef.on('child_added', data => {
        console.log("from get all zones "+data.val());
    });
    

  }


isOsnr(order) {
  return order.osnr == true;
}


isBusiness(order) {
  return order.business == true;
}

// SHOW ARRAy details

showDetails(ordersArray) {
  
  this.details = this.reduceOrderArray(ordersArray);
   
   console.log(ordersArray);
   
  this.showBreakdown = true;
       
}


// TROUBLESHOOT
reduceOrderArray(ordersArray) {
  
  
return ordersArray.reduce((details, order, orderIndex) => {
  
  if(order.osnr == true) {
      details.osnr.total.count += 1;
      details.osnr.total.indices.push(orderIndex); 
      
      details.osnr[order.listName].count += 1;
      details.osnr[order.listName].indices.push(orderIndex);
      
  } else {
      details.business.total.count += 1;
      details.business.total.indices.push(orderIndex); 
      
      details.business[order.listName].count += 1;
      
      details.business[order.listName].indices.push(orderIndex); 
      
  }
  
  return details
}, {
      osnr: {
              total: {
                count: 0,
                indices: []
              },     
              screens:   {
                count: 0,
                indices: []
              },     
              envelopes: {
                count: 0,
                indices: []
              },     
              heavies:   {
                count: 0,
                indices: []
              }     
            },
      business: {
              total: {
                count: 0,
                indices: []
              },     
              screens:   {
                count: 0,
                indices: []
              },     
              envelopes: {
                count: 0,
                indices: []
              },     
              heavies:   {
                count: 0,
                indices: []
              }     
            }   
    
  }
); 
  
// OLD version
  // {
  //     osnr: {
  //             total:     0,
  //             screens:   0,
  //             envelopes: 0,
  //             heavies:   0
  //           },
  //     business: {
  //             total:     0,
  //             screens:   0,
  //             envelopes: 0,
  //             heavies:   0
  //           }      
    
  // }
  
}


clearAllMarkers(): void{
  
  this.postalOrdersArray[0].orders.forEach(order => {
    
      order.marker.setMap(null);
    
  });
  
}


filterMarkers(indices): void {
  this.filterOn = true;

  
  this.clearAllMarkers();
  
  indices.forEach(index => {
    
    console.log("order index"+ index);
    this.postalOrdersArray[0].orders[index].marker.setMap(this.map);
    
  });
  
}


// SHOW ARRAy details
 
hideDetails(): void {
  
  // this.details = {};
  
  this.showBreakdown = false;
  
  
}



// add stops in route

addStop(position, routeName): void {
  
  this.addingStop = true;
  this.stopPosition = position;
  
}

// delete stop

deleteStop(chosenStop): void {
  
  console.log(chosenStop.deleted);
  
  // set stop's deleted property to true in db 
  
  this.orderProvider
      .deleteStop(chosenStop)
      .then(() => {
    //on success, find route that stop belongs to and remove it 
               this.routesArray.forEach((route, routeIndex) => {
    
                  if(route.name == chosenStop.route) {
      
                    this.routesArray[routeIndex].stops.forEach((stop, stopIndex) => {
        
                           if(stop.id == chosenStop.id){

                               this.routesArray[routeIndex].stops.splice(stopIndex, 1);             
          
                              // this.routesArray[routeIndex].stops[stopIndex].deleted = false;             
                           }
                    });    
                  } 
               });
                      
            });
  
} 

searchPlace(query) {

  if(query.length > 5) {
      
      let config = {
            bounds: this.cityBounds,
            types: ['geocode'],
            input:  query
          };
          
      this.autoCompleteService
          .getPlacePredictions(config, (predictions, status) => {
            
            this.places = [];
            
            if(predictions) {

              predictions.forEach((prediction) => {
                  this.places.push(prediction);
                });
                
            }
            
            else {
              return 
            }
        }); 
      
  }
  
}


choosePlace(place, routeName): void {
  
  console.log("chosen place is " +place);
  
  let stop = {
                    address: place.description,
                    placeId: place.place_id,
                    position: this.stopPosition,
                    postalCode: '',
                    lat: 0,
                    lng: 0
              };
  
  this.addingStop = false;
  this.query = '';
  this.places = [];
  
  
  console.log("stop is "+stop.position);
  
  let service = new google.maps.places.PlacesService(this.map);
          
  service.getDetails({placeId: stop.placeId}, (place, status) => {
            
        if(status == "OK") 
              {
                    //Extract postal code from place details result,  
                      let index = place.address_components.length - 1;
                      
                      let postalCodeComponent =  place.address_components[index];
                      let postalCodeLong = postalCodeComponent.long_name;
                      stop.postalCode = postalCodeLong[0]+postalCodeLong[1]+postalCodeLong[2];

                    //Create latlng object with coordinates from place details result 
                      stop.lat = place.geometry.location.lat();
                      stop.lng = place.geometry.location.lng();
                   
                    // save new stop for route in db
                        this.orderProvider.saveRouteStop(this.dateUnderReview, routeName,stop)
                        .then(newStop => {
                                console.log("New order created - "+ newStop);
                                
                                // this.addingStop = false;
                                // this.query = '';
                                // this.places = [];
                                
                                this.stopPosition = '';
                                
                                // this.routesArray.forEach((route,routeIndex) => {
                                  
                                //   if(route.name == routeName){
                                    
                                //     this.routesArray[routeIndex].stops.push(stop);
                                    
                                //   }
                                  
                                // });
                                
                                // this.refreshForm();
                          });
                        
              }
              //place service failed,
              else 
              {
                    console.log("place lookup failed" + status);
              }

            });
  
}


// set selected property of route to true, and close all other selected routes
showRoute(routeName): void {
  
  this.routesArray.forEach((route, routeIndex) => {
    
    if(route.name == routeName) {
      this.routesArray[routeIndex].selected = true;
    } else {
      this.routesArray[routeIndex].selected = false;
    }
    
  });
  
}

// set selected property of route to false
closeRoute(routeName): void {
   
  // this.addingStop = false;
   
   this.routesArray.forEach((route, routeIndex) => {
    
    if(route.name == routeName) {
      this.routesArray[routeIndex].selected = false;    
    } 
    
  });
  
}

// close search address for stop option
closeSearch(routeName): void {
  
    this.addingStop = false;

}

// allow search for adding custom stops
allowSearch(): void {
  
  this.addingStop = true;
  
}


// select route order
selectRouteOrder(routeIndex, orderIndex): void {
  
  this.routesArray[routeIndex].orders[orderIndex].selected 
   = !this.routesArray[routeIndex].orders[orderIndex].selected;
  
  let select = "http://labs.google.com/ridefinder/images/mm_20_yellow.png";
  let unselect = "http://labs.google.com/ridefinder/images/mm_20_green.png";
  
  if(this.routesArray[routeIndex].orders[orderIndex].selected == true){
    
        this.routesArray[routeIndex].orders[orderIndex].marker.setIcon(select);
    
  } else {
    
     this.routesArray[routeIndex].orders[orderIndex].marker.setIcon(unselect);
    
  }
  
}

// Remove/unassign orders
  removeOrders(routeName, routeIndex): void {
  
  //find route the order was deleted from
    this.routesArray[routeIndex].orders.forEach((order, orderIndex) => {
        
        // let routeName = order.route;
        // get all selected orders, alert user to remove
        if(order.selected == true){
          
          // make order obj updating assigned and route properties
          
          let removedOrder = {
                
                id: order.id,
                address: order.address,
                business: order.business,
                dateCreated: order.dateCreated,
                label: order.label,
                listName: order.listName,
                osnr: order.osnr,
                placeId: order.placeId,
                lat: order.lat,
                lng: order.lng,
                postalCode: order.postalCode,
              // updates
                route: 'none',
                assigned: false,
               // updates  
                orderIndex: order.orderIndex,
                postalIndex: order.postalIndex,
                loaded: order.loaded,
                delivered: order.delivered
          };
          
          
          // let removedOrder = order;
            // order.route = 'none';
            // order.assigned = false;
            // order.loaded =  false;
            // order.delivered = false; 
          
          this.orderProvider.updateOrdersList(removedOrder)
              .then(() => {this.orderProvider.updateRoutesList(removedOrder, routeName);})
          // this.orderProvider.updateRoutesList(order, routeName)    
              .then(() => { 
                
                  order.marker.setMap(null);
                  
                  order.deleted = 'true';
                  
                  this.routesArray[routeIndex].orders.splice(orderIndex, 1);
                  
                  this.closeRoute(routeName);
                  
              });
          
        }
        
    });
  
  }


}
