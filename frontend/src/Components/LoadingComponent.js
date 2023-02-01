import Spinner from 'react-bootstrap/Spinner';

export default function LoadingComponent() {
  return (
    <Spinner animating="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
