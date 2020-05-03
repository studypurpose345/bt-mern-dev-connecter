import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { deleteEducation } from '../../actions/profile';

const Education = ({ education }) => {
  const dispatch = useDispatch();
  const educations = education.map((edu) => (
    <tr key={edu._id}>
      <td>{edu.school}</td>
      <td className='hide-sm'>{edu.degree}</td>
      <td>
        {edu.from.substr(0, 10).split('-').join('/')} -{' '}
        {!edu.to ? ' Now' : edu.to.substr(0, 10).split('-').join('/')}
      </td>
      <td>
        <button
          className='btn btn-danger'
          onClick={() => dispatch(deleteEducation(edu._id))}
        >
          Delete
        </button>
      </td>
    </tr>
  ));

  return (
    <Fragment>
      <h2 className='my-2'>Education Credentials</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>School</th>
            <th className='hide-sm'>Degree</th>
            <th className='hide-sm'>Years</th>
            <th />
          </tr>
        </thead>
        <tbody>{educations}</tbody>
      </table>
    </Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired,
};

export default Education;
