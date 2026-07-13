import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './config';
import { Post, Author, MediaItem, ThemeSettings, Revision, Comment } from '../types';
import { EXTRA_SEED_POSTS } from './seedData';
import { MORE_SEED_POSTS } from './seedDataMore';

// Default Theme Settings
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  primaryColor: 'emerald',
  fontFamily: 'editorial',
  heroLayout: 'carousel',
  activeSections: {
    hero: true,
    featured: true,
    latest: true,
    curated: true,
    newsletter: true,
  },
  siteName: 'Travel Bee',
  siteDescription: 'Chronicles of an offline explorer wandering the modern world. Guides, secrets, and visual journeys.',
};

// Default Authors
const DEFAULT_AUTHORS: Author[] = [
  {
    id: 'chloe-vance',
    name: 'Chloe Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    bio: 'Solo backpacker, visual storyteller, and matcha tea fanatic. Exploring the world one hidden alleyway at a time.',
    role: 'Editor',
    socials: { twitter: 'chloevance_travel', instagram: 'chloewanders' }
  },
  {
    id: 'marcus-brooks',
    name: 'Marcus Brooks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    bio: 'Former architectural journalist turned luxury adventure seeker. Fascinated by high-altitude trails and ancient stonework.',
    role: 'Admin',
    socials: { twitter: 'marcusb_journo', website: 'marcusbrooks.com' }
  },
  {
    id: 'elena-martinez',
    name: 'Elena Martinez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    bio: 'Full-time digital nomad, gear technician, and coffee-bean hunter. Sharing remote work setups from island shacks to snowy lofts.',
    role: 'Author',
    socials: { instagram: 'elenanomad', website: 'nomadtechie.co' }
  }
];

