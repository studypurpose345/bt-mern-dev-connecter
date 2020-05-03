const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const router = express.Router();

// @route   POST api/posts
// @desc    Create a Post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      const post = new Post(newPost);
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      console.error(err.messasge);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    Get all Post
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.messasge);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:postId
// @desc    Get Post By ID
// @access  Private
router.get('/:postId', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(err.messasge);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:postId
// @desc    Delete a Post
// @access  Private
router.delete('/:postId', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    // Check for post belongs to user ot not
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User Not Authorised' });
    }
    await post.remove();
    res.status(200).json({ msg: 'Post Removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:postId
// @desc    Like a Post
// @access  Private
router.put('/like/:postId', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    // Check for post belongs to user ot not
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(403).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/unlike/:postId
// @desc    Unlike a Post
// @access  Private
router.put('/unlike/:postId', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    // Check for post belongs to user ot not
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(404).json({ msg: 'Post not yet liked' });
    }
    // Get Removed Index
    const removedIndex = post.likes.map((like) =>
      like.user.toString().indexOf(req.user.id)
    );
    post.likes.splice(removedIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:postId
// @desc    Create a Comment on a Post
// @access  Private
router.post(
  '/comment/:postId',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ msg: 'Post Not Found' });
      }
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.status(201).json(post.comments);
    } catch (err) {
      console.error(err.messasge);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/comment/:postId/:commentId
// @desc    Delete a Comment
// @access  Private
router.delete('/comment/:postId/:commentId', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ msg: 'Comment Not Found' });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User Not Authorised' });
    }
    // Get Removed Index
    const removedIndex = post.comments.map((comment) =>
      comment.user.toString().indexOf(req.user.id)
    );
    post.comments.splice(removedIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post Not Found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
