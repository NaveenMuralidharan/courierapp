import { Component } from '@angular/core';
import { NavController, NavParams, Alert, AlertController } from 'ionic-angular';
import firebase from 'firebase';
import { OrderProvider } from '../../providers/order/order';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  public orderListRef: firebase.database.Reference;
  public listName: string = '';
  public lists: Array<any>= [];
  public dateStamp: any;
  public todaysLists: Array<any> = [];
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public orderProvider: OrderProvider) {
    this.orderListRef = firebase.database().ref();
    this.getTodaysLists();
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
  
// Create new list

  createList(): void {
    const alert: Alert = this.alertCtrl.create({
      message: "Enter the name of your new list",
      inputs: [
          { name: 'listName', placeholder: 'List name'}
        ],
        buttons: [
          {text: 'Cancel', role: 'Cancel'},
          {
            text: 'Save', 
            handler: data => {
              let dateStamp = this.currentDate();
              let list = {
                  listName: data.listName,
                  dateCreated: dateStamp
              };
              
              this.orderProvider.createSorterList(list);

            }
            
          }        
                ]
      
    });
    alert.present();
  }
  
  
  // Get today's lists:
  getTodaysLists(): void {
    let date = this.currentDate();
    let listRef = firebase.database().ref(date+'/sorters/');
    listRef.on('child_added', data => {
      console.log(data.val());  
      this.todaysLists.push(data.val());
      
      });
  }
  
  
  
  goToList(list): void {
    // console.log("clicked" + list);
    // this.navCtrl.push('ListCreatePage', {list: list});
    this.navCtrl.push('ListCreatePage', {list: list});
  }
  

  goToTrial(): void {
    this.navCtrl.push('TrialPage');
  }
  
  
  goToRoutes(): void {
    this.navCtrl.push('RoutesPage');
  }
  
}
