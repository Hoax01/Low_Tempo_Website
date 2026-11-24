const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.product-card');
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(filter => {
    const selected = filter === button;
    filter.classList.toggle('active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
}));

const productDialog = document.getElementById('productDialog');
const bagDialog = document.getElementById('bagDialog');
let selectedCard = null;
let bag = [];
try { bag = JSON.parse(localStorage.getItem('low-tempo-demo-bag') || '[]'); if (!Array.isArray(bag)) bag = []; } catch { bag = []; }
function saveBag() { localStorage.setItem('low-tempo-demo-bag', JSON.stringify(bag)); renderBag(); }
function renderBag() {
  document.getElementById('bagCount').textContent = bag.length;
  document.getElementById('floatingBagCount').textContent = bag.length;
  const holder = document.getElementById('bagItems'); holder.replaceChildren();
  if (!bag.length) { const empty = document.createElement('p'); empty.textContent = 'Nothing here yet. Take a slow look around. ✿'; holder.append(empty); return; }
  bag.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'bag-item';
    const copy = document.createElement('div'); copy.textContent = item.name;
    const price = document.createElement('span'); price.textContent = item.price; copy.append(document.createElement('br'), price);
    const remove = document.createElement('button'); remove.className = 'clear-bag'; remove.type = 'button'; remove.textContent = 'remove'; remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.addEventListener('click', () => { bag.splice(index, 1); saveBag(); });
    row.append(copy, remove); holder.append(row);
  });
}
renderBag();
cards.forEach((card, index) => card.querySelectorAll('.product-image, .round-open').forEach(button => button.addEventListener('click', () => {
  selectedCard = card;
  document.getElementById('dialogTitle').textContent = card.dataset.name;
  document.getElementById('dialogDescription').textContent = card.dataset.description;
  document.getElementById('dialogPrice').textContent = card.dataset.price;
  document.getElementById('dialogArt').style.backgroundPosition = `${index * 50}% 50%`;
  document.getElementById('dialogArt').style.filter = index === 1 ? 'saturate(.18) brightness(1.08)' : 'none';
  productDialog.showModal();
})));
document.getElementById('dialogClose').addEventListener('click', () => productDialog.close());
document.getElementById('addBag').addEventListener('click', () => {
  if (!selectedCard) return;
  bag.push({ name: selectedCard.dataset.name, price: selectedCard.dataset.price });
  saveBag(); productDialog.close(); bagDialog.showModal();
});
document.getElementById('bagButton').addEventListener('click', () => bagDialog.showModal());
document.getElementById('bagClose').addEventListener('click', () => bagDialog.close());
document.getElementById('clearBag').addEventListener('click', () => { bag = []; saveBag(); });
[productDialog, bagDialog].forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));

// A local-only counter and guestbook make this feel like a personal 90s page.
let visits = 0;
try { visits = Number(localStorage.getItem('low-tempo-visits') || 0) + 1; localStorage.setItem('low-tempo-visits', String(visits)); } catch { visits = 1; }
document.getElementById('visitCounter').textContent = String(visits).padStart(6, '0');
const guestbookForm = document.getElementById('guestbookForm');
let notes = [];
try { notes = JSON.parse(localStorage.getItem('low-tempo-guestbook') || '[]'); if (!Array.isArray(notes)) notes = []; } catch { notes = []; }
function renderNotes() {
  const holder = document.getElementById('guestbookNotes'); holder.replaceChildren();
  notes.slice(0, 4).forEach(note => {
    const entry = document.createElement('div'); entry.className = 'guestbook-entry';
    const name = document.createElement('b'); name.textContent = note.name;
    const date = document.createElement('small'); date.textContent = note.date;
    const message = document.createElement('p'); message.textContent = note.message;
    entry.append(name, date, message); holder.append(entry);
  });
}
renderNotes();
guestbookForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = guestbookForm.elements.name.value.trim();
  const message = guestbookForm.elements.note.value.trim();
  if (!name || !message) return;
  notes.unshift({ name, message, date: new Date().toLocaleDateString() });
  notes = notes.slice(0, 20);
  localStorage.setItem('low-tempo-guestbook', JSON.stringify(notes));
  guestbookForm.reset(); renderNotes();
});

