//Import necessary modules and components
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import axios from 'axios';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import ReactModal from 'react-modal';
import { Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import AdminPagination from '../Components/AdminPagination';
import { BiSearch } from 'react-icons/bi';

// Define the default state of the reducer
const initialState = {
  loading: true,
  error: '',
  users: null,
};

// Map the action types to specific functions to update the state
const actionsMap = {
  // Update the loading state to true
  REQUEST: (state) => ({ ...state, loading: true }),
  // Update the users state and set the loading state to false
  SUCCESS: (state, action) => ({
    ...state,
    users: action.payload,
    loading: false,
  }),
  // Update the error state and set the loading state to false
  FAILURE: (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }),
};

// Reducer function for handling state updates based on dispatched actions
const reducer = (state = initialState, action) => {
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

export default function ListUsersPage() {
  // Initialize state, dispatch and apply the reducer to manage the component state
  const [{ loading, error, users }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // Get the global state from the Store context
  const { state } = useContext(Store);
  const { userInfo } = state;
  // Set pagination variables
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  // State variables for handling modal dialogs
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  // State variables for handling search and filtering
  const [search, setSearch] = useState('');
  const [isAdminFilter, setIsAdminFilter] = useState('');

  // Function to update a user's role (admin or non-admin) in the backend
  const updateUserRole = async (userId, makeAdmin) => {
    try {
      await axios.put(
        `/api/users/${userId}`,
        { isAdmin: makeAdmin },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, isAdmin: makeAdmin } : user
      );
      dispatch({ type: 'SUCCESS', payload: updatedUsers });
    } catch (error) {
      dispatch({
        type: 'FAILURE',
        payload: getErrorMessage(error),
      });
    }
  };

  // Function to open the modal dialog for changing a user's role
  const openModal = (action, user) => {
    if (userInfo.email !== 'btvh@owner.com') {
      setShowAccessDeniedModal(true);
      return;
    }

    setSelectedUser(user);
    setModalAction(action);
    setShowConfirmModal(true);
  };

  // Function to close the access denied modal dialog
  const closeAccessDeniedModal = () => {
    setShowAccessDeniedModal(false);
  };

  // Function to close the confirm change role modal dialog
  const closeModal = () => {
    setShowConfirmModal(false);
  };

  // Function to handle changing a user's role after confirming in the modal dialog
  const handleConfirmChangeRole = async () => {
    await updateUserRole(selectedUser._id, modalAction === 'makeAdmin');
    closeModal();
  };

  // Function to handle changes in the search input field
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Function to handle changes in the admin filter dropdown
  const handleFilterChange = (event) => {
    setIsAdminFilter(event.target.value);
  };

  // useEffect hook to fetch user data when component mounts or relevant state variables change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          params: {
            page: currentPage,
            limit: usersPerPage,
            search,
            filter: isAdminFilter,
          },
        });
        setTotalUsers(data.totalUsers);

        // Sort users according to the specified conditions
        const sortedUsers = data.users.sort((a, b) => {
          if (a.isAdmin !== b.isAdmin) {
            return b.isAdmin - a.isAdmin;
          }
          if (a.email === 'btvh@owner.com') return -1;
          if (b.email === 'btvh@owner.com') return 1;
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        });

        dispatch({ type: 'SUCCESS', payload: sortedUsers });
      } catch (error) {
        dispatch({
          type: 'FAILURE',
          payload: getErrorMessage(error),
        });
      }
    };
    fetchData();
  }, [currentPage, userInfo, search, isAdminFilter]);

  // Custom styles for the modal dialogs
  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '400px',
      height: '200px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
  };
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Users</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Users</h1>

      <Row>
        <Col md={4} className="my-3">
          {/* Search input for filtering users by name */}
          <InputGroup>
            <InputGroup.Text>
              <BiSearch />
            </InputGroup.Text>
            <Form.Control
              id="search"
              type="text"
              className="form-control"
              placeholder="Search by User's name ..."
              value={search}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Col>
        {/* Dropdown for filtering users by admin status */}
        <Col md={3} className="my-3">
          <div>
            <select
              className="form-control custom-select"
              value={isAdminFilter}
              onChange={handleFilterChange}
            >
              <option value="">Filter by ADMIN status</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </Col>
      </Row>

      <>
        {/* Modal for confirming a change in user role */}
        <ReactModal
          isOpen={showConfirmModal}
          onRequestClose={closeModal}
          style={customStyles}
        >
          <strong>
            <p>
              Confirm{' '}
              {modalAction === 'makeAdmin' ? 'Make Admin' : 'Change to User'}
            </p>
          </strong>
          <p>
            Are you sure you would like to{' '}
            {modalAction === 'makeAdmin' ? 'make' : 'change'}{' '}
            {selectedUser && selectedUser.firstName}{' '}
            {selectedUser && selectedUser.lastName}{' '}
            {modalAction === 'makeAdmin' ? 'an Admin' : 'to a regular user'}?
          </p>
          <div className="d-flex justify-content-around mt-3">
            <button
              className="btn btn-warning"
              onClick={handleConfirmChangeRole}
            >
              CONFIRM
            </button>
            <button className="btn btn-primary" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </ReactModal>

        {/* Modal for displaying access denied message */}
        <ReactModal
          isOpen={showAccessDeniedModal}
          onRequestClose={closeAccessDeniedModal}
          style={customStyles}
        >
          <strong>
            <p>Access Denied</p>
          </strong>
          <p>
            You don't have access to change the status of this user. Only
            "btvh@owner.com" has access.
          </p>
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-primary"
              onClick={closeAccessDeniedModal}
            >
              Close
            </button>
          </div>
        </ReactModal>
      </>

      {/* Display a loading spinner if loading, an error message if there's an error, or the user table */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th className="btn-text">USER ID</th>
              <th className="btn-text">NAME</th>
              <th className="btn-text">EMAIL</th>
              <th className="btn-text">ADMIN</th>
              <th className="btn-text">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* Map through users to create table rows */}
            {users.map((user) => {
              const { _id, firstName, lastName, email, isAdmin } = user;
              const adminStatusColor = isAdmin ? 'green' : 'red';

              return (
                <tr key={_id}>
                  <td className="btn-text">{_id}</td>
                  <td className="btn-text">
                    {firstName} {lastName}
                  </td>
                  <td className="btn-text">{email}</td>
                  <td className="btn-text">
                    <span
                      style={{ color: adminStatusColor, fontWeight: '600' }}
                    >
                      {isAdmin ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td>
                    {email !== 'btvh@owner.com' &&
                      (!isAdmin ? (
                        <Button
                          className="btn-text mb-1"
                          variant="secondary"
                          onClick={() => openModal('makeAdmin', user)}
                          style={{ padding: '7px 19px', textTransform: 'none' }}
                          disabled={userInfo.email !== 'btvh@owner.com'}
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button
                          className="btn-text mb-1"
                          variant="primary"
                          onClick={() => openModal('changeToUser', user)}
                          style={{ padding: '7px 7px', textTransform: 'none' }}
                          disabled={userInfo.email !== 'btvh@owner.com'}
                        >
                          Change to User
                        </Button>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div>
        {/* Display pagination component */}
        <AdminPagination
          totalPages={Math.ceil(totalUsers / usersPerPage)}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
