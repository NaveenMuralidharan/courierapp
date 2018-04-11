import { Injectable } from '@angular/core';
import firebase from 'firebase';

declare var google;


@Injectable()
export class OrderProvider {

public newOrdersRef: firebase.database.Reference;
public deletedOrder: any={}; 
  constructor() {
    console.log('Hello OrderProvider Provider');
  }
    
createSorterList(list) {
  let listKey = firebase.database().ref(list.dateCreated+'/sorters').push().key;
  
  
  firebase.database().ref(list.dateCreated+'/sorters/'+list.listName)
                            .set(
                                  {
                                    listName: list.listName,
                                    dateCreated: list.dateCreated,
                                    orders: []
                                  }
                                );
  
}

// Create orders:

createOrder(order) {
    
    let deepRef = firebase.database().ref();
    let ordersRef = firebase.database().ref(order.dateCreated+'/orders');

    let newRefKey= ordersRef.push().key;   
    order.id = newRefKey;
    
    let updatedData = {};
    
    // for sorters list
    updatedData[order.dateCreated +'/sorters/'+ order.listName +'/orders/'+ newRefKey]= order; 
    
    // for all orders list
    updatedData[order.dateCreated+'/orders/'+newRefKey]= order; 
    
    return deepRef.update(updatedData);
  
}

// READ orders

getAllOrders(listRef) {
  
      let orderArray = [];
      
      listRef.once('value', snapshot => {
        snapshot.forEach(snap => {
          
        });
        
      });
    return orderArray;
  
  
}


// UPDATE orders

savePostalDemo(postalCode, order, lat, lng): Promise<any> {
  
  console.log("order in savePostalDemo "+ order);
  
  let enrichedOrder = {
                id: order.id,
                address: order.address,
                dateCreated: order.dateCreated,
                listName: order.listName,
                lat: lat,
                lng: lng,
                postalCode: postalCode,
                osnr: order.osnr,
                business: order.business,
                selected: false,
                assigned: false,
                route: 'none',
                zone: 'none',
                deleted: false,
                sorted: true
                
              }; 
  
  
  let postalsListRef = firebase.database().ref(order.dateCreated+'/postals/'+postalCode+'/orders/'+order.id);

    // let newRouteKey= routesListRef.push().key;   
    
    return postalsListRef.set(enrichedOrder);
  
}


saveToPostal(orderKey, order, postalCode, lat, lng) {

  let coords = new google.maps.LatLng(lat, lng);

  console.log("saving new order with coordinates "+coords);
  
  let deepRef = firebase.database().ref(); 

  let updatedData = {};
    

  // for postals list
    updatedData[order.dateCreated+'/postals/'+postalCode+'/'+orderKey] = 
              {
                id: orderKey,
                address: order.address,
                dateCreated: order.dateCreated,
                listName: order.listName,
                lat: lat,
                lng: lng,
                postalCode: postalCode,
                osnr: order.osnr,
                business: order.business,
                selected: false,
                assigned: false,
                route: 'none',
                zone: 'none',
                deleted: false,
                sorted: true
                
              }; 
  // for all orders list
    updatedData[order.dateCreated+'/orders/'+orderKey]= 
              { 
                id: orderKey,
                address: order.address,
                business: order.business,
                dateCreated: order.dateCreated,
                label: order.label,
                listName: order.listName,
                osnr: order.osnr,
                placeId: order.placeId,
                lat: lat,
                lng: lng,
                postalCode: postalCode,
                assigned: false,
                route: 'none',
                zone: 'none',
                deleted: false,
                sorted: true
              };
    
    
  deepRef.update(updatedData);
}







// EXPERIMENAL update method:

updateOrder(order, updates): void {
// find order being updated


console.log("hello from order prov");


let data = firebase.database()
                      .ref(order.dateCreated+'/orders')
                      .orderByChild("id")
                      .equalTo(order.id)
                      .on('child_added', data => {
                          updates.forEach(update =>{
                            if(update.value){
                              
                              // update order in orders list
                              let orderListRef = firebase.database().ref(data.val().dateCreated+'/orders');
                              orderListRef.child(data.val().id).child(update.property).set(update.value);
                              
                              console.log(update.value);
                            }
                             
                          }); 
                      });
                      
//update routest list 
  // let ref = firebase.database()
  //                     .ref(order.dateCreated+'/routes/'+order.route+'/orders')
  //                     .orderByChild("id")
  //                     .equalTo(order.id)
  //                     .on('child_added', data => {
  //                         updates.forEach(update =>{
  //                           if(update.value){

  //                             // update order in route list
  //                             let routesListRef = firebase.database().ref(data.val().dateCreated+'/routes/'+order.route+'/orders');
  //                             routesListRef.child(data.val().id).child(update.property).set(update.value);
                            
  //                             console.log(update.value);
  //                           }
                             
  //                         }); 
  //                     });                    
                      
                        
}

// updateOrder(order, updates): void {
  
//   console.log(order.address+order.assigned);
  
//   let data = firebase.database()
//                       .ref(order.dateCreated+'/orders')
//                       .orderByChild("id")
//                       .equalTo(order.id)
//                       .on('child_added', data => {
//                           updates.forEach(update =>{
//                             if(update.value){
//                               // update order in orders list
//                               let orderListRef = firebase.database().ref(data.val().dateCreated+'/orders');
//                               console.log(orderListRef);
//                               orderListRef.child(data.val().id).child(update.property).set(update.value);
                             
//                           // update order in sorters list
//                               let sortersListRef = firebase.database().ref(data.val().dateCreated+'/sorters/'+data.val().listName +'/orders');
//                               sortersListRef.child(data.val().id).child(update.property).set(update.value);
                          
//                           // IF order was assigned, update order in routes list
//                               if(data.val().route != "none") {
                                
//                                 let routesListRef = firebase.database().ref(data.val().dateCreated+'/routes/'+data.val().route +'/orders');
//                                 console.log(routesListRef);
//                                 routesListRef.child(data.val().id).child(update.property).set(update.value);
                                
//                               }
                                
//                             }
                             
//                           }); 
//                       });

// }


// remove stop from route

deleteStop(stop): Promise<any> {
  
    let updatedStop = stop;
    updatedStop.deleted = true;
  
  // console.log(stop);
  
  console.log(updatedStop);
    let deletedStopRef = firebase.database()
                          .ref(stop.dateCreated+'/routes/'+stop.route+'/stops/'+stop.id);
                          
    
    return deletedStopRef.set(updatedStop);
  
}


 
// SAVE order in route

saveToRoute(dateCreated, routeName, order): Promise<any> {
  
  let deepRef = firebase.database().ref(); 

  let updatedData = {};
  
  order.route = routeName;
  order.assigned = true;
  order.loaded =  false;
  order.delivered = false;  
    
  // for routes list  
  updatedData[dateCreated+'/routes/'+routeName+'/orders/'+order.id] = 
 
  {
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
                route: routeName,
                assigned: true,
                loaded: false,
                delivered: false,
                orderIndex: order.orderIndex,
                postalIndex: order.postalIndex
  };
  
  // for all orders list
  updatedData[dateCreated+'/orders/'+order.id]=
  {
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
                route: routeName,
                assigned: true,
                orderIndex: order.orderIndex,
                postalIndex: order.postalIndex
  };
  
  
  return deepRef.update(updatedData);
 
}


// save fixed stops for route

saveRouteStop(dateCreated, routeName, stop): Promise <any> {
  
  let routeListRef = firebase.database().ref(dateCreated+'/routes/'+routeName+'/stops');
  
  let stopId = routeListRef.push().key;
  
  console.log(stopId);
  
  stop.id = stopId; 
  stop.route = routeName; 
  stop.dateCreated = dateCreated; 
  stop.deleted = false;
  
  let stopRef = firebase.database().ref(dateCreated+'/routes/'+routeName+'/stops/'+stopId);
  
  return stopRef.set(stop);
  
  
}

//  DELETE ORDERS
deleteOrder(order): void {
  
  
  let data = firebase.database()
                      .ref(order.dateCreated+'/orders')
                      .orderByChild("id")
                      .equalTo(order.id)
                      .on('child_added', data => {
                        // console.log(data.val().postalCode);
                          console.log("deleted order is "+ data.val().address);
                            // update order in orders list
                              let orderListRef = firebase.database().ref(data.val().dateCreated+'/orders');
                              console.log("order list ref is"+ orderListRef);
                              orderListRef.child(data.val().id).child("deleted").set(true);
                             
                            // update order in sorters list
                              let sortersListRef = firebase.database().ref(data.val().dateCreated+'/sorters/'+data.val().listName+'/orders');
                              console.log("sorters list ref is"+ sortersListRef);
                              sortersListRef.child(data.val().id).child("deleted").set(true);
                          
                          // IF order was sorted, update order in postals list
                            if(data.val().postalCode){
                                console.log("sorted order deleted "+data.val().postalCode);
                                let postalsListRef = firebase.database().ref(data.val().dateCreated+'/postals/'+data.val().postalCode);
                                console.log("postals list ref is"+ postalsListRef);
                                postalsListRef.child(data.val().id).child("deleted").set(true);
                                                  
                            }
                        
                      });
  
}


// Create route:

createRoute(dateCreated, routeName): Promise<any> {
    console.log("route "+routeName + "created on" + dateCreated);
    
    // let deepRef = firebase.database().ref();
    let routesListRef = firebase.database().ref(dateCreated+'/routes/'+routeName);

    // let newRouteKey= routesListRef.push().key;   
    
    let newRoute = {
                    name: routeName,
                    // routeId: newRouteKey,
                    dateCreated: dateCreated,
                    orders: []
                  }
    
    // let routeRef = firebase.database().ref(dateCreated+'/routes/'+ newRouteKey);
    
    return routesListRef.set(newRoute);
  
}

// UPDAte ORDERS

