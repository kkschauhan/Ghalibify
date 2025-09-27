// Ghalib's Couplets Database with themes and keywords
const ghalibCouplets = [
    {
        urdu: "ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے",
        transliteration: "Hazaaron khwahishen aisi ke har khwahish pe dam nikle\nBahut nikle mere armaan lekin phir bhi kam nikle",
        translation: "Thousands of desires, each one so intense that I could die for it\nMany of my wishes were fulfilled, yet still they seem few",
        theme: "Desire & Longing",
        keywords: ["desire", "wish", "longing", "want", "hope", "dream", "aspiration", "yearning", "craving"]
    },
    {
        urdu: "دل سے نکلے گی نہ مر کر بھی وفا کی امید\nنہیں ہے جس میں کچھ بھی تو کیا ہے",
        transliteration: "Dil se nikle gi na mar kar bhi wafa ki ummeed\nNahi hai jis mein kuch bhi to kya hai",
        translation: "Even after death, the hope of faithfulness won't leave my heart\nWhat is it that has nothing in it?",
        theme: "Love & Faithfulness",
        keywords: ["love", "faithfulness", "loyalty", "devotion", "heart", "romance", "relationship", "commitment", "trust"]
    },
    {
        urdu: "عشق نے غالب نکما کر دیا\nورنہ ہم بھی آدمی تھے کام کے",
        transliteration: "Ishq ne Ghalib nikamma kar diya\nWarna hum bhi aadmi the kaam ke",
        translation: "Love has made Ghalib worthless\nOtherwise I too was a capable person",
        theme: "Love's Impact",
        keywords: ["love", "worthless", "capable", "transformation", "change", "impact", "effect", "influence"]
    },
    {
        urdu: "ہم کو معلوم ہے جنت کی حقیقت لیکن\nدل کے خوش رکھنے کو غالب یہ خیال اچھا ہے",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Hope & Optimism",
        keywords: ["hope", "optimism", "happiness", "paradise", "heaven", "joy", "cheer", "positivity", "comfort"]
    },
    {
        urdu: "نہ تھا کچھ تو خدا تھا، کچھ نہ ہوتا تو خدا ہوتا\nڈبویا مجھ کو ہونے نے، نہ ہوتا میں تو کیا ہوتا",
        transliteration: "Na tha kuch to khuda tha, kuch na hota to khuda hota\nDuboya mujh ko hone ne, na hota main to kya hota",
        translation: "When there was nothing, God was there; if nothing existed, God would exist\nMy existence has drowned me; if I didn't exist, what would I be?",
        theme: "Existence & Philosophy",
        keywords: ["existence", "philosophy", "god", "being", "nothingness", "reality", "meaning", "purpose", "life"]
    },
    {
        urdu: "بسکہ دشوار ہے ہر کام کا آساں ہونا\nآدمی کو بھی میسر نہیں انساں ہونا",
        transliteration: "Baske dushwar hai har kaam ka aasan hona\nAadmi ko bhi mayassar nahi insaan hona",
        translation: "It is difficult for every task to become easy\nEven becoming human is not easy for a person",
        theme: "Life's Challenges",
        keywords: ["difficult", "challenge", "struggle", "hard", "easy", "human", "life", "effort", "perseverance"]
    },
    {
        urdu: "عشق سے طبیعت نے زہر کا کام لیا\nدوا کو بھی کھایا تو زہر کا کام لیا",
        transliteration: "Ishq se tabiyat ne zeher ka kaam liya\nDawa ko bhi khaya to zeher ka kaam liya",
        translation: "Love made my nature take poison\nEven when I took medicine, it acted like poison",
        theme: "Love's Pain",
        keywords: ["love", "pain", "poison", "medicine", "hurt", "suffering", "heartbreak", "agony", "torment"]
    },
    {
        urdu: "ہم کو معلوم ہے جنت کی حقیقت لیکن\nدل کے خوش رکھنے کو غالب یہ خیال اچھا ہے",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Contentment",
        keywords: ["contentment", "satisfaction", "peace", "happiness", "paradise", "bliss", "serenity", "tranquility"]
    },
    {
        urdu: "عشق میں غم خوار ہونا\nعشق میں غم خوار ہونا",
        transliteration: "Ishq mein gham khwar hona\nIshq mein gham khwar hona",
        translation: "To be a bearer of sorrows in love\nTo be a bearer of sorrows in love",
        theme: "Love's Sorrow",
        keywords: ["love", "sorrow", "grief", "sadness", "melancholy", "heartache", "despair", "woe", "anguish"]
    },
    {
        urdu: "ہم کو معلوم ہے جنت کی حقیقت لیکن\nدل کے خوش رکھنے کو غالب یہ خیال اچھا ہے",
        transliteration: "Hum ko maloom hai jannat ki haqeeqat lekin\nDil ke khush rakhne ko Ghalib yeh khayal achha hai",
        translation: "We know the reality of paradise\nBut Ghalib, this thought is good to keep the heart happy",
        theme: "Wisdom & Acceptance",
        keywords: ["wisdom", "acceptance", "reality", "truth", "knowledge", "understanding", "insight", "enlightenment"]
    }
];

