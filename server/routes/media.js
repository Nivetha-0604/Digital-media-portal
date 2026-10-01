const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Media = require('../models/Media');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth, optionalAuth, role } = require('../middleware/auth');

const h = fn => (req, res, next) => fn(req, res, next).catch(e => res.status(500).json({ msg: e.message }));
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  }),
  limits: { fileSize: 200 * 1024 * 1024 }
});
const tagList = t => (t || '').split(',').map(x => x.trim()).filter(Boolean);
const canEdit = (user, m) => user.role === 'admin' || String(m.uploader) === user.id;

// ---- lists ----
router.get('/', h(async (req, res) => {
  const { q, category, type, sort } = req.query;
  const filter = { status: 'approved' };
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { tags: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  if (category) filter.category = category;
  if (type) filter.type = type;
  const order = sort === 'popular' ? { views: -1 } : sort === 'liked' ? { likes: -1 } : { createdAt: -1 };
  res.json(await Media.find(filter).sort(order).populate('uploader', 'name'));
}));

router.get('/categories', h(async (req, res) => res.json(await Media.distinct('category', { status: 'approved' }))));

router.get('/mine', auth, h(async (req, res) =>
  res.json(await Media.find({ uploader: req.user.id }).sort({ createdAt: -1 }).populate('uploader', 'name'))));

router.get('/favorites', auth, h(async (req, res) => {
  const u = await User.findById(req.user.id).populate({ path: 'favorites', populate: { path: 'uploader', select: 'name' } });
  res.json(u.favorites);
}));

router.get('/admin/all', auth, role('admin'), h(async (req, res) =>
  res.json(await Media.find().sort({ createdAt: -1 }).populate('uploader', 'name'))));

router.get('/admin/users', auth, role('admin'), h(async (req, res) =>
  res.json(await User.find().select('-password -favorites').sort({ createdAt: -1 }))));

// ---- single item ----
router.get('/:id', optionalAuth, h(async (req, res) => {
  const m = await Media.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('uploader', 'name');
  if (!m) return res.status(404).json({ msg: 'Not found' });
  let favorited = false;
  if (req.user) favorited = !!(await User.exists({ _id: req.user.id, favorites: m._id }));
  res.json({ ...m.toObject(), liked: !!req.user && m.likes.some(l => String(l) === req.user.id), favorited });
}));

router.get('/:id/related', h(async (req, res) => {
  const m = await Media.findById(req.params.id);
  if (!m) return res.json([]);
  res.json(await Media.find({ _id: { $ne: m._id }, status: 'approved', $or: [{ category: m.category }, { type: m.type }] })
    .limit(6).populate('uploader', 'name'));
}));

// ---- create / edit / delete ----
router.post('/', auth, role('creator', 'admin'), upload.single('file'), h(async (req, res) => {
  const { title, description, category, tags, url, thumbnail } = req.body;
  if (!title) return res.status(400).json({ msg: 'Title is required' });
  let { type } = req.body;
  let fileUrl;
  if (req.file) {
    fileUrl = '/uploads/' + req.file.filename;
    const mime = req.file.mimetype;
    type = mime.startsWith('video') ? 'video' : mime.startsWith('audio') ? 'audio' : 'image';
  } else if (url) fileUrl = url;
  else return res.status(400).json({ msg: 'Choose a file or paste a link' });
  if (!['video', 'audio', 'image'].includes(type)) return res.status(400).json({ msg: 'Select the media type' });
  res.json(await Media.create({
    title, description, category: category || 'General', tags: tagList(tags),
    type, fileUrl, thumbnail, uploader: req.user.id, status: 'approved'
  }));
}));

router.put('/:id', auth, h(async (req, res) => {
  const m = await Media.findById(req.params.id);
  if (!m) return res.status(404).json({ msg: 'Not found' });
  if (!canEdit(req.user, m)) return res.status(403).json({ msg: 'Not allowed' });
  const { title, description, category, tags } = req.body;
  if (title) m.title = title;
  if (description !== undefined) m.description = description;
  if (category) m.category = category;
  if (tags !== undefined) m.tags = tagList(tags);
  await m.save();
  res.json(m);
}));

router.delete('/:id', auth, h(async (req, res) => {
  const m = await Media.findById(req.params.id);
  if (!m) return res.status(404).json({ msg: 'Not found' });
  if (!canEdit(req.user, m)) return res.status(403).json({ msg: 'Not allowed' });
  if (m.fileUrl.startsWith('/uploads/')) await fs.unlink(path.join(__dirname, '..', m.fileUrl)).catch(() => {});
  await m.deleteOne();
  await Comment.deleteMany({ media: m._id });
  res.json({ msg: 'Deleted' });
}));

// ---- likes / favorites ----
router.post('/:id/like', auth, h(async (req, res) => {
  const m = await Media.findById(req.params.id);
  const i = m.likes.findIndex(u => String(u) === req.user.id);
  i >= 0 ? m.likes.splice(i, 1) : m.likes.push(req.user.id);
  await m.save();
  res.json({ likes: m.likes.length, liked: i < 0 });
}));

router.post('/:id/favorite', auth, h(async (req, res) => {
  const u = await User.findById(req.user.id);
  const i = u.favorites.findIndex(f => String(f) === req.params.id);
  i >= 0 ? u.favorites.splice(i, 1) : u.favorites.push(req.params.id);
  await u.save();
  res.json({ favorited: i < 0 });
}));

// ---- comments ----
router.get('/:id/comments', h(async (req, res) =>
  res.json(await Comment.find({ media: req.params.id }).sort({ createdAt: -1 }).populate('user', 'name'))));

router.post('/:id/comments', auth, h(async (req, res) => {
  if (!req.body.text?.trim()) return res.status(400).json({ msg: 'Comment is empty' });
  const c = await Comment.create({ media: req.params.id, user: req.user.id, text: req.body.text.trim() });
  res.json(await c.populate('user', 'name'));
}));

router.delete('/:id/comments/:cid', auth, h(async (req, res) => {
  const c = await Comment.findById(req.params.cid);
  if (!c) return res.status(404).json({ msg: 'Not found' });
  if (req.user.role !== 'admin' && String(c.user) !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });
  await c.deleteOne();
  res.json({ msg: 'Deleted' });
}));

module.exports = router;
