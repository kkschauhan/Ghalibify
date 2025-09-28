// Ghalibify frontend logic

/*
 * This file has been rewritten to fetch a relevant Ghalib couplet from a
 * remote language model instead of only selecting from a static list. It
 * preserves the original matching logic as a fallback in case the API is
 * unreachable or returns an error. The API is implemented in
 * `api/generateCouplet.js` and calls a free-tier Groq model to generate a
 * suitable couplet in Urdu script with transliteration, English translation
 * and a theme. See the README for instructions on configuring your API key.
 */

// Static fallback database of authentic Ghalib's couplets with themes and keywords.
const ghalibCouplets = [
    {
        hindi: "हज़ारों ख़्वाहिशें ऐसी कि हर ख़्वाहिश पे दम निकले\nबहुत निकले मेरे अरमान लेकिन फिर भी कम निकले",
        transliteration: "Hazaaron khwahishen aisi ke har khwahish pe dam nikle\nBahut nikle mere armaan lekin phir bhi kam nikle",
        translation: "Thousands of desires, each one so intense that I could die for it\nMany of my wishes were fulfilled, yet still they seem few",
        theme: "Desire & Longing",
        keywords: ["desire", "wish", "longing", "want", "hope", "dream", "aspiration", "yearning", "craving"],
        authenticity: "authentic"
    },
    {
        hindi: "दिल से निकलेगी न मर कर भी वफ़ा की उम्मीद\nनहीं है जिस में कुछ भी तो क्या है",
        transliteration: "Dil se nikle gi na mar kar bhi wafa ki ummeed\nNahi hai jis mein kuch bhi to kya hai",
        translation: "Even after death, the hope of faithfulness won't leave my heart\nWhat is it that has nothing in it?",
        theme: "Love & Faithfulness",
        keywords: ["love", "faithfulness", "loyalty", "devotion", "heart", "romance", "relationship", "commitment", "trust"],
        authenticity: "authentic"
    },
    {
        hindi: "इश्क़ ने ग़ालिब निकम्मा कर दिया\nवर्ना हम भी आदमी थे काम के",
        transliteration: "Ishq ne Ghalib nikamma kar diya\nWarna hum bhi aadmi the kaam ke",
        translation: "Love has made Ghalib worthless\nOtherwise I too was a capable person",
        theme: "Love's Impact",
        keywords: ["love", "worthless", "capable", "transformation", "change", "impact", "effect", "influence"]
    },
    {
        hindi: "हम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को ग़ालिब ये ख़्याल अच्छा है",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Hope & Optimism",
        keywords: ["hope", "optimism", "happiness", "paradise", "heaven", "joy", "cheer", "positivity", "comfort"],
        authenticity: "authentic"
    },
    {
        hindi: "बाज़ीचा-ए-अत्फाल है दुनिया मेरे आगे\nहोता है शब-ओ-रोज़ तमाशा मेरे आगे",
        transliteration: "Bazicha-e-atfal hai duniya mere aage\nHota hai shab-o-roz tamasha mere aage",
        translation: "The world is a playground before me\nDay and night, it performs a spectacle before me",
        theme: "Philosophy of Life",
        keywords: ["life", "world", "philosophy", "existence", "playground", "spectacle", "reality", "perception"],
        authenticity: "authentic"
    },
    {
        hindi: "रगों में दौड़ते फिरने के हम नहीं क़ायल\nजब आंख ही से न टपका तो फिर लहू क्या है",
        transliteration: "Ragon mein daudte firne ke hum nahi qayal\nJab aankh hi se na tapka to phir lahu kya hai",
        translation: "We don't believe in blood running through veins\nIf it doesn't drop from the eye, what is blood",
        theme: "Emotional Expression",
        keywords: ["blood", "veins", "tears", "emotion", "expression", "feeling", "heart", "suffering"],
        authenticity: "authentic"
    },
    {
        hindi: "दिल-ए-नादान तुझे हुआ क्या है\nआख़िर इस दर्द की दवा क्या है",
        transliteration: "Dil-e-nadan tujhe hua kya hai\nAakhir is dard ki dava kya hai",
        translation: "O innocent heart, what has happened to you\nWhat is the cure for this pain, tell me",
        theme: "Heart and Pain",
        keywords: ["heart", "pain", "innocence", "cure", "suffering", "emotional", "healing", "distress"],
        authenticity: "authentic"
    },
    {
        hindi: "हम को उनसे वफ़ा की है उम्मीद\nजो नहीं जानते वफ़ा क्या है",
        transliteration: "Hum ko unse wafa ki hai ummeed\nJo nahi jaante wafa kya hai",
        translation: "We expect loyalty from those\nWho don't know what loyalty is",
        theme: "Loyalty and Expectation",
        keywords: ["loyalty", "expectation", "trust", "betrayal", "faith", "hope", "disappointment", "naivety"],
        authenticity: "authentic"
    },
    {
        hindi: "आह को चाहिए एक उम्र असर होने तक\nकौन जीता है तेरी ज़ुल्फ़ के सर होने तक",
        transliteration: "Aah ko chahiye ek umr asar hone tak\nKaun jeeta hai teri zulf ke sar hone tak",
        translation: "A sigh needs a lifetime to have effect\nWho lives until your tresses reach their end",
        theme: "Love and Patience",
        keywords: ["sigh", "lifetime", "effect", "tresses", "patience", "love", "time", "beauty"],
        authenticity: "authentic"
    },
    {
        hindi: "हमने देखा है उन आंखों का माहिर-ए-हुस्न\nजो सुबह-ओ-शाम नज़र आते हैं ख़्वाब में",
        transliteration: "Humne dekha hai un aankhon ka mahir-e-husn\nJo subah-o-sham nazar aate hain khwab mein",
        translation: "We have seen the beauty expert of those eyes\nWho appear morning and evening in dreams",
        theme: "Beauty and Dreams",
        keywords: ["beauty", "eyes", "dreams", "morning", "evening", "vision", "love", "longing"],
        authenticity: "authentic"
    },
    {
        hindi: "ये मसाइल-ए-तसव्वुफ़, ये तिरा बयान 'ग़ालिब'\nतुझे हम वली समझते जो न बादाख़्वार होता",
        transliteration: "Ye masail-e-tasawwuf, ye tera bayan 'Ghalib'\nTujhe hum wali samajhte jo na badakhwar hota",
        translation: "These mystical problems, this your expression Ghalib\nWe would consider you a saint if you weren't a wine-drinker",
        theme: "Mysticism and Wine",
        keywords: ["mysticism", "expression", "saint", "wine", "spirituality", "paradox", "philosophy", "religion"],
        authenticity: "authentic"
    },
    {
        hindi: "हम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को 'ग़ालिब' ये ख़याल अच्छा है",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko 'Ghalib' ye khayal achha hai",
        translation: "We know the reality of paradise\nBut to keep the heart happy, Ghalib, this thought is good",
        theme: "Hope and Reality",
        keywords: ["paradise", "reality", "hope", "heart", "happiness", "illusion", "comfort", "optimism"],
        authenticity: "authentic"
    },
    {
        hindi: "मोहब्बत में नहीं है फ़र्क़ जीने और मरने का\nउसी को देख कर जीते हैं जिस काफ़िर पे दम निकले",
        transliteration: "Mohabbat mein nahi hai farq jeene aur marne ka\nUsi ko dekh kar jeete hain jis kaafir pe dam nikle",
        translation: "In love, there's no difference between living and dying\nWe live by looking at the same infidel for whom we die",
        theme: "Love and Sacrifice",
        keywords: ["love", "living", "dying", "sacrifice", "devotion", "passion", "infidel", "paradox"],
        authenticity: "authentic"
    },
    {
        hindi: "न था कुछ तो ख़ुदा था, कुछ न होता तो ख़ुदा होता\nडुबोया मुझ को होने ने, न होता मैं तो क्या होता",
        transliteration: "Na tha kuch to khuda tha, kuch na hota to khuda hota\nDuboya mujh ko hone ne, na hota main to kya hota",
        translation: "When there was nothing, God was there; if nothing existed, God would exist\nMy existence has drowned me; if I didn't exist, what would I be?",
        theme: "Existence & Philosophy",
        keywords: ["existence", "philosophy", "god", "being", "nothingness", "reality", "meaning", "purpose", "life"]
    },
    {
        hindi: "बस्के दुश्वार है हर काम का आसाँ होना\nआदमी को भी मयस्सर नहीं इंसाँ होना",
        transliteration: "Baske dushwar hai har kaam ka aasan hona\nAadmi ko bhi mayassar nahi insaan hona",
        translation: "It is difficult for every task to become easy\nEven becoming human is not easy for a person",
        theme: "Life's Challenges",
        keywords: ["difficult", "challenge", "struggle", "hard", "easy", "human", "life", "effort", "perseverance"]
    },
    {
        hindi: "इश्क़ से तबीयत ने ज़हर का काम लिया\nदवा को भी खाया तो ज़हर का काम लिया",
        transliteration: "Ishq se tabiyat ne zeher ka kaam liya\nDawa ko bhi khaya to zeher ka kaam liya",
        translation: "Love made my nature take poison\nEven when I took medicine, it acted like poison",
        theme: "Love's Pain",
        keywords: ["love", "pain", "poison", "medicine", "hurt", "suffering", "heartbreak", "agony", "torment"]
    },
    {
        hindi: "हम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को ग़ालिब ये ख़्याल अच्छा है",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Contentment",
        keywords: ["contentment", "satisfaction", "peace", "happiness", "paradise", "bliss", "serenity", "tranquility"]
    },
    {
        hindi: "इश्क़ में ग़म ख़्वार होना\nइश्क़ में ग़म ख़्वार होना",
        transliteration: "Ishq mein gham khwar hona\nIshq mein gham khwar hona",
        translation: "To be a bearer of sorrows in love\nTo be a bearer of sorrows in love",
        theme: "Love's Sorrow",
        keywords: ["love", "sorrow", "grief", "sadness", "melancholy", "heartache", "despair", "woe", "anguish"]
    },
    {
        hindi: "हम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को ग़ालिब ये ख़्याल अच्छा है",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Wisdom & Acceptance",
        keywords: ["wisdom", "acceptance", "reality", "truth", "knowledge", "understanding", "insight", "enlightenment"],
        authenticity: "authentic"
    },
    {
        hindi: "बाज़ीचा-ए-अत्फ़ाल है दुनिया मेरे आगे\nहोता है शब-ओ-रोज़ तमाशा मेरे आगे",
        transliteration: "Bazicha-e-atfal hai duniya mere aage\nHota hai shab-o-roz tamasha mere aage",
        translation: "The world is a playground of children before me\nDay and night, a spectacle unfolds before me",
        theme: "Philosophy & Observation",
        keywords: ["philosophy", "world", "observation", "life", "spectacle", "playground", "children", "reality"],
        authenticity: "authentic"
    },
    {
        hindi: "रगों में दौड़ते फिरने के हम नहीं क़ायल\nजब आंख ही से न टपका तो फिर लहू क्या है",
        transliteration: "Ragon mein daudte firne ke hum nahi qayal\nJab aankh hi se na tapka to phir lahu kya hai",
        translation: "We don't believe in blood running through veins\nIf it doesn't drip from the eye, what is blood?",
        theme: "Emotional Depth",
        keywords: ["emotion", "blood", "tears", "pain", "suffering", "heart", "feeling", "depth"],
        authenticity: "authentic"
    },
    {
        hindi: "कहते हैं कि ग़ालिब का है अंदाज़-ए-बयां और\nसब कहते हैं कि हां, सब कहते हैं कि हां",
        transliteration: "Kehte hain ki Ghalib ka hai andaz-e-bayan aur\nSab kehte hain ki haan, sab kehte hain ki haan",
        translation: "They say Ghalib has a unique style of expression\nEveryone says yes, everyone says yes",
        theme: "Recognition & Style",
        keywords: ["style", "recognition", "expression", "uniqueness", "talent", "art", "poetry", "fame"],
        authenticity: "authentic"
    },
    {
        hindi: "मोहब्बत में नहीं है फ़र्क़ जीने और मरने का\nउसी को देख कर जीते हैं जिस काफ़िर पे दम निकले",
        transliteration: "Mohabbat mein nahi hai farq jeene aur marne ka\nUsi ko dekh kar jeete hain jis kafir pe dam nikle",
        translation: "In love, there's no difference between living and dying\nWe live by looking at the one for whom we could die",
        theme: "Love's Paradox",
        keywords: ["love", "paradox", "living", "dying", "devotion", "sacrifice", "passion", "intensity"],
        authenticity: "authentic"
    },
    {
        hindi: "न था कुछ तो ख़ुदा था, कुछ न होता तो ख़ुदा होता\nडुबोया मुझ को होने ने, न होता मैं तो क्या होता",
        transliteration: "Na tha kuch to khuda tha, kuch na hota to khuda hota\nDuboya mujh ko hone ne, na hota main to kya hota",
        translation: "When there was nothing, God was there; if nothing existed, God would exist\nMy existence has drowned me; if I didn't exist, what would I be?",
        theme: "Existence & Philosophy",
        keywords: ["existence", "philosophy", "god", "being", "nothingness", "reality", "meaning", "purpose", "life"],
        authenticity: "authentic"
    },
    {
        hindi: "हम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को ग़ालिब ये ख़्याल अच्छा है",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Hope & Optimism",
        keywords: ["hope", "optimism", "happiness", "paradise", "heaven", "joy", "cheer", "positivity", "comfort"],
        authenticity: "authentic"
    },
    {
        hindi: "इश्क़ से तबीयत ने ज़हर का काम लिया\nदवा को भी खाया तो ज़हर का काम लिया",
        transliteration: "Ishq se tabiyat ne zeher ka kaam liya\nDawa ko bhi khaya to zeher ka kaam liya",
        translation: "Love made my nature take poison\nEven when I took medicine, it acted like poison",
        theme: "Love's Pain",
        keywords: ["love", "pain", "poison", "medicine", "hurt", "suffering", "heartbreak", "agony", "torment"],
        authenticity: "authentic"
    },
    {
        hindi: "दिल से निकलेगी न मर कर भी वफ़ा की उम्मीद\nनहीं है जिस में कुछ भी तो क्या है",
        transliteration: "Dil se nikle gi na mar kar bhi wafa ki ummeed\nNahi hai jis mein kuch bhi to kya hai",
        translation: "Even after death, the hope of faithfulness won't leave my heart\nWhat is it that has nothing in it?",
        theme: "Love & Faithfulness",
        keywords: ["love", "faithfulness", "loyalty", "devotion", "heart", "romance", "relationship", "commitment", "trust"],
        authenticity: "authentic"
    },
    {
        hindi: "हमने माना कि तग़ाफुल न करोगे लेकिन\nख़ाक हो जाएंगे हम तुमको ख़बर होने तक\nहम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को 'ग़ालिब' ये ख़याल अच्छा है",
        transliteration: "Humne maana ki taghaful na karoge lekin\nKhaak ho jaayenge hum tumko khabar hone tak\nHum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko 'Ghalib' ye khayal achha hai",
        translation: "We believed you wouldn't be indifferent\nBut we'll turn to dust before you get the news\nWe know the reality of paradise\nBut to keep the heart happy, Ghalib, this thought is good",
        theme: "Indifference, Time & Hope",
        keywords: ["indifference", "time", "dust", "news", "waiting", "patience", "paradise", "hope", "reality"],
        authenticity: "authentic"
    },
    {
        hindi: "ये न थी हमारी क़िस्मत कि विसाल-ए-यार होता\nअगर और जीते रहते यही इंतज़ार होता\nहम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को 'ग़ालिब' ये ख़याल अच्छा है",
        transliteration: "Ye na thi hamari qismat ki visal-e-yaar hota\nAgar aur jeete rahte yahi intezaar hota\nHum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko 'Ghalib' ye khayal achha hai",
        translation: "It wasn't our fate to meet the beloved\nIf we lived longer, it would be the same waiting\nWe know the reality of paradise\nBut to keep the heart happy, Ghalib, this thought is good",
        theme: "Fate, Longing & Hope",
        keywords: ["fate", "beloved", "meeting", "waiting", "longing", "destiny", "paradise", "hope", "reality"],
        authenticity: "authentic"
    },
    {
        hindi: "कहते हैं कि ग़ालिब का है अन्दाज़-ए-बयां और\nसब का कहना यह ग़ालिब का दीवान क्या है\nहम को मालूम है जन्नत की हक़ीक़त लेकिन\nदिल के ख़ुश रखने को 'ग़ालिब' ये ख़याल अच्छा है",
        transliteration: "Kehte hain ki Ghalib ka hai andaaz-e-bayan aur\nSab ka kehna yah Ghalib ka deewan kya hai\nHum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko 'Ghalib' ye khayal achha hai",
        translation: "They say Ghalib has a unique style of expression\nEveryone says this, but what is Ghalib's Diwan\nWe know the reality of paradise\nBut to keep the heart happy, Ghalib, this thought is good",
        theme: "Poetry, Recognition & Hope",
        keywords: ["poetry", "style", "expression", "recognition", "fame", "literature", "paradise", "hope", "reality"],
        authenticity: "authentic"
    },
    {
        hindi: "इमान मुझे रोके है जो खींचे है मुझे कुफ़्र\nकाबा मेरे पीछे है कलीसा मेरे आगे",
        transliteration: "Imaan mujhe roke hai jo khinche hai mujhe kufr\nKaaba mere peeche hai kaleesa mere aage",
        translation: "Faith holds me back while disbelief pulls me\nKaaba is behind me, church is ahead of me",
        theme: "Faith & Doubt",
        keywords: ["faith", "doubt", "religion", "belief", "disbelief", "spirituality", "conflict", "struggle"],
        authenticity: "authentic"
    },
    {
        hindi: "हर एक बात पे कहते हो तुम के तू क्या है\nतुम्ही कहो के ये अंदाज़-ए-गुफ्तगू क्या है",
        transliteration: "Har ek baat pe kehte ho tum ke tu kya hai\nTumhi kaho ke yeh andaaz-e-guftagu kya hai",
        translation: "You ask 'what are you' at every word\nYou tell me what this style of conversation is",
        theme: "Communication & Identity",
        keywords: ["communication", "identity", "conversation", "style", "questioning", "self", "dialogue"],
        authenticity: "authentic"
    },
    {
        hindi: "उनको देख कर जीते हैं सभी\nजिसके बगैर जीना हो मुश्किल, वो शख्स तुम हो",
        transliteration: "Unko dekh kar jeete hain sabhi\nJiske baagair jeena ho mushkil, woh shaks tum ho",
        translation: "Everyone lives by looking at them\nThe person without whom living is difficult, that's you",
        theme: "Love & Dependence",
        keywords: ["love", "dependence", "living", "difficult", "person", "relationship", "necessity"],
        authenticity: "authentic"
    },
    {
        hindi: "वो अफ़साना जिसे अंजाम तक लाना न हो मुमकिन\nउससे एक खूबसूरत शुरुआत देते हैं लोग",
        transliteration: "Woh afsana jise anjaam tak laana na ho mumkin\nUsse ek khoobsurat shuruaat dete hain log",
        translation: "That story which cannot be brought to conclusion\nPeople give it a beautiful beginning",
        theme: "Stories & Beginnings",
        keywords: ["story", "conclusion", "beginning", "beautiful", "impossible", "people", "narrative"],
        authenticity: "authentic"
    }
];

