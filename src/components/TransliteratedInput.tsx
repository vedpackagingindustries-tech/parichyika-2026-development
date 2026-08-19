import React, { useState, useEffect, useRef } from "react";
import { Languages, Loader2, Mic, MicOff } from "lucide-react";

export function formatDegreesToHindi(text: string): string {
  if (!text) return text;
  let result = text;
  
  // Comprehensive, robust degree and qualification mappings
  const degreeRules: { pattern: RegExp; replacement: string }[] = [
    // M.Com / B.Com
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*com\.?|mcom|एम\.?\s*कॉम\.?|म\.?\s*कॉम\.?|एमकॉम)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.कॉम." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*com\.?|bcom|बी\.?\s*कॉम\.?|बीकॉम)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.कॉम." },

    // M.A / B.A
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*a\.?|ma|एम\.?\s*ए\.?|एमए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.ए." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*a\.?|ba|बी\.?\s*ए\.?|बीए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.ए." },

    // B.Sc / M.Sc
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*sc\.?|bsc|बी\.?\s*एससी\.?|बीएससी)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.एससी." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*sc\.?|msc|एम\.?\s*एससी\.?|एमएससी)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.एससी." },

    // B.Tech / M.Tech / B.E / M.E
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*tech\.?|btech|बी\.?\s*टेक\.?|बीटेक)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.टेक." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*tech\.?|mtech|एम\.?\s*टेक\.?|एमटेक)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.टेक." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*e\.?|be|बी\.?\s*ई\.?|बीई)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.ई." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*e\.?|me|एम\.?\s*ई\.?|एमई)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.ई." },

    // BCA / MCA / BBA / MBA
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*c\.?\s*a\.?|bca|बी\.?\s*सी\.?\s*ए\.?|बीसीए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बीसीए" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*c\.?\s*a\.?|mca|एम\.?\s*सी\.?\s*ए\.?|एमसीए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एमसीए" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*b\.?\s*a\.?|bba|बी\.?\s*बी\.?\s*ए\.?|बीबीए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बीबीए" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*b\.?\s*a\.?|mba|एम\.?\s*बी\.?\s*ए\.?|एमबीए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एमबीए" },

    // Medical: MBBS, BDS, BAMS, BHMS, MD, MS
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*b\.?\s*b\.?\s*s\.?|mbbs|एम\.?\s*बी\.?\s*बी\.?\s*एस\.?|एमबीबीएस)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एमबीबीएस" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*d\.?\s*s\.?|bds|बी\.?\s*डी\.?\s*एस\.?|बीडीएस)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बीडीएस" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*a\.?\s*m\.?\s*s\.?|bams|बी\.?\s*ए\.?\s*एम\.?\s*एस\.?|बीएएमएस)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बीएएमएस" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*h\.?\s*m\.?\s*s\.?|bhms|बी\.?\s*एच\.?\s*एम\.?\s*एस\.?|बीएचएमएस)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बीएचएमएस" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*d\.?|md|एम\.?\s*डी\.?|एमडी)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.डी." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*s\.?|ms|एम\.?\s*एस\.?|एमएस)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.एस." },

    // Law: LLB, LLM
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(l\.?\s*l\.?\s*b\.?|llb|एल\.?\s*एल\.?\s*बी\.?|एलएलबी)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एलएलबी" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(l\.?\s*l\.?\s*m\.?|llm|एल\.?\s*एल\.?\s*एम\.?|एलएलएम)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एलएलएम" },

    // Education: B.Ed, M.Ed, D.El.Ed, D.Ed
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*ed\.?|bed|बी\.?\s*एड\.?|बीएड)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.एड." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*ed\.?|med|एम\.?\s*एड\.?|एमएड)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.एड." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(d\.?\s*el\.?\s*ed\.?|deled|डी\.?\s*एल\.?\s*एड\.?|डीएलएड)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "डी.एल.एड." },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(d\.?\s*ed\.?|ded|डी\.?\s*एड\.?|डीएड)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "डी.एड." },

    // Doctorate: Ph.D
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(ph\.?\s*d\.?|phd|पी\.?\s*एच\.?\s*डी\.?|पीएचडी|पीएच\.?\s*डी\.?)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "पीएच.डी." },

    // Finance/Prof: CA, CS, CMA, ICWA
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(c\.?\s*a\.?|ca|सी\.?\s*ए\.?|सीए)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "सीए" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(c\.?\s*s\.?|cs|सी\.?\s*एस\.?|सीएस)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "सीएस" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(c\.?\s*m\.?\s*a\.?|cma|icwa|सीएमए|सी\.?\s*एम\.?\s*ए\.?)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "सीएमए" },

    // Pharmacy: B.Pharm, M.Pharm, D.Pharm
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(b\.?\s*pharm\.?|bpharm|b\s*pharma|बी\.?\s*फार्मा|बीफार्मा|बी\.?\s*फार्म)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "बी.फार्मा" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(m\.?\s*pharm\.?|mpharm|m\s*pharma|एम\.?\s*फार्मा|एमफार्मा|एम\.?\s*फार्म)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "एम.फार्मा" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(d\.?\s*pharm\.?|dpharm|d\s*pharma|डी\.?\s*फार्मा|डीफार्मा|डी\.?\s*फार्म)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "डी.फार्मा" },

    // Computer / Tech: PGDCA, DCA, ITI, Diploma, Polytechnic
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(pgdca|पीजीडीसीए|पी\.?\s*जी\.?\s*डी\.?\s*सी\.?\s*ए\.?)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "पीजीडीसीए" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(dca|डीसीए|डी\.?\s*सी\.?\s*ए\.?)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "डीसीए" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(iti|आईटीआई|आई\.?\s*टी\.?\s*आई\.?)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "आईटीआई" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(polytechnic|पॉलिटेक्निक|पोलिटेक्निक)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "पॉलिटेक्निक" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(diploma|डिप्लोमा)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "डिप्लोमा" },

    // Schooling & General
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(10th\s*pass|10th|10\s*वीं\s*पास|10\s*वीं|दसवीं\s*पास|दसवीं)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "10वीं" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(12th\s*pass|12th|12\s*वीं\s*पास|12\s*वीं|बारहवीं\s*पास|बारहवीं)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "12वीं" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(post\s*graduat(e|ion)|पोस्ट\s*ग्रेजुएशन|पोस्ट\s*ग्रेजुएट|स्नातकोत्तर)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "स्नातकोत्तर" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(graduat(e|ion)|ग्रेजुएशन|ग्रेजुएट|स्नातक)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "स्नातक" },
    { pattern: /(?<=^|[^a-zA-Z\u0900-\u097F])(honours|hons|ऑनर्स)(?=$|[^a-zA-Z\u0900-\u097F])/gi, replacement: "ऑनर्स" }
  ];

  for (const rule of degreeRules) {
    result = result.replace(rule.pattern, rule.replacement);
  }

  return result;
}

