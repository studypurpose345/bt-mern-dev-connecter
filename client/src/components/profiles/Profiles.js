import React, { useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../layout/Spinner';
import ProfileItem from './ProfileItem';
import { getProfiles } from '../../actions/profile';

const Profiles = () => {
  const profileState = useSelector((state) => state.profile);
  const { profiles, loading } = profileState;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProfiles());
  }, [dispatch]);

  return (
    <Fragment>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <h1 className='large text-primary'>Developers</h1>
          <p className='lead'>
            <i className='fab fa-connectdevelop'></i> Browse and connect with
            developers
          </p>
          <div className='profiles'>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <ProfileItem key={profile._id} profile={profile} />
              ))
            ) : (
              <h4>No Profiles Found...</h4>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Profiles;