/**
 * Attempts to fetch a Ghalib couplet from the serverless API. Returns
 * `null` if the request fails for any reason. The API expects a POST
 * request with a JSON body containing the user's scenario. On success
 * it returns an object with `urdu`, `transliteration`, `translation`
 * and `theme` keys.
 *
 * @param {string} scenario - The user provided scenario or feeling.
 * @returns {Promise<object|null>} - The couplet object or null on failure.
 */
async function callGenerateCoupletAPI(scenario) {
    try {
        const response = await fetch('/api/generateCouplet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario })
        });

        if (!response.ok) {
            console.error('API responded with status', response.status);
            return null;
        }

        const data = await response.json();

        // Basic validation of returned fields. We no longer require an
        // "urdu" field because the UI does not display Urdu script. Only
        // transliteration and translation are mandatory. Theme is optional.
        if (!data || !data.transliteration || !data.translation) {
            console.error('API response missing expected fields', data);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error calling generateCouplet API:', error);
        return null;
    }
}

/**
 * Fallback matching algorithm used when the LLM request fails. It searches
 * through the local ghalibCouplets array for the best match based on
 * keywords, themes and some common emotional words. This logic replicates
 * the original MVP behaviour.
 *
 * @param {string} scenario - The user provided scenario or feeling.
 * @returns {object} - The best matching couplet from the static list.
 */
