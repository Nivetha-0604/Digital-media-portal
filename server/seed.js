const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Media = require('./models/Media');

const G = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
const S = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-';
const P = id => `https://picsum.photos/id/${id}/900/600`;

module.exports = async function seed() {
  if (await User.countDocuments()) return;
  const hash = p => bcrypt.hash(p, 10);
  const [admin, creator, viewer] = await User.insertMany([
    { name: 'Admin', email: 'admin@demo.com', password: await hash('admin123'), role: 'admin' },
    { name: 'Demo Creator', email: 'creator@demo.com', password: await hash('creator123'), role: 'creator' },
    { name: 'Demo Viewer', email: 'viewer@demo.com', password: await hash('viewer123'), role: 'viewer' }
  ]);
  const u = creator._id;
  const v = (title, file, img, category, tags, description) => ({
    title, type: 'video', fileUrl: G + file, thumbnail: G + 'images/' + img, category, tags, description, uploader: u,
    views: 50 + Math.floor(Math.random() * 900)
  });
  const a = (n, title, category, tags) => ({
    title, type: 'audio', fileUrl: `${S}${n}.mp3`, category, tags, uploader: u,
    description: 'Instrumental track for relaxing, studying or background music.', views: 20 + Math.floor(Math.random() * 400)
  });
  const i = (id, title, category, tags, description) => ({
    title, type: 'image', fileUrl: P(id), category, tags, description, uploader: u,
    views: 30 + Math.floor(Math.random() * 600)
  });
  await Media.insertMany([
    v('Big Buck Bunny', 'BigBuckBunny.mp4', 'BigBuckBunny.jpg', 'Animation', ['animation', 'short film', 'comedy'], 'A giant rabbit takes revenge on three bullying rodents.'),
    v('Sintel', 'Sintel.mp4', 'Sintel.jpg', 'Animation', ['animation', 'fantasy', 'dragon'], 'A young woman searches for her lost dragon friend.'),
    v('Tears of Steel', 'TearsOfSteel.mp4', 'TearsOfSteel.jpg', 'Sci-Fi', ['scifi', 'robots', 'short film'], 'Warriors and scientists try to save the world from robots.'),
    v('Elephants Dream', 'ElephantsDream.mp4', 'ElephantsDream.jpg', 'Animation', ['animation', 'surreal'], 'Two strange characters explore a surreal mechanical world.'),
    v('For Bigger Blazes', 'ForBiggerBlazes.mp4', 'ForBiggerBlazes.jpg', 'Trailers', ['trailer', 'action'], 'A fast-paced action teaser clip.'),
    a(1, 'Calm Waves (Instrumental)', 'Music', ['relax', 'instrumental']),
    a(2, 'Evening Drive', 'Music', ['chill', 'electronic']),
    a(3, 'Study Focus', 'Music', ['study', 'focus']),
    a(4, 'Sunrise Mood', 'Music', ['morning', 'ambient']),
    i(10, 'Forest Path', 'Nature', ['forest', 'green', 'trees'], 'A quiet path through a dense green forest.'),
    i(1015, 'River Valley', 'Nature', ['river', 'valley', 'landscape'], 'A winding river cutting through a wide valley.'),
    i(1018, 'Mountain Range', 'Nature', ['mountain', 'landscape'], 'Snow-capped mountains under a clear sky.'),
    i(1039, 'Waterfall', 'Nature', ['waterfall', 'water'], 'A powerful waterfall in the wild.'),
    i(237, 'Black Puppy', 'Animals', ['dog', 'puppy', 'cute'], 'A cute black puppy looking at the camera.'),
    i(1074, 'Lion Portrait', 'Animals', ['lion', 'wildlife'], 'Portrait of a lion in the wild.'),
    i(1025, 'Pug in Blanket', 'Animals', ['dog', 'pug', 'cute'], 'A pug wrapped up in a cosy blanket.')
  ]);
  console.log('Seeded demo data. Logins -> admin@demo.com/admin123, creator@demo.com/creator123, viewer@demo.com/viewer123');
};
