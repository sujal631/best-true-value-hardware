import React from 'react';
import { Table } from 'react-bootstrap';

const HoursOfOperation = () => (
  <Table striped bordered hover>
    <thead>
      <tr className="center">
        <th>Day</th>
        <th>Hours</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Monday</td>
        <td>9 AM to 9 PM</td>
      </tr>
      <tr>
        <td>Tuesday</td>
        <td>9 AM to 9 PM</td>
      </tr>
      <tr>
        <td>Wednesday</td>
        <td>9 AM to 9 PM</td>
      </tr>
      <tr>
        <td>Thursday</td>
        <td>9 AM to 9 PM</td>
      </tr>
      <tr>
        <td>Friday</td>
        <td>9 AM to 9 PM</td>
      </tr>
      <tr>
        <td>Saturday</td>
        <td>10 AM to 7 PM</td>
      </tr>
      <tr>
        <td>Sunday</td>
        <td>12 PM to 5 PM</td>
      </tr>
    </tbody>
  </Table>
);

export default HoursOfOperation;