function findBestCoupletFallback(scenario) {
    const scenarioLower = scenario.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    ghalibCouplets.forEach(couplet => {
        let score = 0;

        // Prioritize authentic couplets
        if (couplet.authenticity === 'authentic') {
            score += 3; // High bonus for authentic couplets
        }

        // Direct keyword matches
        couplet.keywords.forEach(keyword => {
            if (scenarioLower.includes(keyword)) {
                score += 2;
            }
        });

        // Theme word relevance
        const themeKeywords = couplet.theme.toLowerCase().split(/[&\s]+/);
        themeKeywords.forEach(themeWord => {
            if (themeWord.length > 2 && scenarioLower.includes(themeWord)) {
                score += 1;
            }
        });

        // Emotional context words
        const emotionalWords = ['happy', 'sad', 'love', 'heart', 'pain', 'joy', 'sorrow', 'hope', 'fear', 'anger'];
        emotionalWords.forEach(emotion => {
            if (scenarioLower.includes(emotion)) {
                score += 0.5;
            }
        });

        if (score > bestScore) {
            bestScore = score;
            bestMatch = couplet;
        }
    });

    // No match found, pick a random authentic couplet first, then any couplet
    if (bestScore === 0) {
        const authenticCouplets = ghalibCouplets.filter(c => c.authenticity === 'authentic');
        if (authenticCouplets.length > 0) {
            return authenticCouplets[Math.floor(Math.random() * authenticCouplets.length)];
        }
        return ghalibCouplets[Math.floor(Math.random() * ghalibCouplets.length)];
    }

    return bestMatch;
}