// Default Posts
const DEFAULT_POSTS = (authors: Author[]): Omit<Post, 'id'>[] => [
  {
    title: "Kyoto's Whispering Groves: A Solo Guide to Sagano's Secret Bamboo Paths",
    slug: "kyotos-whispering-groves",
    excerpt: "Escape the crowds and discover the secluded, moss-grown paths of Arashiyama's outer bamboo forests at dawn.",
    content: `# The Whispering Groves of Kyoto

There is a precise moment at 5:45 AM when the Sagano Bamboo Forest belongs entirely to the wind. Before the tour buses line the riverbanks, before the rickshaws begin their clattering journeys, the towering stalks of green sway in a quiet, rhythmic dance that sounds like soft rainfall.

As a solo traveler, finding these moments of stillness is what turns a trip into a pilgrimage. 

## Escaping the Standard Arashiyama Route

Most visitors arrive at Arashiyama Station and follow the primary paved path. It is beautiful, yes, but often crowded to the point of suffocation. Instead, follow this alternative loop:

1. **The Northern Temple Entry**: Begin behind Tenryu-ji Temple. There is a small dirt path winding north toward Nonomiya Shrine.
2. **The Moss Sanctuary**: Turn left past the shrine onto the dirt trail bordered by low cedar fences. Here, the bamboo grows denser, and the ground is coated in vibrant emerald moss.
3. **The Adashino Nembutsu-ji Extension**: Continue walking north for 20 minutes toward the preservation district of Saga-Toriimoto. Here, you will find a secondary, stunningly quiet grove that is completely empty.

![Secluded Bamboo Path](https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80)

## The Philosophy of Shinrin-Yoku (Forest Bathing)

In Japan, *shinrin-yoku* is more than a wellness trend—it is a preventative medical practice. The term translates to "absorbing the forest atmosphere." 

When you stand in the bamboo groves at dawn, close your eyes. Listen to the creak of the giant hollow poles. The sensory input reduces cortisol levels, lowers heart rates, and restores a deep, primordial sense of focus.

### Quick Tips for Solo Travelers
- **Getting There**: Take the JR San-In Line from Kyoto Station to Saga-Arashiyama Station. The first train leaves at 5:02 AM.
- **Camera Gear**: Bring a wide-angle lens (16-35mm) to capture the vertical scale of the bamboo, and a circular polarizer to cut glare from wet leaves.
- **Mindful Travel**: Keep your voice to a whisper. Let others enjoy the sound of the forest.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'chloe-vance',
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Asia',
    tags: ['Japan', 'Kyoto', 'Solo Travel', 'Zen'],
    isFeatured: true,
    viewCount: 1420,
    readingTime: 4
  },
  {
    title: "Chasing Sunsets on Santorini's Caldera Footpath: Fira to Oia",
    slug: "santorini-caldera-footpath",
    excerpt: "A rigorous 10km hike along the edge of an ancient active volcano, revealing Greece's most dramatic maritime vistas.",
    content: `# Chasing Sunsets: The Fira to Oia Caldera Hike

While Santorini is globally famous for its luxury resorts, infinity pools, and cave suites, its greatest treasure costs absolutely nothing: the spectacular walking path stretching from Fira to Oia along the rim of the caldera.

This 10.5-kilometer (6.5 miles) trail snakes along the cliff edge, passing pristine white chapels, jagged volcanic crags, and panoramic sea views that feel completely suspended in time.

![Caldera Sea View](https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80)

## The Route Breakdown

### 1. Fira to Firostefani
The hike begins gently. You wind through the narrow, high-end shopping alleys of Fira, climbing slowly toward Firostefani. The pavement is paved marble, and you'll find the famous blue-domed Three Bells of Fira church on this stretch.

### 2. Imerovigli and Skaros Rock
Leaving Imerovigli, the path transitions from smooth cobblestone to raw dirt and volcanic gravel. If you have an extra 45 minutes, descend the steep stone stairs to **Skaros Rock**, an ancient medieval fortress jutting out into the sea. The climb to its peak offers unparalleled panoramic views of the entire crescent island.

### 3. The Wilderness Stretch
From Imerovigli to Oia, there are almost no buildings. This is where the landscape becomes truly dramatic. The trail climbs over red volcanic hills and runs along thin ridges with 300-meter drops on either side.

## The Epic Finish in Oia

As you descend into Oia, the iconic whitewashed windmills and blue-domed churches appear on the horizon. If you timed your hike correctly, you will arrive just as the golden sun dips into the Aegean Sea, casting shades of amber and rose across the chalky cliffs.

### Essential Trail Guide
- **Distance**: 10.2 km / 6.3 miles
- **Duration**: 3 to 4 hours depending on photo stops
- **When to go**: Start either at 7:00 AM to avoid the intense heat, or at 3:30 PM to finish right at sunset.
- **Footwear**: Sturdy trail running shoes. Do not attempt this hike in sandals—the volcanic gravel is slick and steep.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'marcus-brooks',
    heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1469796466635-455ede028ca2?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Europe',
    tags: ['Greece', 'Santorini', 'Hiking', 'Adventure'],
    isFeatured: false,
    viewCount: 985,
    readingTime: 6
  },
  {
    title: "10 Nomadic Packing Hacks for Full-Time Minimalist Explorers",
    slug: "nomadic-packing-hacks",
    excerpt: "Ditch the heavy luggage. Here are the precise packing secrets of a five-year continuous remote worker.",
    content: `# Minimalist Nomad: 10 Packing Hacks for Constant Flight

Five years ago, I walked out of my apartment in Chicago with nothing but a 40-liter backpack. Since then, I’ve worked from beaches in Thailand, cafes in Prague, and mountain huts in Patagonia. 

The secret to this lifestyle isn't how much money you make; it’s how light you can travel. Lugging a 25kg suitcase over cobbled streets is the quickest way to kill the romance of travel. 

Here are the 10 core packing hacks that keep me functional, lightweight, and agile.

![Nomad packing items](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)

## 1. The "Rule of 5" for Wardrobe
You only need five days of clothing, regardless of whether you're traveling for a week or a year. 
- 5 Shirts (lightweight Merino wool or blends)
- 4 Pairs of underwear & socks
- 2 Bottoms (one tech pants, one multi-purpose shorts)
- 1 Light jacket / shell
- 1 Swimsuit

You wash your clothes once a week, or sink-wash them individually as you go.

## 2. Double-Duty Tech
Ditch the dedicated camera charger, phone charger, and laptop power brick. Buy a single **65W GaN (Gallium Nitride) USB-C charger**. It is tiny, incredibly lightweight, and powerful enough to charge a MacBook, iPad, phone, and camera battery simultaneously using standard USB-C cables.

## 3. Compression Packing Cubes
Do not use standard packing cubes; invest in double-zipper compression cubes. They use secondary zippers to actively force air out of your folded clothes, reclaiming about 40% of physical luggage volume.

## 4. Solid Toiletries (Water-Free)
Liquids are heavy and trigger endless security checks. Switch to solid shampoo bars, solid conditioner, solid deodorant, and toothpaste tablets. They last three times longer, weigh next to nothing, and never leak inside your pack.

## 5. The Carabiner Secret
Keep two climbing-grade carabiners clipped to your backpack shoulder straps. They are invaluable for hanging shoes to dry, clipping water bottles, or keeping your pack off dirty airport floor tiles by attaching it to hooks.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'elena-martinez',
    heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Gear & Tips',
    tags: ['Nomad', 'Packing Hacks', 'Minimalism', 'Gear'],
    isFeatured: false,
    viewCount: 2310,
    readingTime: 5
  },
  {
    title: "Petra by Night: Silent Pathways through Jordan's Sandstone Canyon",
    slug: "petra-by-night-jordan",
    excerpt: "Walk the pitch-black winding Siq by the flickering light of 1,500 candles to see the Treasury in absolute silence.",
    content: `# Petra by Night: Wandering Jordan's Ancient Gorge

The Siq—the narrow, winding sandstone canyon that serves as the entrance to Petra—is a place of immense geological scale. During the hot daytime hours, it is a bustling conduit of horse-drawn carriages, echoey tour guides, and souvenir sellers.

But at 8:30 PM on Monday, Wednesday, and Thursday, the canyon transforms.

![Petra Treasury Candlelight](https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80)

## The Silent Pilgrimage

The journey begins in complete darkness. Visitors are asked to walk the 1.2-kilometer gorge in total silence, guided only by the soft, warm glow of small paper candles laid along the path every few meters.

As you walk, the sky is reduced to a thin strip of stars suspended between sheer 80-meter canyon cliffs. The sound of your footsteps on the ancient Nabataean paving stones is the only companion.

## Emerging at the Treasury

At the end of the Siq, the canyon walls peel back. 

There, standing in the monumental plaza, is Al-Khazneh (The Treasury). Hand-carved into the rose-red rock face over 2,000 years ago, its elaborate Romanesque facade is illuminated by the flickering warmth of 1,500 candles placed in neat rows in the sand.

Bedouin musicians play haunting melodies on the *rababa* (a traditional one-stringed fiddle), while hot cardamom tea is served to guests seated on woven rugs.

### Insider Photography Tips
- **No Flash**: Do not use camera flash. It ruins the atmospheric candlelit mood and bleaches the rich red sandstone.
- **Tripod is Mandatory**: To capture the stars over the Treasury, you will need a 15-30 second exposure at ISO 800 or 1600. Bring a lightweight travel tripod.
- **Stay Behind**: Most guests rush back to the entrance immediately after the music ends. If you wait 20 minutes, the plaza empties completely, allowing you to walk back through the glowing Siq in absolute solitude.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'marcus-brooks',
    heroImage: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501535033-a5986577f9d2?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Middle East',
    tags: ['Jordan', 'Petra', 'Desert', 'Ancient History'],
    isFeatured: false,
    viewCount: 760,
    readingTime: 5
  },
  {
    title: "The Ice Cave's Sapphire Pulse: Exploring Vatnajökull's Winter Wonders",
    slug: "ice-caves-vatnajokull",
    excerpt: "Journey deep underneath Iceland's largest ice cap to witness ancient compressed water glowing deep neon blue under the winter sun.",
    content: `# The Ice Cave's Sapphire Pulse: Exploring Vatnajökull

Few places on Earth feel as completely alien as the sub-glacial caves of Vatnajökull. Underneath the crushing weight of thousands of tons of ancient ice, seasonal meltwaters carve out labyrinthine cathedrals of pure, luminous blue.

To walk inside one is to step into the frozen bloodstream of our planet.

## The Mystery of the Blue Ice

Why is the ice in these caves so deep, glowing sapphire? 

Standard ice, like the cubes in your freezer, is filled with tiny trapped air bubbles. These bubbles scatter light, causing the ice to appear white. But glacial ice has been subjected to immense tectonic pressure over hundreds of years. The air is forced out, packing the ice crystals tightly together. This compressed ice absorbs red, yellow, and green wavelengths of light, leaving only the deep, pulsing blue to escape.

![Glacial Blue Ice](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80)

## Finding the Sapphire Chambers

Because these caves are formed by summer meltwater channels, they are dynamic and unstable. They collapse in the spring and brand-new chambers form each autumn. 

### Essential Exploration Guidelines:
1. **Never Go Solo**: Never attempt to enter glacier caves without an experienced glaciologist guide. Glaciers shift constantly, and sub-glacial collapses can be fatal.
2. **Bring Safety Gear**: Hard helmets, ice axes, and steel crampons are non-negotiable for traversing the slick, sloping floors.
3. **Optimal Season**: Mid-November to early March is the only safe window when freezing temperatures stabilize the cave ceilings.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'chloe-vance',
    heroImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Europe',
    tags: ['Iceland', 'Glacier', 'Ice Cave', 'Winter'],
    isFeatured: true,
    viewCount: 1940,
    readingTime: 5
  },
  {
    title: "The Lost Teahouses of Annapurna: A Trekker's Sanctuary",
    slug: "teahouses-annapurna",
    excerpt: "Explore the warmth, dal bhat heritage, and high-altitude hospitality of traditional Nepalese lodges nestled under the giants.",
    content: `# The Lost Teahouses of Annapurna

In the shadow of peak Annapurna South, at an altitude of 3,200 meters, sits a tiny, blue-roofed sanctuary of timber and stone. Inside, the air smells of pine wood smoke, cardamom, and steaming lentils.

This is the Nepalese teahouse—a cultural institution that makes trekking the Himalayas one of the world's most intimate adventures.

## The Ritual of Dal Bhat

For trekkers, the phrase *"Dal Bhat Power, 24 Hour"* is a literal truth. This traditional meal—consisting of spiced lentil soup (dal), steamed white rice (bhat), vegetable curry, and pickled greens—is served in unlimited quantities at every teahouse.

As you sit by the central wood-fired stove, the lodge owner will continuously refill your brass platter. It is a gesture of boundless hospitality that fuels the grueling climb ahead.

![Himalayan Teahouse](https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80)

## What to Expect at High Altitude

- **Simple Amenities**: Rooms are unheated, featuring two wooden twin beds and thick woolen blankets.
- **Thermal Solar Power**: Hot showers are heated by roof-top solar tubes, meaning hot water is best requested in the early afternoon before the sun goes down.
- **Acclimatization**: For every 1,000 meters of vertical ascent, plan to spend an extra night resting to let your body produce red blood cells for the thinner air.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'marcus-brooks',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Asia',
    tags: ['Nepal', 'Himalayas', 'Trekking', 'Culture'],
    isFeatured: false,
    viewCount: 2850,
    readingTime: 7
  },
  {
    title: "Secrets of the Sahara: A Beginner's Guide to Caravan Camping",
    slug: "secrets-sahara-camping",
    excerpt: "Saddle up a dromedary and ride into the Erg Chebbi dunes to spend a night under the dense canopy of the Milky Way.",
    content: `# Secrets of the Sahara: Caravan Camping in Morocco

To understand the desert, you must let go of the concept of silence. The Sahara is never truly quiet. The wind whispers constantly across the crests of the giant Erg Chebbi dunes, shifting millions of orange sand grains in a soft, perpetual rustle.

And then, at night, the sky sings.

## Riding the Dunes of Merzouga

The gate to this wilderness is Merzouga, a small dusty outpost in southeastern Morocco. From here, dromedaries (one-humped camels) are saddled for the 90-minute trek into the interior dunes.

As the camels sway in a rhythmic, ancient gait, the horizon stretches out in massive waves of gold and apricot.

![Morocco Camel Caravan](https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80)

## Sleeping in a Berber Camp

Tucked between two towering 150-meter dunes lies our oasis camp. Hand-woven black wool tents are set in a circle around an open campfire circle lined with colorful hand-knotted rugs.

### High-Desert Night Preparation:
- **Drastic Temperature Drops**: The sand doesn't retain heat. A daytime temperature of 35°C (95°F) can plunge to 5°C (41°F) by midnight. Pack a heavy fleece and thermal beanie.
- **Stargazing Excellence**: With zero light pollution for hundreds of kilometers, the sky is incredibly bright. The Milky Way appears as a solid, luminous ribbon of silver.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'elena-martinez',
    heroImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Middle East',
    tags: ['Morocco', 'Sahara', 'Desert', 'Camping'],
    isFeatured: true,
    viewCount: 1100,
    readingTime: 6
  },
  {
    title: "How to Travel Solo Without Feeling Lonely: A Psychological Guide",
    slug: "how-to-travel-solo",
    excerpt: "Practical strategies to turn solitude into your greatest asset, finding deep connection and friendship in foreign cities.",
    content: `# The Solo Mindset: Traveling Alone Without Loneliness

The fear of dining alone in a crowded Parisian bistro or sitting alone in a bustling Tokyo coffee shop prevents thousands of people from ever packing a suitcase and exploring the world.

But there is a vast, beautiful difference between being *alone* and being *lonely*. One is a state of physical freedom; the other is a state of mental isolation.

## Embracing the Power of Seclusion

When you travel with others, you are insulated in a safe social bubble. You talk to each other, consult each other, and look inward. 

But when you travel solo, you are forced to look outward. You become a observer of the world. You notice the way light hits a damp stone alleyway, the soft laughter of a local baker, and the rhythmic clinking of espresso cups.

![Solo Coffee Shop](https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80)

## Practical Hacks for Solo Explorers

1. **The Book/Notebook Buffer**: Always carry a physical pocket notebook or a classic paperback. If you feel self-conscious sitting alone at a restaurant table, open your book or jot down observations. It grounds you and signals to locals that you are approachable and reflective.
2. **Join Local Walking Tours**: Every historic city has free walking tours led by passionate local students. They are the single easiest place to meet fellow travelers and find dinner partners.
3. **Stay in Boutique Guesthouses**: Choose small, family-run guesthouses or hostels with common lounge areas instead of sterile corporate hotels.
`,
    status: 'published',
    publishedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    scheduledFor: null,
    authorId: 'elena-martinez',
    heroImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Gear & Tips',
    tags: ['Solo Travel', 'Psychology', 'Mindfulness', 'Lifestyle'],
    isFeatured: false,
    viewCount: 3500,
    readingTime: 5
  },
  ...EXTRA_SEED_POSTS,
  ...MORE_SEED_POSTS
];

// Helper to seed data if empty or missing some dispatches
export async function checkAndSeedData() {
  try {
    // 1. Check/Seed Theme Settings
    const themeDocRef = doc(db, 'settings', 'theme');
    const themeDoc = await getDoc(themeDocRef);
    if (!themeDoc.exists()) {
      await setDoc(themeDocRef, DEFAULT_THEME_SETTINGS);
      console.log('Seeded default theme settings.');
    }

    // 2. Check/Seed Authors
    const authorsColRef = collection(db, 'authors');
    const authorSnapshot = await getDocs(authorsColRef);
    if (authorSnapshot.empty) {
      for (const author of DEFAULT_AUTHORS) {
        await setDoc(doc(db, 'authors', author.id), author);
      }
      console.log('Seeded default authors.');
    }

    // 3. Check/Seed Posts (Smart self-updating seeding)
    const postsColRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsColRef);
    const existingSlugs = new Set(postsSnapshot.docs.map(doc => doc.id));
    const postsToSeed = DEFAULT_POSTS(DEFAULT_AUTHORS);
    
    let addedPosts = 0;
    for (const post of postsToSeed) {
      if (!existingSlugs.has(post.slug)) {
        await setDoc(doc(db, 'posts', post.slug), {
          ...post,
          id: post.slug
        });
        addedPosts++;
      }
    }
    if (addedPosts > 0) {
      console.log(`Seeded ${addedPosts} new default posts.`);
    }

    // Seed some media items too based on default images if empty
    const mediaColRef = collection(db, 'media');
    const mediaSnapshot = await getDocs(mediaColRef);
    if (mediaSnapshot.empty) {
      const seedImages = [
        { id: 'img-kyoto', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', name: 'Kyoto Bamboo Forest', altText: 'Tall green bamboo grove in Kyoto at dawn', category: 'Asia', uploadedAt: new Date().toISOString() },
        { id: 'img-santorini', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', name: 'Santorini Caldera', altText: 'Sunlight shining on Santorini whitewashed buildings and sea', category: 'Europe', uploadedAt: new Date().toISOString() },
        { id: 'img-nomad', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80', name: 'Nomadic Gear', altText: 'Camera, map, and explorer bag on a floor', category: 'Gear & Tips', uploadedAt: new Date().toISOString() },
        { id: 'img-petra', url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80', name: 'Petra Treasury', altText: 'Petra treasury stone columns lit by candlelight', category: 'Middle East', uploadedAt: new Date().toISOString() }
      ];
      for (const media of seedImages) {
        await setDoc(doc(db, 'media', media.id), media);
      }
    }

    // Seed a few comments if comments is empty
    const commentsSnapshot = await getDocs(collection(db, 'comments'));
    if (commentsSnapshot.empty) {
      const commentsSeed = [
        { postId: 'kyotos-whispering-groves', authorName: 'Jamie Miller', authorEmail: 'jamie@travel.com', content: 'This dawn route advice is a lifesaver! I went at 6 AM and had the entire middle trail completely to myself. Thank you, Chloe!', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        { postId: 'kyotos-whispering-groves', authorName: 'Haru Tanaka', authorEmail: 'haru@kyoto-guide.org', content: 'As a local, I appreciate the recommendation of Saga-Toriimoto. It is a highly spiritual district that tourists often bypass.', createdAt: new Date().toISOString() },
        { postId: 'santorini-caldera-footpath', authorName: 'Sarah Jenkins', authorEmail: 'sarah.j@nomad.com', content: 'Stout running shoes is no joke. I tried this in flip-flops last year and slipped three times on the gravel before turning back. Definitely wear real shoes!', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }
      ];
      for (const comm of commentsSeed) {
        await addDoc(collection(db, 'comments'), comm);
      }
    }
  } catch (error) {
    console.error('Error in checkAndSeedData:', error);
  }
}

// === Theme Settings Functions ===
export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const docRef = doc(db, 'settings', 'theme');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ThemeSettings;
    }
    return DEFAULT_THEME_SETTINGS;
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export async function saveThemeSettings(settings: ThemeSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'theme'), settings);
}

// === Authors Functions ===
export async function getAuthors(): Promise<Author[]> {
  try {
    const colRef = collection(db, 'authors');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Author));
  } catch {
    return DEFAULT_AUTHORS;
  }
}

export async function saveAuthor(author: Author): Promise<void> {
  await setDoc(doc(db, 'authors', author.id), author);
}

// === Posts Functions ===
export async function getPosts(includeDrafts = false): Promise<Post[]> {
  try {
    const colRef = collection(db, 'posts');
    let q = query(colRef, orderBy('publishedAt', 'desc'));
    if (!includeDrafts) {
      q = query(colRef, where('status', '==', 'published'), orderBy('publishedAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
  } catch (error) {
    console.warn("Could not reach Firestore. Operating in offline mode with fallback content:", error);
    // Return gorgeous fallback default posts instead of an empty screen!
    return DEFAULT_POSTS(DEFAULT_AUTHORS).map(p => ({
      ...p,
      id: p.slug
    } as Post));
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const docSnap = await getDoc(doc(db, 'posts', slug));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    }
    const defaults = DEFAULT_POSTS(DEFAULT_AUTHORS);
    const found = defaults.find(p => p.slug === slug);
    if (found) {
      return { ...found, id: found.slug } as Post;
    }
    return null;
  } catch (error) {
    console.warn("Could not reach Firestore for slug. Operating in offline mode with fallback content:", error);
    const defaults = DEFAULT_POSTS(DEFAULT_AUTHORS);
    const found = defaults.find(p => p.slug === slug);
    if (found) {
      return { ...found, id: found.slug } as Post;
    }
    return null;
  }
}

export async function savePost(post: Post, editorEmail: string): Promise<void> {
  const isNew = !post.id;
  const postId = post.id || post.slug;
  const postRef = doc(db, 'posts', postId);
  
  const postToSave = {
    ...post,
    id: postId,
    publishedAt: post.status === 'published' && !post.publishedAt ? new Date().toISOString() : post.publishedAt
  };

  // Save Post
  await setDoc(postRef, postToSave);

  // Save a revision for rollback tracking
  const revisionsCol = collection(db, 'revisions');
  await addDoc(revisionsCol, {
    postId: postId,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    updatedAt: new Date().toISOString(),
    updatedBy: editorEmail || 'system'
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', postId));
}

// === Revisions (Version History) ===
export async function getRevisions(postId: string): Promise<Revision[]> {
  try {
    const colRef = collection(db, 'revisions');
    const q = query(colRef, where('postId', '==', postId), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Revision));
  } catch (e) {
    console.error("Error loading revisions:", e);
    return [];
  }
}

// === Comments ===
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const colRef = collection(db, 'comments');
    const q = query(colRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
  } catch (error) {
    console.warn("Could not reach Firestore for comments, returning fallback seeded comments:", error);
    const commentsSeed: Comment[] = [
      { id: 'c1', postId: 'kyotos-whispering-groves', authorName: 'Jamie Miller', authorEmail: 'jamie@travel.com', content: 'This dawn route advice is a lifesaver! I went at 6 AM and had the entire middle trail completely to myself. Thank you, Chloe!', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { id: 'c2', postId: 'kyotos-whispering-groves', authorName: 'Haru Tanaka', authorEmail: 'haru@kyoto-guide.org', content: 'As a local, I appreciate the recommendation of Saga-Toriimoto. It is a highly spiritual district that tourists often bypass.', createdAt: new Date().toISOString() },
      { id: 'c3', postId: 'santorini-caldera-footpath', authorName: 'Sarah Jenkins', authorEmail: 'sarah.j@nomad.com', content: 'Stout running shoes is no joke. I tried this in flip-flops last year and slipped three times on the gravel before turning back. Definitely wear real shoes!', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }
    ];
    return commentsSeed.filter(c => c.postId === postId);
  }
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  const docData = {
    ...comment,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, 'comments'), docData);
  return { id: docRef.id, ...docData } as Comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', commentId));
}

// === Media Library ===
export async function getMediaItems(): Promise<MediaItem[]> {
  try {
    const colRef = collection(db, 'media');
    const q = query(colRef, orderBy('uploadedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
  } catch {
    return [];
  }
}

export async function addMediaItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>): Promise<MediaItem> {
  const docData = {
    ...item,
    uploadedAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, 'media'), docData);
  const mediaObj = { id: docRef.id, ...docData } as MediaItem;
  return mediaObj;
}

export async function deleteMediaItem(mediaId: string): Promise<void> {
  await deleteDoc(doc(db, 'media', mediaId));
}
