import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Alert, AlertController } from 'ionic-angular';
import firebase from 'firebase';
import { OrderProvider } from '../../providers/order/order';

declare var google;

@IonicPage()
@Component({
  selector: 'page-list-create',
  templateUrl: 'list-create.html',
})
export class ListCreatePage {
  
  public list: any = {};
  
  public showForm: boolean = false;
  public showMap: boolean = false;

  // public newOrder: any = {osnr: false, business: false};
  public newOrderList: Array<any> = [];
  public imageSource: string = '';
  // public orderListRef: firebase.database.Reference;
  public labelNo: number=1;
  public labelHolder: number;

  public dataArray: Array<any>;
  public ordersList: Array<any> = [];
  // public query: string = '';
  // public places: Array<any>;
  public showPlaces: boolean = false;
  public orderReady: boolean = false;
  public hideLabel: boolean = false;
  public chosenPlace: any = {};
  public orderUnderEdit: any = {};
  public indexUnderEdit: number;

// 1.b
public autoCompleteService: any;
public cityBounds: any;
public query: any;
public places: Array<any> = [];


public formReady: boolean = false;
public newOrder: any;
public orderOsnr: boolean = false;
public orderBusiness: boolean = false;

 @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public orderProvider: OrderProvider, 
              public alertCtrl: AlertController) {
        
        
        this.list = this.navParams.get('list');
        console.log(this.list);
             
  }

  ionViewDidLoad() {
    this.loadMap();
    
    this.getOrdersInList();
    this.addListListener();
    
    console.log('ionViewDidLoad ListCreatePage');
   this.autoCompleteService = new google.maps.places.AutocompleteService();
    
    //  
    this.cityBounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng(45.331342, -76.424771),
                        new google.maps.LatLng(45.508702, -75.007534)
                  );
  
  }
  
  getOrdersInList(): void {
    let listRef = firebase.database().ref(this.list.dateCreated+'/sorters/'+this.list.listName+'/orders');

    this.ordersList = [];
    
    listRef.on('child_added', data => {
      
      if(data.val().deleted == true){

        this.ordersList.push(
                              {
                                address: data.val().address,
                                label: data.val().label,
                                deleted: true
                              }
                            );
      } else {

      let length = this.ordersList.push(data.val());
                          
      }
      this.labelNo += 1;
      console.log(this.ordersList);
      
      });
      
      // this.addListListener();
  }
 
 addListListener(): void {
    let listRef = firebase.database().ref(this.list.dateCreated+'/sorters/'+this.list.listName+'/orders');

    listRef.on('child_changed', data => {
      
      if(data.val().assigned == true || data.val().loaded == true){
        
          this.ordersList.forEach((order, orderIndex) => {
            
            if(order.label == data.val().label){
              
              this.ordersList[orderIndex] = order;
              
            }
            
          });
        
      }
      
    });
    
    
 }
  
  deleteOrder(order, i): void {
    let label = order.label;
    let address = "order deleted";
    
    const alert: Alert = this.alertCtrl.create({
      message: "Delete order?",
      buttons: [
          {text: 'No', role: 'Cancel'},
          {text: 'Yes', 
            handler: data => {
              // this.orderProvider.deleteOrder(order);
              this.orderProvider.updateOrder(order, [{property: 'deleted', value: true}]);
              this.ordersList[i] = 
                                     {
                                        address: address,
                                        label: label,
                                        deleted: true
                                      };
            }
          }
        ]
    });
    
    alert.present();
  } 
  
  
  
  
  sortAndSave(order) {
    
    this.refreshForm();
    
    let service = new google.maps.places.PlacesService(this.map);
          
          service.getDetails({placeId: order.placeId}, (place, status) => {
              if(status == "OK") 
              {
                    let sortedtOrder = order;
                    
                    //Extract postal code from place details result,  
                      let index = place.address_components.length - 1;
                      
                      let postalCodeComponent =  place.address_components[index];
                      let postalCodeLong = postalCodeComponent.long_name;
                      sortedtOrder.postalCode = postalCodeLong[0]+postalCodeLong[1]+postalCodeLong[2];

                    //Create latlng object with coordinates from place details result 
                      sortedtOrder.lat = place.geometry.location.lat();
                      sortedtOrder.lng = place.geometry.location.lng();
                   
                    // save new order in db
                        this.orderProvider.createOrder(sortedtOrder)
                        .then(newOrder => {
                                console.log("New order created - "+newOrder);
                                // this.refreshForm();
                          });
                        
                      }
              //place service failed,
              else 
              {
                    console.log("place lookup failed" + status);
              }

            });
    // 
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

  // choosePlace(place: any): void {
    
  //   // this.query = place.description;
  //   this.chosenPlace = place;
  //   console.log("chosen place is "+place.description);
  //   this.showPlaces = false;
  //   this.orderReady= true;
  // } 
choosePlace(place): void {
 
 // setup form with place
  // this.formReady = true;   
  
  this.chosenPlace = {
                    address: place.description,
                    placeId: place.place_id
                 };
  // console.log("poop" + this.chosenPlace.address +place.description);              
// // setup form with place
  this.formReady = true;    

} 

  // createOrder(osnr: boolean, business: boolean): void {
  //   // let index = this.ordersList.length;   
     
  //   this.orderProvider.createOrder(this.list, index,
  //                                   this.chosenPlace, 
  //                                   this.labelNo, 
  //                                   osnr, business)
  //                       .then(newOrder => {
  //                               console.log("New order created - "+newOrder);
  //                               this.refreshForm();
  //                         });
  // } 
  
  compileOrder()
             {
      console.log(this.list + this.chosenPlace.address+ this.labelNo+ this.orderOsnr + this.orderBusiness);
      
      let list = this.list;
      let chosenPlace = this.chosenPlace;
      let labelNo = this.labelNo;
      let osnr = this.orderOsnr;
      let business = this.orderBusiness;
            
          // if both osnr and business are false, alert user 
             
            let bothTrue = osnr == true && business == true;
            let bothFalse = osnr == false && business == false;
             
              
             if(bothFalse || bothTrue){
               
                const alert: Alert = 
                    this.alertCtrl.create({
                      message: "Select one - OSNR  OR  Business",
                      buttons: [
                          {text: 'OK', role: 'Cancel'},
                        ]
                    });
    
    alert.present();
               
             } else {

             let newOrder = {
                    address: chosenPlace.address,
                    dateCreated: list.dateCreated,
                    label: labelNo,
                    listName: list.listName,
                    osnr: osnr,
                    business: business,
                    placeId: chosenPlace.placeId,
                    deleted: false,
                    assigned: false,
                    loaded: false,
                    delivered: false,
                    route: "none"
                    };
             
              this.sortAndSave(newOrder);
             
            }
      }      
  
  cancelOrder(): void {
    
     console.log("cancel Order");
    this.refreshForm();  
    
  }
  
  
  refreshForm() : void {
                                this.formReady = false;
                                this.query = '';
                                // this.newOrder = {osnr: false, business: false};
                                this.orderOsnr = false;
                                this.orderBusiness = false;
                                this.chosenPlace = {};
                                this.places = [];  
    
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
 
  
}
