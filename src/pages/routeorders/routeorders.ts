import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import { OrderProvider } from '../../providers/order/order';

@IonicPage()
@Component({
  selector: 'page-routeorders',
  templateUrl: 'routeorders.html',
})



export class RouteordersPage {

public ordersArray: Array<any> = [];
public dateCreated: string;
public routeName: string;



  constructor(public navCtrl: NavController, public navParams: NavParams,
              public orderProvider: OrderProvider) {
  
    this.dateCreated = this.navParams.get('dateCreated');
    this.routeName = this.navParams.get('routeName');
    
    this.addListListener(this.dateCreated, this.routeName);
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RouteordersPage');
    
  }
  
  
  
  // listen for new orders added to route

addListListener(dateCreated, routeName): void {
    
    let listRef = firebase.database().ref(dateCreated+'/routes/'+routeName+'/orders');
    
      listRef.on('child_added', data => {
       
        console.log("child added");
        
        let order = data.val();
  
        if(order.assigned == false){
          return
        }
        else {
          
          if(this.ordersArray.length < 1) {
            
              let listLength = this.ordersArray
                                  .push(
                                    {
                                      name: order.listName,
                                      orders: []
                                    }
                                  );
                                  
              let listIndex = listLength -1;  
              
              this.ordersArray[listIndex].orders.push(order);
             
            console.log(this.ordersArray[listIndex]);
            
          }
          else {
            
            let foundList = false;
            
            this.ordersArray.forEach((list, listIndex) => {
              
              console.log(list.name);
              console.log(order.listName);
              
              
              if(list.name == order.listName){
                  
                foundList = true;
                
                this.ordersArray[listIndex].orders.push(order);
              } 
              
            });  
            
            if(foundList == false){
              
              
              
              let listLength = this.ordersArray
                                  .push(
                                    {
                                      name: order.listName,
                                      orders: []
                                    }
                                  );
                                  
              let listIndex = listLength -1;  
              
              this.ordersArray[listIndex].orders.push(order);
              
            }
            
          }
          
        }
          

      });
    
      listRef.on('child_changed', data => {
        
        console.log("child changed");
        
        let removedOrder = data.val(); 
        
        if(removedOrder.assigned == false){
          
        // find removed order's list and thetn order, set assigned = false;
            this.ordersArray.forEach((list, listIndex) => {
              
              if(list.name == removedOrder.listName) {
                  
                  this.ordersArray[listIndex]
                      .orders
                      .forEach((order, orderIndex) => {
                        
                        if(order.id == removedOrder.id){
                          console.log("order removed was "+ order.address);
                            this.ordersArray[listIndex].orders[orderIndex].assigned = false;
                          
                        }
                        
                      });
                  
              }
              
              
            });
          
        }
        
      });
    
  }  
  
  
 loadOrder(order, orderIndex, listIndex): void {
    
    console.log("loaded status "+ this.ordersArray[listIndex].orders[orderIndex].loaded);

    let loaded = this.ordersArray[listIndex].orders[orderIndex].loaded;
    
    if(loaded == false) {
      
      let updates = [{property: 'loaded', value: false}];
    
      this.orderProvider.updateOrder(order, updates);
      
    }
    
    
  }

}
