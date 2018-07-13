import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import Bets from '../../api/bets/bets';
import container from '../../modules/container';
import { Table } from 'react-bootstrap';

const NosList = (props) => (
  <div>
      { props.nos.length > 0 ? <Table className="NosList"
        striped bordered condensed hover>
        <thead>
          <tr>
            <th className="col-xs-2 col-sm-1 text-center" style={{ verticalAlign: 'middle' }}
              rowSpan="3">ป-ด-ว</th>
            <th className="col-xs-1 col-sm-1 text-center" style={{ verticalAlign: 'middle' }}
              rowSpan="3">เลข</th>

            <th className="col-xs-1 col-xs-offset-3 col-sm-1 col-sm-offset-2 text-center" colSpan="5" style={{ color: 'red' }}>
              $ { (props.up2Total + props.down2Total + props.up3Total + props.down3Total + props.permuteTotal).toLocaleString() }
            </th>
          </tr>

          <tr>
            <th className="col-xs-1 col-sm-1 text-center" style={{ color: 'red' }}>$ { props.up2Total.toLocaleString() }</th>
            <th className="col-xs-1 col-sm-1 text-center" style={{ color: 'red' }}>$ { props.down2Total.toLocaleString() }</th>
            <th className="col-xs-1 col-sm-1 text-center" style={{ color: 'red' }}>$ { props.up3Total.toLocaleString() }</th>
            <th className="col-xs-1 col-sm-1 text-center" style={{ color: 'red' }}>$ { props.permuteTotal.toLocaleString() }</th>
            <th className="col-xs-1 col-sm-1 text-center" style={{ color: 'red' }}>$ { props.down3Total.toLocaleString() }</th>
          </tr>

          <tr>
            <th className="col-xs-1 col-xs-offset-3 col-sm-1 col-sm-offset-2 text-center">2ตัวบน</th>
            <th className="col-xs-1 col-sm-1 text-center">2ตัวล่าง</th>
            <th className="col-xs-1 col-sm-1 text-center">3ตัวเต็ง</th>
            <th className="col-xs-1 col-sm-1 text-center">3ตัวโต๊ด</th>
            <th className="col-xs-1 col-sm-1 text-center">3ตัวล่าง</th>
          </tr>

        </thead>
        <tbody>
          { props.nos.map((no, index) => (
            <tr key={index}>
              <td className="col-xs-2 col-sm-1 text-center">{ no.cd }</td>
              <td className="col-xs-1 col-sm-1 text-center"><b>{ no.no }</b></td>

              <td className="col-xs-1 col-sm-1 text-center">{ no.up2 > 0 ? no.up2 : '' }</td>
              <td className="col-xs-1 col-sm-1 text-center">{ no.down2 > 0 ? no.down2 : '' }</td>
              <td className="col-xs-1 col-sm-1 text-center">{ no.up3 > 0 ? no.up3 : '' }</td>
              <td className="col-xs-1 col-sm-1 text-center">{ no.permute > 0 ? no.permute : '' }</td>
              <td className="col-xs-1 col-sm-1 text-center">{ no.down3 > 0 ? no.down3 : '' }</td>
            </tr>
          )) }
        </tbody>
      </Table> : undefined }
  </div>
);

NosList.propTypes = {
  bets: PropTypes.array,
  nos: PropTypes.array,
};

export default container((props, onData) => {
  const createdDate = Session.get('nosCreatedDate') ? 
    Session.get('nosCreatedDate').substring(0, 10) : '';
    
  const subscription = Meteor.subscribe('bets.list', createdDate);
  
  if (subscription.ready()) {
    const bets = Bets.find({}, {sort: {createdAt: -1}}).fetch();
    var nos = [];
    var i = 0, j = 0;
    var up2Total = 0, down2Total = 0, 
      up3Total = 0, down3Total = 0, permuteTotal = 0;
    
    for( i = 0; i < 100; i++ ) {
      let no = String(i);
      let cd = createdDate;
      let up2 = 0, down2 = 0;
      no = no.length < 2 ? '0' + no : no;

      for( j = 0; j < bets.length; j++ ) {
        if ( no === bets[j].no ) {
          up2 += bets[j].up2;
          down2 += bets[j].down2;
        }
      }

      up2Total += up2;
      down2Total += down2;

      nos.push({ cd, no, up2, down2, up3: 0, down3: 0, permute: 0 });
    }

    for( i = 0; i < 1000; i++ ) {
      let no = String(i);
      let cd = createdDate;
      let up3 = 0, down3 = 0, permute = 0;
      no = no.length < 2 ? '00' + no : no;
      no = no.length < 3 ? '0' + no : no;

      for( j = 0; j < bets.length; j++ ) {
        if ( no === bets[j].no ) {
          up3 += bets[j].up3;
          down3 += bets[j].down3;
          permute += bets[j].permute;
        }
      }

      up3Total += up3;
      down3Total += down3;
      permuteTotal += permute;

      nos.push({ cd, no, up2: 0, down2: 0, up3, down3, permute });
    }

    onData(null, { bets, nos, up2Total, down2Total, up3Total, down3Total, permuteTotal });
  }
}, NosList);