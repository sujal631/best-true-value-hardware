import React from 'react';
import { Button } from 'react-bootstrap';

function ProductRow({ products, onEdit, onDelete }) {
  return (
    <table className="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th>PRODUCT ID</th>
          <th>PRODUCT NAME</th>
          <th>AMOUNT</th>
          <th>DEPARTMENT</th>
          <th>BRAND</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product._id}>
            <td>{product._id}</td>
            <td>{product.name}</td>
            <td>{product.price.toFixed(2)}</td>
            <td>{product.department}</td>
            <td>{product.brand}</td>
            <td>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onEdit(product._id)}
              >
                Edit
              </Button>
              &emsp;
              <Button
                type="button"
                variant="primary"
                onClick={() => onDelete(product)}
              >
                <i className="fa fa-trash "></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProductRow;
