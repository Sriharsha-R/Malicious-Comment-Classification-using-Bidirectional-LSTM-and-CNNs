const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const checkPost = require('../../utils/checkPost');

// @route   POST api/v1/posts
// @desc    Create a post
// @access  Restricted(Login Required)
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const resultArr = await checkPost(req.body.text);
      const labelsArr = [];
      for (let i = 0; i < 6; i++) {
        if (resultArr[i] >= 0.7) {
          switch (i) {
            case 0:
              labelsArr.push('Toxic');
              break;
            case 1:
              labelsArr.push('Severe Toxic');
              break;
            case 2:
              labelsArr.push('Obscene');
              break;
            case 3:
              labelsArr.push('Threat');
              break;
            case 4:
              labelsArr.push('Insult');
              break;
            case 5:
              labelsArr.push('Identity Hate');
              break;
            default:
              _;
          }
        }
      }

      const newPost = new Post({
        text: req.body.text,
        name: user.fname + ' ' + user.lname,
        avatar: user.avatar,
        user: req.user.id,
        labels: labelsArr,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/v1/posts
// @desc    Get all posts
// @access  Restricted(Login Required)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/v1/posts/:pid
// @desc    Get a single post by ID
// @access  Restricted(Login Required)
router.get('/:pid', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pid);
    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/v1/posts/like/:pid
// @desc    Like a post
// @access  Restricted(Login Required)
router.put('/like/:pid', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pid);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/v1/posts/unlike/:pid
// @desc    Unlike a post
// @access  Restricted(Login Required)
router.put('/unlike/:pid', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pid);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/v1/posts/:pid
// @desc    Delete a post
// @access  Restricted(Login Required)
router.delete('/:pid', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pid);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

module.exports = router;
