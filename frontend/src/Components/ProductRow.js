// Import required dependencies
import React from 'react';
import { Button } from 'react-bootstrap';

// Define ProductRow functional component
function ProductRow({ products, onEdit, onDelete }) {
  return (
    // Create a table to display product information
    <table className="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th className="btn-text">PRODUCT ID</th>
          <th className="btn-text">PRODUCT NAME</th>
          <th className="btn-text">AMOUNT</th>
          <th className="btn-text">DEPARTMENT</th>
          <th className="btn-text">BRAND</th>
          <th className="btn-text">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {/* Map through products to create table rows */}
        {products.map((product) => {
          // Destructure product properties
          const { _id, name, price, department, brand } = product;

          // Return a table row for each product
          return (
            <tr key={_id}>
              <td className="btn-text">{_id}</td>
              <td className="btn-text">{name}</td>
              <td className="btn-text">{price.toFixed(2)}</td>
              <td className="btn-text">{department}</td>
              <td className="btn-text">{brand}</td>
              <td>
                {/* Add Edit button for each product */}
                <Button
                  variant="light"
                  className="btn btn-outline-success btn-text mb-1"
                  style={{ padding: '2px 5px' }}
                  type="button"
                  onClick={() => onEdit(_id)}
                >
                  Edit
                </Button>
                <span style={{ margin: '5px' }}> </span>
                {/* Add Delete button for each product */}
                <Button
                  className="btn btn-outline-danger btn-text mb-1"
                  style={{ padding: '2px 12px' }}
                  type="button"
                  variant="light"
                  onClick={() => onDelete(product)}
                >
                  <i className="fa fa-trash "></i>
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Export ProductRow component
export default ProductRow;
