"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
/*
  Generated class for the PolygonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var PolygonProvider = (function () {
    function PolygonProvider(http) {
        this.http = http;
        console.log('Hello PolygonProvider Provider');
    }
    // Raycast point in polygon method
    PolygonProvider.prototype.inPoly = function (zoneCoordinates, order) {
        // console.log("zoneCoordinates" + zoneCoordinates + "order" + order);
        var lat = order.lat;
        var lng = order.lng;
        // console.log("order's lat and lng "+lat + lng);
        var length = zoneCoordinates.length;
        var j = length - 1;
        var inPoly = false;
        zoneCoordinates.forEach(function (coordinates, i) {
            var zoneLat = coordinates.lat();
            // console.log("zone coordinates before logic "+ zoneLat +"compared with "+lat+lng);
            // let vertex1 = coordinates;
            var vertex1Lat = coordinates.lat();
            var vertex1Lng = coordinates.lng();
            var vertex2Lat = zoneCoordinates[j].lat();
            var vertex2Lng = zoneCoordinates[j].lng();
            if (vertex1Lng < lng &&
                vertex2Lng >= lng ||
                vertex2Lng < lng &&
                    vertex1Lng >= lng) {
                if (vertex1Lat +
                    (lng - vertex1Lng) /
                        (vertex2Lng - vertex1Lng) *
                        (vertex2Lat - vertex1Lat) <
                    lat) {
                    inPoly = !inPoly;
                }
            }
            j = i;
        });
        return inPoly;
    };
    PolygonProvider = __decorate([
        core_1.Injectable()
    ], PolygonProvider);
    return PolygonProvider;
}());
exports.PolygonProvider = PolygonProvider;
