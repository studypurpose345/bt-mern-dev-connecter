import React from 'react';
import PropTypes from 'prop-types';

const ProfileExperience = ({
  experience: { company, title, location, current, to, from, description },
}) => (
  <div>
    <h3 className='text-dark'>{company}</h3>
    <p>
      {from.substr(0, 10)} - {!to ? 'Now' : to.substr(0, 10)}
    </p>
    <p>
      <strong>Position: </strong> {title}
    </p>
    <p>
      <strong>Description: </strong> {description}
    </p>
  </div>
);

ProfileExperience.propTypes = {
  experience: PropTypes.object.isRequired,
};

export default ProfileExperience;
