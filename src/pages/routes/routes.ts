import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';

declare var google;


@IonicPage()
@Component({
  selector: 'page-routes',
  templateUrl: 'routes.html',
})
export class RoutesPage {

public routesArray: Array<any> = [];


  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoutesPage');
    this.getAllRoutes();
  }

// Generate timestamp

  currentDate(): string {

    let currentTime = new Date();
    let day = currentTime.getDate();
    let month = currentTime.getMonth()+1;
    let year = currentTime.getFullYear();
    
    let dateStamp = day+'-'+month+'-'+year;



    return dateStamp;
  }
  

//RETREIVE ORDERS FOR ALL ROUTES /ROUTES
  getAllRoutes(): void {
    
    console.log("getAllRoutes");
    let dateCreated = this.currentDate();
    let listType = 'routes';
    
    let listRef = firebase.database().ref(dateCreated+'/'+listType);

console.log(listRef);
      listRef.once('value', data => {
        
        let listEntries = data.val();
        
        // console.log("entries in /postal "+listEntries);
        
        for(let entry in listEntries) {
            
            console.log("entry " + entry);          
            if(listEntries.hasOwnProperty(entry)) {
              
                let value = listEntries[entry];
                
                console.log("value " + value.name);          
                
                // // do something with each element here
                let newRoute = {
                          name:        value.name,
                          dateCreated: value.dateCreated,
                          orders:      []
                        };
                
                let routeIndex = this.routesArray.push(newRoute) - 1;
                
                console.log("routes array "+ this.routesArray);
                this.addListListener(dateCreated, value.name, routeIndex, listType);
  
        
            }
            
        }
                    
      });
    
  }   
      

// listen for new orders added to route

addListListener(dateCreated, listName,routeIndex, listType): void {
    
    let listRef = firebase.database().ref(dateCreated+'/'+listType+'/'+listName+'/orders');
    
      listRef.on('child_added', data => {
        console.log("child added");
        
        let order = data.val();
        let newMarker = {};
        let icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
        let title = order.route + order.address; 
        let coords = new google.maps.LatLng(order.lat, order.lng);
        
        newMarker = new google.maps.Marker({
                                    title: title,
                                    // map: this.map,
                                    position: coords,
                                    icon: icon
                                  });
    
        order.marker = newMarker;
    
        this.routesArray[routeIndex].orders.push(order);          
        console.log(this.routesArray[routeIndex].orders);    

      });
    
  }  


// go to view route page

viewRouteOrders(routeName, dateCreated): void {
  
  this.navCtrl.push('RouteordersPage', {routeName: routeName, dateCreated : dateCreated});
  
}



}