interface TransliteratedInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  isTextArea?: boolean;
  rows?: number;
}

export default function TransliteratedInput({
  id,
  value,
  onChange,
  label,
  placeholder = "",
  required = false,
  isTextArea = false,
  rows = 2
}: TransliteratedInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [autoHindi, setAutoHindi] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync from parent if changed externally (e.g. on reset or custom loading)
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const performTransliteration = async (textToConvert: string) => {
    if (!textToConvert.trim() || !autoHindi) return;

    // Check if the input is already entirely Hindi to save API bandwidth
    const isHindiOnly = /^[\u0900-\u097F\s\d+\-.,()@]+$/.test(textToConvert);
    if (isHindiOnly) return;

    setIsTransliterating(true);
    try {
      if (textToConvert.includes(",")) {
        const parts = textToConvert.split(",");
        const convertedParts = await Promise.all(
          parts.map(async (part) => {
            const trimmed = part.trim();
            if (!trimmed) return part;

            // If the part is already Hindi/numerals/symbols, skip transliteration
            const isPartHindi = /^[\u0900-\u097F\s\d+\-.,()@]+$/.test(trimmed);
            if (isPartHindi) return part;

            try {
              const res = await fetch("/api/transliterate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: trimmed })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.result) {
                  const leadSpace = part.match(/^\s*/)?.[0] || "";
                  const trailSpace = part.match(/\s*$/)?.[0] || "";
                  return leadSpace + formatDegreesToHindi(data.result) + trailSpace;
                }
              }
            } catch (err) {
              console.error("Single part transliteration failed:", err);
            }
            return part;
          })
        );
        const finalResult = formatDegreesToHindi(convertedParts.join(","));
        setLocalValue(finalResult);
        onChange(finalResult);
        return;
      }

      const res = await fetch("/api/transliterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToConvert })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const finalResult = formatDegreesToHindi(data.result);
          setLocalValue(finalResult);
          onChange(finalResult);
        }
      }
    } catch (err) {
      console.error("Transliteration request failed:", err);
    } finally {
      setIsTransliterating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const rawVal = e.target.value;
    const val = formatDegreesToHindi(rawVal);
    setLocalValue(val);
    onChange(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (autoHindi && val.trim().length > 0) {
      // Debounce the call to avoid hitting translation API too frequently
      timerRef.current = setTimeout(() => {
        performTransliteration(val);
      }, 1500); // slightly longer debounce "thodda ruk kar" as requested
    }
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoHindi && localValue.trim().length > 0) {
      performTransliteration(localValue);
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("⚠️ आपका ब्राउज़र वॉयस टाइपिंग (Speech Recognition) का समर्थन नहीं करता है। कृपया गूगल क्रोम का उपयोग करें।");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN"; // Hindi voice typing

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const space = localValue.trim() ? " " : "";
          const newVal = localValue + space + transcript;
          setLocalValue(newVal);
          onChange(newVal);
          if (autoHindi) {
            performTransliteration(newVal);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition failed to start:", err);
      setIsListening(false);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col space-y-1.5" id={id}>
      <div className="w-full flex flex-wrap items-center justify-between gap-1.5 min-w-0">
        <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-1 min-w-0 break-words">
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold shrink-0">*</span>}
        </label>
        
        <div className="flex items-center gap-1.5">
          {/* Voice Command Dictation Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`shrink-0 p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
              isListening
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
            title={isListening ? "सुनना बंद करें" : "बोलकर टाइप करें (Voice Typing)"}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setAutoHindi(!autoHindi)}
            className={`shrink-0 text-[11px] md:text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer select-none border ${
              autoHindi
                ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 shadow-2xs"
                : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
            }`}
            title="रोमन में टाइप करने पर स्वतः हिंदी में बदलने की व्यवस्था (क्लिक करके भाषा बदलें)"
          >
            <Languages className="w-3.5 h-3.5 shrink-0 text-orange-600" />
            <span>{autoHindi ? "हिन्दी" : "English"}</span>
            <span className="text-[10px] text-stone-400 font-normal">| {autoHindi ? "English" : "हिन्दी"}</span>
            {isTransliterating && <Loader2 className="w-3 h-3 animate-spin text-orange-600 shrink-0" />}
          </button>
        </div>
      </div>

      {isTextArea ? (
        <textarea
          rows={rows}
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder || `${label} रोमन में टाइप करें, वह हिंदी में बदल जायेगा या माइक बटन दबाकर बोलें...`}
          className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm md:text-[15px] shadow-xs"
        />
      ) : (
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder || `${label} रोमन में लिखें या माइक बटन दबाकर बोलें...`}
          className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm md:text-[15px] shadow-xs"
        />
      )}
    </div>
  );
}
