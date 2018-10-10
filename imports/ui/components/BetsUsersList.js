import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { Table } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Bert } from 'meteor/themeteorchef:bert';
import Bets from '../../api/bets/bets';
import { removeBet } from '../../api/bets/methods';
import container from '../../modules/container';
import moment from 'moment';

const BetsUsersList = ({ users }) => (
  users.length > 0 ? <Table className="BetsList" 
    striped bordered condensed hover>
    <thead>
      <tr>
        <th className="col-xs-1 col-sm-1 text-center"></th>
        <th className="col-xs-4 col-sm-4 text-center">ID</th>
        <th className="col-xs-4 col-sm-4 text-center">Email</th>
        <th className="col-xs-3 col-sm-3 text-center">Record(s)</th>
      </tr>
    </thead>
    <tbody>
      { users.map(({ _id, emails, record }, index) => 
        { 
          return ( <tr key={ _id }>
            <td className="col-xs-1 col-sm-1 text-center">{ (index + 1) }</td>
            <td className="col-xs-4 col-sm-4 text-center">{ _id }</td>
            <td className="col-xs-4 col-sm-4 text-center">{ emails[0].address.replace(/.{1,4}(?=\@.*?)/, '****') }</td>
            <td className="col-xs-3 col-sm-3 text-center">{ record }</td>
          </tr> )
        }
      )}
    </tbody>
  </Table> : <div />
  // <Alert bsStyle="warning">No bets yet.</Alert>
);

BetsUsersList.propTypes = {
  users: PropTypes.array,
};

export default container((props, onData) => { 
  const createdDate = Session.get('createdDate') ? Session.get('createdDate').substring(0, 10) : '';
  const insertedId = Session.get('insertedId') ? Session.get('insertedId') : '';
    
  const subscription = Meteor.subscribe('bets.list', createdDate);
  const usersSubscription = Meteor.subscribe('users.list');
  
  if (subscription.ready() && usersSubscription.ready() ) {
    const bets = Bets.find({}, {sort: {createdAt: 1}}).fetch();
    const users = Meteor.users.find({}, {fields: {emails: 1, profile: 1}}).fetch();

    users.forEach( obj => {
      obj.record = bets.length ? bets.filter(bet => bet.userId == obj._id).length : 0;
    });

    console.log(users);
    
    if ( bets.length > 0 && insertedId !== '' ) {
      const bet = bets.find( obj => obj._id === insertedId );
      console.log(bet);
      Session.set('latestSessionBet', bet);
    }

    onData(null, { users });
  }
}, BetsUsersList);
