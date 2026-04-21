// Sample prompts — will be expanded to 2000 and moved to Firestore
const PROMPTS = [
  { id: 1, text: "The cat knocked over the coffee machine and…", category: "humor" },
  { id: 2, text: "The last message on your phone was from 7 years ago…", category: "mystery" },
  { id: 3, text: "Your shadow started moving on its own…", category: "horror" },
  { id: 4, text: "The detective found a note that simply said…", category: "mystery" },
  { id: 5, text: "The spaceship's AI started telling jokes, but no one was laughing because…", category: "scifi" },
  { id: 6, text: "The barista handed you the wrong coffee, but when you tasted it…", category: "slice" },
  { id: 7, text: "If memories could be sold, the most expensive one would be…", category: "philosophy" },
  { id: 8, text: "The map led to a door that wasn't there yesterday…", category: "adventure" },
  { id: 9, text: "The letter was dated 1923, but it mentioned your name…", category: "historical" },
  { id: 10, text: "The character realized they were in a story and…", category: "meta" },
  { id: 11, text: "Every morning at 3:33 AM, the radio turns on by itself and plays…", category: "horror" },
  { id: 12, text: "The old woman at the bus stop handed me an envelope and whispered…", category: "mystery" },
  { id: 13, text: "I opened the fridge and found a tiny civilization living between the yogurt and…", category: "humor" },
  { id: 14, text: "The museum painting blinked. I'm sure of it because…", category: "horror" },
  { id: 15, text: "My dog brought back something from the park that definitely wasn't a stick…", category: "humor" },
  { id: 16, text: "The elevator stopped between floors and a voice said…", category: "mystery" },
  { id: 17, text: "I found my own diary, but the handwriting wasn't mine and the entries were from…", category: "horror" },
  { id: 18, text: "The vending machine gave me something that wasn't food…", category: "scifi" },
  { id: 19, text: "They said the lake was bottomless, but when I dove in I found…", category: "adventure" },
  { id: 20, text: "The fortune cookie's message was oddly specific about…", category: "mystery" },
  { id: 21, text: "My phone autocorrected my text to something I never typed, and it said…", category: "horror" },
  { id: 22, text: "The library book was 47 years overdue. When I opened it, I understood why…", category: "mystery" },
  { id: 23, text: "If silence had a taste, today it would taste like…", category: "philosophy" },
  { id: 24, text: "The astronaut's last transmission before going silent was…", category: "scifi" },
  { id: 25, text: "I woke up speaking a language I'd never learned, and the first thing I said was…", category: "scifi" },
  { id: 26, text: "The wedding invitation was beautiful, except for the part that said…", category: "humor" },
  { id: 27, text: "The dumbest superpower in the world turned out to be the most dangerous because…", category: "humor" },
  { id: 28, text: "She left a single word carved into the park bench. It said…", category: "romance" },
  { id: 29, text: "The clock on the wall started counting up instead of down, and I realized…", category: "horror" },
  { id: 30, text: "My grandmother's recipe for happiness included one unusual ingredient…", category: "slice" },
  { id: 31, text: "The pigeon delivered a message. The message was classified as…", category: "humor" },
  { id: 32, text: "I time-traveled exactly 11 minutes into the past, which was a problem because…", category: "scifi" },
  { id: 33, text: "The therapist paused, put down her notebook, and said something no therapist should ever say…", category: "mystery" },
  { id: 34, text: "They built a bridge to nowhere, but people kept walking across it and…", category: "philosophy" },
  { id: 35, text: "The rain started falling upward, and the only person who noticed was…", category: "scifi" },
  { id: 36, text: "I accidentally sent my resignation letter to the wrong person, and they replied with…", category: "humor" },
  { id: 37, text: "The lighthouse keeper hadn't spoken to anyone in 12 years. When he finally did, he said…", category: "slice" },
  { id: 38, text: "My reflection waved at me, but I hadn't moved my hand…", category: "horror" },
  { id: 39, text: "The last human city on Earth had one rule that everyone had to follow…", category: "scifi" },
  { id: 40, text: "I found a door in my basement that I'd never seen before. Behind it was…", category: "adventure" },
  { id: 41, text: "The street musician played a song that made everyone who heard it suddenly remember…", category: "philosophy" },
  { id: 42, text: "The world's worst magician accidentally performed real magic when…", category: "humor" },
  { id: 43, text: "I received a package I never ordered. Inside was a key and a note that read…", category: "mystery" },
  { id: 44, text: "The trees in the forest started growing overnight, but they were growing in the shape of…", category: "horror" },
  { id: 45, text: "If you could bottle one feeling and sell it, the richest person in the world would sell…", category: "philosophy" },
  { id: 46, text: "The new neighbor moved in at midnight and the first thing they did was…", category: "mystery" },
  { id: 47, text: "In a world where everyone is born with a tattoo of their soulmate's name, mine said…", category: "romance" },
  { id: 48, text: "The abandoned train station had one train that still ran, but only on nights when…", category: "adventure" },
  { id: 49, text: "I told the AI to write me a love letter, and instead it wrote a warning about…", category: "scifi" },
  { id: 50, text: "The most boring town in the world suddenly became famous because…", category: "slice" },
  
  // Memetic / Brainrot / Unhinged Easter Egg Prompts
  { id: 1001, text: "Write an apology essay, but you're a TikToker who got caught stealing a meme...", category: "brainrot" },
  { id: 1002, text: "Explain the plot of Hamlet but entirely in Gen Z slang...", category: "brainrot" },
  { id: 1003, text: "Your aura just dropped to zero in front of your crush. What do you do?", category: "brainrot" },
  { id: 1004, text: "You woke up and realized your entire life was just a 10-hour podcast ad read...", category: "brainrot" },
  { id: 1005, text: "The villain's evil plan is just to slightly inconvenience everyone's Wi-Fi connection...", category: "brainrot" },
  { id: 1006, text: "You have to defend yourself in court, but your lawyer only speaks in brainrot...", category: "brainrot" },
  { id: 1007, text: "Your group chat got leaked to the FBI, and now they're asking questions about...", category: "brainrot" },
  { id: 1008, text: "The Grim Reaper showed up, but you challenged him to a 1v1 on Rust...", category: "brainrot" },
  { id: 1009, text: "You tried to touch grass, but the grass touched you back...", category: "brainrot" },
  { id: 1010, text: "A time traveler arrives from 2050 to warn you about the Great Ratio of 2029...", category: "brainrot" },
  { id: 1011, text: "Your Spotify Wrapped was so unhinged that Spotify sent a wellness check...", category: "brainrot" },
  { id: 1012, text: "Write a dramatic monologue about burning your mouth on a Hot Pocket...", category: "brainrot" },
  { id: 1013, text: "You accidentally liked a picture from 2012, and now the original poster is...", category: "brainrot" },
  { id: 1014, text: "The only way to save the world is to post a cringe dance on TikTok...", category: "brainrot" },
  { id: 1015, text: "Your sleep paralysis demon is actually just a really annoying crypto bro...", category: "brainrot" },
  { id: 1016, text: "You got trapped in an elevator with a guy who won't stop talking about his podcast...", category: "brainrot" },
  { id: 1017, text: "Explain the economy to a Victorian child using only Fortnite terms...", category: "brainrot" },
  { id: 1018, text: "You discovered the secret to immortality, but it requires spending 5 hours a day on Twitter...", category: "brainrot" },
  { id: 1019, text: "The aliens landed, but they just wanted to know if we had games on our phones...", category: "brainrot" },
  { id: 1020, text: "Write a Yelp review for the concept of 'consciousness'...", category: "brainrot" },
  { id: 1021, text: "You have to explain to your parents why you bought 10,000 V-Bucks using their card...", category: "brainrot" },
  { id: 1022, text: "The protagonist is a sentient vape pen searching for its owner...", category: "brainrot" },
  { id: 1023, text: "You found a cursed artifact that forces you to narrate your life like a YouTuber...", category: "brainrot" },
  { id: 1024, text: "Describe a boss fight, but the boss is your Wi-Fi randomly disconnecting...", category: "brainrot" },
  { id: 1025, text: "You're trying to hide from a serial killer, but your phone starts playing a loud ad...", category: "brainrot" },
  { id: 1026, text: "The president declared a national emergency because the servers went down...", category: "brainrot" },
  { id: 1027, text: "You entered a cooking competition, but your only ingredient is existential dread...", category: "brainrot" },
  { id: 1028, text: "Write an epic fantasy battle, but the weapons are oversized foam fingers...", category: "brainrot" },
  { id: 1029, text: "You woke up as an NPC in a game, and the main character just quicksaved next to you...", category: "brainrot" },
  { id: 1030, text: "The prophecy foretold of a hero who could read an entire terms and conditions agreement...", category: "brainrot" },
];

