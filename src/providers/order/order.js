"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var firebase_1 = require('firebase');
var OrderProvider = (function () {
    function OrderProvider() {
        this.deletedOrder = {};
        console.log('Hello OrderProvider Provider');
    }
    OrderProvider.prototype.createSorterList = function (list) {
        var listKey = firebase_1["default"].database().ref(list.dateCreated + '/sorters').push().key;
        firebase_1["default"].database().ref(list.dateCreated + '/sorters/' + list.listName)
            .set({
            listName: list.listName,
            dateCreated: list.dateCreated,
            orders: []
        });
    };
    // Create orders:
    OrderProvider.prototype.createOrder = function (order) {
        var deepRef = firebase_1["default"].database().ref();
        var ordersRef = firebase_1["default"].database().ref(order.dateCreated + '/orders');
        var newRefKey = ordersRef.push().key;
        var updatedData = {};
        // for sorters list
        updatedData[order.dateCreated + '/sorters/' + order.listName + '/orders/' + newRefKey] = order;
        // for all orders list
        updatedData[order.dateCreated + '/orders/' + newRefKey] = order;
        return deepRef.update(updatedData);
    };
    // READ orders
    OrderProvider.prototype.getAllOrders = function (listRef) {
        var orderArray = [];
        listRef.once('value', function (snapshot) {
            snapshot.forEach(function (snap) {
            });
        });
        return orderArray;
    };
    // UPDATE orders
    OrderProvider.prototype.savePostalDemo = function (postalCode, order, lat, lng) {
        console.log("order in savePostalDemo " + order);
        var enrichedOrder = {
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
        var postalsListRef = firebase_1["default"].database().ref(order.dateCreated + '/postals/' + postalCode + '/orders/' + order.id);
        // let newRouteKey= routesListRef.push().key;   
        return postalsListRef.set(enrichedOrder);
    };
    OrderProvider.prototype.saveToPostal = function (orderKey, order, postalCode, lat, lng) {
        var coords = new google.maps.LatLng(lat, lng);
        console.log("saving new order with coordinates " + coords);
        var deepRef = firebase_1["default"].database().ref();
        var updatedData = {};
        // for postals list
        updatedData[order.dateCreated + '/postals/' + postalCode + '/' + orderKey] =
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
        updatedData[order.dateCreated + '/orders/' + orderKey] =
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
    };
    // EXPERIMENAL update method:
    // updateOrder(order, updates): void {
    // // find order being updated
    // console.log("hello from order prov");
    // let data = firebase.database()
    //                       .ref(order.dateCreated+'/orders')
    //                       .orderByChild("id")
    //                       .equalTo(order.id)
    //                       .on('child_added', data => {
    //                           updates.forEach(update =>{
    //                             if(update.value){
    //                               // update order in orders list
    //                               let orderListRef = firebase.database().ref(data.val().dateCreated+'/orders');
    //                               orderListRef.child(data.val().id).child(update.property).set(update.value);
    //                               console.log(update.value);
    //                             }
    //                           }); 
    //                       });
    // //update routest list 
    //   // let ref = firebase.database()
    //   //                     .ref(order.dateCreated+'/routes/'+order.route+'/orders')
    //   //                     .orderByChild("id")
    //   //                     .equalTo(order.id)
    //   //                     .on('child_added', data => {
    //   //                         updates.forEach(update =>{
    //   //                           if(update.value){
    //   //                             // update order in route list
    //   //                             let routesListRef = firebase.database().ref(data.val().dateCreated+'/routes/'+order.route+'/orders');
    //   //                             routesListRef.child(data.val().id).child(update.property).set(update.value);
    //   //                             console.log(update.value);
    //   //                           }
    //   //                         }); 
    //   //                     });                    
    // }
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
    OrderProvider.prototype.deleteStop = function (stop) {
        var updatedStop = stop;
        updatedStop.deleted = true;
        // console.log(stop);
        console.log(updatedStop);
        var deletedStopRef = firebase_1["default"].database()
            .ref(stop.dateCreated + '/routes/' + stop.route + '/stops/' + stop.id);
        return deletedStopRef.set(updatedStop);
    };
    // SAVE order in route
    OrderProvider.prototype.saveToRoute = function (dateCreated, routeName, order) {
        var deepRef = firebase_1["default"].database().ref();
        var updatedData = {};
        order.route = routeName;
        order.assigned = true;
        order.loaded = false;
        order.delivered = false;
        // for routes list  
        updatedData[dateCreated + '/routes/' + routeName + '/orders/' + order.id] =
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
        updatedData[dateCreated + '/orders/' + order.id] =
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
    };
    // save fixed stops for route
    OrderProvider.prototype.saveRouteStop = function (dateCreated, routeName, stop) {
        var routeListRef = firebase_1["default"].database().ref(dateCreated + '/routes/' + routeName + '/stops');
        var stopId = routeListRef.push().key;
        console.log(stopId);
        stop.id = stopId;
        stop.route = routeName;
        stop.dateCreated = dateCreated;
        stop.deleted = false;
        var stopRef = firebase_1["default"].database().ref(dateCreated + '/routes/' + routeName + '/stops/' + stopId);
        return stopRef.set(stop);
    };
    //  DELETE ORDERS
    OrderProvider.prototype.deleteOrder = function (order) {
        var data = firebase_1["default"].database()
            .ref(order.dateCreated + '/orders')
            .orderByChild("id")
            .equalTo(order.id)
            .on('child_added', function (data) {
            // console.log(data.val().postalCode);
            console.log("deleted order is " + data.val().address);
            // update order in orders list
            var orderListRef = firebase_1["default"].database().ref(data.val().dateCreated + '/orders');
            console.log("order list ref is" + orderListRef);
            orderListRef.child(data.val().id).child("deleted").set(true);
            // update order in sorters list
            var sortersListRef = firebase_1["default"].database().ref(data.val().dateCreated + '/sorters/' + data.val().listName + '/orders');
            console.log("sorters list ref is" + sortersListRef);
            sortersListRef.child(data.val().id).child("deleted").set(true);
            // IF order was sorted, update order in postals list
            if (data.val().postalCode) {
                console.log("sorted order deleted " + data.val().postalCode);
                var postalsListRef = firebase_1["default"].database().ref(data.val().dateCreated + '/postals/' + data.val().postalCode);
                console.log("postals list ref is" + postalsListRef);
                postalsListRef.child(data.val().id).child("deleted").set(true);
            }
        });
    };
    // Create route:
    OrderProvider.prototype.createRoute = function (dateCreated, routeName) {
        console.log("route " + routeName + "created on" + dateCreated);
        // let deepRef = firebase.database().ref();
        var routesListRef = firebase_1["default"].database().ref(dateCreated + '/routes/' + routeName);
        // let newRouteKey= routesListRef.push().key;   
        var newRoute = {
            name: routeName,
            // routeId: newRouteKey,
            dateCreated: dateCreated,
            orders: []
        };
        // let routeRef = firebase.database().ref(dateCreated+'/routes/'+ newRouteKey);
        return routesListRef.set(newRoute);
    };
    // UPDAte ORDERS
    OrderProvider.prototype.updateOrdersList = function (order) {
        var ordersListRef = firebase_1["default"].database().ref(order.dateCreated + '/orders/' + order.id);
        return ordersListRef.set(order);
    };
    OrderProvider.prototype.updateRoutesList = function (order) {
        var routeListRef = firebase_1["default"].database().ref(dateCreated + '/routes/' + order.route + '/orders/' + order.id);
        return routeListRef.set(order);
    };
    OrderProvider = __decorate([
        core_1.Injectable()
    ], OrderProvider);
    return OrderProvider;
}());
exports.OrderProvider = OrderProvider;
