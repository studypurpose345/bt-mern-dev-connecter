import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { deleteExperience } from '../../actions/profile';

const Experience = ({ experience }) => {
  const dispatch = useDispatch();
  const experiences = experience.map((exp) => (
    <tr key={exp._id}>
      <td>{exp.company}</td>
      <td className='hide-sm'>{exp.title}</td>
      <td>
        {exp.from.substr(0, 10).split('-').join('/')} -{' '}
        {!exp.to ? ' Now' : exp.to.substr(0, 10).split('-').join('/')}
      </td>
      <td>
        <button
          className='btn btn-danger'
          onClick={() => dispatch(deleteExperience(exp._id))}
        >
          Delete
        </button>
      </td>
    </tr>
  ));

  return (
    <Fragment>
      <h2 className='my-2'>Experience Credentials</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>Company</th>
            <th className='hide-sm'>Title</th>
            <th className='hide-sm'>Years</th>
            <th />
          </tr>
        </thead>
        <tbody>{experiences}</tbody>
      </table>
    </Fragment>
  );
};

Experience.propTypes = {
  experience: PropTypes.array.isRequired,
};

export default Experience;