let soundContext, oscillators = [];
const soundButton = document.getElementById('soundButton');
soundButton.addEventListener('click', async () => {
  if (oscillators.length) {
    oscillators.forEach(({ oscillator, gain }) => { gain.gain.setTargetAtTime(0, soundContext.currentTime, .12); setTimeout(() => oscillator.stop(), 700); });
    oscillators = []; soundButton.textContent = '▷ play sound'; soundButton.setAttribute('aria-pressed', 'false'); document.body.classList.remove('sound-playing'); return;
  }
  soundContext ||= new (window.AudioContext || window.webkitAudioContext)();
  await soundContext.resume();
  const now = soundContext.currentTime;
  [523.25, 659.25].forEach((frequency, index) => {
    const note = soundContext.createOscillator(); const volume = soundContext.createGain();
    note.type = 'sine'; note.frequency.value = frequency;
    const start = now + index * .18;
    volume.gain.setValueAtTime(0, start); volume.gain.linearRampToValueAtTime(.12, start + .025); volume.gain.exponentialRampToValueAtTime(.001, start + 1.2);
    note.connect(volume).connect(soundContext.destination); note.start(start); note.stop(start + 1.25);
  });
  [174.61, 261.63, 349.23].forEach((frequency, index) => {
    const oscillator = soundContext.createOscillator(); const gain = soundContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.value = 0; gain.gain.setTargetAtTime(index === 0 ? .025 : .012, now, .8);
    oscillator.connect(gain).connect(soundContext.destination); oscillator.start(); oscillators.push({ oscillator, gain });
  });
  soundButton.textContent = 'Ⅱ pause sound'; soundButton.setAttribute('aria-pressed', 'true'); document.body.classList.add('sound-playing');
});



// Bundle choices are front-end examples; the existing demo bag holds the selections.
document.querySelectorAll('.bundle-add').forEach(button => button.addEventListener('click', () => {
  bag.push({ name: button.dataset.name, price: 'Price on request' });
  saveBag();
  bagDialog.showModal();
}));

const customDevice = document.getElementById('customDevice');
const customCase = document.getElementById('customCase');
const customCharm = document.getElementById('customCharm');
const customGems = document.getElementById('customGems');
const customSummary = document.getElementById('customSummary');
const customInitials = document.getElementById('customInitials');
const customImage = document.getElementById('customImage');
const customImages = {
  'Blush crochet': 'custom-blush-camera.png',
  'Strawberry knit': 'bundle-strawberry.png',
  'Slate star': 'bundle-starlight.png',
  'Sky blue crochet': 'custom-ipod-charms.png',
  'Midnight crochet': 'custom-ipod-charms.png'
};
function updateCustomTicket() {
  customSummary.textContent = [customDevice.value, customCase.value, customCharm.value, customGems.value, customInitials.value.trim() ? 'Personalized: ' + customInitials.value.trim() : ''].filter(Boolean).join(' · ');
  customImage.src = `assets/${customImages[customCase.value]}`;
  customImage.alt = `Inspiration photo for ${customCase.value}`;
}
[customDevice, customCase, customCharm, customGems].forEach(select => select.addEventListener('change', updateCustomTicket));
customInitials.addEventListener('input', updateCustomTicket);
document.querySelectorAll('.custom-preset').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.preset === 'friends') {
    customDevice.value = 'Music player';
    customCase.value = 'Sky blue crochet';
    customCharm.value = 'Star charm';
    customGems.value = 'Blue gems';
  } else {
    customDevice.value = 'Digicam';
    customCase.value = 'Blush crochet';
    customCharm.value = 'Flower charm';
    customGems.value = 'Lilac gems';
  }
  updateCustomTicket();
  document.getElementById('customizer').scrollIntoView({ behavior: 'smooth', block: 'center' });
  customCase.focus({ preventScroll: true });
}));
document.getElementById('customBag').addEventListener('click', () => {
  bag.push({ name: `Custom idea: ${customSummary.textContent}`, price: 'Quote on request' });
  saveBag();
  bagDialog.showModal();
});