  updateOrdersList(order): Promise<any> {
    
    // let newOrder = {
                
    //             id: order.id,
    //             address: order.address,
    //             business: order.business,
    //             dateCreated: order.dateCreated,
    //             label: order.label,
    //             listName: order.listName,
    //             osnr: order.osnr,
    //             placeId: order.placeId,
    //             lat: order.lat,
    //             lng: order.lng,
    //             postalCode: order.postalCode,
    //             route: order.route,
    //             assigned: order.assigned,
    //             orderIndex: order.orderIndex,
    //             postalIndex: order.postalIndex,
    //             loaded: order.loaded,
    //             delivered: order.delivered
    //       };
    
    // console.log(order);
  
     let ordersListRef = firebase.database().ref(order.dateCreated+'/orders/'+order.id);
  
      return ordersListRef.set(order);
    
  
  } 

  updateRoutesList(order, routeName): Promise<any> {
  
    // let newOrder = {
                
    //             id: order.id,
    //             address: order.address,
    //             business: order.business,
    //             dateCreated: order.dateCreated,
    //             label: order.label,
    //             listName: order.listName,
    //             osnr: order.osnr,
    //             placeId: order.placeId,
    //             lat: order.lat,
    //             lng: order.lng,
    //             postalCode: order.postalCode,
    //             route: order.route,
    //             assigned: order.assigned,
    //             orderIndex: order.orderIndex,
    //             postalIndex: order.postalIndex,
    //             loaded: order.loaded,
    //             delivered: order.delivered
    //       };
  
    let routeListRef = firebase.database().ref(order.dateCreated+'/routes/'+routeName+'/orders/'+order.id);

    console.log(routeListRef); 
    return routeListRef.set(order);
    
  
  } 



}  