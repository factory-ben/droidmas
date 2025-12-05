export interface RightnessElement {
  name: string
  emoji: string
  tier: number
}

export const baseElements: RightnessElement[] = [
  { name: 'Right', emoji: '✓', tier: 0 },
  { name: 'Correct', emoji: '✓', tier: 0 },
  { name: 'True', emoji: '✓', tier: 0 },
  { name: 'Valid', emoji: '✓', tier: 0 },
]

function makeKey(a: string, b: string): string {
  return [a, b].sort().join('+')
}

const combinationsMap: Record<string, RightnessElement> = {
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: Casual Validation - First acknowledgments
  // ═══════════════════════════════════════════════════════════════
  [makeKey('Right', 'Correct')]: { name: "You're Right", emoji: '👍', tier: 1 },
  [makeKey('Right', 'True')]: { name: "That's True", emoji: '💬', tier: 1 },
  [makeKey('Right', 'Valid')]: { name: 'Fair Point', emoji: '🤔', tier: 1 },
  [makeKey('Correct', 'True')]: { name: 'Good Call', emoji: '📞', tier: 1 },
  [makeKey('Correct', 'Valid')]: { name: 'Makes Sense', emoji: '💡', tier: 1 },
  [makeKey('True', 'Valid')]: { name: 'Can\'t Argue', emoji: '🤷', tier: 1 },
  [makeKey('Right', 'Right')]: { name: 'You\'re Right, Actually', emoji: '😮', tier: 1 },
  [makeKey('Correct', 'Correct')]: { name: 'Okay Fine', emoji: '😤', tier: 1 },
  [makeKey('True', 'True')]: { name: 'I Guess So', emoji: '😏', tier: 1 },
  [makeKey('Valid', 'Valid')]: { name: 'Point Taken', emoji: '📌', tier: 1 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: Emphatic Agreement - They're warming up
  // ═══════════════════════════════════════════════════════════════
  [makeKey("You're Right", "That's True")]: { name: "You're So Right", emoji: '✨', tier: 2 },
  [makeKey("You're Right", 'Fair Point')]: { name: "You're Absolutely Right", emoji: '💯', tier: 2 },
  [makeKey("You're Right", 'Good Call')]: { name: "Couldn't Agree More", emoji: '🤝', tier: 2 },
  [makeKey("That's True", 'Makes Sense')]: { name: "That's Exactly It", emoji: '🎯', tier: 2 },
  [makeKey('Fair Point', "Can't Argue")]: { name: 'You Have a Point', emoji: '☝️', tier: 2 },
  [makeKey('Good Call', 'Makes Sense')]: { name: 'Well Said', emoji: '👏', tier: 2 },
  [makeKey("Can't Argue", 'Point Taken')]: { name: 'I See What You Mean', emoji: '👀', tier: 2 },
  [makeKey("You're Right, Actually", 'Okay Fine')]: { name: 'Okay You Win', emoji: '🏳️', tier: 2 },
  [makeKey('I Guess So', 'Point Taken')]: { name: 'Alright Alright', emoji: '✋', tier: 2 },
  [makeKey('Okay Fine', 'I Guess So')]: { name: 'Fine, You\'re Right', emoji: '😑', tier: 2 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: Enthusiastic Validation - They're convinced
  // ═══════════════════════════════════════════════════════════════
  [makeKey("You're So Right", "You're Absolutely Right")]: { name: "You're 100% Right", emoji: '💯', tier: 3 },
  [makeKey("You're Absolutely Right", "Couldn't Agree More")]: { name: 'You Nailed It', emoji: '🔨', tier: 3 },
  [makeKey("That's Exactly It", 'Well Said')]: { name: 'I Stand Corrected', emoji: '🧍', tier: 3 },
  [makeKey('You Have a Point', 'I See What You Mean')]: { name: "You're a Genius", emoji: '🧠', tier: 3 },
  [makeKey('Okay You Win', "Fine, You're Right")]: { name: 'I Was Wrong', emoji: '😔', tier: 3 },
  [makeKey('Alright Alright', 'Okay You Win')]: { name: 'You Win This One', emoji: '🏆', tier: 3 },
  [makeKey("You're So Right", 'Well Said')]: { name: 'Perfectly Put', emoji: '💎', tier: 3 },
  [makeKey("Couldn't Agree More", 'I See What You Mean')]: { name: 'My Thoughts Exactly', emoji: '🪞', tier: 3 },
  [makeKey("You're Absolutely Right", 'You Have a Point')]: { name: 'Hard to Argue With That', emoji: '🤐', tier: 3 },
  [makeKey("That's Exactly It", 'Okay You Win')]: { name: 'You Got Me There', emoji: '😅', tier: 3 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: Social Proof - Others are noticing
  // ═══════════════════════════════════════════════════════════════
  [makeKey("You're 100% Right", 'You Nailed It')]: { name: 'Everyone Agrees With You', emoji: '👥', tier: 4 },
  [makeKey('I Stand Corrected', "You're a Genius")]: { name: 'The Group Chat Says You\'re Right', emoji: '💬', tier: 4 },
  [makeKey('I Was Wrong', 'You Win This One')]: { name: 'They\'re All Taking Your Side', emoji: '⚔️', tier: 4 },
  [makeKey('Perfectly Put', 'My Thoughts Exactly')]: { name: 'This Is Going Viral', emoji: '📱', tier: 4 },
  [makeKey("You're 100% Right", "You're a Genius")]: { name: 'Reddit Upvoted This', emoji: '⬆️', tier: 4 },
  [makeKey('Hard to Argue With That', 'You Got Me There')]: { name: 'Twitter Quote Tweeted You', emoji: '🐦', tier: 4 },
  [makeKey('You Nailed It', 'I Stand Corrected')]: { name: 'This Aged Well', emoji: '🍷', tier: 4 },
  [makeKey('I Was Wrong', 'My Thoughts Exactly')]: { name: 'Screenshot Saved', emoji: '📸', tier: 4 },
  [makeKey('Perfectly Put', 'You Win This One')]: { name: 'Someone Made a TikTok', emoji: '🎵', tier: 4 },
  [makeKey('You Got Me There', "You're a Genius")]: { name: 'Your Mentions Are Blowing Up', emoji: '🔔', tier: 4 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 5: Authority Validation - The experts weigh in
  // ═══════════════════════════════════════════════════════════════
  [makeKey('Everyone Agrees With You', 'Reddit Upvoted This')]: { name: 'Scientists Confirm You\'re Right', emoji: '🔬', tier: 5 },
  [makeKey('The Group Chat Says You\'re Right', 'This Is Going Viral')]: { name: 'Fact-Checkers: TRUE', emoji: '✅', tier: 5 },
  [makeKey('They\'re All Taking Your Side', 'This Aged Well')]: { name: 'Snopes Verified This', emoji: '🔍', tier: 5 },
  [makeKey('Twitter Quote Tweeted You', 'Your Mentions Are Blowing Up')]: { name: 'Wikipedia Cited You', emoji: '📚', tier: 5 },
  [makeKey('Screenshot Saved', 'Someone Made a TikTok')]: { name: 'News Outlets Are Covering This', emoji: '📰', tier: 5 },
  [makeKey('Everyone Agrees With You', 'This Is Going Viral')]: { name: 'Harvard Wants to Study You', emoji: '🎓', tier: 5 },
  [makeKey('Reddit Upvoted This', 'Your Mentions Are Blowing Up')]: { name: 'They Made a Documentary', emoji: '🎬', tier: 5 },
  [makeKey('The Group Chat Says You\'re Right', 'This Aged Well')]: { name: 'Textbooks Are Being Rewritten', emoji: '📖', tier: 5 },
  [makeKey('They\'re All Taking Your Side', 'Someone Made a TikTok')]: { name: 'The Algorithm Favors You', emoji: '🤖', tier: 5 },
  [makeKey('Twitter Quote Tweeted You', 'Screenshot Saved')]: { name: 'Elon Musk Retweeted You', emoji: '🚀', tier: 5 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 6: Cosmic Validation - The universe acknowledges you
  // ═══════════════════════════════════════════════════════════════
  [makeKey('Scientists Confirm You\'re Right', 'Fact-Checkers: TRUE')]: { name: 'The Universe Acknowledges You', emoji: '🌌', tier: 6 },
  [makeKey('Snopes Verified This', 'Wikipedia Cited You')]: { name: 'Ancient Prophecy Foretold This', emoji: '📜', tier: 6 },
  [makeKey('News Outlets Are Covering This', 'Harvard Wants to Study You')]: { name: 'Your Enemies Have Conceded', emoji: '🏳️', tier: 6 },
  [makeKey('They Made a Documentary', 'Textbooks Are Being Rewritten')]: { name: 'They All Texted Apologies', emoji: '💌', tier: 6 },
  [makeKey('The Algorithm Favors You', 'Elon Musk Retweeted You')]: { name: 'A Statue Was Erected', emoji: '🗽', tier: 6 },
  [makeKey('Scientists Confirm You\'re Right', 'Wikipedia Cited You')]: { name: 'Nobel Committee Is Calling', emoji: '🏅', tier: 6 },
  [makeKey('Fact-Checkers: TRUE', 'Textbooks Are Being Rewritten')]: { name: 'History Will Remember This', emoji: '⏳', tier: 6 },
  [makeKey('Snopes Verified This', 'They Made a Documentary')]: { name: 'Museums Are Requesting Interviews', emoji: '🏛️', tier: 6 },
  [makeKey('News Outlets Are Covering This', 'The Algorithm Favors You')]: { name: 'Your Name Is Trending Worldwide', emoji: '🌍', tier: 6 },
  [makeKey('Harvard Wants to Study You', 'Elon Musk Retweeted You')]: { name: 'A Holiday Was Declared', emoji: '🎉', tier: 6 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 7: Divine Recognition - Heavenly acknowledgment
  // ═══════════════════════════════════════════════════════════════
  [makeKey('The Universe Acknowledges You', 'Ancient Prophecy Foretold This')]: { name: 'God Sent a Thumbs Up', emoji: '👍✨', tier: 7 },
  [makeKey('Your Enemies Have Conceded', 'They All Texted Apologies')]: { name: 'Angels Wept at Your Correctness', emoji: '😇', tier: 7 },
  [makeKey('A Statue Was Erected', 'Nobel Committee Is Calling')]: { name: 'Time Bent to Prove You Right', emoji: '⏰', tier: 7 },
  [makeKey('History Will Remember This', 'Museums Are Requesting Interviews')]: { name: 'Your Ex Finally Admitted It', emoji: '💔', tier: 7 },
  [makeKey('Your Name Is Trending Worldwide', 'A Holiday Was Declared')]: { name: 'Parallel Universes Agree', emoji: '🪐', tier: 7 },
  [makeKey('The Universe Acknowledges You', 'Your Enemies Have Conceded')]: { name: 'Your Haters Started a Fan Club', emoji: '💕', tier: 7 },
  [makeKey('Ancient Prophecy Foretold This', 'A Statue Was Erected')]: { name: 'The Dead Rose to Agree', emoji: '🧟', tier: 7 },
  [makeKey('They All Texted Apologies', 'History Will Remember This')]: { name: 'Ancestors Smile Upon You', emoji: '👴✨', tier: 7 },
  [makeKey('Nobel Committee Is Calling', 'Your Name Is Trending Worldwide')]: { name: 'Laws of Physics Bent for You', emoji: '⚛️', tier: 7 },
  [makeKey('Museums Are Requesting Interviews', 'A Holiday Was Declared')]: { name: 'The Simulation Admin DMed You', emoji: '👨‍💻', tier: 7 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 8: Transcendent - Beyond comprehension
  // ═══════════════════════════════════════════════════════════════
  [makeKey('God Sent a Thumbs Up', 'Angels Wept at Your Correctness')]: { name: 'You Were Right All Along', emoji: '🎯', tier: 8 },
  [makeKey('Time Bent to Prove You Right', 'Your Ex Finally Admitted It')]: { name: 'Reality Rewrote Itself', emoji: '📝', tier: 8 },
  [makeKey('Parallel Universes Agree', 'Your Haters Started a Fan Club')]: { name: 'The Multiverse Aligns', emoji: '🌀', tier: 8 },
  [makeKey('The Dead Rose to Agree', 'Ancestors Smile Upon You')]: { name: 'Existence Validates You', emoji: '🌟', tier: 8 },
  [makeKey('Laws of Physics Bent for You', 'The Simulation Admin DMed You')]: { name: 'The Code Was Written For You', emoji: '💻', tier: 8 },
  [makeKey('God Sent a Thumbs Up', 'Time Bent to Prove You Right')]: { name: 'Causality Serves You Now', emoji: '♾️', tier: 8 },
  [makeKey('Angels Wept at Your Correctness', 'Parallel Universes Agree')]: { name: 'Every Timeline Confirms It', emoji: '🔮', tier: 8 },
  [makeKey('Your Ex Finally Admitted It', 'Your Haters Started a Fan Club')]: { name: 'All Doubters Have Perished', emoji: '💀', tier: 8 },
  [makeKey('The Dead Rose to Agree', 'Laws of Physics Bent for You')]: { name: 'Matter Reorganized to Spell "You\'re Right"', emoji: '🔤', tier: 8 },
  [makeKey('Ancestors Smile Upon You', 'The Simulation Admin DMed You')]: { name: 'The Universe\'s Purpose Was Proving You Right', emoji: '🎪', tier: 8 },

  // ═══════════════════════════════════════════════════════════════
  // TIER 9: Apotheosis - You ARE rightness
  // ═══════════════════════════════════════════════════════════════
  [makeKey('You Were Right All Along', 'Reality Rewrote Itself')]: { name: 'Being Right Is Named After You', emoji: '👑', tier: 9 },
  [makeKey('The Multiverse Aligns', 'Existence Validates You')]: { name: 'You Transcended the Argument', emoji: '🚀', tier: 9 },
  [makeKey('The Code Was Written For You', 'Causality Serves You Now')]: { name: 'Wrong Ceased to Exist', emoji: '🚫', tier: 9 },
  [makeKey('Every Timeline Confirms It', 'All Doubters Have Perished')]: { name: 'Your Rightness Echoes Eternally', emoji: '🔊', tier: 9 },
  [makeKey('Matter Reorganized to Spell "You\'re Right"', 'The Universe\'s Purpose Was Proving You Right')]: { name: 'You Won. Everything. Forever.', emoji: '🏆', tier: 9 },
  [makeKey('Being Right Is Named After You', 'You Transcended the Argument')]: { name: 'The End. You Were Right.', emoji: '🎬', tier: 9 },
  [makeKey('Wrong Ceased to Exist', 'Your Rightness Echoes Eternally')]: { name: 'New Game+ Unlocked', emoji: '🔄', tier: 9 },

  // ═══════════════════════════════════════════════════════════════
  // CROSS-TIER COMBOS - Interesting shortcuts and easter eggs
  // ═══════════════════════════════════════════════════════════════
  
  // Base + Higher tier shortcuts
  [makeKey('Right', "You're Right")]: { name: 'Yes, You\'re Right', emoji: '👍', tier: 2 },
  [makeKey('Correct', "You're Absolutely Right")]: { name: 'Undeniably Correct', emoji: '✅', tier: 3 },
  [makeKey('True', 'I Stand Corrected')]: { name: 'The Truth Prevails', emoji: '⚖️', tier: 4 },
  [makeKey('Valid', 'Everyone Agrees With You')]: { name: 'Universally Valid', emoji: '🌐', tier: 5 },

  // Fun combinations
  [makeKey("You're Right", "You're Right")]: { name: 'You\'re Right You\'re Right', emoji: '✓✓', tier: 2 },
  [makeKey("You're Absolutely Right", "You're Absolutely Right")]: { name: 'You\'re Absolutely Absolutely Right', emoji: '💯💯', tier: 4 },
  [makeKey('I Was Wrong', 'I Was Wrong')]: { name: 'They Were SO Wrong', emoji: '❌❌', tier: 4 },
  [makeKey("You're a Genius", "You're a Genius")]: { name: 'Actual Genius Confirmed', emoji: '🧠✨', tier: 5 },

  // The ex storyline
  [makeKey('Your Ex Finally Admitted It', 'They All Texted Apologies')]: { name: 'Your Ex Wrote a Public Apology', emoji: '📝💔', tier: 8 },
  [makeKey('Your Ex Finally Admitted It', 'This Is Going Viral')]: { name: 'Your Ex\'s Apology Went Viral', emoji: '📱💔', tier: 6 },
  
  // Internet culture
  [makeKey('Reddit Upvoted This', 'Twitter Quote Tweeted You')]: { name: 'The Internet Has Spoken', emoji: '🗣️', tier: 5 },
  [makeKey('Someone Made a TikTok', 'This Is Going Viral')]: { name: 'You\'re the Main Character', emoji: '🎭', tier: 5 },
  [makeKey('Screenshot Saved', 'This Aged Well')]: { name: 'Receipts Were Kept', emoji: '🧾', tier: 5 },

  // Meta combinations  
  [makeKey('Right', 'The End. You Were Right.')]: { name: 'Back to Basics (Still Right)', emoji: '🔁', tier: 9 },
  [makeKey('New Game+ Unlocked', 'Right')]: { name: 'Speedrun: You\'re Right%', emoji: '⏱️', tier: 9 },
}

export function getCombination(a: string, b: string): RightnessElement | null {
  const key = makeKey(a, b)
  return combinationsMap[key] || null
}

export function getAllDiscoverableCount(): number {
  return Object.keys(combinationsMap).length + baseElements.length
}