const CATEGORIES = [
  { id: "all", label: "All Categories", icon: "🎲" },
  { id: "mystery", label: "Mystery & Thriller", icon: "🔍" },
  { id: "humor", label: "Humor & Absurd", icon: "😂" },
  { id: "scifi", label: "Sci-Fi & Fantasy", icon: "🚀" },
  { id: "romance", label: "Romance & Drama", icon: "💕" },
  { id: "horror", label: "Horror & Creepy", icon: "👻" },
  { id: "slice", label: "Slice of Life", icon: "☕" },
  { id: "philosophy", label: "Philosophy & Deep", icon: "🧠" },
  { id: "adventure", label: "Adventure", icon: "🗺️" },
  { id: "historical", label: "Historical", icon: "📜" },
  { id: "meta", label: "Meta & Writing", icon: "✍️" },
];

export function getRandomPrompt(category = "all") {
  // 5% chance of Brainrot override
  const wantsBrainrot = Math.random() < 0.05;

  if (wantsBrainrot) {
    const brainrotPrompts = PROMPTS.filter(p => p.category === "brainrot");
    return brainrotPrompts[Math.floor(Math.random() * brainrotPrompts.length)];
  }

  const normalPrompts = PROMPTS.filter(p => p.category !== "brainrot");
  const filtered = category === "all" 
    ? normalPrompts 
    : normalPrompts.filter(p => p.category === category);
    
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getCategoryLabel(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.label : categoryId;
}

export { PROMPTS, CATEGORIES };