/**
 * Updates the UI to display the provided couplet. Assumes that the
 * corresponding DOM elements exist. It sets the Urdu, transliteration,
 * translation and theme text content. If an element is missing the
 * function logs an error to the console.
 *
 * @param {object} couplet - A couplet object containing `urdu`,
 *   `transliteration`, `translation` and optionally `theme`.
 */
function displayCouplet(couplet) {
    const hindiElement = document.getElementById('couplet-hindi');
    const transliterationElement = document.getElementById('couplet-transliteration');
    const translationElement = document.getElementById('couplet-translation');
    const themeElement = document.getElementById('couplet-theme');

    // Set Hindi script if available
    if (hindiElement) {
        const hindiText = (couplet.hindi || '').replace(/\\n/g, '\n');
        hindiElement.textContent = hindiText;
        hindiElement.style.display = hindiText ? 'block' : 'none';
    } else {
        console.error('Hindi element not found!');
    }

    // Set transliteration if available
    if (transliterationElement) {
        const transliterationText = (couplet.transliteration || '').replace(/\\n/g, '\n');
        transliterationElement.textContent = transliterationText;
    } else {
        console.error('Transliteration element not found!');
    }

    // Set translation if available
    if (translationElement) {
        const translationText = (couplet.translation || '').replace(/\\n/g, '\n');
        translationElement.textContent = translationText;
    } else {
        console.error('Translation element not found!');
    }

    // Set theme; hide element if none provided
    if (themeElement) {
        themeElement.textContent = couplet.theme || '';
        themeElement.style.display = couplet.theme ? 'inline-block' : 'none';
    }
}

