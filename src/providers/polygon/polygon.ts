import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the PolygonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PolygonProvider {

  constructor(public http: HttpClient) {
    console.log('Hello PolygonProvider Provider');
  }

  // Raycast point in polygon method

  inPoly(zoneCoordinates, order): boolean {
          // console.log("zoneCoordinates" + zoneCoordinates + "order" + order);
          
          let lat = order.lat;
          let lng = order.lng;
          
          // console.log("order's lat and lng "+lat + lng);
          
          let length = zoneCoordinates.length;
          
          let j = length - 1;
          let inPoly = false; 
          
    zoneCoordinates.forEach((coordinates, i) => {
      let zoneLat = coordinates.lat();
      // console.log("zone coordinates before logic "+ zoneLat +"compared with "+lat+lng);
      // let vertex1 = coordinates;
       let vertex1Lat = coordinates.lat();
       let vertex1Lng = coordinates.lng();

       let vertex2Lat = zoneCoordinates[j].lat();
       let vertex2Lng = zoneCoordinates[j].lng();  
        if (
          vertex1Lng <  lng &&
          vertex2Lng >= lng ||
          vertex2Lng <  lng &&
          vertex1Lng >= lng
        ) {
            if (
              vertex1Lat +
              (lng - vertex1Lng) /
              (vertex2Lng - vertex1Lng) *
              (vertex2Lat - vertex1Lat) <
              lat
            ) {
              inPoly = !inPoly;
            }
        }
        
        j = i;
    });
    return inPoly;
  }
  
  
//   for (p = 0; p < numPaths; p++) {
//     path = this.getPaths().getAt(p);
//     numPoints = path.getLength();
//     j = numPoints - 1;

//     for (i = 0; i < numPoints; i++) {
//       vertex1 = path.getAt(i);
//       vertex2 = path.getAt(j);

//       if (
//         vertex1.lng() <  lng &&
//         vertex2.lng() >= lng ||
//         vertex2.lng() <  lng &&
//         vertex1.lng() >= lng
//       ) {
//         if (
//           vertex1.lat() +
//           (lng - vertex1.lng()) /
//           (vertex2.lng() - vertex1.lng()) *
//           (vertex2.lat() - vertex1.lat()) <
//           lat
//         ) {
//           inPoly = !inPoly;
//         }
//       }

//       j = i;
//     }
//   }

//   return inPoly;
// };

}
