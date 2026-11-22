const mongoose = require('mongoose');
const Post = require('../models/post');
const Problem = require('../models/problem');
const User = require('../models/user');

const POPULATE = [
  { path: 'userId', select: 'firstName' },
  { path: 'comments.userId', select: 'firstName' },
];

const shapeComment = (c) => ({
  _id: c._id,
  text: c.text,
  createdAt: c.createdAt,
  author: { _id: c.userId?._id, firstName: c.userId?.firstName },
});

const shapePost = (post, userId) => ({
  _id: post._id,
  content: post.content,
  problemId: post.problemId || null,
  author: { _id: post.userId?._id, firstName: post.userId?.firstName },
  likeCount: post.likes.length,
  likedByMe: post.likes.some((id) => id.equals(userId)),
  comments: post.comments.map(shapeComment),
  createdAt: post.createdAt,
});

const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong. Try again.' });
};

// GET /feed?page=1
const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: 'userId', select: 'firstName', model: User });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /feed  { content, problemId? }
const createPost = async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    const { problemId } = req.body;

    if (!content) return res.status(400).json({ error: 'Write something first' });
    if (content.length > 500) {
      return res.status(400).json({ error: 'Posts can be up to 500 characters' });
    }
    if (problemId) {
      if (!mongoose.isValidObjectId(problemId)) {
        return res.status(400).json({ error: 'Invalid problem' });
      }
      if (!(await Problem.exists({ _id: problemId }))) {
        return res.status(404).json({ error: 'Problem not found' });
      }
    }

    const post = await Post.create({
      userId: req.result._id,
      content,
      problemId: problemId || undefined,
    });
    await post.populate(POPULATE);

    res.status(201).json({ post: shapePost(post, req.result._id) });
  } catch (err) {
    serverError(res, err);
  }
};

// POST /feed/:id/like  (toggles)
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid post' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.result._id;
    const liked = post.likes.some((u) => u.equals(userId));

    if (liked) post.likes.pull(userId);
    else post.likes.push(userId);
    await post.save();

    res.status(200).json({ likeCount: post.likes.length, likedByMe: !liked });
  } catch (err) {
    serverError(res, err);
  }
};

// POST /feed/:id/comment  { text }
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid post' });

    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Write a comment first' });
    if (text.length > 300) {
      return res.status(400).json({ error: 'Comments can be up to 300 characters' });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId: req.result._id, text });
    await post.save();
    await post.populate('comments.userId', 'firstName');

    res.status(201).json({ comment: shapeComment(post.comments[post.comments.length - 1]) });
  } catch (err) {
    serverError(res, err);
  }
};

// DELETE /feed/:id  (author or admin)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid post' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAuthor = post.userId.equals(req.result._id);
    const isAdmin = req.result.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { getFeed, createPost, toggleLike, addComment, deletePost  };