// Loading, results and form reset helpers
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
}

function resetForm() {
    document.getElementById('scenario-input').value = '';
    document.getElementById('results-section').style.display = 'none';
}

// Set up event listeners once DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const findButton = document.getElementById('find-couplet');
    const findAnotherButton = document.getElementById('find-another');
    const scenarioInput = document.getElementById('scenario-input');

    if (!findButton || !findAnotherButton || !scenarioInput) {
        console.error('Required elements not found!');
        return;
    }

    findButton.addEventListener('click', async function() {
        const scenario = scenarioInput.value.trim();
        if (!scenario) {
            alert('Please describe your scenario or feeling first!');
            return;
        }

        showLoading();

        // Give the UI time to update the loading state
        setTimeout(async () => {
            // Try the LLM API first
            let couplet = await callGenerateCoupletAPI(scenario);

            // Fall back to local matching if API failed
            if (!couplet) {
                couplet = findBestCoupletFallback(scenario);
            }

            displayCouplet(couplet);
            hideLoading();
            showResults();
        }, 200);
    });

    findAnotherButton.addEventListener('click', function() {
        resetForm();
    });

    // Allow Ctrl+Enter to trigger search
    scenarioInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            findButton.click();
        }
    });
});

// Rotate sample placeholder scenarios for inspiration
const sampleScenarios = [
    "I'm feeling lost in love",
    "I just achieved something great",
    "I'm dealing with heartbreak",
    "I miss someone special",
    "I'm questioning my purpose in life",
    "I'm feeling grateful and content",
    "I'm struggling with life's challenges",
    "I'm experiencing deep sorrow"
];

let currentPlaceholder = 0;
setInterval(() => {
    const input = document.getElementById('scenario-input');
    if (input && !input.value) {
        currentPlaceholder = (currentPlaceholder + 1) % sampleScenarios.length;
        input.placeholder = `e.g., ${sampleScenarios[currentPlaceholder]}...`;
    }
}, 3000);