/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Session } from 'meteor/session';
import { Bert } from 'meteor/themeteorchef:bert';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, Grid, Row, Col, Table } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import DatePicker from 'react-bootstrap-date-picker';
import container from '../../modules/container';

import { upsertBet, removeBet } from '../../api/bets/methods.js';

class BetEditorFast extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      createdDate: moment().toISOString(true).substring(0, 10),
      broker: 'หมายเลขบิล',
      betMessage: '',
    };

    this.props.Session.set('createdDate', moment().toISOString(true).substring(0, 10));

    this.handleCreatedDateChange = this.handleCreatedDateChange.bind(this);
    this.handleBrokerChange = this.handleBrokerChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleCreatedDateChange(value) {
    const createdDate = value;
    this.setState({ 
      ...this.state,
      createdDate,
    });

    this.props.Session.set('createdDate', createdDate.substring(0, 10));
  }

  handleBrokerChange(e) {
    const broker = e.target.value;
    this.setState({
      ...this.state,
      broker,
    });
  }

  handleChange(e) {
    const betMessage = e.target.value;
    this.setState({
      ...this.state,
      betMessage,
    });

    const arr = betMessage.split(/\r?\n/);
    console.log(arr);
    
    var upsert = {};

    var no = '', 
      up2 = 0, 
      down2 = 0, 
      up3 = 0, 
      down3 = 0, 
      permute = 0;

    const createdAt = moment().valueOf(), 
      broker = this.state.broker, 
      createdDate = this.state.createdDate.substr(0, 10);

    // up2+down2
    if ( arr.length > 2 &&
      !isNaN( parseInt(arr[arr.length - 3]) ) && arr[arr.length - 3].length === 2 &&
      !isNaN( parseInt(arr[arr.length - 2]) ) &&
      arr[arr.length - 1] === ''
    ) {
      console.log('up2+down2');
      no = arr[arr.length - 3];
      up2 = down2 = parseInt(arr[arr.length - 2]);
    }

    // up2
    if ( arr.length > 1 &&
      _.includes( arr[arr.length - 2], '+' ) &&
      arr[arr.length - 2].split('+')[0].length === 2 &&
      !isNaN( parseInt( arr[arr.length - 2].split('+')[0] ) ) &&
      !isNaN( parseInt( arr[arr.length - 2].split('+')[1] ) )
    ) {
      console.log('up2');
      no = arr[arr.length - 2].split('+')[0];
      up2 = parseInt( arr[arr.length - 2].split('+')[1] );
    }

    // down2
    if ( arr.length > 1 &&
      _.includes( arr[arr.length - 2], '-' ) &&
      arr[arr.length - 2].split('-')[0].length === 2 &&
      !isNaN( parseInt( arr[arr.length - 2].split('-')[0] ) ) &&
      !isNaN( parseInt( arr[arr.length - 2].split('-')[1] ) )
    ) {
      console.log('down2');
      no = arr[arr.length - 2].split('-')[0];
      down2 = parseInt( arr[arr.length - 2].split('-')[1] );
    }

    // up3+permute
    if ( arr.length > 2 &&
      !isNaN( parseInt(arr[arr.length - 3]) ) && arr[arr.length - 3].length === 3 &&
      !isNaN( parseInt(arr[arr.length - 2]) ) &&
      arr[arr.length - 1] === ''
    ) {
      console.log('up3+down3');
      no = arr[arr.length - 3];
      up3 = permute = parseInt(arr[arr.length - 2]);
    }

    // up3
    if ( arr.length > 1 &&
      _.includes( arr[arr.length - 2], '+' ) &&
      arr[arr.length - 2].split('+')[0].length === 3 &&
      !isNaN( parseInt( arr[arr.length - 2].split('+')[0] ) ) &&
      !isNaN( parseInt( arr[arr.length - 2].split('+')[1] ) )
    ) {
      console.log('up3');
      no = arr[arr.length - 2].split('+')[0];
      up3 = parseInt( arr[arr.length - 2].split('+')[1] );
    }

    // permute
    if ( arr.length > 1 &&
      _.includes( arr[arr.length - 2], '*' ) &&
      arr[arr.length - 2].split('*')[0].length === 3&&
      !isNaN( parseInt( arr[arr.length - 2].split('*')[0] ) ) &&
      !isNaN( parseInt( arr[arr.length - 2].split('*')[1] ) )
    ) {
      console.log('permute');
      no = arr[arr.length - 2].split('*')[0];
      permute = parseInt( arr[arr.length - 2].split('*')[1] );
    }

    // down3
    if ( arr.length > 1 &&
      _.includes( arr[arr.length - 2], '-' ) &&
      arr[arr.length - 2].split('-')[0].length === 3&&
      !isNaN( parseInt( arr[arr.length - 2].split('-')[0] ) ) &&
      !isNaN( parseInt( arr[arr.length - 2].split('-')[1] ) )
    ) {
      console.log('down3');
      no = arr[arr.length - 2].split('-')[0];
      down3 = parseInt( arr[arr.length - 2].split('-')[1] );
    }

    // clear screen
    if ( arr.length > 1 &&
      arr[arr.length - 2] === "-" &&
      arr[arr.length - 1] === ""
    ) {
      this.setState({
        ...this.state,
        betMessage: ''
      });
    }

    // remove latest bet
    if ( arr.length > 1 &&
      arr[arr.length - 2] === "--" &&
      arr[arr.length - 1] === ""
    ) {
      
      const _id = this.insertedId;

      console.log(_id);

      if ( _id ) {
        removeBet.call({ _id }, (error, response) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert('Latest bet removed', 'success');
  
            this.setState({
              ...this.state,
              betMessage: '',
            });

            this.insertedId = undefined;
            this.props.Session.set('insertedId', undefined);
          }
        });
      }
    }

    // no2+latestSpend
    if ( arr.length > 2 &&
      arr[arr.length - 3].length === 2 &&
      !isNaN( parseInt( arr[arr.length - 3] ) ) &&
      arr[arr.length - 2] === "" &&
      arr[arr.length - 1] === ""
    ) {
      console.log('no2+latestSpend');

      if ( this.props.Session.get('latestSessionBet').up3 > 0 || 
        this.props.Session.get('latestSessionBet').down3 > 0 ||
        this.props.Session.get('latestSessionBet').permute > 0
      ) {
        return;
      } else {
        no = arr[arr.length - 3];
        up2 = this.props.Session.get('latestSessionBet').up2;
        down2 = this.props.Session.get('latestSessionBet').down2;
      }
    }

    // no3+latestSpend
    if ( arr.length > 2 &&
      arr[arr.length - 3].length === 3 &&
      !isNaN( parseInt( arr[arr.length - 3] ) ) &&
      arr[arr.length - 2] === "" &&
      arr[arr.length - 1] === ""
    ) {
      console.log('no3+latestSpend');

      if ( this.props.Session.get('latestSessionBet').up2 > 0 ||
        this.props.Session.get('latestSessionBet').down2 > 0 
      ) {
        return;
      } else {
        no = arr[arr.length - 3];
        up3 = this.props.Session.get('latestSessionBet').up3;
        down3 = this.props.Session.get('latestSessionBet').down3;
        permute = this.props.Session.get('latestSessionBet').permute;
      }
    }

    if ( no !== '' ){
      upsert = { no, 
        up2, 
        down2, 
        up3, 
        down3, 
        permute, 
        createdAt, 
        broker, 
        createdDate,
      };
      console.log(upsert);

      upsertBet.call(upsert, (error, response) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Bet added', 'success');

          

          this.insertedId = response.insertedId;
          this.props.Session.set('insertedId', response.insertedId);
        }
      });

      this.setState({
        ...this.state,
        betMessage: '',
      });
    }
  }

  render() {

    const yellowStyle = { height: 225, minHeight: 150, fontSize: 48, borderColor: 'yellow', borderWidth: 2 };
    const redStyle = { height: 225, minHeight: 150, fontSize: 48, borderColor: 'red', borderWidth: 2 };

    return (<form>      
      <FormGroup>
        <ControlLabel>ตัวอย่างการบันทึก</ControlLabel>

        <Grid>
          <Row>
            <Col xs={6} sm={6} md={6}>
              <Table bordered condensed hover>
                <thead>
                  <tr>
                    <th>เบอร์</th>
                    <th>ซื้อ</th>
                    <th>พิมพ์</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>45บน</td>
                    <td>= 10</td>
                    <td>45+10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>45ล่าง</td>
                    <td>= 10</td>
                    <td>45-10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>45</td>
                    <td>= 10x10</td>
                    <td>45<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong>10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>78</td>
                    <td>ซ้ำ</td>
                    <td>78<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong><strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>-</td>
                    <td colSpan={2}>ลบข้อความ</td>
                  </tr>
                  <tr>
                    <td>--</td>
                    <td colSpan={2}>ลบเบอร์ล่าสุด</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            
            <Col xs={6} sm={6} md={6}>
              <Table bordered condensed hover>
                <thead>
                  <tr>
                    <th>เบอร์</th>
                    <th>ซื้อ</th>
                    <th>พิมพ์</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>456เต็ง</td>
                    <td>= 10</td>
                    <td>456+10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>456ล่าง</td>
                    <td>= 10</td>
                    <td>456-10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>456โต๊ด</td>
                    <td>= 10</td>
                    <td>456*10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>456</td>
                    <td>= 10x10</td>
                    <td>456<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong>10<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                  <tr>
                    <td>789</td>
                    <td>ซ้ำ</td>
                    <td>789<strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong><strong style={{ color: 'red', fontSize: 12 }}>[Enter]</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Grid>
      </FormGroup>

      <FormGroup>
      <ControlLabel>ป-ด-ว</ControlLabel>
        <DatePicker dateFormat="YYYY-MM-DD" 
          name="createdDate" ref="createdDate"
          value={this.state.createdDate}
          onChange={this.handleCreatedDateChange}/>
      </FormGroup>
      <FormGroup>
        <ControlLabel>หมายเลขบิล</ControlLabel>
        <FormControl type="text" name="broker" 
          ref="broker"
          value={this.state.broker}
          onChange={this.handleBrokerChange}/>
      </FormGroup>

      <FormGroup>
        <ControlLabel>บันทึก</ControlLabel>
        <FormControl
          componentClass="textarea"
          type="number"
          name="bet"
          style={this.state.betMessage.length > 0 ? yellowStyle : redStyle}
          bsSize="large"
          value={this.state.betMessage}
          onChange={this.handleChange}
        />
      </FormGroup>
    </form>);
  }
}

BetEditorFast.propTypes = {
  Session: PropTypes.object,
};

export default container((props, onData) => {
  onData(null, { Session });
}, BetEditorFast);