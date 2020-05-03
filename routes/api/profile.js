const express = require('express');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const auth = require('../../middleware/auth');

const router = express.Router();

// @route   GET api/profile/me
// @desc    Get Current User Profile
// @access  Private
router.get('/me', auth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(404).json({ msg: 'No Profile Found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile/me
// @desc    Create/Update User Profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build Social Object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // Update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      return res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/profile
// @desc    Get all Profile
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:userId
// @desc    Get Profile By User ID
// @access  Public
router.get('/user/:userId', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(404).json({ msg: 'No Profile Found For User' });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile/
// @desc    Delete Profile, User and Posts
// @access  Private
router.delete('/', auth, async (req, res, next) => {
  try {
    // Remove Users Posts
    await Post.deleteMany({ user: req.user.id });

    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).json({ msg: 'User Removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add Profile Experience
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is requried').not().isEmpty(),
      check('company', 'Company is requried').not().isEmpty(),
      check('from', 'From Date is requried').not().isEmpty(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(201).json(profile);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/experience/:expId
// @desc    Delete Profile Experience
// @access  Private
router.delete('/experience/:expId', auth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // et Removed Index
    const removedIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.expId);

    profile.experience.splice(removedIndex, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/education
// @desc    Add Profile Education
// @access  Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'SChool is requried').not().isEmpty(),
      check('degree', 'Degree is requried').not().isEmpty(),
      check('fieldofstudy', 'Field Of Study is requried').not().isEmpty(),
      check('from', 'From Date is requried').not().isEmpty(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(201).json(profile);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/education/:expId
// @desc    Delete Profile Education
// @access  Private
router.delete('/education/:eduId', auth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // et Removed Index
    const removedIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.eduId);

    profile.education.splice(removedIndex, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/github/:username
// @desc    Get Users Repos From Github
// @access  Public
router.get('/github/:username', (req, res, next) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        res.status(400).json({ msg: 'No Github Profile Found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
