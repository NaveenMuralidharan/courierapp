"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
var firebase_1 = require('firebase');
var TrialPage = (function () {
    function TrialPage(navCtrl, navParams, orderProvider, alertCtrl, polygonProvider) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.orderProvider = orderProvider;
        this.alertCtrl = alertCtrl;
        this.polygonProvider = polygonProvider;
        this.listKey = '';
        this.orderArray = [];
        this.datesArray = [];
        this.postalsArray = [];
        this.newPostalsArray = [];
        this.newViewArray = [];
        this.postalOrdersArray = [];
        this.markerArray = [];
        this.assignableArray = [];
        this.routesArray = [];
        // public zonesArray: Array<any> = [];
        // public zoneCoordinates: Array<any> = [];
        // public zoneMarkers: Array<any> = [];
        this.selectedMarkersArray = [];
        // public newPostalsArray: Array<any> = [];
        this.sortFailedOrders = [];
        this.zoneIndices = [];
        this.zoneUnderView = false;
        this.markingZone = false;
        this.showingRoutes = false;
        this.filterOn = false;
        this.markerSelected = false;
        this.searchAddress = false;
        this.addingStop = false;
        // public zoneBusinessCount: number = 0;
        // // public zoneOsnrCount: number = 0;
        // public zoneHeaviesCount: number = 0;
        // public zoneEnvelopesCount: number = 0;
        // public zoneScreensCount: number = 0;
        this.trialRoutesArray = [];
        this.noRoutes = false;
        this.viewOsnr = false;
        this.viewBusiness = false;
        this.viewRoutes = false;
        this.newPostal = false;
        this.listFilterOn = false;
        this.postalSelected = false;
        this.routeUnderCreation = false;
        this.showBreakdown = false;
        this.showOrders = false;
        this.dateChosen = false;
        this.choosingMarkers = false;
        this.places = [];
    }
    TrialPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad TrialPage');
        this.lastFewDays();
        this.loadMap();
        this.autoCompleteService = new google.maps.places.AutocompleteService();
        //  
        this.cityBounds = new google.maps.LatLngBounds(new google.maps.LatLng(45.331342, -76.424771), new google.maps.LatLng(45.508702, -75.007534));
    };
    // Generate timestamp
    TrialPage.prototype.chooseDate = function () {
        this.dateChosen = false;
    };
    TrialPage.prototype.currentDate = function () {
        var currentTime = new Date();
        var day = currentTime.getDate();
        var month = currentTime.getMonth() + 1;
        var year = currentTime.getFullYear();
        var dateStamp = day + '-' + month + '-' + year;
        return dateStamp;
    };
    TrialPage.prototype.lastFewDays = function () {
        var currentTime = new Date();
        var day = currentTime.getDate();
        var month = currentTime.getMonth() + 1;
        var year = currentTime.getFullYear();
        var daysArray = [day, day - 1, day - 2];
        this.datesArray = daysArray.map(function (day) {
            return day + '-' + month + '-' + year;
            // this.dateProvider.last5
        });
    };
    //RETREIVE ORDERS FOR CHOSEN DATE FROM /ORDERS  
    TrialPage.prototype.getNewOrders = function (dateCreated) {
        var _this = this;
        this.dateChosen = true;
        this.dateUnderReview = dateCreated;
        // retreive any existing routes
        var listType = 'routes';
        this.getAllRoutes(dateCreated, listType);
        // create reference to orders node for the chosen date
        var listRef = firebase_1["default"].database().ref(dateCreated + '/orders');
        // Attach a listener for assigned orders 
        listRef.on('child_changed', function (data) {
            var order = data.val();
            var orderKey = data.key;
            //If order was assigned, 
            if (order.assigned == true) {
                // console.log("order index "+ order.orderIndex);
                // console.log("postal index "+ order.postalIndex);
                // this.moveToAssigned(order);
                _this.updateOrder(order);
                console.log("assigned order " + order.address);
                return;
            }
            else if (order.assigned == false) {
                _this.updateOrder(order);
                console.log("order unassigned");
                // this.unassignOrder(order);
                return;
            }
            else {
                console.log("other change");
            }
        });
        // end of listener
        // NEW - Attach a listener - sort orders after filtering deleted ones 
        listRef.on('child_added', function (data) {
            var order = data.val();
            var orderKey = data.key;
            if (order.assigned == true) {
                return;
            }
            else {
                order.route = 'none';
                order.id = orderKey;
                _this.addNewOrder(order);
            }
        });
        // end of listener
    };
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
    // unassign order
    TrialPage.prototype.updateOrder = function (order) {
        if (order.assigned == true) {
            this.postalsArray[order.postalIndex].unassigned = this.postalsArray[order.postalIndex].unassigned - 1;
            console.log(this.postalsArray[order.postalIndex].unassigned);
            this.postalsArray[order.postalIndex].orders[order.orderIndex].assigned = true;
        }
        else {
            if (this.postalsArray[order.postalIndex]) {
                console.log("true");
            }
            else {
                console.log("false");
            }
        }
    };
    // NEW add new order to its postal
    TrialPage.prototype.addNewOrder = function (order) {
        var coords = new google.maps.LatLng(order.lat, order.lng);
        // add marker to order
        var newMarker = {};
        var icon = "http://www.google.com/mapfiles/marker.png";
        newMarker = new google.maps.Marker({
            title: order.address,
            // map: this.map,
            position: coords,
            icon: icon
        });
        order.marker = newMarker;
        // push order into its postal
        var found = false;
        var length = this.postalsArray.length;
        if (length > 0) {
            // let found = false;
            for (var i = 0; i < length; i++) {
                var postal = this.postalsArray[i];
                if (postal.code == order.postalCode) {
                    this.postalsArray[i].orders.push(order);
                    this.postalsArray[i].unassigned += 1;
                    return;
                }
            }
            this.addFirstPostalOrder(order);
            return;
        }
        else {
            this.addFirstPostalOrder(order);
            return;
        }
    };
    TrialPage.prototype.addFirstPostalOrder = function (order) {
        var newPostal = {
            code: order.postalCode,
            selected: true,
            unassigned: 1,
            orders: [],
            assignedOrders: []
        };
        var length = this.postalsArray.push(newPostal);
        var postalIndex = length - 1;
        this.postalsArray[postalIndex].orders.push(order);
    };
    //RETREIVE ORDERS FOR ALL ROUTES /ROUTES
    TrialPage.prototype.getAllRoutes = function (dateCreated, listType) {
        var _this = this;
        var listRef = firebase_1["default"].database().ref(dateCreated + '/' + listType);
        listRef.once('value', function (data) {
            var listEntries = data.val();
            // console.log("entries in /postal "+listEntries);
            for (var entry in listEntries) {
                console.log("entry " + entry);
                if (listEntries.hasOwnProperty(entry)) {
                    var value = listEntries[entry];
                    console.log("value " + value.name);
                    // do something with each element here
                    var newRoute = {
                        name: value.name,
                        dateCreated: value.dateCreated,
                        selected: false,
                        orders: [],
                        stops: []
                    };
                    // // this.routesArray[routeIndex] =  newRoute;
                    var routeIndex = _this.routesArray.push(newRoute) - 1;
                    _this.addListListener(dateCreated, value.name, routeIndex, listType);
                    _this.addStopsListener(dateCreated, value.name, routeIndex, listType);
                }
            }
        });
    };
    // listen for new orders added to route
    TrialPage.prototype.addListListener = function (dateCreated, listName, listIndex, listType) {
        // let listRef = firebase.database().ref(dateCreated+'/routes/'+routeName+'/orders');
        var _this = this;
        var listRef = firebase_1["default"].database().ref(dateCreated + '/' + listType + '/' + listName + '/orders');
        console.log("reference of route list " + listRef);
        listRef.on('child_added', function (data) {
            console.log("child added");
            var order = data.val();
            var newMarker = {};
            var icon = "http://labs.google.com/ridefinder/images/mm_20_green.png";
            var title = order.route + order.address;
            var coords = new google.maps.LatLng(order.lat, order.lng);
            newMarker = new google.maps.Marker({
                title: title,
                map: _this.map,
                position: coords,
                icon: icon
            });
            order.marker = newMarker;
            order.selected = false;
            var length = _this.routesArray[listIndex].orders.push(order);
            var orderIndex = length - 1;
            // Attach click listener
            google.maps.event.addListener(order.marker, 'click', function () {
                order.selected = !order.selected;
                // console.log(order.selected);  
                // if marker was selected, 
                if (order.selected == true) {
                    // highlight marker, 
                    var icon_1 = "http://labs.google.com/ridefinder/images/mm_20_yellow.png";
                    order.marker.setIcon(icon_1);
                    _this.routesArray[listIndex].orders[orderIndex].selected = true;
                    // test
                    console.log(_this.routesArray[listIndex].orders[orderIndex].selected);
                }
                else {
                    // de-select marker
                    var icon_2 = "http://labs.google.com/ridefinder/images/mm_20_green.png";
                    order.marker.setIcon(icon_2);
                    _this.routesArray[listIndex].orders[orderIndex].selected = false;
                    // test
                    console.log(_this.routesArray[listIndex].orders[orderIndex].selected);
                }
            });
            // end of google map listener        
            // this.routesArray[listIndex].orders.push(order);          
        });
    };
    // listen for new stops added to route 
    TrialPage.prototype.addStopsListener = function (dateCreated, listName, listIndex, listType) {
        var _this = this;
        var stopsRef = firebase_1["default"].database().ref(dateCreated + '/' + listType + '/' + listName + '/stops');
        stopsRef.on('child_added', function (data) {
            var stop = data.val();
            console.log("new stop added " + data.val().address + data.val().position);
            if (stop.deleted == true) {
                return;
            }
            else {
                // find route the stop belongs to and add it
                _this.routesArray.forEach(function (route, routeIndex) {
                    if (route.name == listName) {
                        //check if stop is a breakpoint 
                        if (stop.position != 'start' && stop.position != 'end') {
                            var message = "Breakpoint after " + stop.position;
                            stop.message = message;
                            console.log("stop deleted " + stop.deleted);
                            _this.routesArray[routeIndex].stops.push(stop);
                        }
                        else {
                            var message = stop.position;
                            stop.message = message;
                            console.log("stop deleted " + stop.deleted);
                            _this.routesArray[routeIndex].stops.push(stop);
                        }
                    }
                });
            }
        });
    };
    TrialPage.prototype.showRoutes = function () {
        this.showingRoutes = true;
    };
    TrialPage.prototype.hideRoutes = function () {
        this.showingRoutes = false;
    };
    // method to sort each order into postals
    TrialPage.prototype.sortOrder = function (order) {
        //create places service and send to , save in postal
        var _this = this;
        var service = new google.maps.places.PlacesService(this.map);
        service.getDetails({ placeId: order.placeId }, function (place, status) {
            if (status == "OK") {
                //Extract postal code from place details result,  
                var index = place.address_components.length - 1;
                var postalCodeComponent = place.address_components[index];
                var postalCodeLong = postalCodeComponent.long_name;
                var postalCode = postalCodeLong[0] + postalCodeLong[1] + postalCodeLong[2];
                //Create latlng object with coordinates from place details result 
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                console.log("place found " + lat + lng + postalCode);
                // save order to its postal in db
                // this.orderProvider.saveToPostal(order.id, order, postalCode, lat, lng);
                _this.orderProvider.savePostalDemo(postalCode, order, lat, lng)
                    .then(function () {
                    console.log("order saved in postal");
                });
                _this.updateDisplay(postalCode);
            }
            else {
                _this.sortFailed(order);
                console.log("place lookup failed" + status);
            }
        });
        // end of places service  
    };
    //start sort failed 
    TrialPage.prototype.sortFailed = function (order) {
        // show orders that failed sort in view
        this.sortFailedOrders.push(order);
        // have a retry button
    };
    TrialPage.prototype.retrySort = function () {
        var _this = this;
        this.sortFailedOrders.forEach(function (order) {
            _this.sortOrder(order);
        });
    };
    // UPDAtE Display 
    TrialPage.prototype.updateDisplay = function (postalCode) {
        var _this = this;
        var foundPostal = false;
        if (this.postalsArray.length > 0) {
            this.postalsArray.forEach(function (postal, i) {
                // console.log("comparing" + postalCode +"with "+postal.code);
                if (postal.code == postalCode) {
                    // console.log("matched "+postal.code);
                    _this.postalsArray[i].orders += 1;
                    foundPostal = true;
                }
            });
        }
        if (!foundPostal) {
            this.postalsArray.push({
                code: postalCode,
                orders: 1,
                selected: false
            });
        }
    };
    // NEW VIEW POStAL
    TrialPage.prototype.viewPostal = function (postal, postalIndex) {
        var _this = this;
        this.markerSelected = false;
        this.details = {};
        this.postalOrdersArray = [];
        this.postalSelected = true;
        this.postalsArray[postalIndex].selected = true;
        // this.postalOrdersArray.push(this.postalsArray[postalIndex]);
        this.postalOrdersArray.push({
            code: postal.code,
            orders: []
        });
        // copy all unassigned orders into view - postal orders array 
        this.postalsArray[postalIndex].orders.forEach(function (order, orderIndex) {
            if (order.assigned == false) {
                order.postalIndex = postalIndex;
                order.orderIndex = orderIndex;
                order.marker.setMap(_this.map);
                // Attach click listener
                google.maps.event.addListener(order.marker, 'click', function () {
                    order.selected = !order.selected;
                    // console.log(order.selected);  
                    // if marker was selected, 
                    if (order.selected == true) {
                        // console.log("selected true");
                        _this.markerSelected = true;
                        // highlight marker, 
                        var icon = "http://www.google.com/mapfiles/dd-start.png";
                        order.marker.setIcon(icon);
                        _this.postalOrdersArray[0].orders[orderIndex].selected = true;
                        console.log(_this.postalOrdersArray[0].orders[orderIndex]);
                    }
                    else {
                        // de-select marker
                        // console.log("selected false");
                        var icon = "http://www.google.com/mapfiles/marker.png";
                        order.marker.setIcon(icon);
                        _this.postalOrdersArray[0].orders[orderIndex].selected = false;
                        console.log(_this.postalOrdersArray[0].orders[orderIndex]);
                    }
                });
                // end of google map listener
                _this.postalOrdersArray[0].orders.push(order);
            }
        });
        // this.postalOrdersArray[0].orders.forEach((order, orderIndex) => {
        //   order.marker.setMap(this.map);
        //   // Attach click listener
        //     // google.maps.event.addListener(order.marker, 'click', () => {
        //     //       // console.log("clicked "+ order.address);
        //     //       // // toggle selected property
        //     //     // this.postalOrdersArray[0].orders[orderIndex].selected 
        //     //     //       = !this.postalOrdersArray[0].orders[orderIndex].selected;
        //     //     let status = this.postalOrdersArray[0].orders[orderIndex].selected;
        //     //     let newStatus = !status;
        //     //     newStatus = this.postalOrdersArray[0].orders[orderIndex].selected;
        //     //     console.log(ntatus); 
        //     //     // if marker was selected, 
        //     //       // if(selected == true){
        //     //       //   console.log("selected true");
        //     //       //       this.markerSelected = true;
        //     //       //       // highlight marker, 
        //     //       //       let icon = "http://www.google.com/mapfiles/dd-start.png";
        //     //       //       order.marker.setIcon(icon);
        //     //       // } 
        //     //       // else {
        //     //       //       // de-select marker
        //     //       //       console.log("selected false");
        //     //       //       let icon = "http://www.google.com/mapfiles/marker.png";
        //     //       //       order.marker.setIcon(icon); 
        //     //       // }
        //     // });
        //     // // end of google map listener 
        // });
    };
    TrialPage.prototype.processOrder = function (order, postalIndex) {
        // push order into postalOrdersArray 
        var ordersLength = this.postalOrdersArray[postalIndex].orders.push(order);
        var orderIndex = ordersLength - 1;
        console.log("adding marker");
        // Create marker with index corresponding to order's index in postalOrdersArray
        this.addMarker(order, postalIndex, orderIndex);
    };
    //Listener for orders being assigned - 
    // updates assigned order in postalOrdersArray and markerArray
    TrialPage.prototype.attachAssignedListener = function (listRef) {
        var _this = this;
        // Attach listener
        listRef.on('child_changed', function (data) {
            //if order was assigned,  
            if (data.val().assigned == true) {
                //loop through postals array
                _this.postalsArray.forEach(function (postal, postalIndex) {
                    // find postal of assigned order
                    // check if it is being viewed currently
                    if (postal.code == data.val().postalCode) {
                        // if postal is under view, deal wih markers
                        if (postal.selected == true) {
                            _this.postalOrdersArray[0]
                                .orders
                                .forEach(function (order, orderIndex) {
                                console.log(order);
                                if (order.id == data.val().id) {
                                    // this.postalOrdersArray[0].orders[orderIndex] = {}; 
                                    var assignedOrderMarker = _this.markerArray[0].markers[orderIndex];
                                    assignedOrderMarker.setMap(null);
                                    // this.markerArray[0].markers[orderIndex] = null;
                                    console.log(_this.postalsArray[postalIndex].orders);
                                    // decrease  unassigned order count in postals Array
                                    var count = _this.postalsArray[postalIndex].orders;
                                    _this.postalsArray[postalIndex].orders = count - 1;
                                }
                            });
                        }
                        else {
                            // only delete order in postals Array
                            console.log(postal.orders);
                            postal
                                .orders
                                .forEach(function (order, orderIndex) {
                                if (order.id == data.val().id) {
                                    // decrease  unassigned order count in postals Array
                                    var count = _this.postalsArray[postalIndex].orders;
                                    _this.postalsArray[postalIndex].orders = count - 1;
                                }
                            });
                        }
                    }
                });
            }
        });
    };
    // HIDE VIEW POStAL's orders and markers
    TrialPage.prototype.closePostal = function () {
        var _this = this;
        this.postalSelected = false;
        // set selected property of postal in postalsArray to false
        this.postalsArray.forEach(function (postal, i) {
            if (postal.selected == true) {
                _this.postalsArray[i].selected = false;
            }
        });
        // clear markers
        this.postalOrdersArray[0].orders.forEach(function (order) {
            order.marker.setMap(null);
        });
        // clear any polygons
        this.eraseZone();
        // clear postalOrdersArray
        this.postalOrdersArray = [];
        // // refreshview
        // this.refreshView();
    };
    // LOAD MAP 
    TrialPage.prototype.loadMap = function () {
        var coords = new google.maps.LatLng(45.418216, -75.667683);
        var mapOptions = {
            center: coords,
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        console.log(mapOptions);
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    };
    //  add marker for order
    TrialPage.prototype.addMarker = function (order, postalIndex, orderIndex) {
        var coords = new google.maps.LatLng(order.lat, order.lng);
        var newMarker = {};
        var icon = "http://www.google.com/mapfiles/marker.png";
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
    };
    // END OF ADD MARKER 
    // ADD MARKER To MARKER ARRAY
    TrialPage.prototype.addMarkerToArray = function (newMarker, order) {
        // console.log("marker added to array");
        var newPostal = true;
        if (this.markerArray.length > 0) {
            this.markerArray.forEach(function (marker) {
                if (marker.postalCode == order.postalCode) {
                    newPostal = false;
                    marker.markers.push(newMarker);
                }
            });
        }
        if (newPostal) {
            var length_1 = this.markerArray.push({
                postalCode: order.postalCode,
                markers: []
            });
            var index = length_1 - 1;
            this.markerArray[index].markers.push(newMarker);
        }
        // console.log(this.markerArray);
    };
    // refresh  view - empty postal orders and markers,
    // and reload selected postal
    TrialPage.prototype.refreshView = function () {
        // console.log("refreshing display");
        var _this = this;
        // empty out postalOrders and markerArrays
        this.postalOrdersArray = [];
        // if any markers in ayrray, clear them
        if (this.markerArray.length > 0) {
            this.markerArray.forEach(function (marker, i) {
                _this.markerArray[i].markers.forEach(function (marker) {
                    if (marker != null) {
                        marker.setMap(null);
                    }
                });
            });
            this.markerArray.length = 0;
            this.markerArray = [];
        }
        // Repopulate view with selected postals and associated markers
        this.postalsArray.forEach(function (postal, i) {
            if (postal.selected) {
                _this.viewPostal(postal, i);
            }
        });
    };
    TrialPage.prototype.selectAllOrders = function (postalIndex) {
        this.markerArray[postalIndex].markers.forEach(function (marker) {
            marker.setIcon('http://www.google.com/mapfiles/dd-start.png');
        });
        this.postalOrdersArray[postalIndex].orders.forEach(function (order) {
            order.selected = true;
        });
    };
    // Get induvidually selected orders in postalOrdersArray
    TrialPage.prototype.getSelectedOrders = function () {
        // this.assignableArray = [];
        var assignableArray = [];
        this.postalOrdersArray.forEach(function (postal, postalIndex) {
            postal.orders.forEach(function (order, orderIndex) {
                if (order.selected) {
                    var assignedOrder = order;
                    assignedOrder.orderIndex = orderIndex;
                    assignedOrder.postalIndex = postalIndex;
                    // this.assignableArray.push(assignedOrder);
                    assignableArray.push(assignedOrder);
                }
            });
        });
        console.log("Assignable " + assignableArray);
        return assignableArray;
        // console.log("Assignable "+ this.assignableArray);
    };
    TrialPage.prototype.createRoute = function () {
        var _this = this;
        // Prompt user for route name
        var alert = this.alertCtrl.create({
            message: "Drop pins to mark a zone and hit Create Zone",
            inputs: [
                { name: 'routeName', placeholder: 'Route name' }
            ],
            buttons: [
                { text: 'Cancel', role: 'Cancel' },
                {
                    text: 'OK',
                    handler: function (data) {
                        // push new route into routes array
                        var newRoute = {
                            name: data.routeName,
                            dateCreated: _this.dateUnderReview,
                            selected: true,
                            orders: [],
                            stops: []
                        };
                        var routeIndex = _this.routesArray.push(newRoute) - 1;
                        _this.orderProvider.createRoute(_this.dateUnderReview, data.routeName)
                            .then(function () {
                            var listType = 'routes';
                            _this.addListListener(_this.dateUnderReview, newRoute.name, routeIndex, listType);
                            _this.addStopsListener(_this.dateUnderReview, newRoute.name, routeIndex, listType);
                        });
                    }
                }
            ]
        });
        alert.present();
    };
    //method to allow choosing orders by clicking markers 
    TrialPage.prototype.allowMarkerChoosing = function () {
        var _this = this;
        this.choosingMarkers = true;
        // loop markers
        this.markerArray[0].markers.forEach(function (marker, markerIndex) {
            // Attach click listener
            google.maps.event.addListener(marker, 'click', function () {
                console.log("postalOrdersArray " + _this.postalOrdersArray);
                console.log("markerIndex " + markerIndex);
                // // toggle selected property
                _this.postalOrdersArray[0].orders[markerIndex].selected
                    = !_this.postalOrdersArray[0].orders[markerIndex].selected;
                var selected = _this.postalOrdersArray[0].orders[markerIndex].selected;
                // if marker was selected, 
                if (selected == true) {
                    // highlight marker, 
                    var icon = "http://www.google.com/mapfiles/dd-start.png";
                    marker.setIcon(icon);
                }
                else {
                    // de-select marker
                    var icon = "http://www.google.com/mapfiles/marker.png";
                    marker.setIcon(icon);
                }
            });
            // end of google map listener   
        });
    };
    TrialPage.prototype.stopMarking = function () {
        console.log("stop marking clicked");
        this.choosingMarkers = false;
        // de-select and detach listener on markers and set to normal
        this.markerArray[0]
            .markers
            .forEach(function (marker, markerIndex) {
            // detach listener
            google.maps.event.clearListeners(marker, 'click');
            // de-select 
            var icon = "http://www.google.com/mapfiles/marker.png";
            marker.setIcon(icon);
        });
    };
    TrialPage.prototype.saveChosenMarkers = function () {
        // get all selected orders in postal orders array
        var selectedOrders = this.getSelectedOrders();
        // console.log(selectedOrders);
        // add selected orders to assignable array
        this.assignableArray = [];
        this.assignableArray = selectedOrders;
        // enable choose markers button
        // this.choosingMarkers = false;
    };
    // Method to allow zone markking:
    TrialPage.prototype.markZone = function () {
        var _this = this;
        // hide postals details
        this.hideDetails();
        // prevent user from clicking mark zone again
        this.markingZone = true;
        this.zone = {
            markers: [],
            coordinates: [],
            orders: [],
            indices: []
        };
        // add click listener to map
        google.maps.event.addListener(this.map, 'click', function (event) {
            var image = "http://labs.google.com/ridefinder/images/mm_20_purple.png";
            // drop marker at each clicked latlng, 
            var newMarker = new google.maps.Marker({
                title: "zone boundary",
                map: _this.map,
                animation: google.maps.Animation.DROP,
                position: event.latLng,
                icon: image,
                draggable: true
            });
            //save coordinate and correspomding marker in respective arrays  
            _this.zone.coordinates.push(event.latLng);
            _this.zone.markers.push(newMarker);
        });
        //END of map listener  
    };
    //END of mark zone
    //METHOD TO erase A ZONE  
    TrialPage.prototype.eraseZone = function () {
        if (this.zoneUnderView == true) {
            this.zone.zonePolygon.setMap(null);
        }
        // clear zone coordinates 
        this.zone = {};
        // enable mark zone button
        this.markingZone = false;
        this.zoneUnderView = false;
        // detach click listener from map
        google.maps.event.clearListeners(this.map, 'click');
    };
    // METHOD TO SEtup ZONE that was MARKED
    TrialPage.prototype.setupZone = function () {
        // create and display zone polygon overlay
        console.log(this.zone.coordinates);
        var coordinates = this.zone.coordinates;
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
        this.zone.markers.forEach(function (marker) {
            marker.setMap(null);
        });
        // this.zone.markers.length = 0;
        // this.zone.markers = [];
        // detach click listener from map
        google.maps.event.clearListeners(this.map, 'click');
        this.zoneUnderView = true;
    };
    // END Save zone
    // 
    TrialPage.prototype.showZoneDetails = function () {
        var _this = this;
        this.setupZone();
        // filter orders in postalOrders that are inside polygon 
        var zoneOrders = {
            orders: [],
            orderIndices: []
        };
        zoneOrders = this.getOrdersInZone(this.zone.coordinates, this.postalOrdersArray[0].orders);
        // this.zone.orders = this.getOrdersInZone(this.zone.coordinates, this.postalOrdersArray[0].orders);
        this.zoneDetails = this.reduceOrderArray(zoneOrders.orders);
        this.zoneIndices = zoneOrders.orderIndices;
        console.log("zone order indices are " + this.zoneIndices);
        // push into zone holding obj, 
        this.zone.orders = [];
        console.log(zoneOrders.orders);
        zoneOrders.orders.forEach(function (order) {
            _this.zone.orders.push(order);
        });
        console.log("zone.orders afetr show details " + this.zone.orders[0].address);
    };
    // return ORDERS WItHIN POLyGON-
    TrialPage.prototype.getOrdersInZone = function (zoneCoordinates, ordersArray) {
        // console.log("zoneCoordinates before calling inPoly "+ zoneCoordinates)
        var _this = this;
        var ordersInZone = {
            orders: [],
            orderIndices: []
        };
        ordersArray.forEach(function (order, orderIndex) {
            // check if order is inside polygon
            var inPoly = _this.polygonProvider.inPoly(zoneCoordinates, order);
            // console.log(inPoly);
            // if order is in polygon, push into zone
            if (inPoly == true) {
                ordersInZone.orders.push(order);
                ordersInZone.orderIndices.push(orderIndex);
            }
        });
        return ordersInZone;
    };
    // Add chosen markers to a route:
    TrialPage.prototype.addMarkersToRoute = function (routeName, routeIndex) {
        // // get all selected orders in postal orders array
        var _this = this;
        this.assignableArray.forEach(function (order) {
            _this.routesArray[routeIndex].orders.push(order);
            _this.orderProvider.saveToRoute(_this.dateUnderReview, routeName, order);
            // update order as assigned in db
            var updates = [
                { property: 'assigned', value: true },
                { property: 'route', value: routeName }
            ];
            _this.orderProvider.updateOrder(order, updates);
        });
        console.log("order makers added to " + this.routesArray[routeIndex].name);
        // enable choose markers button
        this.choosingMarkers = false;
    };
    // Add zone to a route
    TrialPage.prototype.addToRoute = function (routeName, routeIndex) {
        // // remove markers of assigned orders and delete in postalorders
        // if(this.zoneIndices.length > 0)  {
        var _this = this;
        //     this.zoneIndices.forEach((orderIndex) => {
        //     this.postalOrdersArray[0]
        //         .orders[orderIndex]
        //         .marker.setMap(null);
        //     this.postalOrdersArray[0]
        //         .orders[orderIndex]
        //         .route = routeName;
        //   }); 
        // }      
        // save orders in  zone to route in db
        if (this.zoneUnderView == true) {
            this.zone.orders.forEach(function (order, orderIndex) {
                console.log(order);
                then(function () {
                    _this.eraseZone();
                    // remove markers of assigned orders and delete in postalorders
                    if (_this.zoneIndices.length > 0) {
                        _this.zoneIndices.forEach(function (orderIndex) {
                            _this.postalOrdersArray[0]
                                .orders[orderIndex]
                                .marker.setMap(null);
                            _this.postalOrdersArray[0]
                                .orders[orderIndex]
                                .route = routeName;
                        });
                    }
                });
            });
        }
        // save individually selected orders to route in db
        if (this.markerSelected == true) {
            this.postalOrdersArray[0].orders.forEach(function (order, orderIndex) {
                if (order.selected == true) {
                    _this.orderProvider.saveToRoute(_this.dateUnderReview, routeName, order)
                        .then(function () {
                        console.log("individual order saved in route");
                        _this.postalOrdersArray[0]
                            .orders[orderIndex]
                            .marker.setMap(null);
                        _this.postalOrdersArray[0]
                            .orders[orderIndex]
                            .route = routeName;
                    });
                }
            });
            this.markerSelected = false;
        }
    };
    // View filters:
    TrialPage.prototype.applyListFilter = function (filter) {
        var _this = this;
        this.listFilterOn = true;
        console.log("filter applied is " + filter);
        //clear out marker array 
        this.markerArray.forEach(function (postal) {
            postal.markers.forEach(function (marker) {
                marker.setMap(null);
            });
        });
        this.markerArray.length = 0;
        this.markerArray = [];
        // loop through postalOrders and filter orders of list
        this.postalOrdersArray.forEach(function (postal, postalIndex) {
            postal.orders.forEach(function (order, orderIndex) {
                if (order.listName == filter) {
                    _this.addMarker(order, postalIndex, orderIndex);
                }
            });
        });
    };
    TrialPage.prototype.removeAllFilters = function () {
        var _this = this;
        this.listFilterOn = false;
        // this.refreshView();
        // remake markers for all unassigned orders in postal
        this.postalOrdersArray.forEach(function (postal, postalIndex) {
            postal.orders.forEach(function (order, orderIndex) {
                if (order.assigned == false) {
                    _this.addMarker(order, postalIndex, orderIndex);
                }
            });
        });
    };
    TrialPage.prototype.showOsnr = function () {
        var _this = this;
        // if filter is selected
        if (this.viewOsnr == true) {
            //clear out marker array 
            this.markerArray.forEach(function (postal) {
                postal.markers.forEach(function (marker) {
                    marker.setMap(null);
                });
            });
            this.markerArray.length = 0;
            this.markerArray = [];
            // loop tthrough postal orders array and set markers
            this.postalOrdersArray.forEach(function (postal, postalIndex) {
                postal.orders.forEach(function (order, orderIndex) {
                    if (order.osnr == true) {
                        _this.addMarker(order, postalIndex, orderIndex);
                    }
                });
            });
        }
        else {
            this.postalOrdersArray.forEach(function (postal, postalIndex) {
                postal.orders.forEach(function (order, orderIndex) {
                    _this.addMarker(order, postalIndex, orderIndex);
                });
            });
        }
    };
    // Business orders view filter
    TrialPage.prototype.showBusiness = function () {
        var _this = this;
        // if filter is selected
        if (this.viewBusiness == true) {
            //clear out marker array 
            this.markerArray.forEach(function (postal) {
                postal.markers.forEach(function (marker) {
                    marker.setMap(null);
                });
            });
            this.markerArray.length = 0;
            this.markerArray = [];
            // loop tthrough postal orders array and set markers
            this.postalOrdersArray.forEach(function (postal, postalIndex) {
                postal.orders.forEach(function (order, orderIndex) {
                    if (order.business == true) {
                        _this.addMarker(order, postalIndex, orderIndex);
                    }
                });
            });
        }
        else {
            this.postalOrdersArray.forEach(function (postal, postalIndex) {
                postal.orders.forEach(function (order, orderIndex) {
                    _this.addMarker(order, postalIndex, orderIndex);
                });
            });
        }
    };
    // RETRIEVE zones for postals and LISTENER FOR CHANGE 
    TrialPage.prototype.getAllZones = function () {
        var zoneListRef = firebase_1["default"].database().ref(this.dateUnderReview + '/zones');
        zoneListRef.on('child_added', function (data) {
            console.log("from get all zones " + data.val());
        });
    };
    TrialPage.prototype.isOsnr = function (order) {
        return order.osnr == true;
    };
    TrialPage.prototype.isBusiness = function (order) {
        return order.business == true;
    };
    // SHOW ARRAy details
    TrialPage.prototype.showDetails = function (ordersArray) {
        this.details = this.reduceOrderArray(ordersArray);
        console.log(ordersArray);
        this.showBreakdown = true;
    };
    // TROUBLESHOOT
    TrialPage.prototype.reduceOrderArray = function (ordersArray) {
        return ordersArray.reduce(function (details, order, orderIndex) {
            if (order.osnr == true) {
                details.osnr.total.count += 1;
                details.osnr.total.indices.push(orderIndex);
                details.osnr[order.listName].count += 1;
                details.osnr[order.listName].indices.push(orderIndex);
            }
            else {
                details.business.total.count += 1;
                details.business.total.indices.push(orderIndex);
                details.business[order.listName].count += 1;
                details.business[order.listName].indices.push(orderIndex);
            }
            return details;
        }, {
            osnr: {
                total: {
                    count: 0,
                    indices: []
                },
                screens: {
                    count: 0,
                    indices: []
                },
                envelopes: {
                    count: 0,
                    indices: []
                },
                heavies: {
                    count: 0,
                    indices: []
                }
            },
            business: {
                total: {
                    count: 0,
                    indices: []
                },
                screens: {
                    count: 0,
                    indices: []
                },
                envelopes: {
                    count: 0,
                    indices: []
                },
                heavies: {
                    count: 0,
                    indices: []
                }
            }
        });
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
    };
    TrialPage.prototype.clearAllMarkers = function () {
        this.postalOrdersArray[0].orders.forEach(function (order) {
            order.marker.setMap(null);
        });
    };
    TrialPage.prototype.filterMarkers = function (indices) {
        var _this = this;
        this.filterOn = true;
        this.clearAllMarkers();
        indices.forEach(function (index) {
            console.log("order index" + index);
            _this.postalOrdersArray[0].orders[index].marker.setMap(_this.map);
        });
    };
    // SHOW ARRAy details
    TrialPage.prototype.hideDetails = function () {
        // this.details = {};
        this.showBreakdown = false;
    };
    // add stops in route
    TrialPage.prototype.addStop = function (position, routeName) {
        this.addingStop = true;
        this.stopPosition = position;
    };
    // delete stop
    TrialPage.prototype.deleteStop = function (chosenStop) {
        var _this = this;
        console.log(chosenStop.deleted);
        // set stop's deleted property to true in db 
        this.orderProvider
            .deleteStop(chosenStop)
            .then(function () {
            //on success, find route that stop belongs to and remove it 
            _this.routesArray.forEach(function (route, routeIndex) {
                if (route.name == chosenStop.route) {
                    _this.routesArray[routeIndex].stops.forEach(function (stop, stopIndex) {
                        if (stop.id == chosenStop.id) {
                            _this.routesArray[routeIndex].stops.splice(stopIndex, 1);
                        }
                    });
                }
            });
        });
    };
    TrialPage.prototype.searchPlace = function (query) {
        var _this = this;
        if (query.length > 5) {
            var config = {
                bounds: this.cityBounds,
                types: ['geocode'],
                input: query
            };
            this.autoCompleteService
                .getPlacePredictions(config, function (predictions, status) {
                _this.places = [];
                if (predictions) {
                    predictions.forEach(function (prediction) {
                        _this.places.push(prediction);
                    });
                }
                else {
                    return;
                }
            });
        }
    };
    TrialPage.prototype.choosePlace = function (place, routeName) {
        var _this = this;
        console.log("chosen place is " + place);
        var stop = {
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
        console.log("stop is " + stop.position);
        var service = new google.maps.places.PlacesService(this.map);
        service.getDetails({ placeId: stop.placeId }, function (place, status) {
            if (status == "OK") {
                //Extract postal code from place details result,  
                var index = place.address_components.length - 1;
                var postalCodeComponent = place.address_components[index];
                var postalCodeLong = postalCodeComponent.long_name;
                stop.postalCode = postalCodeLong[0] + postalCodeLong[1] + postalCodeLong[2];
                //Create latlng object with coordinates from place details result 
                stop.lat = place.geometry.location.lat();
                stop.lng = place.geometry.location.lng();
                // save new stop for route in db
                _this.orderProvider.saveRouteStop(_this.dateUnderReview, routeName, stop)
                    .then(function (newStop) {
                    console.log("New order created - " + newStop);
                    // this.addingStop = false;
                    // this.query = '';
                    // this.places = [];
                    _this.stopPosition = '';
                    // this.routesArray.forEach((route,routeIndex) => {
                    //   if(route.name == routeName){
                    //     this.routesArray[routeIndex].stops.push(stop);
                    //   }
                    // });
                    // this.refreshForm();
                });
            }
            else {
                console.log("place lookup failed" + status);
            }
        });
    };
    // set selected property of route to true, and close all other selected routes
    TrialPage.prototype.showRoute = function (routeName) {
        var _this = this;
        this.routesArray.forEach(function (route, routeIndex) {
            if (route.name == routeName) {
                _this.routesArray[routeIndex].selected = true;
            }
            else {
                _this.routesArray[routeIndex].selected = false;
            }
        });
    };
    // set selected property of route to false
    TrialPage.prototype.closeRoute = function (routeName) {
        // this.addingStop = false;
        var _this = this;
        this.routesArray.forEach(function (route, routeIndex) {
            if (route.name == routeName) {
                _this.routesArray[routeIndex].selected = false;
            }
        });
    };
    // close search address for stop option
    TrialPage.prototype.closeSearch = function (routeName) {
        this.addingStop = false;
    };
    // allow search for adding custom stops
    TrialPage.prototype.allowSearch = function () {
        this.addingStop = true;
    };
    // select route order
    TrialPage.prototype.selectRouteOrder = function (routeIndex, orderIndex) {
        this.routesArray[routeIndex].orders[orderIndex].selected
            = !this.routesArray[routeIndex].orders[orderIndex].selected;
        var select = "http://labs.google.com/ridefinder/images/mm_20_yellow.png";
        var unselect = "http://labs.google.com/ridefinder/images/mm_20_green.png";
        if (this.routesArray[routeIndex].orders[orderIndex].selected == true) {
            this.routesArray[routeIndex].orders[orderIndex].marker.setIcon(select);
        }
        else {
            this.routesArray[routeIndex].orders[orderIndex].marker.setIcon(unselect);
        }
    };
    // Remove/unassign orders
    TrialPage.prototype.removeOrders = function (routeName, routeIndex) {
        var _this = this;
        var selectedOrders = [];
        //push all selected orders into a array 
        this.routesArray[routeIndex].orders.forEach(function (order, orderIndex) {
            // get all selected orders, alert user to remove
            if (order.selected == true) {
                var updates = [
                    { property: 'assigned', value: false }
                ];
                _this.orderProvider.updateOrder(order, updates);
            }
        });
    };
    __decorate([
        core_1.ViewChild('map')
    ], TrialPage.prototype, "mapElement");
    TrialPage = __decorate([
        ionic_angular_1.IonicPage(),
        core_1.Component({
            selector: 'page-trial',
            templateUrl: 'trial.html'
        })
    ], TrialPage);
    return TrialPage;
}());
exports.TrialPage = TrialPage;
