const Post = require('../models/post');

const createPost = async (req, res) => {
  try {
    const { content, problemId } = req.body;
    const post = await Post.create({ userId: req.result._id, content, problemId });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.result._id.toString())
      return res.status(403).json({ message: 'Not allowed' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const uid = req.result._id.toString();
    const liked = post.likes.some(id => id.toString() === uid);
    if (liked) post.likes.pull(req.result._id);
    else post.likes.push(req.result._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ userId: req.result._id, text: req.body.text });
    await post.save();
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createPost, deletePost, likePost, commentPost };