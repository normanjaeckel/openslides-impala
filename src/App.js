import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';


class Autoupdate {

  newConnect (dispatch) {
    const socket = new WebSocket('ws://localhost:8000/ws/site/');

    socket.onclose = (event) => {
      console.log('Socket closed. Code for reconnect is missing.');
    };

    socket.onmessage = (event) => {
      let dataList;
      try {
        dataList = JSON.parse(event.data);
      } catch(err) {
        console.error(err);
      }
      if (dataList) {
        const dataListByCollection = _.groupBy(dataList, 'collection');
        _.forEach(dataListByCollection, (list, collectionString) => {
          const changedElements = [];
          const deletedElements = [];
          _.forEach(list, (data) => {
            // Uncomment this line for debugging to log all autoupdates:
            // console.log("Received object: " + data.collection + ", " + data.id);

            // Now handle autoupdate message but do not handle notify messages.
            if (data.collection !== 'notify') {
              // remove (=eject) object from local DS store
              //var instance = DS.get(data.collection, data.id);
              //if (instance) {
              //  dsEject(data.collection, instance);
              //}
              // check if object changed or deleted
              if (data.action === 'changed') {
                changedElements.push(data.data);
              } else if (data.action === 'deleted') {
                deletedElements.push(data.id);
              } else {
                console.error('Error: Undefined action for received object' +
                  '(' + data.collection + ', ' + data.id + ')');
              }
            }
          });
          // add (=inject) all given objects into local DS store
          if (changedElements.length > 0) {
            //DS.inject(collectionString, changedElements);
            _.forEach(changedElements, element => {
                element.collection = collectionString;
                dispatch({type: 'CHANGED_ELEMENT', element});
              }
            );
          }
          // delete (=eject) all given objects from local DS store
          // (note: js-data does not provide 'bulk eject' as for DS.inject)
          _.forEach(deletedElements, function(id) {
            //DS.eject(collectionString, id);
          });
        });
      }
    };
  }

}


class App extends Component {
  componentDidMount() {
      const autoupdate = new Autoupdate()
      autoupdate.newConnect(this.props.dispatch);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {this.props.motions.map( motion =>
          <p key={motion.id}>{motion.identifier}</p>
        )}
      </div>
    );
  }
}


const mapStateToProps = state => {

  //state.push({collection: 'motions/motion', id: 42, data: 'ddd'});
  //state.push({collection: 'motions/motion', id: 43, data: 'dddxcvxcv'});
console.log(_.filter(state, {collection: 'motions/motion'}));
  return {
    motions: _.filter(state, {collection: 'motions/motion'}),
  };
};


export default connect(mapStateToProps)(App);