// Sample cards show the interaction; visitors can pin their own photos locally.
const memorySamples = [
  { title: 'the garden went quiet', feeling: 'We stopped because the light made everything look softer. For a moment, there was nowhere else to be.', name: 'a little memory', image: 'assets/memory-flowers.png', alt: 'Pink flowers in a sunlit garden', sample: true },
  { title: 'one more round', feeling: 'Nobody wanted the game to end. The fruit disappeared, and then the hours did too.', name: 'a little memory', image: 'assets/memory-card-night.png', alt: 'Friends playing cards together on a rug', sample: true },
  { title: 'too close to the flash', feeling: 'A little chaotic, a little blurry, and exactly how I remember us.', name: 'a little memory', image: 'assets/memory-party-selfie.png', alt: 'Friends crowded together for a flash photo', sample: true },
  { title: 'hold still (or don’t)', feeling: 'We tried to take one serious photo. We kept laughing through every attempt.', name: 'a little memory', image: 'assets/memory-camera-moment.png', alt: 'A friend taking a photo of another friend', sample: true },
  { title: 'the ride home', feeling: 'We were tired, loud, and still not ready to say goodnight.', name: 'a little memory', image: 'assets/memory-transit.png', alt: 'Friends together on a late-night train', sample: true },
  { title: 'sparks after dark', feeling: 'For a minute, the whole night felt like it belonged to us.', name: 'a little memory', image: 'assets/memory-sparklers.png', alt: 'Friends holding sparklers outside at night', sample: true }
];

let memoryEntries = [];
try {
  const saved = JSON.parse(localStorage.getItem('low-tempo-memories') || '[]');
  if (Array.isArray(saved)) memoryEntries = saved.filter(item => item && typeof item.image === 'string' && typeof item.feeling === 'string').slice(0, 10);
} catch { memoryEntries = []; }
const memoryWall = document.getElementById('memoryWall');
function renderMemories() {
  memoryWall.replaceChildren();
  const entries = [...memoryEntries, ...memorySamples];
  document.getElementById('memoryCount').textContent = `${String(entries.length).padStart(2, '0')} MEMORIES`;
  entries.forEach(entry => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.type = 'button';
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `Flip memory: ${entry.title}`);
    const inner = document.createElement('span'); inner.className = 'memory-card-inner';
    const front = document.createElement('span'); front.className = 'memory-face memory-front';
    const photo = document.createElement('img'); photo.src = entry.image; photo.alt = entry.alt || `Photo for ${entry.title}`; photo.loading = 'lazy';
    const title = document.createElement('strong'); title.textContent = entry.title;
    const hint = document.createElement('small'); hint.textContent = '↻ FLIP TO READ';
    front.append(photo, title, hint);
    const back = document.createElement('span'); back.className = 'memory-face memory-back';
    const tag = document.createElement('b'); tag.textContent = entry.sample ? 'A SAMPLE PAGE ✿' : 'A LITTLE MEMORY ✿';
    const feeling = document.createElement('p'); feeling.textContent = entry.feeling;
    const name = document.createElement('small'); name.textContent = `— ${entry.name || 'someone here'} · ↻ FLIP BACK`;
    back.append(tag, feeling, name); inner.append(front, back); card.append(inner);
    card.addEventListener('click', () => {
      const flipped = card.getAttribute('aria-pressed') !== 'true';
      card.setAttribute('aria-pressed', String(flipped));
      card.setAttribute('aria-label', `${flipped ? 'Show photo for' : 'Flip memory:'} ${entry.title}`);
    });
    memoryWall.append(card);
  });
}
renderMemories();

const memoryForm = document.getElementById('memoryForm');
const memoryStatus = document.getElementById('memoryStatus');
const memoryPhoto = document.getElementById('memoryPhoto');
memoryPhoto.addEventListener('change', () => {
  const name = memoryPhoto.files[0]?.name;
  document.querySelector('.memory-upload strong').textContent = name ? name.slice(0, 28) : 'choose a photo';
});
function shrinkMemoryPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .76));
      } catch (error) { reject(error); }
      URL.revokeObjectURL(url);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image could not be opened')); };
    image.src = url;
  });
}
memoryForm.addEventListener('submit', async event => {
  event.preventDefault();
  const file = memoryPhoto.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) { memoryStatus.textContent = 'Please choose a photo under 8 MB.'; return; }
  const title = memoryForm.elements.title.value.trim();
  const feeling = memoryForm.elements.feeling.value.trim();
  const name = memoryForm.elements.name.value.trim() || 'someone here';
  if (!title || !feeling) return;
  memoryStatus.textContent = 'Pinning your photo…';
  try {
    const image = await shrinkMemoryPhoto(file);
    const next = [{ title, feeling, name, image, alt: `Memory photo: ${title}` }, ...memoryEntries].slice(0, 10);
    localStorage.setItem('low-tempo-memories', JSON.stringify(next));
    memoryEntries = next;
    renderMemories();
    memoryForm.reset();
    document.querySelector('.memory-upload strong').textContent = 'choose a photo';
    memoryStatus.textContent = 'Pinned! Tap your photo to read the other side.';
  } catch {
    memoryStatus.textContent = 'Could not save that photo here. Try a smaller one.';
  }
});
