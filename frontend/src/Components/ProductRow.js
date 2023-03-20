import React from 'react';
import { Button } from 'react-bootstrap';

function ProductRow({ products, onEdit, onDelete }) {
  return (
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
        {products.map((product) => (
          <tr key={product._id}>
            <td className="btn-text">{product._id}</td>
            <td className="btn-text">{product.name}</td>
            <td className="btn-text">{product.price.toFixed(2)}</td>
            <td className="btn-text">{product.department}</td>
            <td className="btn-text">{product.brand}</td>
            <td>
              <Button
                className="btn-text mb-1"
                type="button"
                variant="secondary"
                onClick={() => onEdit(product._id)}
              >
                Edit
              </Button>
              <span style={{ margin: '5px' }}> </span>
              <Button
                className="btn-text mb-1"
                type="button"
                variant="primary"
                onClick={() => onDelete(product)}
                style={{ padding: '7px 19px' }}
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
