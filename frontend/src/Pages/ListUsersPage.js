import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import axios from 'axios';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import ReactModal from 'react-modal';
import { Button } from 'react-bootstrap';
import AdminPagination from '../Components/AdminPagination';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function ListUsersPage() {
  const [{ loading, error, users }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

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

  const openModal = (action, user) => {
    if (userInfo.email !== 'btvh@owner.com') {
      setShowAccessDeniedModal(true);
      return;
    }

    setSelectedUser(user);
    setModalAction(action);
    setShowConfirmModal(true);
  };

  const closeAccessDeniedModal = () => {
    setShowAccessDeniedModal(false);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmChangeRole = async () => {
    await updateUserRole(selectedUser._id, modalAction === 'makeAdmin');
    closeModal();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          params: { page: currentPage, limit: usersPerPage },
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
  }, [currentPage, userInfo]);

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
      <>
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
        {/* Access Denied Modal */}
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
            {users.map((user) => (
              <tr key={user._id}>
                <td className="btn-text">{user._id}</td>
                <td className="btn-text">
                  {user.firstName} {user.lastName}
                </td>
                <td className="btn-text">{user.email}</td>
                <td className="btn-text">
                  {user.isAdmin ? (
                    <span style={{ color: 'green', fontWeight: '600' }}>
                      YES
                    </span>
                  ) : (
                    <span style={{ color: 'red', fontWeight: '600' }}>NO</span>
                  )}
                </td>
                <td>
                  {user.email !== 'btvh@owner.com' &&
                    (!user.isAdmin ? (
                      <Button
                        className="btn-text"
                        variant="secondary"
                        onClick={() => openModal('makeAdmin', user)}
                        style={{ padding: '7px 19px', textTransform: 'none' }}
                        disabled={userInfo.email !== 'btvh@owner.com'}
                      >
                        Make Admin
                      </Button>
                    ) : (
                      <Button
                        className="btn-text"
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
            ))}
          </tbody>
        </table>
      )}
      <div>
        <AdminPagination
          totalPages={Math.ceil(totalUsers / usersPerPage)}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