// Function to find the best matching couplet
function findBestCouplet(scenario) {
    const scenarioLower = scenario.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    ghalibCouplets.forEach(couplet => {
        let score = 0;
        
        // Check keyword matches
        couplet.keywords.forEach(keyword => {
            if (scenarioLower.includes(keyword)) {
                score += 2; // Higher weight for direct keyword matches
            }
        });

        // Check theme relevance (simplified matching)
        const themeKeywords = couplet.theme.toLowerCase().split(/[&\s]+/);
        themeKeywords.forEach(themeWord => {
            if (themeWord.length > 2 && scenarioLower.includes(themeWord)) {
                score += 1;
            }
        });

        // Check for emotional context words
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

    // If no good match found, return a random couplet
    if (bestScore === 0) {
        return ghalibCouplets[Math.floor(Math.random() * ghalibCouplets.length)];
    }

    return bestMatch;
}

// Function to display the couplet
function displayCouplet(couplet) {
    console.log('Displaying couplet:', couplet);
    
    const transliterationElement = document.getElementById('couplet-transliteration');
    const translationElement = document.getElementById('couplet-translation');
    const themeElement = document.getElementById('couplet-theme');
    
    console.log('Elements found:', {
        transliteration: !!transliterationElement,
        translation: !!translationElement,
        theme: !!themeElement
    });
    
    if (transliterationElement) {
        transliterationElement.textContent = couplet.transliteration;
        console.log('Set transliteration:', couplet.transliteration);
    } else {
        console.error('Transliteration element not found!');
    }
    
    if (translationElement) {
        translationElement.textContent = couplet.translation;
        console.log('Set translation:', couplet.translation);
    } else {
        console.error('Translation element not found!');
    }
    
    if (themeElement) {
        themeElement.textContent = couplet.theme;
        console.log('Set theme:', couplet.theme);
    } else {
        console.error('Theme element not found!');
    }
}

// Function to show loading animation
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
}

// Function to hide loading animation
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Function to show results
function showResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    } else {
        console.error('Results section not found!');
    }
}

// Function to reset the form
function resetForm() {
    document.getElementById('scenario-input').value = '';
    document.getElementById('results-section').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners...');
    
    const findButton = document.getElementById('find-couplet');
    const findAnotherButton = document.getElementById('find-another');
    const scenarioInput = document.getElementById('scenario-input');
    
    console.log('Elements found:', {
        findButton: !!findButton,
        findAnotherButton: !!findAnotherButton,
        scenarioInput: !!scenarioInput
    });
    
    if (!findButton || !findAnotherButton || !scenarioInput) {
        console.error('Required elements not found!');
        return;
    }

    findButton.addEventListener('click', function() {
        const scenario = scenarioInput.value.trim();
        
        if (!scenario) {
            alert('Please describe your scenario or feeling first!');
            return;
        }

        console.log('Searching for couplet for scenario:', scenario);
        showLoading();
        
        // Simulate processing time for better UX
        setTimeout(() => {
            try {
                console.log('Starting couplet search...');
                const bestCouplet = findBestCouplet(scenario);
                console.log('Found couplet:', bestCouplet);
                
                // Make sure we have a valid couplet
                if (!bestCouplet || !bestCouplet.transliteration) {
                    throw new Error('Invalid couplet data');
                }
                
                console.log('About to display couplet...');
                displayCouplet(bestCouplet);
                
                console.log('Hiding loading...');
                hideLoading();
                
                console.log('Showing results...');
                showResults();
                
                console.log('Process completed successfully!');
            } catch (error) {
                console.error('Error finding couplet:', error);
                hideLoading();
                alert('Sorry, there was an error finding your couplet. Please try again. Error: ' + error.message);
            }
        }, 1500);
    });

    findAnotherButton.addEventListener('click', function() {
        resetForm();
    });

    // Allow Enter key to trigger search
    scenarioInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            findButton.click();
        }
    });
});

// Add some sample scenarios for inspiration
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

// Add placeholder rotation for inspiration
let currentPlaceholder = 0;
setInterval(() => {
    const input = document.getElementById('scenario-input');
    if (input && !input.value) {
        currentPlaceholder = (currentPlaceholder + 1) % sampleScenarios.length;
        input.placeholder = `e.g., ${sampleScenarios[currentPlaceholder]}...`;
    }
}, 3000);

// Test function to verify everything is working
function testApp() {
    console.log('Testing Ghalibify app...');
    console.log('Number of couplets:', ghalibCouplets.length);
    console.log('Sample couplet:', ghalibCouplets[0]);
    
    // Test the matching function
    const testScenario = "I'm feeling lost in love";
    const result = findBestCouplet(testScenario);
    console.log('Test result for "lost in love":', result);
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    testApp();
});
