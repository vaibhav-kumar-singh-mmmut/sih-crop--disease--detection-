/**
 * constants/advisory.ts
 * Localized treatments and description plans for crop diseases.
 * Maps disease keys to translated text fields for all 10 supported languages.
 */
import { LangCode } from './voice'

export interface AdvisoryDetails {
  name: string
  desc: string
  chemical: string
  cultural: string
  biological: string
}

export const CROP_ADVISORIES: Record<string, Record<LangCode, AdvisoryDetails>> = {
  "Tomato___Early_blight": {
    hi: {
      name: "टमाटर का अगेती झुलसा (Early Blight)",
      desc: "यह अल्टरनेरिया सोलेनी कवक द्वारा होने वाली बीमारी है, जिससे पत्तियों पर गाढ़े भूरे रंग के चक्राकार छल्ले वाले धब्बे बन जाते हैं।",
      chemical: "मैनकोज़ेब (Mancozeb) 75% WP @ 2 ग्राम प्रति लीटर पानी में मिलाकर संक्रमित फसल पर छिड़काव करें। 10 दिन बाद दोबारा करें।",
      cultural: "संक्रमित निचली पत्तियों को तुरंत तोड़कर नष्ट कर दें। दो पौधों के बीच वायु संचालन हेतु उचित दूरी रखें।",
      biological: "स्यूडोमोनास फ्लोरेसेंस (Pseudomonas fluorescens) जैव-कवकनाशी @ 5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।"
    },
    en: {
      name: "Tomato Early Blight",
      desc: "Fungal infection caused by Alternaria solani. Symptoms include brown-black spots with concentric rings ('target boards') on older leaves.",
      chemical: "Spray Mancozeb 75% WP @ 2g per liter of water. Repeat after 10 days if infection persists.",
      cultural: "Remove and destroy infected lower leaves. Maintain optimal spacing between plants for airflow.",
      biological: "Apply Pseudomonas fluorescens bio-fungicide formulation @ 5g per liter of water."
    },
    mr: { name: "टोमॅटो अर्ली ब्लाईट", desc: "अल्टरनेरिया सोलेनी कवकजन्य रोग...", chemical: "मॅन्कोझेब २ ग्रॅम प्रति लीटर फवारा.", cultural: "बाधित पाने काढा.", biological: "सुडोमोनास ५ ग्रॅम फवारा." },
    pa: { name: "ਟਮਾਟਰ ਦਾ ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ", desc: "ਫੰਗਲ ਇਨਫੈਕਸ਼ਨ...", chemical: "ਮੈਨਕੋਜ਼ੇਬ 2 ਗ੍ਰਾਮ ਪ੍ਰਤੀ ਲੀਟਰ ਸਪਰੇਅ ਕਰੋ।", cultural: "ਬਿਮਾਰ ਪੱਤੇ ਨਸ਼ਟ ਕਰੋ।", biological: "ਸੂਡੋਮੋਨਾਸ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "టమోటా ఆకు మచ్చ తెగులు", desc: "శిలీంధ్ర వ్యాధి...", chemical: "మాంకోజెబ్ 2 గ్రాములు లీటరు నీటికి కలిపి పిచికారీ చేయండి.", cultural: "వ్యాధి సోకిన ఆకులను తొలగించండి.", biological: "సుడోమోనాస్ 5 గ్రాములు వాడండి." },
    ta: { name: "தக்காளி கருகல் நோய்", desc: "பூஞ்சை தொற்று...", chemical: "மேன்கோசெப் 2 கிராம் ஒரு லிட்டர் தண்ணீரில் தெளிக்கவும்.", cultural: "பாதிக்கப்பட்ட இலைகளை அகற்றவும்.", biological: "சூடோமோனாஸ் 5 கிராம் பயன்படுத்தவும்." },
    kn: { name: "ಟೊಮೆಟೊ ಮುಂಗಾರು ಕರಕು ರೋಗ", desc: "ಶಿಲೀಂಧ್ರ ರೋಗ...", chemical: "ಮ್ಯಾಂಕೋಜೆಬ್ 2 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ.", cultural: "ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ.", biological: "ಸ್ಯೂಡೋಮೊನಾಸ್ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "ટમેટાનો આગોતરો સુકારો", desc: "ફૂગ જન્ય રોગ...", chemical: "મેન્કોઝેબ ૨ ગ્રામ પ્રતિ લીટર પાણીમાં છાંટો.", cultural: "રોગગ્રસ્ત પાંદડા નાશ કરો.", biological: "સ્યુડોમોનાસ ૫ ગ્રામ વાપરો." },
    bn: { name: "টমেটোর আগাম ধসা রোগ", desc: "ছত্রাকজনিত রোগ...", chemical: "ম্যানকোজেব ২ গ্রাম প্রতি লিটার জলে স্প্রে করুন।", cultural: "আক্রান্ত পাতা ধ্বংস করুন।", biological: "সুডোমোনাস ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ଟମାଟୋ ଆଗୁଆ ଝୁଳସା ରୋଗ", desc: "କବକ ଜନିତ ରୋଗ...", chemical: "ମାନକୋଜେବ୍ ୨ ଗ୍ରାମ ପ୍ରତି ଲିଟର ପାଣିରେ ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ଆକ୍ରାନ୍ତ ପତ୍ର ନଷ୍ଟ କରନ୍ତୁ।", biological: "ସୁଡୋମୋନାସ ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Tomato___Late_blight": {
    hi: {
      name: "टमाटर का पछेती झुलसा (Late Blight)",
      desc: "फाइटोफ्थोरा इन्फेस्टन्स कवक द्वारा फैलने वाला एक अत्यंत संक्रामक रोग। पत्तियां गीली, गहरे रंग की होकर गलने लगती हैं।",
      chemical: "मेटालैक्सिल 8% + मैनकोज़ेब 64% WP @ 2.5 ग्राम प्रति लीटर पानी का तुरंत छिड़काव करें।",
      cultural: "खेत से संक्रमित पौधों को उखाड़कर गहरे गड्ढे में दबाएं। सिंचाई केवल ड्रिप द्वारा करें, पत्तियों पर पानी न गिराएं।",
      biological: "ट्राइकोडर्मा विरिडी (Trichoderma viride) @ 5 ग्राम प्रति लीटर छिड़काव करें।"
    },
    en: {
      name: "Tomato Late Blight",
      desc: "Highly destructive fungal disease caused by Phytophthora infestans. Leaves turn dark, water-soaked, and quickly rot under humid conditions.",
      chemical: "Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5g per liter of water immediately.",
      cultural: "Uproot and bury infected crop debris. Use drip irrigation to prevent wetting the foliage.",
      biological: "Spray Trichoderma viride formulation @ 5g per liter of water."
    },
    mr: { name: "टोमॅटो लेट ब्लाईट", desc: "फायटोफ्थोरा कवकजन्य रोग...", chemical: "मेटालॅक्सिल + मॅन्कोझेब २.५ ग्रॅम फवारा.", cultural: "झाडे काढून पुरा.", biological: "ट्रायकोडर्मा ५ ग्रॅम फवारा." },
    pa: { name: "ਟਮਾਟਰ ਦਾ ਪਿਛੇਤਾ ਝੁਲਸ ਰੋਗ", desc: "ਬਹੁਤ ਘਾਤਕ ਬਿਮਾਰੀ...", chemical: "ਮੈਟਾਲੈਕਸਿਲ + ਮੈਨਕੋਜ਼ੇਬ 2.5 ਗ੍ਰਾਮ ਸਪਰੇਅ ਕਰੋ।", cultural: "ਬਿਮਾਰ ਬੂਟੇ ਪੁੱਟ ਕੇ ਦੱਬ ਦਿਓ।", biological: "ਟ੍ਰਾਈਕੋਡਰਮਾ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "టమోటా మాడు తెగులు", desc: "తీవ్రమైన తెగులు...", chemical: "మెటాలాక్సిల్ + మాంకోజెబ్ 2.5 గ్రాములు పిచికారీ చేయండి.", cultural: "వ్యాధి సోకిన మొక్కలను తొలగించండి.", biological: "ట్రైకోడెర్మా 5 గ్రాములు వాడండి." },
    ta: { name: "தக்காளி தாமத கருகல்", desc: "அதிவேக பூஞ்சை தொற்று...", chemical: "மெட்டலாக்சில் + மேன்கோசெப் 2.5 கிராம் தெளிக்கவும்.", cultural: "பாதிக்கப்பட்ட செடிகளை அழிக்கவும்.", biological: "ட்ரைக்கோடெர்மா 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಟೊಮೆಟೊ ಹಿಂಗಾರು ಕರಕು ರೋಗ", desc: "ಮಾರಕ ಶಿಲೀಂಧ್ರ ರೋಗ...", chemical: "ಮೆಟಾಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ 2.5 ಗ್ರಾಂ ಸಿಂಪಡಿಸಿ.", cultural: "ರೋಗಪೀಡಿತ ಗಿಡಗಳನ್ನು ನಾಶಮಾಡಿ.", biological: "ಟ್ರೈಕೋಡರ್ಮಾ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "ટમેટાનો મોડાનો સુકારો", desc: "અતિ નુકસાનકારક રોગ...", chemical: "મેટાલક્ષિલ + મેન્કોઝેબ ૨.૫ ગ્રામ છાંટો.", cultural: "નુકસાનગ્રસ્ત છોડ દબાવી દો.", biological: "ટ્રાયકોડર્મા ૫ ગ્રામ વાપરો." },
    bn: { name: "টমেটোর নাবি ধসা রোগ", desc: "মারাত্মক ছত্রাক রোগ...", chemical: "মেটালাক্সিল + ম্যানকোজেব ২.৫ গ্রাম স্প্রে করুন।", cultural: "আক্রান্ত গাছ মাটিতে পুঁতে দিন।", biological: "ট্রাইকোডার্মা ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ଟମାଟୋ ପଛୁଆ ଝୁଳସା ରୋଗ", desc: "ଅତି କ୍ଷତିକାରକ କବକ ରୋଗ...", chemical: "ମେଟାଲାକ୍ସିଲ୍ + ମାନକୋଜେବ୍ ୨.୫ ଗ୍ରାମ ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ଆକ୍ରାନ୍ତ ଗଛକୁ ମାଟିରେ ପୋତି ଦିଅନ୍ତୁ।", biological: "ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Tomato___Tomato_mosaic_virus": {
    hi: {
      name: "टमाटर का मोज़ेक वायरस (Mosaic Virus)",
      desc: "विषाणु जनित रोग जो पत्तियों में मोज़ेक जैसा पीलापन और सिकुड़न पैदा करता है। यह रस चूसने वाले कीटों (एफिड्स) द्वारा फैलता है।",
      chemical: "वायरस की कोई दवा नहीं है। वाहक कीटों को मारने के लिए इमिडाक्लोप्रिड (Imidacloprid) @ 0.5 मिली प्रति लीटर छिड़कें।",
      cultural: "संक्रमित पौधों को तुरंत उखाड़कर जला दें। छूने के बाद हाथ साबुन से धोएं।",
      biological: "नीम का तेल (Neem Oil) 5 मिली प्रति लीटर पानी में मिलाकर कीट नियंत्रण हेतु छिड़काव करें।"
    },
    en: {
      name: "Tomato Mosaic Virus",
      desc: "Viral pathogen causing mosaic-like yellowing and mottling of leaves. Transmitted mechanically and via sucking pests like aphids.",
      chemical: "No direct chemical cure for viruses. Spray Imidacloprid @ 0.5ml per liter to control vector insects.",
      cultural: "Remove and burn infected plants. Wash hands and tools with soap after handling.",
      biological: "Spray Neem oil formulation @ 5ml per liter of water to repel sap-sucking pests."
    },
    mr: { name: "टोमॅटो मोझॅक व्हायरस", desc: "विषाणूजन्य रोग...", chemical: "इमिडाक्लोप्रिड ०.५ मिली फवारा (कीट नियंत्रण).", cultural: "बाधित झाडे जाळा.", biological: "कडुलिंब तेल ५ मिली फवारा." },
    pa: { name: "ਟਮਾਟਰ ਦਾ ਮੋਜ਼ੇਕ ਵਿਸ਼ਾਣੂ ਰੋਗ", desc: "ਵਾਇਰਲ ਰੋਗ...", chemical: "ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ 0.5 ਮਿ.ਲੀ. ਸਪਰੇਅ ਕਰੋ।", cultural: "ਬਿਮਾਰ ਬੂਟੇ ਸਾੜ ਦਿਓ।", biological: "ਨਿੰਮ ਦਾ ਤੇਲ 5 ਮਿ.ਲੀ. ਪਾਓ।" },
    te: { name: "టమోటా మొజాయిక్ వైరస్", desc: "వైరస్ తెగులు...", chemical: "ఇమిడాక్లోప్రిడ్ 0.5 మి.లీ. పిచಿಕారీ చేయండి (కీటకాల కోసం).", cultural: "వ్యాధి సోకిన మొక్కలను తగులబెట్టండి.", biological: "వేప నూనె 5 మి.లీ. వాడండి." },
    ta: { name: "தக்காளி மொசைக் வைரஸ்", desc: "வைரஸ் நோய்...", chemical: "இமிடாசிளோபிரிட் 0.5 மி.லி. தெளிக்கவும் (பூச்சி கட்டுப்பாடு).", cultural: "பாதிக்கப்பட்ட செடிகளை எரிக்கவும்.", biological: "வேப்ப எண்ணெய் 5 மி.லி. தெளிக்கவும்." },
    kn: { name: "ಟೊಮೆಟೊ ಮೊಸಾಯಿಕ್ ವೈರಸ್", desc: "ವೈರಸ್ ರೋಗ...", chemical: "ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 0.5 ಮಿ.ಲೀ. ಸಿಂಪಡಿಸಿ (ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ).", cultural: "ರೋಗಪೀಡಿತ ಗಿಡಗಳನ್ನು ಸುಟ್ಟುಹಾಕಿ.", biological: "ಬೇವಿನ ಎಣ್ಣೆ 5 ಮಿ.ಲೀ. ಬಳಸಿ." },
    gu: { name: "ટમેટાનો મોઝેક વાયરસ", desc: "વાયરસ જન્ય રોગ...", chemical: "ઇમિડાક્લોપ્રિડ ૦.૫ મીલી છાંટો (જીવાત નિયંત્રણ).", cultural: "નુકસfancy છોડ સળગાવો.", biological: "લીમડાનું તેલ ૫ મીલી વાપરો." },
    bn: { name: "টমেটোর মোজাইক ভাইরাস", desc: "ভাইরাসজনিত রোগ...", chemical: "ইমিডাক্লোপ্রিড ০.৫ মিলি স্প্রে করুন (বাহক পোকা মারতে)।", cultural: "আক্রান্ত গাছ পুড়িয়ে দিন।", biological: "নিম তেল ৫ মিলি স্প্রে করুন।" },
    or: { name: "ଟମାଟୋ ମୋଜାଇକ୍ ଭୂତାଣୁ ରୋଗ", desc: "ଭୂତାଣୁ ଜନିତ ରୋଗ...", chemical: "ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୦.୫ ମିଲି ସ୍ପ୍ରେ କରନ୍ତୁ (ପୋକ ମାରିବାକୁ)।", cultural: "ଆକ୍ରାନ୍ତ ଗଛକୁ ପୋଡି ଦିଅନ୍ତୁ।", biological: "ନିମ୍ବ ତେଲ ୫ ମିଲି ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Potato___Early_blight": {
    hi: {
      name: "आलू का अगेती झुलसा (Early Blight)",
      desc: "अल्टरनेरिया सोलेनी कवक द्वारा आलू की पत्तियों पर भूरे रंग के कोणीय छल्लेदार धब्बे बन जाते हैं।",
      chemical: "क्लोरोथैलोनिल (Chlorothalonil) 75% WP @ 2 ग्राम प्रति लीटर पानी का छिड़काव करें।",
      cultural: "फसल चक्र (Crop Rotation) अपनाएं। आलू की खुदाई के बाद अवशेषों को खेत से दूर फेंकें।",
      biological: "स्यूडोमोनास फ्लोरेसेंस @ 5 ग्राम प्रति लीटर छिड़काव करें।"
    },
    en: {
      name: "Potato Early Blight",
      desc: "Fungal leaf disease caused by Alternaria solani. Creates target-board dark brown spots on potato leaves, reducing tuber yields.",
      chemical: "Spray Chlorothalonil 75% WP @ 2g per liter of water.",
      cultural: "Practice crop rotation. Remove and clear old crop residues after harvest.",
      biological: "Spray Pseudomonas fluorescens formulation @ 5g per liter of water."
    },
    mr: { name: "बटाटा अर्ली ब्लाईट", desc: "कवकजन्य रोग...", chemical: "क्लोरोथॅलोनिल २ ग्रॅम फवारा.", cultural: "पीक बदल करा.", biological: "सुडोमोनास ५ ग्रॅम फवारा." },
    pa: { name: "ਆਲੂ ਦਾ ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ", desc: "ਉੱਲੀ ਰੋਗ...", chemical: "ਕਲੋਰੋਥੈਲੋਨਿਲ 2 ਗ੍ਰਾਮ ਸਪਰੇਅ ਕਰੋ।", cultural: "ਫਸਲੀ ਚੱਕਰ ਅਪਣਾਓ।", biological: "ਸੂਡੋਮੋਨਾਸ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "బంగాళదుంప ఆకుమచ్చ తెగులు", desc: "శిలీంధ్ర వ్యాధి...", chemical: "క్లోరోథలోనిల్ 2 గ్రాములు పిచికారీ చేయండి.", cultural: "పంట మార్పిడి చేయండి.", biological: "సుడోమోనాస్ 5 గ్రాములు వాడండి." },
    ta: { name: "உருளைக்கிழங்கு அਗੇதி கருகல்", desc: "பூஞ்சை நோய்...", chemical: "குளோரோதலோனில் 2 கிராம் தெளிக்கவும்.", cultural: "பயிர் சுழற்சி செய்யவும்.", biological: "சூடோமோனாஸ் 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಆಲೂಗಡ್ಡೆ ಮುಂಗಾರು ಕರಕು ರೋಗ", desc: "ಶಿಲೀಂಧ್ರ ರೋಗ...", chemical: "ಕ್ಲೋರೋಥಲೋನಿಲ್ 2 ಗ್ರಾಂ ಸಿಂಪಡಿಸಿ.", cultural: "ಬೆಳೆ ಸರದೂಡಿಕೆ ಮಾಡಿ.", biological: "ಸ್ಯೂಡೋಮೊನಾಸ್ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "બટાકાનો આગોતરો સુકારો", desc: "ફૂગ જન્ય રોગ...", chemical: "ક્લોરોથેલોનીલ ૨ ગ્રામ છાંટો.", cultural: "પાકની ફેરબદલી કરો.", biological: "સ્યુડોમોનાસ ૫ ગ્રામ વાપરો." },
    bn: { name: "আলুর আগাম ধসা রোগ", desc: "ছত্রাকজনিত রোগ...", chemical: "ক্লোরোথালোনিল ২ গ্রাম স্প্রে করুন।", cultural: "ফসল চক্র অনুসরণ করুন।", biological: "সুডোমোনাস ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ଆଳୁ ଆଗୁଆ ଝୁଳସା ରୋଗ", desc: "କବକ ଜନିତ ରୋଗ...", chemical: "କ୍ଲୋରୋଥାଲୋନିଲ୍ ୨ ଗ୍ରାମ ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ଫସଲ ଚକ୍ର ଆପଣାନ୍ତୁ।", biological: "ସୁଡୋମୋନାସ ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତु।" }
  },
  "Potato___Late_blight": {
    hi: {
      name: "आलू का पछेती झुलसा (Late Blight)",
      desc: "आलू की फसल का सबसे विनाशकारी रोग। पत्तियों के किनारे काले होकर गलने लगते हैं और कंद भी सड़ जाते हैं।",
      chemical: "साइमोक्सानिल + मैनकोज़ेब (Cymoxanil + Mancozeb) @ 2 ग्राम प्रति लीटर पानी का छिड़काव करें।",
      cultural: "केवल प्रमाणित और रोगमुक्त कंद ही बोएं। सिंचाई नियंत्रण में रखें, खेतों में पानी न जमा होने दें।",
      biological: "ट्राइकोडर्मा विरिडी @ 5 ग्राम प्रति लीटर भूमि उपचार और पर्णीय छिड़काव करें।"
    },
    en: {
      name: "Potato Late Blight",
      desc: "Highly destructive disease caused by Phytophthora infestans. Leaves and stems develop black rotting spots, and potato tubers decay.",
      chemical: "Spray Cymoxanil + Mancozeb mix @ 2g per liter of water immediately.",
      cultural: "Plant only certified, disease-free seed tubers. Manage drainage to avoid water accumulation.",
      biological: "Apply Trichoderma viride bio-fungicide @ 5g per liter."
    },
    mr: { name: "बटाटा लेट ब्लाईट", desc: "अति विनाशकारी रोग...", chemical: "सायमॉक्सानिल + मॅन्कोझेब २ ग्रॅम फवारा.", cultural: "निरोगी बियाणे वापरा.", biological: "ट्रायकोडर्मा ५ ग्रॅम फवारा." },
    pa: { name: "ਆਲੂ ਦਾ ਪਿਛੇਤਾ ਝੁਲਸ ਰੋਗ", desc: "ਵਿਨਾਸ਼ਕਾਰੀ ਰੋਗ...", chemical: "ਸਾਈਮੋਕਸਾਨਿਲ + ਮੈਨਕੋਜ਼ੇਬ 2 ਗ੍ਰਾਮ ਸਪਰੇਅ ਕਰੋ।", cultural: "ਸਾਫ਼ ਬੀਜ ਵਰਤੋ।", biological: "ਟ੍ਰਾਈਕੋਡਰਮਾ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "బంగాళదుంప లేట్ బ్లైట్", desc: "వినాశకరమైన తెగులు...", chemical: "సైమోక్సానిల్ + మాంకోజెబ్ 2 గ్రాములు పిచికారీ చేయండి.", cultural: "ఆరోగ్యకరమైన విత్తనాలు వాడండి.", biological: "ట్రైకోడెర్మా 5 గ్రాములు వాడండి." },
    ta: { name: "உருளைக்கிழங்கு தாமத கருகல்", desc: "விநாசகரமான பூஞ்சை...", chemical: "சைமோக்சானில் + மேன்கோசெப் 2 கிராம் தெளிக்கவும்.", cultural: "தரமான விதைகளைப் பயன்படுத்தவும்.", biological: "ட்ரைக்கோடெர்மா 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಆಲೂಗಡ್ಡೆ ಹಿಂಗಾರು ಕರಕು ರೋಗ", desc: "ಮಾರಕ ಕರಕು ರೋಗ...", chemical: "ಸೈಮೋಕ್ಸಾನಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ 2 ಗ್ರಾಂ ಸಿಂಪಡಿಸಿ.", cultural: "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಬಿತ್ತನೆ ಆಲೂಗಡ್ಡೆ ಬಳಸಿ.", biological: "ಟ್ರೈಕೋಡರ್ಮಾ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "બટાકાનો મોડાનો સુકારો", desc: "વિનાશક રોગ...", chemical: "સાયમોક્સેનીલ + મેન્કોઝેબ ૨ ગ્રામ છાંટો.", cultural: "પ્રમાણિત બિયારણ વાપરો.", biological: "ટ્રાયકોડર્મા ૫ ગ્રામ વાપરો." },
    bn: { name: "আলুর নাবি ধসা রোগ", desc: "মারাত্মক রোগ...", chemical: "সাইমক্সানিল + ম্যানকোজেব ২ গ্রাম স্প্রে করুন।", cultural: "রোগমুক্ত বীজ ব্যবহার করুন।", biological: "ট্রাইকোডার্মা ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ଆଳୁ ପଛୁଆ ଝୁଳସା ରୋଗ", desc: "ମାରାତ୍ମକ କବକ ରୋଗ...", chemical: "ସାଇମୋକ୍ସାନିଲ୍ + ମାନକୋଜେବ୍ ୨ ଗ୍ରାମ ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ରୋଗମୁକ୍ତ ବିହନ ବ୍ୟବହାର କରନ୍ତୁ।", biological: "ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Apple___Apple_scab": {
    hi: {
      name: "सेब का स्कैब (Apple Scab)",
      desc: "वेंचुरिया इनेक्वलिस कवक जनित रोग। पत्तियों और फलों पर जैतून-हरे रंग के खुरदरे धब्बे बन जाते हैं जिससे फल फट जाते हैं।",
      chemical: "डिफेनोकोनाज़ोल (Difenoconazole) 25% EC @ 0.5 मिली प्रति लीटर पानी में मिलाकर स्प्रे करें।",
      cultural: "गिरे हुए संक्रमित पत्तों को इकट्ठा कर नष्ट करें या मिट्टी में दबा दें। टहनियों की कटाई-छंटाई (Pruning) करें।",
      biological: "स्यूडोमोनास फ्लोरेसेंस @ 5 ग्राम प्रति लीटर छिड़काव करें।"
    },
    en: {
      name: "Apple Scab",
      desc: "Fungal disease caused by Venturia inaequalis. Creates olive-green to black scabby lesions on leaves and fruit, causing cracking.",
      chemical: "Spray Difenoconazole 25% EC @ 0.5ml per liter of water.",
      cultural: "Collect and destroy fallen leaf litter to prevent overwintering. Prune branches for canopy ventilation.",
      biological: "Apply Pseudomonas fluorescens formulation @ 5g per liter of water."
    },
    mr: { name: "सफरचंद स्कॅब", desc: "कवकजन्य रोग...", chemical: "डिफेनोकोनाझोल ०.५ मिली फवारा.", cultural: "गिरेली पाने नष्ट करा.", biological: "सुडोमोनास ५ ग्रॅम फवारा." },
    pa: { name: "ਸੇਬ ਦਾ ਸਕੈਬ ਰੋਗ", desc: "ਉੱਲੀ ਰੋਗ...", chemical: "ਡਿਫੈਨੋਕੋਨਾਜ਼ੋਲ 0.5 ਮਿ.ਲੀ. ਸਪਰੇਅ ਕਰੋ।", cultural: "ਡਿੱਗੇ ਪੱਤੇ ਸਾੜ ਦਿਓ।", biological: "ਸੂਡੋਮੋਨਾਸ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "యాపిల్ గజ్జి తెగులు", desc: "శిలీంధ్ర తెగులు...", chemical: "డైఫెనోకోనజోల్ 0.5 మి.లీ. పిచिकారీ చేయండి.", cultural: "రాలిన ఆకులను నాశనం చేయండి.", biological: "సుడోమోనాస్ 5 గ్రాములు వాడండి." },
    ta: { name: "ஆப்பிள் செதில் நோய்", desc: "பூஞ்சை நோய்...", chemical: "டிஃபெனோகோனசோல் 0.5 மி.லி. தெளிக்கவும்.", cultural: "உதிர்ந்த இலைகளை அழிக்கவும்.", biological: "சூடோமோனாஸ் 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಸೇಬು ಸ್ಕ್ಯಾಬ್ ರೋಗ", desc: "ಶಿಲೀಂಧ್ರ ರೋಗ...", chemical: "ಡಿಫೆನೋಕೊನಜೋಲ್ 0.5 ಮಿ.ಲೀ. ಸಿಂಪಡಿಸಿ.", cultural: "ಬಿದ್ದ ಎಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ ನಾಶಮಾಡಿ.", biological: "ಸ್ಯೂಡೋಮೊನಾಸ್ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "સફરજનની ખીલ", desc: "ફૂગ જન્ય રોગ...", chemical: "ડિફેનોકોનાઝોલ ૦.૫ મીલી છાંટો.", cultural: "ખરેલા પાંદડા નાશ કરો.", biological: "સ્યુડોમોનાસ ૫ ગ્રામ વાપરો." },
    bn: { name: "আপেলের স্ক্যাব রোগ", desc: "ছত্রাকজনিত রোগ...", chemical: "ডিফেনোকোনাজোল ০.৫ মিলি স্প্রে করুন।", cultural: "ঝরে পড়া পাতা ধ্বংস করুন।", biological: "সুডোমোনাস ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ସେଓ ସ୍କାବ୍ ରୋଗ", desc: "କବକ ଜନିତ ରୋଗ...", chemical: "ଡିଫେନୋକୋନାଜୋଲ୍ ୦.୫ ମିଲି ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ଝଡି ପଡିଥିବା ପତ୍ର ନଷ୍ଟ କରନ୍ତୁ।", biological: "ସୁଡୋମୋନାସ ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Apple___Black_rot": {
    hi: {
      name: "सेब का काला सड़न (Black Rot)",
      desc: "कवक द्वारा सेब की छाल, पत्तियों और फलों का सड़ना। फल भूरे और काले रंग के होकर सड़ जाते हैं।",
      chemical: "टेबुकोनाज़ोल + ट्राइफ्लॉक्सीस्ट्रोबिन (Tebuconazole + Trifloxystrobin) @ 1 ग्राम प्रति लीटर पानी का स्प्रे करें।",
      cultural: "प्रभावित टहनियों और घावों को काटकर अलग करें। कटे हुए स्थान पर बोर्डो पेस्ट लगाएं।",
      biological: "बैसिलस सबटिलिस (Bacillus subtilis) @ 5 ग्राम प्रति लीटर का छिड़काव करें।"
    },
    en: {
      name: "Apple Black Rot",
      desc: "Fungal pathogen causing cankers on twigs, frog-eye spots on leaves, and black rotting circles on ripening apples.",
      chemical: "Spray Tebuconazole + Trifloxystrobin mix @ 1g per liter of water.",
      cultural: "Prune out dead wood and cankered branches. Apply Bordeaux paste to cut wounds.",
      biological: "Apply Bacillus subtilis formulation @ 5g per liter of water."
    },
    mr: { name: "सफरचंद काळे कुजणे", desc: "कवकजन्य सड...", chemical: "टेबुकोनाझोल + ट्रायफ्लॉक्सीस्ट्रोबिन १ ग्रॅम फवारा.", cultural: "बाधित फांद्या काढा.", biological: "बॅसिलस ५ ग्रॅम फवारा." },
    pa: { name: "ਸੇਬ ਦਾ ਕਾਲਾ ਗਲਣ ਰੋਗ", desc: "ਉੱਲੀ ਰੋਗ...", chemical: "ਟੇਬੂਕੋਨਾਜ਼ੋਲ + ਟ੍ਰਾਈਫਲੋਕਸੀਸਟ੍ਰੋਬਿਨ 1 ਗ੍ਰਾਮ ਸਪਰੇਅ ਕਰੋ।", cultural: "ਬਿਮਾਰ ਟਾਹਣੀਆਂ ਕੱਟ ਦਿਓ।", biological: "ਬੈਸੀਲਸ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "యాపిల్ నల్ల కుళ్ళు తెగులు", desc: "శిలీంధ్ర తెగులు...", chemical: "టెబుకోనజోల్ + ట్రైఫ్లోక్సిస్ట్రోబిన్ 1 గ్రాము పిచికారీ చేయండి.", cultural: "కుళ్ళిన కొమ్మలను కత్తిరించండి.", biological: "బాసిల్లస్ 5 గ్రాములు వాడండి." },
    ta: { name: "ஆப்பிள் கரு அழுகல்", desc: "பூஞ்சை அழுகல்...", chemical: "டெபுகோனசோல் + ட்ரைஃப்ளோக்சிஸ்ட்ரோபின் 1 கிராம் தெளிக்கவும்.", cultural: "பாதிக்கப்பட்ட கிளைகளை வெட்டவும்.", biological: "பேசிலஸ் 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಸೇಬು ಕಪ್ಪು ಕೊಳೆ ರೋಗ", desc: "ಕೊಳೆ ರೋಗ...", chemical: "ಟೆಬುಕೊನಜೋಲ್ + ಟ್ರೈಫ್ಲೋಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ 1 ಗ್ರಾಂ ಸಿಂಪಡಿಸಿ.", cultural: "ಒಣಗಿದ ಕೊಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ.", biological: "ಬ್ಯಾಸಿಲಸ್ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "સફરજનનો કાળો સડો", desc: "સડો કરતો રોગ...", chemical: "ટેબુકોનાઝોલ + ટ્રાઇફ્લોક્સિસ્ટ્રોબિન ૧ ગ્રામ છાંટો.", cultural: "સડેલી ડાળીઓ કાપી નાખો.", biological: "બેસિલસ ૫ ગ્રામ વાપरो." },
    bn: { name: "আপেলের কালো পচা রোগ", desc: "ছত্রাকজনিত রোগ...", chemical: "টেবুকোনাজোল + ট্রাইফ্লক্সিস্ট্রোবিন ১ গ্রাম স্প্রে করুন।", cultural: "আক্রান্ত ডাল ছাঁটাই করুন।", biological: "ব্যাসিলাস ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ସେଓ କଳା ପଚା ରୋଗ", desc: "କବକ ଜନିତ ପଚା ରୋଗ...", chemical: "ଟେବୁକୋନାଜୋଲ୍ + ଟ୍ରାଇଫ୍ଲୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍ ୧ ଗ୍ରାମ ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ଆକ୍ରାନ୍ତ ଡାଳ କାଟି ଦିଅନ୍ତୁ।", biological: "ବାସିଲସ ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Rice___Brown_spot": {
    hi: {
      name: "धान का भूरा धब्बा (Brown Spot)",
      desc: "पत्तियों पर अंडाकार भूरे धब्बे बनते हैं जिनके चारों तरफ पीला चक्र होता है। यह पोषण की कमी (पोटेशियम) के कारण अधिक फैलता है।",
      chemical: "प्रोपिकोनाज़ोल (Propiconazole) 25% EC @ 1 मिली प्रति लीटर पानी का छिड़काव करें।",
      cultural: "खेत में नाइट्रोजन और पोटेशियम खादों का संतुलित मात्रा में उपयोग करें।",
      biological: "स्यूडोमोनास फ्लोरेसेंस @ 5 ग्राम प्रति लीटर बीज और भूमि उपचार करें।"
    },
    en: {
      name: "Rice Brown Spot",
      desc: "Fungal disease causing oval dark-brown spots with yellow halos on rice leaves. Promoted by nutrient deficiency (especially Potassium).",
      chemical: "Spray Propiconazole 25% EC @ 1ml per liter of water.",
      cultural: "Apply balanced fertilizers. Correct potassium deficiencies in the soil.",
      biological: "Apply Pseudomonas fluorescens bio-fungicide @ 5g per liter for seed treatment."
    },
    mr: { name: "भातावरील तपकिरी ठिपके", desc: "पोषक कमतरतेमुळे होणारा रोग...", chemical: "प्रोपिकोनाझोल १ मिली फवारा.", cultural: "संतुलित खते वापरा.", biological: "सुडोमोनास ५ ग्रॅम वापरा." },
    pa: { name: "ਝੋਨੇ ਦੇ ਭੂਰੇ ਧੱਬੇ ਦਾ ਰੋਗ", desc: "ਉੱਲੀ ਰੋਗ...", chemical: "ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ 1 ਮਿ.ਲੀ. ਸਪਰੇਅ ਕਰੋ।", cultural: "ਖਾਦਾਂ ਦੀ ਸੰਤੁਲਿਤ ਵਰਤੋਂ ਕਰੋ।", biological: "ਸੂਡੋਮੋਨਾਸ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "వరి ఆకుమచ్చ తెగులు", desc: "పోషకాల లోపం...", chemical: "ప్రొపికోనజోల్ 1 మి.లీ. పిచికారీ చేయండి.", cultural: "సమతుల్య ఎరువులు వాడండి.", biological: "సుడోమోనాస్ 5 గ్రాములు వాడండి." },
    ta: { name: "நெல் பழுப்பு புள்ளி நோய்", desc: "ஊட்டச்சத்து குறைபாடு...", chemical: "புரோபிகோனசோல் 1 மி.லி. தெளிக்கவும்.", cultural: "சீரான உரங்களைப் பயன்படுத்தவும்.", biological: "சூடோமோனாஸ் 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಭತ್ತದ ಕಂದು ಚುಕ್ಕೆ ರೋಗ", desc: "ಶಿಲೀಂಧ್ರ ರೋಗ...", chemical: "ಪ್ರೊಪಿಕೊನಜೋಲ್ 1 ಮಿ.ಲೀ. ಸಿಂಪಡಿಸಿ.", cultural: "ಸಮತೋಲನ ಗೊಬ್ಬರ ಬಳಸಿ.", biological: "ಸ್ಯೂಡೋಮೊನಾಸ್ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "ડાંગરના કથ્થઈ ટપકાં", desc: "પોષણની ખામીનો રોગ...", chemical: "પ્રોપીકોનાઝોલ ૧ મીલી છાંટો.", cultural: "સંતુલિત ખાતર આપો.", biological: "સ્યુડોમોનાસ ૫ ગ્રામ વાપરો." },
    bn: { name: "ধানের বাদামী দাগ রোগ", desc: "ছত্রাকজনিত রোগ...", chemical: "প্রোপিকোনাজল ১ মিলি স্প্রে করুন।", cultural: "সুষম সার ব্যবহার করুন।", biological: "সুডোমোনাস ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ଧାନର ବାଦାମୀ ଦାଗ ରୋଗ", desc: "ପୋଷକ ତତ୍ତ୍ୱ ଅଭାବ ରୋଗ...", chemical: "ପ୍ରୋପିକୋନାଜୋଲ୍ ୧ ମିଲି ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ସୁଷମ ସାର ପ୍ରୟୋଗ କରନ୍ତୁ।", biological: "ସୁଡୋମୋନାସ ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Wheat___Yellow_rust": {
    hi: {
      name: "गेहूं का पीला रतुआ (Yellow Rust)",
      desc: "पत्तियों पर पीले रंग की धारियां बन जाती हैं जो हाथ से छूने पर पाउडर जैसी लगती हैं। यह ठंडे मौसम में तेजी से फैलता है।",
      chemical: "टेबुकोनाज़ोल (Tebuconazole) 250 EC @ 1 मिली प्रति लीटर पानी में मिलाकर स्प्रे करें।",
      cultural: "Rust-रोधी किस्मों की बुवाई करें। यूरिया (नाइट्रोजन) का अत्यधिक उपयोग बंद करें।",
      biological: "नॉन-सिट्रस हर्बल काढ़ा या ट्राइकोडर्मा विरिडी @ 5 ग्राम प्रति लीटर छिड़कें।"
    },
    en: {
      name: "Wheat Yellow Rust",
      desc: "Fungal stripe rust producing powdery yellow spores in stripes along wheat leaf veins. Spreads quickly in cool, damp weather.",
      chemical: "Spray Tebuconazole 250 EC @ 1ml per liter of water immediately.",
      cultural: "Grow rust-resistant wheat varieties. Avoid over-application of nitrogen fertilizers.",
      biological: "Apply Trichoderma viride bio-fungicide formulation @ 5g per liter of water."
    },
    mr: { name: "गव्हावरील पिवळा तांबेरा", desc: "पिवळसर पट्टे पडणारा रोग...", chemical: "टेबुकोनाझोल १ मिली फवारा.", cultural: "प्रतिरोधक वाण वापरा.", biological: "ट्रायकोडर्मा ५ ग्रॅम फवारा." },
    pa: { name: "ਕਣਕ ਦੀ ਪੀਲੀ ਕੁੰਗੀ", desc: "ਪੀਲੀ ਕੁੰਗੀ ਰੋਗ...", chemical: "ਟੇਬੂਕੋਨਾਜ਼ੋਲ 1 ਮਿ.ਲੀ. ਸਪਰੇਅ ਕਰੋ।", cultural: "ਬਿਮਾਰੀ-ਰੋਧਕ ਕਿਸਮਾਂ ਬੀਜੋ।", biological: "ਟ੍ਰਾਈਕੋਡਰਮਾ 5 ਗ੍ਰਾਮ ਪਾਓ।" },
    te: { name: "గోధుమ పసుపు తుప్పు తెగులు", desc: "పసుపు గీతల తెగులు...", chemical: "టెబుకోనజోల్ 1 మి.లీ. పిచికారీ చేయండి.", cultural: "తెగులు తట్టుకునే రకాలు వాడండి.", biological: "ట్రైకోడెర్మా 5 గ్రాములు వాడండి." },
    ta: { name: "கோதுமை மஞ்சள் துரு நோய்", desc: "மஞ்சள் கோடு நோய்...", chemical: "டெபுகோனசோல் 1 மி.லி. தெளிக்கவும்.", cultural: "நோய் எதிர்ப்பு ரகங்களை பயிரிடவும்.", biological: "ட்ரைக்கோடெர்மா 5 கிராம் தெளிக்கவும்." },
    kn: { name: "ಗೋದಿಯ ಹಳದಿ ತುಕ್ಕು ರೋಗ", desc: "ಹಳದಿ ಗೆರೆ ರೋಗ...", chemical: "ಟೆಬುಕೊನಜೋಲ್ 1 ಮಿ.ಲೀ. ಸಿಂಪಡಿಸಿ.", cultural: "ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬೆಳೆಯಿರಿ.", biological: "ಟ್ರೈಕೋಡರ್ಮಾ 5 ಗ್ರಾಂ ಬಳಸಿ." },
    gu: { name: "ઘઉંનો પીળો ગેરુ", desc: "પીળી પટ્ટીઓનો રોગ...", chemical: "ટેબુકોનાઝોલ ૧ મીલી છાંટો.", cultural: "પ્રતિકારક જાતો વાવો.", biological: "ટ્રાયકોડર્મા ૫ ગ્રામ વાપરો." },
    bn: { name: "গমের হলুদ মরিচা রোগ", desc: "হলুদ মরিচা রোগ...", chemical: "টেবুকোনাজোল ১ মিলি স্প্রে করুন।", cultural: "রোগ-প্রতিরোধী জাত চাষ করুন।", biological: "ট্রাইকোডার্মা ৫ গ্রাম স্প্রে করুন।" },
    or: { name: "ଗହମର ହଳଦିଆ କଳଙ୍କି ରୋଗ", desc: "ହଳଦିଆ ଦାଗ ରୋଗ...", chemical: "ଟେବୁକୋନାଜୋଲ୍ ୧ ମିଲି ସ୍ପ୍ରେ କରନ୍ତୁ।", cultural: "ରୋଗ ପ୍ରତିରୋଧକ କିସମ ଚାଷ କରନ୍ତୁ।", biological: "ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ ବ୍ୟବହାର କରନ୍ତୁ।" }
  },
  "Healthy": {
    hi: {
      name: "स्वस्थ पत्ती (Healthy Crop)",
      desc: "आपकी फसल स्वस्थ और सुरक्षित है। कोई बीमारी या कीट का प्रभाव नहीं पाया गया है।",
      chemical: "किसी रासायनिक छिड़काव की आवश्यकता नहीं है। कीटनाशकों पर पैसे न खर्च करें।",
      cultural: "खेत की नियमित निगरानी जारी रखें और संतुलित खाद डालें।",
      biological: "प्रतिरोधक क्षमता बढ़ाने के लिए नीम के तेल का छिड़काव हर 15 दिनों में कर सकते हैं।"
    },
    en: {
      name: "Healthy Leaf",
      desc: "Your crop is healthy and secure. No symptoms of disease or pest infestation were detected.",
      chemical: "No chemical fungicides are required. Save your input costs.",
      cultural: "Continue regular field inspections and maintain balanced irrigation.",
      biological: "Apply Neem oil preventive spray once in 15 days to boost plant immunity."
    },
    mr: { name: "निरोगी पीक", desc: "पीक निरोगी आहे...", chemical: "औषधांची गरज नाही.", cultural: "नियमित निरीक्षण करा.", biological: "कडुलिंब तेल फवारा." },
    pa: { name: "ਤੰਦਰੁਸਤ ਫਸਲ", desc: "ਤੁਹਾਡੀ ਫਸਲ ਠੀਕ ਹੈ...", chemical: "ਕਿਸੇ ਸਪਰੇਅ ਦੀ ਲੋੜ ਨਹੀਂ।", cultural: "ਨਿਗਰਾਨੀ ਰੱਖੋ।", biological: "ਨਿੰਮ ਦਾ ਤੇਲ ਵਰਤੋ।" },
    te: { name: "ఆరోగ్యకరమైన పంట", desc: "పంట ఆరోగ్యంగా ఉంది...", chemical: "పిచికారీ అవసరం లేదు.", cultural: "క్రమం తప్పకుండా గమనించండి.", biological: "వేప నूనె వాడండి." },
    ta: { name: "ஆரோக்கியமான பயிர்", desc: "பயிர் ஆரோக்கியமாக உள்ளது...", chemical: "மருந்து தேவையில்லை.", cultural: "தொடர்ந்து கண்காணிக்கவும்.", biological: "வேப்ப எண்ணெய் தெளிக்கவும்." },
    kn: { name: "ಆರೋಗ್ಯಕರ ಬೆಳೆ", desc: "ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ...", chemical: "ಯಾವುದೇ ಸಿಂಪಡಣೆ ಅಗತ್ಯವಿಲ್ಲ.", cultural: "ನಿಯಮಿತವಾಗಿ ತಪಾಸಣೆ ಮಾಡಿ.", biological: "ಬೇವಿನ ಎಣ್ಣೆ ಬಳಸಿ." },
    gu: { name: "સ્વસ્થ પાક", desc: "પાક તંદુરસ્ત છે...", chemical: "દવાની જરૂર નથી.", cultural: "નિયમિત દેખરેખ રાખો.", biological: "લીમડાનું તેલ છાંટો." },
    bn: { name: "সুস্থ পাতা", desc: "আপনার ফসল সুস্থ আছে...", chemical: "কোন স্প্রে করার প্রয়োজন নেই।", cultural: "নিয়মিত পরিদর্শন করুন।", biological: "নিম তেল ব্যবহার করতে পারেন।" },
    or: { name: "ସୁସ୍ଥ ଗଛ", desc: "ଆପଣଙ୍କ ଫସଲ ସୁସ୍ଥ ଅଛି...", chemical: "କୌଣସି ସ୍ପ୍ରେ ଆବଶ୍ୟକ ନାହିଁ।", cultural: "ନିୟମିତ ତଦାରଖ କରନ୍ତୁ।", biological: "ନିମ୍ବ ତେଲ ବ୍ୟବହାର କରିପାରିବେ।" }
  }
}
