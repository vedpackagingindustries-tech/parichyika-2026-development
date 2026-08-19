import React, { useState, useEffect } from "react";
import {
  Heart,
  Building,
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  FileText,
  HelpCircle,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Hash,
  Loader2,
  Trash2,
  User,
  Plus,
  Send,
  Upload as UploadIcon,
  Sparkles,
  ChevronRight,
  BookOpen,
  CreditCard,
  Phone,
  Eye,
  EyeOff,
  Smartphone,
  Printer,
  Maximize2,
  Store,
  Gift,
  MessageSquare,
  Camera,
  AlertCircle,
  Info,
  X,
  Copy,
  Check,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";
import TransliteratedInput from "./components/TransliteratedInput";
import PaymentGatewayModal from "./components/PaymentGatewayModal";
import InvoicePDF from "./components/InvoicePDF";
import AdminPanel from "./components/AdminPanel";
import {
  District,
  Sangathan,
  Magazine,
  Edition,
  AdvertisementSize,
  Publication,
  MatrimonyFormState,
  BusinessFormState,
  CartItem,
  Order
} from "./types";

export function formatDegreesToHindi(text: string): string {
  if (!text) return text;
  let result = text;
  
  const mappings = [
    { keys: ["b\\.com", "bcom", "बीकॉम", "बी\\. कॉम", "बी\\. कॉम\\."], hindi: "बी.कॉम." },
    { keys: ["m\\.a", "ma", "एमए", "एम\\. ए", "एम\\. ए\\."], hindi: "एम.ए." },
    { keys: ["b\\.a", "ba", "बीए", "बी\\. ए", "बी\\. ए\\."], hindi: "बी.ए." },
    { keys: ["bca", "बीसीए"], hindi: "बीसीए" },
    { keys: ["mca", "एमसीए"], hindi: "एमसीए" },
    { keys: ["mba", "एमबीए"], hindi: "एमबीए" },
    { keys: ["b\\.sc", "bsc", "बीएससी", "बी\\. एससी", "बी\\. एससी\\."], hindi: "बी.एससी." },
    { keys: ["m\\.sc", "msc", "एमएससी", "एम\\. एससी", "एम\\. एससी\\."], hindi: "एम.एससी." },
    { keys: ["b\\.tech", "btech", "बीटेक", "बी\\. टेक", "बी\\. टेक\\."], hindi: "बी.टेक." },
    { keys: ["m\\.tech", "mtech", "एमटेक", "एम\\. टेक", "एम\\. टेक\\."], hindi: "एम.टेक." },
    { keys: ["ph\\.d", "phd", "पीएचडी", "पीएच\\. डी", "पीएच\\. डी\\."], hindi: "पीएच.डी." },
    { keys: ["b\\.ed", "bed", "बीएड", "बी\\. एड", "बी\\. एड\\."], hindi: "बी.एड." }
  ];

  for (const map of mappings) {
    for (const key of map.keys) {
      const regex = new RegExp(`(?<=^|[^a-zA-Z\\u0900-\\u097F])${key}(?=$|[^a-zA-Z\\u0900-\\u097F])`, "gi");
      result = result.replace(regex, map.hindi);
    }
  }

  return result;
}

export default function App() {
  // Navigation Screens: 'home' | 'matrimony_form' | 'business_form' | 'cart' | 'checkout' | 'invoice' | 'admin'
  const [screen, setScreen] = useState<"home" | "matrimony_form" | "business_form" | "cart" | "checkout" | "invoice" | "admin">("home");

  // Masters State loaded from Server
  const [masters, setMasters] = useState<{
    districts: District[];
    sangathans: Sangathan[];
    magazines: Magazine[];
    editions: Edition[];
    sizes: AdvertisementSize[];
    publications: Publication[];
  }>({
    districts: [],
    sangathans: [],
    magazines: [],
    editions: [],
    sizes: [],
    publications: []
  });

  const [userConfigs, setUserConfigs] = useState<any[]>([]);

  // Client Session ID for Persistent Shopping Cart
  const [sessionId, setSessionId] = useState("");

  // Cart State (loaded from server + local fallback)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Form selections and data structures
  const [selectedPubId, setSelectedPubId] = useState("");
  const [selectedSizeCode, setSelectedSizeCode] = useState("");
  const [matrimonyTheme, setMatrimonyTheme] = useState<"classic" | "premium" | "bold" | "minimal">("classic");
  const [matrimonyPreviewMode, setMatrimonyPreviewMode] = useState<"fit" | "print">("fit");
  const [showMatrimonyGuides, setShowMatrimonyGuides] = useState<boolean>(false);

  // Files upload loading helpers
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // 1. Matrimony Form Initial State
  const [matrimonyForm, setMatrimonyForm] = useState<MatrimonyFormState>({
    name: "",
    dob: "",
    height: "",
    blood_group: "",
    gotra: "",
    education: "",
    occupation: "",
    father_name: "",
    father_occupation: "",
    mother_name: "",
    mobile1: "",
    mobile2: "",
    whatsapp: "",
    currentAddress: "",
    permanentAddress: "",
    photoUrl: "",
    biodataUrl: "",
    district_id: "",
    sangathan_id: "",
    magazine_id: "",
    edition_id: ""
  });

  // 2. Business Form Initial State
  const [businessForm, setBusinessForm] = useState<BusinessFormState>({
    businessName: "",
    ownerName: "",
    category: "",
    businessDesc: "",
    productsServices: "",
    specialOffer: "",
    keyFeatures: "",
    mobile1: "",
    mobile2: "",
    whatsapp: "",
    email: "",
    businessAddress: "",
    otherAddress: "",
    logoUrl: "",
    photoUrl: "",
    readyAdUrl: "",
    district_id: "",
    sangathan_id: "",
    magazine_id: "",
    edition_id: "",
    size_code: ""
  });

  // Active form previews / Ad Maker states
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isAdMakerOpen, setIsAdMakerOpen] = useState(false);

  const uniqueDistricts = Array.from(new Set([
    ...userConfigs.map(c => c.district),
    ...masters.publications.map(p => p.district_hi)
  ])).filter(Boolean);

  const uniqueSangathans = Array.from(new Set([
    ...userConfigs.map(c => c.sangathan),
    ...masters.publications.map(p => p.sangathan_hi)
  ])).filter(Boolean);

  // New step-by-step wizard states with saved Ad IDs & numbers
  const [matrimonyStep, setMatrimonyStep] = useState<number>(1);
  const [businessStep, setBusinessStep] = useState<1 | 2 | 3>(1);
  const [showMatrimonyAdMaker, setShowMatrimonyAdMaker] = useState(false);
  const [savedAdId, setSavedAdId] = useState<number | null>(null);
  const [savedAdNumber, setSavedAdNumber] = useState("");
  const [nextMatrimonyAdNum, setNextMatrimonyAdNum] = useState("001");
  const [nextBusinessAdNum, setNextBusinessAdNum] = useState("BUS-001 / परिचायिका");
  const [savedPrice, setSavedPrice] = useState(500);

  // In-app Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  // Business Ad Workflow States (ChatGPT Workflow)
  const [businessLinks, setBusinessLinks] = useState({
    business_full: "",
    business_half: "",
    business_quarter: ""
  });
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);

  const BUSINESS_PROMPTS = {
    business_full: `Design a high-impact, professional Full Page Magazine Advertisement (Print Ready).
Dimensions: 7.2 inches width x 9.6 inches height (Aspect ratio ~3:4, High Resolution 300 DPI).
Include:
- Business Name & Slogan / Tagline
- Key Products & Services (with attractive imagery/vectors)
- Special Festival Offer or Discount Badge (e.g. 10% Off)
- Showroom Address & Location Landmark
- Contact Numbers & WhatsApp
Style: Elegant, modern, high-contrast typography, premium magazine color aesthetic.`,

    business_half: `Design a professional Half Page Horizontal Magazine Advertisement (Print Ready).
Dimensions: 7.2 inches width x 4.8 inches height (Aspect ratio 3:2, High Resolution 300 DPI).
Include:
- Prominent Business Name & Logo placement
- Core Offerings & Highlights
- Attractive Festive / Seasonal Offer
- Contact Mobile Numbers, WhatsApp, and Address
Style: Balanced horizontal layout, eye-catching banners, clean and legible text for publication.`,

    business_quarter: `Design a crisp, neat Quarter Page Vertical Magazine Advertisement (Print Ready).
Dimensions: 3.6 inches width x 4.8 inches height (Aspect ratio 3:4, High Resolution 300 DPI).
Include:
- Bold Business Name & Sector
- Top 3 Key Services / Products
- Special Discount / Offer note
- Direct Contact Phone Numbers & Address
Style: Compact, crisp typography, easily readable in compact print space.`
  };

  const handleCopyPrompt = async (key: "business_full" | "business_half" | "business_quarter") => {
    const promptText = BUSINESS_PROMPTS[key];
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promptText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = promptText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedPromptKey(key);
      showToast("✓ ChatGPT प्रॉम्ट क्लिपबोर्ड में कॉपी हो गया!", "success");
      setTimeout(() => {
        setCopiedPromptKey((curr) => (curr === key ? null : curr));
      }, 3000);
    } catch (err) {
      showToast("कॉपी करने में समस्या आई, कृपया मैन्युअली कॉपी करें।", "error");
    }
  };

  const handleAddBusinessAdToCart = async (sizeCode: "business_full" | "business_half" | "business_quarter") => {
    const link = businessLinks[sizeCode]?.trim();
    if (!link) {
      showToast("कृपया अपना डिज़ाइन लिंक (Design URL) दर्ज करें।", "error");
      return;
    }

    const sz = masters.sizes.find((s) => s.code === sizeCode);
    const sizeHi = sz ? sz.name_hi : (
      sizeCode === "business_full" ? "पूरा पृष्ठ (7.2 × 9.6 इंच)" :
      sizeCode === "business_half" ? "आधा पृष्ठ (7.2 × 4.8 इंच)" : "चौथाई पृष्ठ (3.6 × 4.8 इंच)"
    );

    setIsSubmittingBusiness(true);
    try {
      // 1. Save business ad record in database
      const saveRes = await fetch("/api/advertisements/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeCode: "business",
          sizeCode,
          customerName: "व्यवसायिक विज्ञापन",
          customerMobile: "9999999999",
          formData: {
            readyAdUrl: link,
            designLink: link,
            businessName: "व्यवसायिक विज्ञापन",
            size_code: sizeCode,
            size_hi: sizeHi,
            district_hi: "आवंटन प्रतीक्षित",
            sangathan_hi: "आवंटन प्रतीक्षित",
            magazine_hi: "परिचायिका",
            edition_hi: "संस्करण 2026"
          }
        })
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        showToast("त्रुटि: " + (errData.error || "सुरक्षित करने में असमर्थ"), "error");
        setIsSubmittingBusiness(false);
        return;
      }

      const savedData = await saveRes.json();

      // 2. Add to cart
      const cartRes = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          adType: "business",
          data: {
            adId: savedData.id,
            adNumber: savedData.adNumber,
            readyAdUrl: link,
            designLink: link,
            businessName: "व्यवसायिक विज्ञापन",
            size_code: sizeCode,
            size_hi: sizeHi,
            district_hi: "आवंटन प्रतीक्षित",
            sangathan_hi: "आवंटन प्रतीक्षित",
            magazine_hi: "परिचायिका",
            edition_hi: "संस्करण 2026"
          },
          price: savedData.price
        })
      });

      if (cartRes.ok) {
        await fetchCart();
        showToast("सफलता: व्यवसाय विज्ञापन कार्ट में जोड़ दिया गया है!", "success");
        setBusinessLinks((prev) => ({ ...prev, [sizeCode]: "" }));
        setScreen("cart");
      } else {
        const err = await cartRes.json();
        showToast("त्रुटि: " + (err.error || "कार्ट में जोड़ने में समस्या"), "error");
      }
    } catch (err: any) {
      showToast("नेटवर्क त्रुटि: " + err.message, "error");
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Helper to fetch live next ad number from database
  const fetchNextAdNumbers = () => {
    fetch("/api/advertisements/next-ad-number?type=matrimony")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.nextAdNumber) setNextMatrimonyAdNum(d.nextAdNumber);
      })
      .catch((e) => console.error("Error fetching next matrimony ad number:", e));

    fetch("/api/advertisements/next-ad-number?type=business")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.nextAdNumber) setNextBusinessAdNum(d.nextAdNumber);
      })
      .catch((e) => console.error("Error fetching next business ad number:", e));
  };

  // Checkout and Order Response
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    totalAmount: number;
    paymentStatus: string;
    upiPayload: string;
    recipientPhone: string;
  } | null>(null);

  // Payment proof reference input
  const [paymentRef, setPaymentRef] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);

  // Initializing Client Session & Masters
  useEffect(() => {
    // Session Setup
    let sId = localStorage.getItem("parichayika_session_id");
    if (!sId) {
      sId = `SESS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("parichayika_session_id", sId);
    }
    setSessionId(sId);

    // Fetch Masters from Backend API
    fetch("/api/masters")
      .then((res) => res.json())
      .then((data) => {
        setMasters({
          districts: data.districts || [],
          sangathans: data.sangathans || [],
          magazines: data.magazines || [],
          editions: data.editions || [],
          sizes: data.sizes || [],
          publications: data.publications || []
        });
      })
      .catch((err) => console.error("Error fetching masters:", err));

    // Fetch Admin Configurations
    fetch("/api/admin/configurations")
      .then((res) => res.json())
      .then((data) => {
        setUserConfigs(data || []);
      })
      .catch((err) => console.error("Error fetching configurations:", err));

    // Fetch initial next ad numbers
    fetchNextAdNumbers();
  }, []);

  // Dynamic custom fields definitions loaded from backend
  const [dynFields, setDynFields] = useState<{ matrimony: any[]; business: any[] }>({ matrimony: [], business: [] });

  useEffect(() => {
    fetch("/api/custom-fields/matrimony")
      .then(r => r.json())
      .then(d => setDynFields(prev => ({ ...prev, matrimony: d || [] })))
      .catch(e => console.error(e));

    fetch("/api/custom-fields/business")
      .then(r => r.json())
      .then(d => setDynFields(prev => ({ ...prev, business: d || [] })))
      .catch(e => console.error(e));
  }, []);

  // Fetch Cart Items whenever screen transitions to cart or sessionId loads
  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId, screen]);

  const fetchCart = async () => {
    setIsLoadingCart(true);
    try {
      const res = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Synchronize dynamic details of publication selection into forms
  const handlePubSelectionChange = (pubId: string, formType: "matrimony" | "business") => {
    setSelectedPubId(pubId);
    if (pubId && typeof pubId === "string" && pubId.startsWith("CONF-")) {
      const conf = userConfigs.find((c) => c.configuration_id === pubId);
      if (conf) {
        if (formType === "matrimony") {
          setMatrimonyForm((prev) => ({
            ...prev,
            district_id: "999",
            sangathan_id: "999",
            magazine_id: "999",
            edition_id: "999",
            district_hi: conf.district,
            sangathan_hi: conf.sangathan,
            magazine_hi: conf.magazine,
            edition_hi: conf.edition
          }));
        } else {
          setBusinessForm((prev) => ({
            ...prev,
            district_id: "999",
            sangathan_id: "999",
            magazine_id: "999",
            edition_id: "999",
            district_hi: conf.district,
            sangathan_hi: conf.sangathan,
            magazine_hi: conf.magazine,
            edition_hi: conf.edition
          }));
        }
      }
      return;
    }

    const pub = masters.publications.find((p) => String(p.id) === pubId);
    if (pub) {
      if (formType === "matrimony") {
        setMatrimonyForm((prev) => ({
          ...prev,
          district_id: String(pub.district_id),
          sangathan_id: String(pub.sangathan_id),
          magazine_id: String(pub.magazine_id),
          edition_id: String(pub.edition_id),
          district_hi: pub.district_hi,
          sangathan_hi: pub.sangathan_hi,
          magazine_hi: pub.magazine_hi,
          edition_hi: pub.edition_hi
        }));
      } else {
        setBusinessForm((prev) => ({
          ...prev,
          district_id: String(pub.district_id),
          sangathan_id: String(pub.sangathan_id),
          magazine_id: String(pub.magazine_id),
          edition_id: String(pub.edition_id),
          district_hi: pub.district_hi,
          sangathan_hi: pub.sangathan_hi,
          magazine_hi: pub.magazine_hi,
          edition_hi: pub.edition_hi
        }));
      }
    } else {
      if (formType === "matrimony") {
        setMatrimonyForm((prev) => ({
          ...prev,
          district_id: "",
          sangathan_id: "",
          magazine_id: "",
          edition_id: "",
          district_hi: "",
          sangathan_hi: "",
          magazine_hi: "",
          edition_hi: ""
        }));
      } else {
        setBusinessForm((prev) => ({
          ...prev,
          district_id: "",
          sangathan_id: "",
          magazine_id: "",
          edition_id: "",
          district_hi: "",
          sangathan_hi: "",
          magazine_hi: "",
          edition_hi: ""
        }));
      }
    }
  };

  // Upload status and retry helpers
  const [lastSelectedFiles, setLastSelectedFiles] = useState<{ [key: string]: File }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});
  const [uploadSuccesses, setUploadSuccesses] = useState<{ [key: string]: boolean }>({});

  // Secure File Uploading client pipeline with type checking
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | null, fieldName: string, fileObject?: File) => {
    const file = fileObject || e?.target?.files?.[0];
    if (!file) return;

    // Cache file for retries
    setLastSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));

    // Client-side extension validation
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      showToast("अमान्य फ़ाइल प्रकार! केवल JPG, JPEG, PNG और PDF की अनुमति है।", "error");
      return;
    }

    setUploadingField(fieldName);
    setUploadErrors((prev) => ({ ...prev, [fieldName]: "" }));
    setUploadSuccesses((prev) => ({ ...prev, [fieldName]: false }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          // Map to correct state field
          if (screen === "matrimony_form") {
            setMatrimonyForm((prev) => ({ ...prev, [fieldName]: data.url }));
          } else if (screen === "business_form") {
            setBusinessForm((prev) => ({ ...prev, [fieldName]: data.url }));
          }
          setUploadSuccesses((prev) => ({ ...prev, [fieldName]: true }));
          showToast("फ़ाइल सफलतापूर्वक अपलोड हो गई!", "success");
        } else {
          setUploadErrors((prev) => ({ ...prev, [fieldName]: "सर्वर से फाइल यूआरएल प्राप्त नहीं हुआ।" }));
          showToast("सर्वर से फाइल यूआरएल प्राप्त नहीं हुआ।", "error");
        }
      } else {
        const err = await res.json();
        setUploadErrors((prev) => ({ ...prev, [fieldName]: err.error || "अपलोड करने में असमर्थ" }));
        showToast(err.error || "अपलोड करने में असमर्थ", "error");
      }
    } catch (err) {
      setUploadErrors((prev) => ({ ...prev, [fieldName]: "नेटवर्क त्रुटि के कारण अपलोड करने में असमर्थ" }));
      showToast("नेटवर्क त्रुटि के कारण अपलोड करने में असमर्थ", "error");
    } finally {
      setUploadingField(null);
    }
  };

  const handleUploadRetry = (fieldName: string) => {
    const file = lastSelectedFiles[fieldName];
    if (file) {
      handleFileUpload(null, fieldName, file);
    } else {
      showToast("कृपया फ़ाइल पुनः चुनें।", "info");
    }
  };

  const handleUploadRemove = (fieldName: string) => {
    if (screen === "matrimony_form") {
      setMatrimonyForm((prev) => ({ ...prev, [fieldName]: "" }));
    } else if (screen === "business_form") {
      setBusinessForm((prev) => ({ ...prev, [fieldName]: "" }));
    }
    setUploadSuccesses((prev) => ({ ...prev, [fieldName]: false }));
    setUploadErrors((prev) => ({ ...prev, [fieldName]: "" }));
    setLastSelectedFiles((prev) => {
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });
  };

  // Server Calculated authorative price finder
  const getCalculatedPrice = (adType: "matrimony" | "business", sizeCode?: string): number => {
    if (selectedPubId && typeof selectedPubId === "string" && selectedPubId.startsWith("CONF-")) {
      const conf = userConfigs.find((c) => c.configuration_id === selectedPubId);
      if (conf) return conf.pricing;
    }
    const pub = masters.publications.find((p) => String(p.id) === selectedPubId);
    if (!pub) return adType === "matrimony" ? 500 : 1500;

    // Search matches inside masters.pricings
    const targetSize = adType === "matrimony" ? "matrimony_standard" : (sizeCode || "business_full");
    
    // In-memory lookup based on priced combinations
    if (adType === "matrimony") return pub.district_id === 1 ? 500 : pub.district_id === 2 ? 450 : 400;
    
    // Business rates depending on full, half, quarter size
    switch (targetSize) {
      case "business_full": return pub.district_id === 1 ? 5000 : 4500;
      case "business_half": return pub.district_id === 1 ? 3000 : 2500;
      case "business_quarter": return pub.district_id === 1 ? 1500 : 1200;
      default: return pub.district_id === 1 ? 2500 : 2000;
    }
  };

  const validateMobile = (num: string): boolean => {
    const clean = num.replace(/[^0-9]/g, "");
    return clean.length === 10;
  };

  // Step-by-step navigation helpers for Matrimony Form
  const handleNextMatrimonyStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!matrimonyForm.name?.trim()) {
        showToast("कृपया युवक-युवती का नाम अवश्य भरें।", "error");
        return;
      }
      if (!matrimonyForm.dob?.trim()) {
        showToast("कृपया जन्म तिथि अवश्य चुनें।", "error");
        return;
      }
      if (!matrimonyForm.height?.trim()) {
        showToast("कृपया ऊँचाई अवश्य दर्ज करें (उदा. 5.4 ft)।", "error");
        return;
      }
      if (!matrimonyForm.blood_group?.trim()) {
        showToast("कृपया रक्त समूह अवश्य दर्ज करें (उदा. B+, O+)।", "error");
        return;
      }
      if (!matrimonyForm.gotra?.trim()) {
        showToast("कृपया गोत्र अवश्य भरें।", "error");
        return;
      }
      if (!matrimonyForm.occupation?.trim()) {
        showToast("कृपया व्यवसाय/नौकरी अवश्य भरें।", "error");
        return;
      }
      if (!matrimonyForm.education?.trim()) {
        showToast("कृपया विस्तृत शैक्षणिक योग्यता अवश्य भरें।", "error");
        return;
      }
      if (!matrimonyForm.photoUrl?.trim()) {
        showToast("कृपया युवक/युवती का पासपोर्ट फोटो अवश्य अपलोड करें।", "error");
        return;
      }
      setMatrimonyStep(2);
    } else if (currentStep === 2) {
      if (!matrimonyForm.father_name?.trim()) {
        showToast("कृपया पिता का नाम अवश्य भरें।", "error");
        return;
      }
      if (!matrimonyForm.father_occupation?.trim()) {
        showToast("कृपया पिता का व्यवसाय अवश्य भरें।", "error");
        return;
      }
      if (!matrimonyForm.mother_name?.trim()) {
        showToast("कृपया माता का नाम अवश्य भरें।", "error");
        return;
      }
      setMatrimonyStep(3);
    }
  };

  const handlePrevMatrimonyStep = () => {
    if (matrimonyStep > 1) {
      setMatrimonyStep(matrimonyStep - 1);
    } else {
      setScreen("home");
    }
  };

  // Matrimony Form: Validate Details and Save directly to DB -> Proceed to Step 4 (Visual Preview)
  const handleMatrimonySave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Step 1 Validation
    if (!matrimonyForm.name?.trim()) {
      showToast("कृपया युवक-युवती का नाम अवश्य भरें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.dob?.trim()) {
      showToast("कृपया जन्म तिथि अवश्य चुनें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.height?.trim()) {
      showToast("कृपया ऊँचाई अवश्य दर्ज करें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.blood_group?.trim()) {
      showToast("कृपया रक्त समूह अवश्य दर्ज करें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.gotra?.trim()) {
      showToast("कृपया गोत्र अवश्य भरें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.occupation?.trim()) {
      showToast("कृपया व्यवसाय/नौकरी अवश्य भरें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.education?.trim()) {
      showToast("कृपया शैक्षणिक योग्यता अवश्य भरें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }
    if (!matrimonyForm.photoUrl?.trim()) {
      showToast("कृपया युवक/युवती का फोटो अवश्य अपलोड करें (चरण 1)।", "error");
      setMatrimonyStep(1);
      return;
    }

    // Step 2 Validation
    if (!matrimonyForm.father_name?.trim()) {
      showToast("कृपया पिता का नाम अवश्य भरें (चरण 2)।", "error");
      setMatrimonyStep(2);
      return;
    }
    if (!matrimonyForm.father_occupation?.trim()) {
      showToast("कृपया पिता का व्यवसाय अवश्य भरें (चरण 2)।", "error");
      setMatrimonyStep(2);
      return;
    }
    if (!matrimonyForm.mother_name?.trim()) {
      showToast("कृपया माता का नाम अवश्य भरें (चरण 2)।", "error");
      setMatrimonyStep(2);
      return;
    }

    // Step 3 Validation (Only mobile2 is optional)
    if (!matrimonyForm.mobile1?.trim()) {
      showToast("कृपया प्राथमिक मोबाइल नंबर (Mobile 1) अवश्य भरें।", "error");
      return;
    }
    if (!validateMobile(matrimonyForm.mobile1)) {
      showToast("प्राथमिक मोबाइल नंबर (Mobile 1) ठीक 10 अंकों का होना आवश्यक है।", "error");
      return;
    }
    if (matrimonyForm.mobile2 && !validateMobile(matrimonyForm.mobile2)) {
      showToast("द्वितीयक मोबाइल नंबर (Mobile 2) ठीक 10 अंकों का होना आवश्यक है।", "error");
      return;
    }
    if (!matrimonyForm.whatsapp?.trim()) {
      showToast("कृपया व्हाट्सएप नंबर अवश्य भरें।", "error");
      return;
    }
    if (!validateMobile(matrimonyForm.whatsapp)) {
      showToast("व्हाट्सएप नंबर ठीक 10 अंकों का होना आवश्यक है।", "error");
      return;
    }
    if (!matrimonyForm.currentAddress?.trim()) {
      showToast("कृपया वर्तमान पता अवश्य भरें।", "error");
      return;
    }
    if (!matrimonyForm.permanentAddress?.trim()) {
      showToast("कृपया स्थायी पता अवश्य भरें।", "error");
      return;
    }

    const payload = {
      adId: savedAdId, // can be null or a pre-existing ID for edit
      typeCode: "matrimony",
      publicationId: selectedPubId || "CUSTOM",
      customerName: matrimonyForm.name,
      customerMobile: matrimonyForm.mobile1,
      formData: {
        ...matrimonyForm,
        district_hi: matrimonyForm.district_hi || "आवंटन प्रतीक्षित",
        sangathan_hi: matrimonyForm.sangathan_hi || "आवंटन प्रतीक्षित",
        magazine_hi: matrimonyForm.magazine_hi || "परिचायिका",
        edition_hi: matrimonyForm.edition_hi || "संस्करण 2026"
      }
    };

    try {
      const res = await fetch("/api/advertisements/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAdId(data.id);
        setSavedAdNumber(data.adNumber);
        setSavedPrice(data.price || 500);
        setMatrimonyForm((prev) => ({
          ...prev,
          district_hi: data.district_hi || prev.district_hi || "आवंटन प्रतीक्षित",
          sangathan_hi: data.sangathan_hi || prev.sangathan_hi || "आवंटन प्रतीक्षित",
          magazine_hi: data.magazine_hi || prev.magazine_hi || "परिचायिका",
          edition_hi: data.edition_hi || prev.edition_hi || "संस्करण 2026"
        }));
        showToast("विवरण सुरक्षित हो गया! सटीक प्रीव्यू देखें।", "success");
        setMatrimonyStep(4); // Go directly to Visual Preview
      } else {
        const err = await res.json();
        showToast("त्रुटि: " + (err.error || "सुरक्षित करने में विफल।"), "error");
      }
    } catch (err) {
      console.error("Save failed:", err);
      showToast("नेटवर्क त्रुटि: विज्ञापन सुरक्षित करने में असमर्थ", "error");
    }
  };

  // Matrimony Form Step 4: Approve Standard Block -> Add to Cart
  const handleMatrimonyApprove = async () => {
    let adIdToUse = savedAdId;
    let adNumToUse = savedAdNumber;
    let priceToUse = savedPrice || 500;

    // Auto-save safeguard: if savedAdId or savedAdNumber is not set yet, save immediately first
    if (!adIdToUse || !adNumToUse) {
      try {
        const payload = {
          adId: null,
          typeCode: "matrimony",
          publicationId: selectedPubId || "CUSTOM",
          customerName: matrimonyForm.name || "युवक-युवती",
          customerMobile: matrimonyForm.mobile1 || "0000000000",
          formData: {
            ...matrimonyForm,
            district_hi: matrimonyForm.district_hi || "रायपुर",
            sangathan_hi: matrimonyForm.sangathan_hi || "रायपुर साहू संगठन",
            magazine_hi: matrimonyForm.magazine_hi || "परिचायिका",
            edition_hi: matrimonyForm.edition_hi || "संस्करण 2026"
          }
        };
        const res = await fetch("/api/advertisements/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          adIdToUse = data.id;
          adNumToUse = data.adNumber;
          priceToUse = data.price || 500;
          setSavedAdId(adIdToUse);
          setSavedAdNumber(adNumToUse);
          setSavedPrice(priceToUse);
        } else {
          const err = await res.json();
          showToast("त्रुटि: " + (err.error || "विज्ञापन सुरक्षित नहीं हो सका।"), "error");
          return;
        }
      } catch (e) {
        console.error("Auto-save failed:", e);
        showToast("नेटवर्क त्रुटि: विज्ञापन सुरक्षित करने में असमर्थ", "error");
        return;
      }
    }

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          adType: "matrimony",
          data: {
            ...matrimonyForm,
            adId: adIdToUse,
            adNumber: adNumToUse
          },
          price: priceToUse
        })
      });

      if (res.ok) {
        showToast("सफलता: प्रविष्टि को कार्ट में जोड़ दिया गया है।", "success");
        // Reset form states completely
        setMatrimonyForm({
          name: "", dob: "", height: "", blood_group: "", gotra: "",
          education: "", occupation: "", father_name: "", father_occupation: "", mother_name: "",
          mobile1: "", mobile2: "", whatsapp: "", currentAddress: "", permanentAddress: "",
          photoUrl: "", biodataUrl: "", district_hi: "रायपुर", sangathan_hi: "रायपुर साहू संगठन",
          magazine_hi: "परिचायिका", edition_hi: "संस्करण 2026"
        });
        setSelectedPubId("");
        setSelectedSizeCode("");
        setSavedAdId(null);
        setSavedAdNumber("");
        setShowMatrimonyAdMaker(false);
        setMatrimonyStep(1);
        fetchCart();
        setScreen("cart");
      }
    } catch (err) {
      console.error("Cart add failed:", err);
      showToast("कार्ट में जोड़ने में समस्या आई", "error");
    }
  };

  // Matrimony Form Step 3: Receive approved layout from AI Ad Maker -> Add to Cart
  const handleApproveMatrimonyAdMakerDesign = async (approvedLayout: any, dimensions?: any, readyAdFileUrl?: string) => {
    let adIdToUse = savedAdId;
    let adNumToUse = savedAdNumber;
    let priceToUse = savedPrice || 500;

    if (!adIdToUse || !adNumToUse) {
      try {
        const payload = {
          adId: null,
          typeCode: "matrimony",
          publicationId: selectedPubId || "CUSTOM",
          customerName: matrimonyForm.name || "युवक-युवती",
          customerMobile: matrimonyForm.mobile1 || "0000000000",
          formData: {
            ...matrimonyForm,
            district_hi: matrimonyForm.district_hi || "रायपुर",
            sangathan_hi: matrimonyForm.sangathan_hi || "रायपुर साहू संगठन",
            magazine_hi: matrimonyForm.magazine_hi || "परिचायिका",
            edition_hi: matrimonyForm.edition_hi || "संस्करण 2026"
          }
        };
        const res = await fetch("/api/advertisements/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          adIdToUse = data.id;
          adNumToUse = data.adNumber;
          priceToUse = data.price || 500;
          setSavedAdId(adIdToUse);
          setSavedAdNumber(adNumToUse);
          setSavedPrice(priceToUse);
        } else {
          const err = await res.json();
          showToast("त्रुटि: " + (err.error || "विज्ञापन सुरक्षित नहीं हो सका।"), "error");
          return;
        }
      } catch (e) {
        console.error("Auto-save failed:", e);
        showToast("नेटवर्क त्रुटि: विज्ञापन सुरक्षित करने में असमर्थ", "error");
        return;
      }
    }

    const updatedForm = {
      ...matrimonyForm,
      adMakerDesignJson: approvedLayout,
      customDimensions: dimensions,
      readyAdUrl: readyAdFileUrl || matrimonyForm.biodataUrl,
      adId: adIdToUse,
      adNumber: adNumToUse
    };

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          adType: "matrimony",
          data: updatedForm,
          price: priceToUse
        })
      });

      if (res.ok) {
        showToast("सफलता: वैवाहिक प्रविष्टि को AI Ad Maker डिज़ाइन के साथ कार्ट में जोड़ दिया गया है।", "success");
        setMatrimonyForm({
          name: "", dob: "", height: "", blood_group: "", gotra: "",
          education: "", occupation: "", father_name: "", father_occupation: "", mother_name: "",
          mobile1: "", mobile2: "", whatsapp: "", currentAddress: "", permanentAddress: "",
          photoUrl: "", biodataUrl: "", district_hi: "रायपुर", sangathan_hi: "रायपुर साहू संगठन",
          magazine_hi: "परिचायिका", edition_hi: "संस्करण 2026"
        });
        setSelectedPubId("");
        setSelectedSizeCode("");
        setSavedAdId(null);
        setSavedAdNumber("");
        setShowMatrimonyAdMaker(false);
        setMatrimonyStep(1);
        fetchCart();
        setScreen("cart");
      }
    } catch (err) {
      console.error("Matrimony custom ad cart failed:", err);
      showToast("कार्ट में जोड़ने में समस्या आई", "error");
    }
  };

  // Remove from Shopping Cart API Call
  const handleRemoveCartItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/cart/remove/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Cart Item: Pulls item out of cart, populates state, and directs to form
  const handleEditCartItem = async (item: any) => {
    try {
      const res = await fetch(`/api/cart/remove/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedAdId(item.data.adId || item.data.ad_id || null);
        setSavedAdNumber(item.data.adNumber || item.data.ad_number || "");
        setSavedPrice(item.price);
        
        if (item.adType === "matrimony") {
          setMatrimonyForm({
            name: item.data.name || "",
            dob: item.data.dob || "",
            height: item.data.height || "",
            blood_group: item.data.blood_group || "",
            gotra: item.data.gotra || "",
            education: item.data.education || "",
            occupation: item.data.occupation || "",
            father_name: item.data.father_name || "",
            father_occupation: item.data.father_occupation || "",
            mother_name: item.data.mother_name || "",
            mobile1: item.data.mobile1 || "",
            mobile2: item.data.mobile2 || "",
            whatsapp: item.data.whatsapp || "",
            currentAddress: item.data.currentAddress || "",
            permanentAddress: item.data.permanentAddress || "",
            photoUrl: item.data.photoUrl || "",
            biodataUrl: item.data.biodataUrl || "",
            district_id: item.data.district_id || "",
            sangathan_id: item.data.sangathan_id || "",
            magazine_id: item.data.magazine_id || "",
            edition_id: item.data.edition_id || "",
            district_hi: item.data.district_hi || "",
            sangathan_hi: item.data.sangathan_hi || "",
            magazine_hi: item.data.magazine_hi || "परिचायिका",
            edition_hi: item.data.edition_hi || "संस्करण 2026"
          });
          setSelectedPubId(item.data.publication_id || item.data.publicationId || "");
          setMatrimonyStep(1);
          setScreen("matrimony_form");
        } else {
          const code = (item.data.size_code || item.data.sizeCode || "business_full") as "business_full" | "business_half" | "business_quarter";
          const link = item.data.readyAdUrl || item.data.designLink || "";
          setBusinessLinks((prev) => ({
            ...prev,
            [code]: link
          }));
          setScreen("business_form");
        }
        
        fetchCart();
      }
    } catch (err) {
      console.error("Edit cart item load error:", err);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Finalize order creation and fetch Dynamic UPI Payload
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone) {
      showToast("कृपया मुख्य संपर्क नाम और मोबाइल नंबर अवश्य भरें।", "error");
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/order/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          customerName: checkoutName,
          customerMobile: checkoutPhone
        })
      });

      if (res.ok) {
        const result = await res.json();
        setOrderResult(result);
        setScreen("checkout");
      } else {
        const err = await res.json();
        showToast(`चेकआउट विफल: ${err.error}`, "error");
      }
    } catch (err) {
      showToast("चेकआउट सर्वर त्रुटि", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Customer confirms payment completion
  const handleConfirmPayment = async (utrOrRef: string, screenshotUrl: string) => {
    setSubmittingPayment(true);
    try {
      const res = await fetch("/api/order/payment-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderResult?.orderId,
          paymentRef: utrOrRef || paymentRef || "DIRECT_UPI_CONFIRMED",
          paymentScreenshot: screenshotUrl,
          customerName: checkoutName
        })
      });

      // Build invoice object to show instantly to client
      const invoicePayload: Order = {
        id: Date.now(),
        order_id: orderResult?.orderId || "ORD-PENDING",
        total_amount: orderResult?.totalAmount || 0,
        payment_status: "SUBMITTED",
        payment_ref: utrOrRef,
        payment_screenshot: screenshotUrl,
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        items: cart.map((it, idx) => ({
          id: idx,
          order_id: orderResult?.orderId || "ORD-PENDING",
          ad_number: it.data.adNumber || it.data.ad_number || `00${idx + 1}`,
          ad_type: it.adType,
          district_hi: it.data.district_hi || "रायपुर",
          sangathan_hi: it.data.sangathan_hi || "साहू संगठन",
          magazine_hi: it.data.magazine_hi || "परिचायिका",
          edition_hi: it.data.edition_hi || "संस्करण 2026",
          size_hi: it.adType === "matrimony" ? "विवाह मानक (3.5 × 2 इंच)" : (it.data as BusinessFormState).size_hi || "आकार",
          price: it.price,
          customer_name: checkoutName,
          customer_mobile: checkoutPhone,
          matrimonyDetails: it.adType === "matrimony" ? it.data : null,
          businessDetails: it.adType === "business" ? it.data : null
        }))
      };

      setActiveInvoiceOrder(invoicePayload);
      setScreen("invoice");
      showToast("भुगतान संदर्भ सफलतापूर्वक दर्ज हुआ!", "success");
      // Reset checkout state
      setOrderResult(null);
      setCheckoutName("");
      setCheckoutPhone("");
      setPaymentRef("");
      setCart([]);
    } catch (err) {
      showToast("भुगतान दर्ज करने में त्रुटि", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-[#2D2D2D] relative">
      {/* Universal Floating In-App Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all ${
          toast.type === "success"
            ? "bg-emerald-900/95 text-emerald-50 border-emerald-700 backdrop-blur-md"
            : toast.type === "error"
            ? "bg-red-900/95 text-red-50 border-red-700 backdrop-blur-md"
            : "bg-stone-900/95 text-stone-50 border-stone-700 backdrop-blur-md"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-orange-400 shrink-0" />
          )}
          <span className="flex-1 text-xs sm:text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg cursor-pointer transition-colors text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <datalist id="district-datalist">
        {uniqueDistricts.map((d, idx) => (
          <option key={idx} value={d} />
        ))}
      </datalist>
      <datalist id="sangathan-datalist">
        {uniqueSangathans.map((s, idx) => (
          <option key={idx} value={s} />
        ))}
      </datalist>

      {/* HEADER */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3.5 flex justify-between items-center shrink-0 shadow-xs sticky top-0 z-30 print:hidden">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setScreen("home")}>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-2 sm:p-2.5 rounded-xl shadow-md text-white">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#E65100] tracking-tight">
                परिचायिका
              </h1>
              <span className="hidden sm:inline-block bg-orange-100 text-[#E65100] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                2026
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-400 font-bold">
              Powered by Indian Press, Raipur
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/60">
          <button
            onClick={() => setScreen("home")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              screen === "home" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            होमपेज
          </button>
          <button
            onClick={() => {
              setSavedAdId(null);
              setSavedAdNumber("");
              setSelectedPubId("");
              setSelectedSizeCode("");
              setMatrimonyStep(1);
              fetchNextAdNumbers();
              setScreen("matrimony_form");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "matrimony_form" ? "bg-white text-[#E65100] shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#E65100]" />
            विवाह प्रविष्टि
          </button>
          <button
            onClick={() => {
              setSavedAdId(null);
              setSavedAdNumber("");
              setSelectedPubId("");
              setSelectedSizeCode("");
              setBusinessStep(1);
              fetchNextAdNumbers();
              setScreen("business_form");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "business_form" ? "bg-white text-emerald-700 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            व्यापार विज्ञापन
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setScreen("cart")}
            className={`relative p-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer border ${
              screen === "cart"
                ? "bg-orange-50 text-[#E65100] border-orange-200"
                : "text-stone-700 hover:text-[#E65100] border-stone-200 hover:bg-stone-50"
            }`}
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs font-bold">कार्ट</span>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {cart.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setScreen(screen === "admin" ? "home" : "admin")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer border ${
              screen === "admin"
                ? "bg-stone-900 text-white border-stone-900"
                : "border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{screen === "admin" ? "होमपेज" : "सुपर एडमिन"}</span>
            <span className="sm:hidden">एडमिन</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 pb-28 md:pb-12">
        {/* HOMEPAGE */}
        {screen === "home" && (
          <div className="space-y-12 my-6">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
                साहू समाज युवक-युवती परिचय सम्मेलन की प्रविष्टियाँ यहाँ दें
              </h2>
              <p className="text-sm text-stone-500 max-w-lg mx-auto">
                परिचायिका पत्रिका प्रकाशन एवं सम्मेलन में सहभागिता हेतु अपने विवाह विवरण या व्यापार के विज्ञापन यहाँ सीधे दर्ज करें।
              </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Box 1: Matrimony Entry */}
              <div
                onClick={() => {
                  setSavedAdId(null);
                  setSavedAdNumber("");
                  setSelectedPubId("");
                  setSelectedSizeCode("");
                  setMatrimonyStep(1);
                  setMatrimonyForm({
                    name: "", dob: "", height: "", blood_group: "", gotra: "",
                    education: "", occupation: "", father_name: "", father_occupation: "", mother_name: "",
                    mobile1: "", mobile2: "", whatsapp: "", currentAddress: "", permanentAddress: "",
                    photoUrl: "", biodataUrl: "", district_id: "", sangathan_id: "", magazine_id: "", edition_id: ""
                  });
                  fetchNextAdNumbers();
                  setScreen("matrimony_form");
                }}
                className="group cursor-pointer bg-white border border-stone-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl p-8 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Heart className="w-8 h-8 text-[#E65100] fill-orange-100" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">विवाह विज्ञापन दें</h3>
                <p className="text-stone-500 text-xs">
                  स्वयं या परिवार के युवक-युवती परिचय सम्मेलन विवरण दर्ज करें एवं मानक ३.५ × २ इंच आकार का कॉलम बुक करें।
                </p>
                <span className="inline-flex items-center text-[#E65100] font-bold text-xs pt-2">
                  प्रविष्टि प्रारंभ करें <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>

              {/* Box 2: Business Entry */}
              <div
                onClick={() => {
                  setSavedAdId(null);
                  setSavedAdNumber("");
                  setSelectedPubId("");
                  setSelectedSizeCode("");
                  setBusinessStep(1);
                  setBusinessForm({
                    businessName: "", ownerName: "", category: "", businessDesc: "", productsServices: "",
                    specialOffer: "", keyFeatures: "", mobile1: "", mobile2: "", whatsapp: "", email: "",
                    businessAddress: "", otherAddress: "", logoUrl: "", photoUrl: "", readyAdUrl: "",
                    district_id: "", sangathan_id: "", magazine_id: "", edition_id: "", size_code: ""
                  });
                  fetchNextAdNumbers();
                  setScreen("business_form");
                }}
                className="group cursor-pointer bg-white border border-stone-200 hover:border-orange-600 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl p-8 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-orange-50/60 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">व्यवसाय विज्ञापन दें</h3>
                <p className="text-stone-500 text-xs">
                  अपने व्यापार/दुकान की परिचायिका विज्ञापन बुक करें। आकर्षक डिज़ाइन बनाने हेतु AI एड-मेकर की सुविधा।
                </p>
                <span className="inline-flex items-center text-orange-600 font-bold text-xs pt-2">
                  प्रारंभ करें <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MATRIMONY ENTRY FORM */}
        {screen === "matrimony_form" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <button
                onClick={handlePrevMatrimonyStep}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-stone-500" />
                {matrimonyStep > 1 ? "पिछला चरण (Back)" : "वापस होमपेज"}
              </button>

              {/* Responsive Step Progress Wizard */}
              <div className="flex items-center gap-1.5 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => setMatrimonyStep(1)}
                  className="flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-all p-1 rounded-lg"
                  title="चरण 1: निजी विवरण"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    matrimonyStep === 1 ? "bg-[#E65100] text-white shadow-xs ring-2 ring-orange-200" : "bg-emerald-600 text-white"
                  }`}>
                    {matrimonyStep > 1 ? "✓" : "1"}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-bold ${matrimonyStep === 1 ? "text-[#E65100] font-extrabold" : "text-stone-500"}`}>
                    निजी विवरण
                  </span>
                </button>

                <div className="w-4 sm:w-6 h-0.5 bg-stone-200 shrink-0"></div>

                <button
                  type="button"
                  onClick={() => setMatrimonyStep(2)}
                  className="flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-all p-1 rounded-lg"
                  title="चरण 2: परिवार विवरण"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    matrimonyStep === 2 ? "bg-[#E65100] text-white shadow-xs ring-2 ring-orange-200" : matrimonyStep > 2 ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"
                  }`}>
                    {matrimonyStep > 2 ? "✓" : "2"}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-bold ${matrimonyStep === 2 ? "text-[#E65100] font-extrabold" : "text-stone-500"}`}>
                    परिवार विवरण
                  </span>
                </button>

                <div className="w-4 sm:w-6 h-0.5 bg-stone-200 shrink-0"></div>

                <button
                  type="button"
                  onClick={() => setMatrimonyStep(3)}
                  className="flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-all p-1 rounded-lg"
                  title="चरण 3: संपर्क विवरण"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    matrimonyStep === 3 ? "bg-[#E65100] text-white shadow-xs ring-2 ring-orange-200" : matrimonyStep > 3 ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"
                  }`}>
                    {matrimonyStep > 3 ? "✓" : "3"}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-bold ${matrimonyStep === 3 ? "text-[#E65100] font-extrabold" : "text-stone-500"}`}>
                    संपर्क विवरण
                  </span>
                </button>

                <div className="w-4 sm:w-6 h-0.5 bg-stone-200 shrink-0"></div>

                <button
                  type="button"
                  onClick={() => {
                    if (savedAdId) {
                      setMatrimonyStep(4);
                    } else {
                      showToast("कृपया पहले चरण 3 में विवरण सुरक्षित करें।", "info");
                    }
                  }}
                  className="flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-all p-1 rounded-lg"
                  title="चरण 4: सटीक प्रीव्यू"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    matrimonyStep === 4 ? "bg-[#E65100] text-white shadow-xs ring-2 ring-orange-200" : "bg-stone-200 text-stone-600"
                  }`}>
                    4
                  </span>
                  <span className={`text-[11px] sm:text-xs font-bold ${matrimonyStep === 4 ? "text-[#E65100] font-extrabold" : "text-stone-400"}`}>
                    सटीक प्रीव्यू
                  </span>
                </button>
              </div>
            </div>

            {matrimonyStep <= 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Inputs (Left) */}
                <div className="lg:col-span-7 space-y-6">
                  <form onSubmit={handleMatrimonySave} className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6">
                    {/* Auto Ad Number Card (Mandatory / Auto Allocated) - Show on Step 1 */}
                    {matrimonyStep === 1 && (
                      <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#E65100] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                            <Hash className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                                ऑटो विज्ञापन क्रमांक (Auto Ad Number)
                              </label>
                              <span className="bg-[#E65100] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> अनिवार्य / Auto Assigned
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">
                              परिचायिका पुस्तिका में आपकी प्रविष्टि का सिस्टम-आवंटित क्रमांक (Sequential ID)
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-white border border-orange-300 px-3.5 py-1.5 rounded-lg shadow-2xs shrink-0">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">आवंटित संख्या</span>
                          <span className="text-base sm:text-xl font-mono font-black text-[#E65100]">
                            {savedAdNumber || nextMatrimonyAdNum || "001"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step 1 Content: Personal Details */}
                    {matrimonyStep === 1 && (
                      <div className="space-y-6">
                        <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <h3 className="text-base font-black text-stone-800">चरण 1: युवक-युवती का निजी विवरण</h3>
                            <p className="text-xs text-stone-500">सभी व्यक्तिगत जानकारी दर्ज करें जो विवाह कार्ड पर प्रदर्शित होगी।</p>
                          </div>
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full w-fit">
                            * सभी फ़ील्ड अनिवार्य हैं
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <TransliteratedInput
                            value={matrimonyForm.name}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, name: val })}
                            label="युवक-युवती का नाम (Name)"
                            required
                          />

                          <div className="w-full min-w-0 flex flex-col space-y-1.5">
                            <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-1">
                              <span>जन्म तिथि (Date of Birth)</span>
                              <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={matrimonyForm.dob}
                              onChange={(e) => setMatrimonyForm({ ...matrimonyForm, dob: e.target.value })}
                              className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white text-sm md:text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-xs"
                            />
                          </div>

                          <TransliteratedInput
                            value={matrimonyForm.height}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, height: val })}
                            label="ऊँचाई (Height - e.g. 5.4 ft)"
                            required
                          />

                          <div className="w-full min-w-0 flex flex-col space-y-1.5">
                            <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-1">
                              <span>रक्त समूह (Blood Group)</span>
                              <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={matrimonyForm.blood_group}
                              onChange={(e) => setMatrimonyForm({ ...matrimonyForm, blood_group: e.target.value })}
                              className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white placeholder-stone-400 text-sm md:text-[15px] outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium shadow-xs"
                              placeholder="उदा. AB+, O+, B+"
                            />
                          </div>

                          <TransliteratedInput
                            value={matrimonyForm.gotra}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, gotra: val })}
                            label="गोत्र (Gotra)"
                            required
                          />

                          <TransliteratedInput
                            value={matrimonyForm.occupation}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, occupation: val })}
                            label="व्यवसाय/नौकरी (Occupation)"
                            required
                          />

                          <div className="w-full col-span-1 md:col-span-2">
                            <TransliteratedInput
                              value={matrimonyForm.education}
                              onChange={(val) => setMatrimonyForm({ ...matrimonyForm, education: formatDegreesToHindi(val) })}
                              label="विस्तृत शैक्षणिक योग्यता (Education Detail)"
                              required
                              isTextArea
                              rows={2}
                              placeholder="अल्पविराम ( , ) लगाकर एक से अधिक डिग्री दर्ज करें (जैसे: 12th, B.Com, MBA...)"
                            />
                          </div>

                          {/* Dynamic Custom Fields */}
                          {dynFields.matrimony.filter(f => {
                            const norm = (f.field_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                            const banned = [
                              "name", "fullname", "applicantname", "dob", "birthdate", "dateofbirth",
                              "height", "bloodgroup", "gotra", "gothra", "education", "qualification",
                              "occupation", "profession", "fathername", "fatheroccupation", "mothername",
                              "motheroccupation", "mobile1", "mobile", "phone", "phonenumber", "mobile2",
                              "altmobile", "whatsapp", "whatsappnumber", "currentaddress", "address",
                              "permanentaddress", "photourl", "photo", "biodataurl", "biodata", "documenturl"
                            ];
                            return !banned.includes(norm);
                          }).map((f) => {
                            const fieldVal = matrimonyForm[f.field_name] || f.default_value || "";
                            const onChangeVal = (val: string) => setMatrimonyForm({ ...matrimonyForm, [f.field_name]: val });

                            return (
                              <div key={f.id} className={f.field_type === "textarea" ? "w-full col-span-1 md:col-span-2" : "w-full min-w-0"}>
                                {f.field_type === "textarea" ? (
                                  <TransliteratedInput
                                    value={fieldVal}
                                    onChange={onChangeVal}
                                    label={f.label}
                                    required={f.required === 1}
                                    isTextArea
                                    rows={2}
                                  />
                                ) : f.field_type === "select" ? (
                                  <div className="w-full min-w-0 flex flex-col space-y-1.5">
                                    <label className="text-xs md:text-sm font-bold text-stone-700 block">
                                      {f.label}{f.required ? " *" : ""}
                                    </label>
                                    <select
                                      value={fieldVal}
                                      onChange={(e) => onChangeVal(e.target.value)}
                                      required={f.required === 1}
                                      className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white text-sm md:text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-xs"
                                    >
                                      <option value="">-- चुनें --</option>
                                      {f.select_options.split(",").map((opt: string) => (
                                        <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                      ))}
                                    </select>
                                    {f.help_text && <p className="text-[11px] text-stone-400 mt-1">{f.help_text}</p>}
                                  </div>
                                ) : (
                                  <div className="w-full min-w-0">
                                    <TransliteratedInput
                                      value={fieldVal}
                                      onChange={onChangeVal}
                                      label={f.label}
                                      required={f.required === 1}
                                      placeholder={f.placeholder || ""}
                                    />
                                    {f.help_text && <p className="text-[11px] text-stone-400 mt-1">{f.help_text}</p>}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Document & Photo Upload Pipeline */}
                          <div className="w-full col-span-1 md:col-span-2 border border-stone-200 rounded-2xl p-4 md:p-6 bg-stone-50 shadow-xs">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                                युवक/युवती का फोटो (JPG/PNG) <span className="text-red-500">*</span>
                              </label>
                              
                              <div className="relative">
                                <input
                                  id="matrimony-photoUrl-file"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, "photoUrl")}
                                  className="sr-only"
                                />
                                
                                <label
                                  htmlFor="matrimony-photoUrl-file"
                                  className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-orange-500 bg-white hover:bg-orange-50/20 rounded-xl p-5 cursor-pointer transition-all active:scale-[0.98] min-h-[110px]"
                                >
                                  <div className="flex flex-col items-center text-center space-y-1">
                                    <UploadIcon className="w-6 h-6 text-[#E65100]" />
                                    <span className="text-xs font-bold text-stone-700">फ़ाइल चुनें (Choose Image)</span>
                                    <span className="text-[10px] text-stone-400">अधिकतम साइज: 15MB (JPG/PNG)</span>
                                  </div>
                                </label>
                              </div>

                              {uploadingField === "photoUrl" && (
                                <p className="text-xs text-orange-600 font-semibold mt-2 flex items-center gap-1.5 animate-pulse">
                                  <span className="inline-block w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></span>
                                  फ़ोटो अपलोड हो रही है, कृपया प्रतीक्षा करें...
                                </p>
                              )}

                              {(uploadSuccesses["photoUrl"] || matrimonyForm.photoUrl) && matrimonyForm.photoUrl && (
                                <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg p-3 space-y-2">
                                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                    ✓ फ़ोटो सफलतापूर्वक अपलोड हो गई है!
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleNextMatrimonyStep(1)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow cursor-pointer transition-all active:scale-95"
                          >
                            अगला चरण (पारिवारिक विवरण) &rarr;
                          </button>
                        </div>
                      </div>
                    )}

                    {matrimonyStep === 2 && (
                      <div className="space-y-6">
                        <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <h3 className="text-base font-black text-stone-800">चरण 2: पारिवारिक विवरण</h3>
                            <p className="text-xs text-stone-500">माता-पिता और उनके व्यवसाय की जानकारी भरें।</p>
                          </div>
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full w-fit">
                            * सभी फ़ील्ड अनिवार्य हैं
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <TransliteratedInput
                            value={matrimonyForm.father_name}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, father_name: val })}
                            label="पिता का नाम (Father's Name)"
                            required
                          />

                          <TransliteratedInput
                            value={matrimonyForm.father_occupation}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, father_occupation: val })}
                            label="पिता का व्यवसाय (Father's Occupation)"
                            required
                          />

                          <TransliteratedInput
                            value={matrimonyForm.mother_name}
                            onChange={(val) => setMatrimonyForm({ ...matrimonyForm, mother_name: val })}
                            label="माता का नाम (Mother's Name)"
                            required
                          />
                        </div>

                        <div className="pt-4 border-t border-stone-100 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setMatrimonyStep(1)}
                            className="border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold py-2.5 px-6 rounded-lg text-sm cursor-pointer transition-all"
                          >
                            &larr; पिछला चरण
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNextMatrimonyStep(2)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow cursor-pointer transition-all active:scale-95"
                          >
                            अगला चरण (संपर्क विवरण) &rarr;
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3 Content: Contact Details */}
                    {matrimonyStep === 3 && (
                      <div className="space-y-6">
                        <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <h3 className="text-base font-black text-stone-800">चरण 3: संपर्क विवरण</h3>
                            <p className="text-xs text-stone-500">पता एवं फ़ोन नंबर की जानकारी भरें।</p>
                          </div>
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full w-fit">
                            * मोबाइल नंबर 2 को छोड़कर सभी फ़ील्ड अनिवार्य हैं
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="w-full min-w-0 flex flex-col space-y-1.5">
                            <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-1">
                              <span>मोबाइल नंबर 1 (Mobile 1)</span>
                              <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={matrimonyForm.mobile1}
                              onChange={(e) => setMatrimonyForm({ ...matrimonyForm, mobile1: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                              placeholder="दस अंकों का संपर्क नंबर"
                              className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white placeholder-stone-400 text-sm md:text-[15px] outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-xs"
                            />
                            {matrimonyForm.mobile1 && !validateMobile(matrimonyForm.mobile1) && (
                              <p className="text-xs font-bold text-red-600 animate-pulse">
                                ⚠️ कृपया ठीक 10 अंकों का प्राथमिक मोबाइल नंबर दर्ज करें और सुधारें!
                              </p>
                            )}
                          </div>

                          <div className="w-full min-w-0 flex flex-col space-y-1.5">
                            <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-1.5">
                              <span>मोबाइल नंबर 2 (Mobile 2)</span>
                              <span className="text-stone-400 text-[11px] font-semibold">(वैकल्पिक / Optional)</span>
                            </label>
                            <input
                              type="tel"
                              value={matrimonyForm.mobile2}
                              onChange={(e) => setMatrimonyForm({ ...matrimonyForm, mobile2: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                              placeholder="वैकल्पिक नंबर (यदि हो)"
                              className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white placeholder-stone-400 text-sm md:text-[15px] outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-xs"
                            />
                            {matrimonyForm.mobile2 && !validateMobile(matrimonyForm.mobile2) && (
                              <p className="text-xs font-bold text-red-600 animate-pulse">
                                ⚠️ द्वितीयक मोबाइल नंबर ठीक 10 अंकों का होना आवश्यक है!
                              </p>
                            )}
                          </div>

                          <div className="w-full min-w-0 flex flex-col space-y-1.5">
                            <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-1">
                              <span>व्हाट्सएप नंबर (WhatsApp No.)</span>
                              <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={matrimonyForm.whatsapp}
                              onChange={(e) => setMatrimonyForm({ ...matrimonyForm, whatsapp: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                              placeholder="10 अंकों का व्हाट्सएप नंबर"
                              className="w-full block box-border min-w-0 px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800 bg-white placeholder-stone-400 text-sm md:text-[15px] outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-xs"
                            />
                            {matrimonyForm.whatsapp && !validateMobile(matrimonyForm.whatsapp) && (
                              <p className="text-xs font-bold text-red-600 animate-pulse">
                                ⚠️ कृपया ठीक 10 अंकों का व्हाट्सएप नंबर दर्ज करें और सुधारें!
                              </p>
                            )}
                          </div>

                          <div className="w-full col-span-1 md:col-span-2">
                            <TransliteratedInput
                              value={matrimonyForm.currentAddress}
                              onChange={(val) => setMatrimonyForm({ ...matrimonyForm, currentAddress: val })}
                              label="वर्तमान पता (Current Address)"
                              required
                              isTextArea
                              rows={2}
                            />
                          </div>

                          <div className="w-full col-span-1 md:col-span-2">
                            <TransliteratedInput
                              value={matrimonyForm.permanentAddress}
                              onChange={(val) => setMatrimonyForm({ ...matrimonyForm, permanentAddress: val })}
                              label="स्थायी पता (Permanent Address)"
                              required
                              isTextArea
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setMatrimonyStep(2)}
                            className="border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold py-2.5 px-6 rounded-lg text-sm cursor-pointer transition-all"
                          >
                            &larr; पिछला चरण
                          </button>
                          <button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow cursor-pointer transition-all active:scale-95"
                          >
                            विवरण सुरक्षित करें और प्रीव्यू देखें
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Live Preview Panel (Right) - Instantly Syncs as They Type */}
                <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
                        <h4 className="text-xs font-black text-stone-800 uppercase tracking-wide">लाइव विज्ञापन प्रीव्यू</h4>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        लाइव अपडेट
                      </span>
                    </div>

                    {/* Accurate real-time rendering of Matrimony Block */}
                    <div className="w-full bg-stone-50 rounded-xl p-3 border border-stone-150 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[360px] bg-[#FFFDF6] border border-stone-800 rounded-xl p-3.5 shadow-xs relative select-none">
                        {/* Top Header */}
                        <div className="border-b-2 border-red-100 pb-1.5 mb-2 flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-xs font-black text-red-600 tracking-wide flex items-center min-w-0">
                            <span className="font-mono">{savedAdNumber || nextMatrimonyAdNum || "001"}.</span>
                            <span className="ml-1.5 break-words">{matrimonyForm.name || "युवक-युवती का नाम"}</span>
                          </h4>
                        </div>

                        {/* Details Grid & Image */}
                        <div className="flex flex-row gap-2.5 items-start">
                          <div className="flex-1 min-w-0 font-sans">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8.5px] leading-[11px] text-stone-800 font-bold text-left">
                              <div className="flex items-start min-w-0">
                                <span className="inline-block w-[32px] text-stone-950 font-black shrink-0">जन्म</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.dob || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0">
                                <span className="inline-block w-[32px] text-stone-950 font-black shrink-0">ऊँचाई</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.height || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0">
                                <span className="inline-block w-[32px] text-stone-950 font-black shrink-0">गोत्र</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.gotra || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0">
                                <span className="inline-block w-[32px] text-stone-950 font-black shrink-0">रक्त</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.blood_group || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0 col-span-2">
                                <span className="inline-block w-[45px] text-stone-950 font-black shrink-0">पिता</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.father_name || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0 col-span-2">
                                <span className="inline-block w-[45px] text-stone-950 font-black shrink-0">पिता व्यव</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.father_occupation || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0 col-span-2">
                                <span className="inline-block w-[45px] text-stone-950 font-black shrink-0">माता</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.mother_name || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0 col-span-2">
                                <span className="inline-block w-[45px] text-stone-950 font-black shrink-0">व्यवसाय</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 break-words flex-1">{matrimonyForm.occupation || "-"}</span>
                              </div>
                            </div>
                            
                            <div className="mt-1.5 pt-1.5 border-t border-stone-200 space-y-1 text-[8.5px] leading-[11px] text-stone-800">
                              <div className="flex items-start min-w-0">
                                <span className="inline-block w-[45px] text-stone-950 font-black shrink-0">शिक्षा</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 flex-1 break-words">{matrimonyForm.education || "-"}</span>
                              </div>
                              <div className="flex items-start min-w-0">
                                <span className="inline-block w-[45px] text-stone-950 font-black shrink-0">पता</span>
                                <span className="text-stone-900 mx-1 shrink-0">:</span>
                                <span className="text-stone-800 flex-1 break-words">{matrimonyForm.currentAddress || matrimonyForm.permanentAddress || "-"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Profile Image Frame */}
                          <div className="w-[114px] h-[152px] bg-stone-100 border border-stone-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                            {matrimonyForm.photoUrl ? (
                              <img src={matrimonyForm.photoUrl} alt="Live Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[7.5px] text-stone-400 font-bold text-center bg-stone-50 p-0.5">
                                <User className="w-5 h-5 text-stone-300 mb-0.5" />
                                <span>पासपोर्ट फोटो</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Contact */}
                        <div className="mt-2.5 pt-1.5 border-t border-stone-200 flex items-center justify-between text-[8px] font-bold text-stone-900">
                          <div className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-[#E65100]" />
                            {!matrimonyForm.mobile1 ? (
                              <span className="text-stone-400 font-normal">XXXXXXXXXX</span>
                            ) : validateMobile(matrimonyForm.mobile1) ? (
                              <span className="font-mono">{matrimonyForm.mobile1}</span>
                            ) : (
                              <span className="text-red-600 font-bold text-[7.5px]">(अमान्य मोबाइल नंबर)</span>
                            )}
                          </div>
                          {matrimonyForm.whatsapp && (
                            <div className="flex items-center gap-0.5 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                              {validateMobile(matrimonyForm.whatsapp) ? (
                                <span className="font-mono">{matrimonyForm.whatsapp}</span>
                              ) : (
                                <span className="text-red-600 font-bold text-[7.5px]">(अमान्य व्हाट्सएप)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Prompting instruction to keep user oriented */}
                    <p className="text-[10px] text-stone-500 leading-normal text-center">
                      यह विज्ञापन परिचायिका पत्रिका में ठीक इसी प्रकार मुद्रित किया जाएगा। जैसे-जैसे आप विवरण भरेंगे, प्रीव्यू तुरंत अपडेट होगा।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {matrimonyStep === 4 && (
              <div className="space-y-6">
                {/* STANDARD 3.5x2 INCH MATRIMONY BLOCK VIEW */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6">
                    {/* Header & Controls Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-100 pb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-stone-800 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#E65100]" />
                          विज्ञापन प्रीव्यू (सटीक प्रिंट रूप)
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          सम्मेलन परिचायिका पत्रिका हेतु 3.5 × 2 इंच मानक ब्लॉक लेआउट
                        </p>
                      </div>
                      
                      {/* View Controls & Theme Selector */}
                      <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                        {/* View Mode Toggle (Mobile / Print Scale) */}
                        <div className="flex items-center bg-stone-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setMatrimonyPreviewMode("fit")}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              matrimonyPreviewMode === "fit"
                                ? "bg-white text-[#E65100] shadow-xs"
                                : "text-stone-600 hover:text-stone-900"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">मोबाइल</span> दृश्य
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatrimonyPreviewMode("print")}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              matrimonyPreviewMode === "print"
                                ? "bg-white text-[#E65100] shadow-xs"
                                : "text-stone-600 hover:text-stone-900"
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            प्रिंट स्केल
                          </button>
                        </div>

                        {/* Guidelines Toggle */}
                        <button
                          type="button"
                          onClick={() => setShowMatrimonyGuides(!showMatrimonyGuides)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            showMatrimonyGuides
                              ? "bg-orange-50 text-[#E65100] border-orange-200"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          {showMatrimonyGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{showMatrimonyGuides ? "गाइडलाइन ऑन" : "गाइडलाइन ऑफ"}</span>
                        </button>

                        {/* Theme Toggles */}
                        <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl">
                          {(["classic", "premium", "bold", "minimal"] as const).map((styleName) => (
                            <button
                              key={styleName}
                              type="button"
                              onClick={() => setMatrimonyTheme(styleName)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                                matrimonyTheme === styleName
                                  ? "bg-white text-stone-900 shadow-xs"
                                  : "text-stone-500 hover:text-stone-800"
                              }`}
                            >
                              {styleName === "classic" ? "क्लासिक" : 
                               styleName === "premium" ? "प्रीमियम" : 
                               styleName === "bold" ? "बोल्ड" : "न्यूनतम"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Print Safety Guidelines Explainer (When Guides are Enabled) */}
                    {showMatrimonyGuides && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-600">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500 shrink-0"></span>
                          <span><strong>लाल डॉटेड लाइन (ब्लीड):</strong> 3mm कटिंग सीमा (काटने का क्षेत्र)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-500 shrink-0"></span>
                          <span><strong>नीली डॉटेड लाइन (सुरक्षित क्षेत्र):</strong> संपूर्ण विवरण सुरक्षित रहता है</span>
                        </div>
                      </div>
                    )}

                    {/* PREVIEW CONTAINER - Responsive, Zero Cutoff, Mobile-First */}
                    <div className="w-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 bg-gradient-to-b from-stone-100 to-stone-200/80 rounded-2xl border border-stone-200 shadow-inner">
                      
                      {/* Outer Frame Wrapper */}
                      <div className={`relative transition-all ${
                        matrimonyPreviewMode === "print"
                          ? "w-[350px] p-4 bg-[#FAFAFA] border border-stone-300 shadow-xl rounded-md select-none shrink-0"
                          : "w-full max-w-[460px] p-2 sm:p-4 bg-white/90 backdrop-blur-xs border border-stone-300/80 shadow-lg rounded-2xl"
                      }`}>
                        
                        {/* Bleed guide line (outer red dotted border) */}
                        {showMatrimonyGuides && (
                          <div className="absolute inset-1 sm:inset-2 border border-dashed border-red-400 pointer-events-none rounded">
                            <span className="absolute -top-3 left-2 bg-red-100 text-red-600 text-[8px] font-bold px-1 rounded shadow-2xs">ब्लीड सीमा</span>
                          </div>
                        )}

                        {/* Safe zone guide line (inner blue dotted border) */}
                        {showMatrimonyGuides && (
                          <div className="absolute inset-3 sm:inset-4 border border-dashed border-blue-400 pointer-events-none rounded">
                            <span className="absolute -bottom-3 right-2 bg-blue-100 text-blue-600 text-[8px] font-bold px-1 rounded shadow-2xs">सुरक्षित क्षेत्र</span>
                          </div>
                        )}

                        {/* Actual Card Rendering - Responsive, Proportional, Zero Text Chopping */}
                        <div 
                          className={`relative w-full border rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-all ${
                            matrimonyTheme === "classic" ? "bg-[#FFFDF6] border-stone-800 text-stone-900 shadow-sm" :
                            matrimonyTheme === "premium" ? "bg-[#FAF5EC] border-[#C5A880] text-stone-800 font-serif shadow-sm" :
                            matrimonyTheme === "bold" ? "bg-white border-2 border-stone-950 text-stone-950 font-sans shadow-sm" :
                            "bg-white border border-stone-300 text-stone-900 shadow-sm"
                          }`}
                          style={{
                            fontFamily: matrimonyTheme === "premium" ? "'Tiro Devanagari Hindi', Georgia, serif" : "'Yantramanav', sans-serif"
                          }}
                        >
                          {/* Top Header: Ad No. and Candidate Name in BOLD, RED, HIGH-CONTRAST TEXT */}
                          <div className="border-b-2 border-red-100 pb-1.5 mb-2 flex items-center justify-between gap-2">
                            <h4 className="text-sm sm:text-[15px] font-black text-red-600 tracking-wide flex items-center min-w-0">
                              <span className="font-mono">{savedAdNumber || nextMatrimonyAdNum || "001"}.</span>
                              <span className="ml-1.5 break-words">{matrimonyForm.name || "युवक-युवती का नाम"}</span>
                            </h4>
                          </div>

                          {/* Main Body: Left Column (Dense, Clear, Bold Details) + Right Column (Passport Photo) */}
                          <div className="flex flex-row gap-3 sm:gap-4 items-start">
                            {/* Left Column: All text info, clean 2-column layout, highly legible */}
                            <div className="flex-1 min-w-0">
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] sm:text-[10.5px] leading-[13px] sm:leading-[15px] text-stone-900 font-bold text-left">
                                <div className="flex items-start min-w-0">
                                  <span className="inline-block w-[35px] sm:w-[45px] text-stone-950 font-black shrink-0">जन्म</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.dob || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0">
                                  <span className="inline-block w-[35px] sm:w-[45px] text-stone-950 font-black shrink-0">ऊँचाई</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.height || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0">
                                  <span className="inline-block w-[35px] sm:w-[45px] text-stone-950 font-black shrink-0">गोत्र</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.gotra || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0">
                                  <span className="inline-block w-[35px] sm:w-[45px] text-stone-950 font-black shrink-0">रक्त</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.blood_group || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0 col-span-2">
                                  <span className="inline-block w-[50px] sm:w-[65px] text-stone-950 font-black shrink-0">पिता</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.father_name || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0 col-span-2">
                                  <span className="inline-block w-[50px] sm:w-[65px] text-stone-950 font-black shrink-0">पिता व्यव</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.father_occupation || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0 col-span-2">
                                  <span className="inline-block w-[50px] sm:w-[65px] text-stone-950 font-black shrink-0">माता</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.mother_name || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0 col-span-2">
                                  <span className="inline-block w-[50px] sm:w-[65px] text-stone-950 font-black shrink-0">व्यवसाय</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 break-words flex-1">{matrimonyForm.occupation || "-"}</span>
                                </div>
                              </div>

                              {/* Full-width details: Education & Address */}
                              <div className="mt-1.5 pt-1.5 border-t border-stone-200/80 space-y-1.5 text-[9px] sm:text-[10.5px] leading-[13px] sm:leading-[15px] text-stone-900">
                                <div className="flex items-start min-w-0">
                                  <span className="inline-block w-[50px] sm:w-[65px] text-stone-950 font-black shrink-0">शिक्षा</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 flex-1 break-words">{matrimonyForm.education || "-"}</span>
                                </div>
                                <div className="flex items-start min-w-0">
                                  <span className="inline-block w-[50px] sm:w-[65px] text-stone-950 font-black shrink-0">पता</span>
                                  <span className="text-stone-900 mx-2 shrink-0">:</span>
                                  <span className="font-semibold text-stone-800 flex-1 break-words">
                                    {matrimonyForm.currentAddress || matrimonyForm.permanentAddress || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Candidate Photo */}
                            <div className="w-[145px] sm:w-[170px] h-[193px] sm:h-[226px] bg-stone-100 border-2 border-stone-300 rounded-lg overflow-hidden shrink-0 relative shadow-xs flex items-center justify-center animate-fade-in">
                              {matrimonyForm.photoUrl ? (
                                <img src={matrimonyForm.photoUrl} alt="Candidate Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-stone-400 font-bold text-center p-1 bg-stone-50">
                                  <User className="w-6 h-6 text-stone-300 mb-0.5" />
                                  <span>पासपोर्ट फोटो</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bottom Contact Bar with Mobile & WhatsApp logos */}
                          <div className="mt-2.5 pt-1.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-1.5 text-[9px] sm:text-[10px] font-bold text-stone-900 shrink-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* Mobile Phone with Logo */}
                              <div className="flex items-center gap-1 text-stone-900">
                                <Phone className="w-3 h-3 text-[#E65100] shrink-0" />
                                {!matrimonyForm.mobile1 ? (
                                  <span className="text-stone-400 font-normal">XXXXXXXXXX</span>
                                ) : validateMobile(matrimonyForm.mobile1) ? (
                                  <span className="font-mono font-bold">{matrimonyForm.mobile1}</span>
                                ) : (
                                  <span className="text-red-600 font-bold text-[8.5px] sm:text-[9px]">(अमान्य मोबाइल नंबर)</span>
                                )}
                                {matrimonyForm.mobile2 && (
                                  validateMobile(matrimonyForm.mobile2) ? (
                                    <span className="font-mono text-stone-700">, {matrimonyForm.mobile2}</span>
                                  ) : (
                                    <span className="text-red-600 font-bold text-[8.5px] sm:text-[9px]">, (अमान्य मोबाइल 2)</span>
                                  )
                                )}
                              </div>

                              {/* WhatsApp with Logo */}
                              {(matrimonyForm.whatsapp || matrimonyForm.mobile1) && (
                                <div className="flex items-center gap-1 text-emerald-800">
                                  <svg className="w-3 h-3 fill-emerald-600 shrink-0" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.815 11.815 0 018.413 3.484 11.821 11.821 0 013.48 8.413c-.003 6.558-5.339 11.893-11.893 11.893h-.005a11.882 11.882 0 01-5.683-1.448L.057 24zm6.305-3.654l.361.214a9.87 9.87 0 005.031 1.378h.004c5.448 0 9.882-4.434 9.885-9.884a9.825 9.825 0 00-2.893-6.994 9.833 9.833 0 00-6.988-2.898c-5.452 0-9.887 4.434-9.888 9.884a9.86 9.86 0 001.51 5.26l.235.374-.998 3.648 3.741-.982z" />
                                  </svg>
                                  {validateMobile(matrimonyForm.whatsapp || matrimonyForm.mobile1) ? (
                                    <span className="font-mono font-bold text-emerald-900">{matrimonyForm.whatsapp || matrimonyForm.mobile1}</span>
                                  ) : (
                                    <span className="text-red-600 font-bold text-[8.5px] sm:text-[9px]">(अमान्य व्हाट्सएप)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Price & Ad Number Badge */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#E65100] text-white flex items-center justify-center font-bold">
                          <Hash className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs text-stone-500 block">आवंटित विज्ञापन संख्या (Ad No.)</span>
                          <span className="text-base sm:text-lg font-mono font-black text-[#E65100]">{savedAdNumber || nextMatrimonyAdNum || "001"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-orange-200 shadow-2xs">
                        <span className="text-xs text-stone-600 font-medium">प्रकाशन दर (Price):</span>
                        <span className="text-base sm:text-lg font-mono font-black text-stone-900">₹{savedPrice}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-stone-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setMatrimonyStep(1)}
                        className="px-4 py-3 sm:py-2 border border-stone-300 hover:bg-stone-50 rounded-xl text-xs sm:text-sm font-bold text-stone-700 transition-all cursor-pointer text-center"
                      >
                        ← विवरण संपादित करें
                      </button>
                      <button
                        type="button"
                        onClick={handleMatrimonyApprove}
                        className="bg-[#E65100] hover:bg-orange-700 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        स्वीकृत करें और कार्ट में जोड़ें (Locks Item)
                      </button>
                    </div>
                  </div>
              </div>
            )}
          </div>
        )}

        {/* BUSINESS ADVERTISEMENT ENTRY - 3-SECTION CHATGPT WORKFLOW */}
        {screen === "business_form" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Navigation & Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <button
                onClick={() => setScreen("home")}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl shrink-0 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-stone-500" />
                वापस होमपेज
              </button>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  ChatGPT विज्ञापन मॉड्यूल
                </span>
              </div>
            </div>

            {/* Introductory Banner & 3-Step Guide */}
            <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 backdrop-blur-xs">
                  <Building className="w-3.5 h-3.5" />
                  व्यावसायिक पत्रिका विज्ञापन (Business Advertisements)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  ChatGPT से विज्ञापन डिज़ाइन करवाएँ और परिचायिका में प्रकाशित करें
                </h2>
                <p className="text-sm text-emerald-100/90 leading-relaxed">
                  नीचे दिए गए ३ आकारों में से अपनी पसंद का आकार चुनें। रेडीमेड प्रॉम्ट कॉपी करके ChatGPT में अपना विज्ञापन तैयार करें और डिज़ाइन लिंक पेस्ट करके तुरंत कार्ट में जोड़ें।
                </p>

                {/* 3 Step Quick Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center justify-center mb-2">1</span>
                    <h4 className="text-xs font-bold text-white">प्रॉम्ट कॉपी करें</h4>
                    <p className="text-[11px] text-emerald-200 mt-1">अपने इच्छित आकार का ChatGPT प्रॉम्ट "कॉपी" करें।</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center justify-center mb-2">2</span>
                    <h4 className="text-xs font-bold text-white">ChatGPT में पोस्टर बनाएं</h4>
                    <p className="text-[11px] text-emerald-200 mt-1">ChatGPT खोलें और अपने व्यापार की जानकारी डालकर पोस्टर तैयार करवाएँ।</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center justify-center mb-2">3</span>
                    <h4 className="text-xs font-bold text-white">लिंक दर्ज कर पे करें</h4>
                    <p className="text-[11px] text-emerald-200 mt-1">डिज़ाइन लिंक पेस्ट करें और कार्ट में जोड़कर भुगतान पूरा करें।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE SIZE SECTIONS */}
            <div className="space-y-8">
              {/* SECTION 1: FULL PAGE (7.2 x 9.6 inches) */}
              <div className="bg-white border-2 border-emerald-500/40 hover:border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-md transition-all space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        सर्वाधिक लोकप्रिय • Full Page
                      </span>
                      <span className="bg-stone-100 text-stone-700 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-stone-200">
                        7.2 × 9.6 इंच
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 pt-1">
                      1. पूरा पृष्ठ विज्ञापन (Full Page Magazine Ad)
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      सम्पूर्ण पत्रिका पृष्ठ पर भव्य, विस्तृत एवं आकर्षक विज्ञापन प्रस्तुति
                    </p>
                  </div>

                  <div className="sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                    <span className="text-xs text-stone-500 font-bold block">प्रकाशन दर (Price)</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                      ₹{(masters.pricings?.find(p => p.adv_size_code === "business_full")?.price || 5000).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* ChatGPT Prompt Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      ChatGPT प्रॉम्ट (Full Page Print Template):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt("business_full")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          copiedPromptKey === "business_full"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                        }`}
                      >
                        {copiedPromptKey === "business_full" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            प्रॉम्ट कॉपी हो गया!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            प्रॉम्ट कॉपी करें
                          </>
                        )}
                      </button>

                      <a
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        ChatGPT खोलें <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-stone-800 select-all">
                    {BUSINESS_PROMPTS.business_full}
                  </div>
                </div>

                {/* Link Input & Add to Cart Action */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1.5">
                      डिज़ाइन लिंक (Design Link / Shared URL) पेस्ट करें *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={businessLinks.business_full}
                        onChange={(e) => setBusinessLinks({ ...businessLinks, business_full: e.target.value })}
                        placeholder="ChatGPT शेयर लिंक, Google Drive या इमेज का URL (उदा. https://...)"
                        className="w-full pl-3.5 pr-4 py-3 bg-white border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      ChatGPT से प्राप्त शेयर लिंक या अपनी फ़ाइल का ऑनलाइन लिंक यहाँ पेस्ट करें।
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingBusiness}
                    onClick={() => handleAddBusinessAdToCart("business_full")}
                    className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingBusiness ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        कार्ट में जोड़ा जा रहा है...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        फुल पेज विज्ञापन कार्ट में जोड़ें (Add to Cart) →
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 2: HALF PAGE (7.2 x 4.8 inches) */}
              <div className="bg-white border-2 border-stone-200 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-md transition-all space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        संतुलित लेआउट • Half Page
                      </span>
                      <span className="bg-stone-100 text-stone-700 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-stone-200">
                        7.2 × 4.8 इंच
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 pt-1">
                      2. आधा पृष्ठ विज्ञापन (Half Page Horizontal Ad)
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      हॉरिजॉन्टल आकर्षक फॉर्मेट, प्रमुख उत्पाद व संपर्क विवरण हेतु सर्वोत्तम
                    </p>
                  </div>

                  <div className="sm:text-right bg-teal-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                    <span className="text-xs text-stone-500 font-bold block">प्रकाशन दर (Price)</span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-800 font-mono">
                      ₹{(masters.pricings?.find(p => p.adv_size_code === "business_half")?.price || 3000).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* ChatGPT Prompt Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      ChatGPT प्रॉम्ट (Half Page Print Template):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt("business_half")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          copiedPromptKey === "business_half"
                            ? "bg-teal-700 text-white border-teal-700"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                        }`}
                      >
                        {copiedPromptKey === "business_half" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            प्रॉम्ट कॉपी हो गया!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            प्रॉम्ट कॉपी करें
                          </>
                        )}
                      </button>

                      <a
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-300 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        ChatGPT खोलें <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-stone-800 select-all">
                    {BUSINESS_PROMPTS.business_half}
                  </div>
                </div>

                {/* Link Input & Add to Cart Action */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1.5">
                      डिज़ाइन लिंक (Design Link / Shared URL) पेस्ट करें *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={businessLinks.business_half}
                        onChange={(e) => setBusinessLinks({ ...businessLinks, business_half: e.target.value })}
                        placeholder="ChatGPT शेयर लिंक, Google Drive या इमेज का URL (उदा. https://...)"
                        className="w-full pl-3.5 pr-4 py-3 bg-white border border-stone-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      ChatGPT से प्राप्त शेयर लिंक या अपनी फ़ाइल का ऑनलाइन लिंक यहाँ पेस्ट करें।
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingBusiness}
                    onClick={() => handleAddBusinessAdToCart("business_half")}
                    className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 disabled:bg-stone-300 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingBusiness ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        कार्ट में जोड़ा जा रहा है...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        हाफ पेज विज्ञापन कार्ट में जोड़ें (Add to Cart) →
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 3: QUARTER PAGE (3.6 x 4.8 inches) */}
              <div className="bg-white border-2 border-stone-200 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-md transition-all space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        किफायती एवं प्रभावी • Quarter Page
                      </span>
                      <span className="bg-stone-100 text-stone-700 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-stone-200">
                        3.6 × 4.8 इंच
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 pt-1">
                      3. चौथाई पृष्ठ विज्ञापन (Quarter Page Vertical Ad)
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      कॉम्पैक्ट एवं प्रभावशाली वर्टिकल स्पेस, मुख्य सेवाओं के प्रचार हेतु उत्तम
                    </p>
                  </div>

                  <div className="sm:text-right bg-slate-100 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                    <span className="text-xs text-stone-500 font-bold block">प्रकाशन दर (Price)</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
                      ₹{(masters.pricings?.find(p => p.adv_size_code === "business_quarter")?.price || 1500).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* ChatGPT Prompt Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-700" />
                      ChatGPT प्रॉम्ट (Quarter Page Print Template):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt("business_quarter")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          copiedPromptKey === "business_quarter"
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                        }`}
                      >
                        {copiedPromptKey === "business_quarter" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            प्रॉम्ट कॉपी हो गया!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            प्रॉम्ट कॉपी करें
                          </>
                        )}
                      </button>

                      <a
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        ChatGPT खोलें <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-stone-800 select-all">
                    {BUSINESS_PROMPTS.business_quarter}
                  </div>
                </div>

                {/* Link Input & Add to Cart Action */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1.5">
                      डिज़ाइन लिंक (Design Link / Shared URL) पेस्ट करें *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={businessLinks.business_quarter}
                        onChange={(e) => setBusinessLinks({ ...businessLinks, business_quarter: e.target.value })}
                        placeholder="ChatGPT शेयर लिंक, Google Drive या इमेज का URL (उदा. https://...)"
                        className="w-full pl-3.5 pr-4 py-3 bg-white border border-stone-300 focus:border-slate-600 focus:ring-2 focus:ring-slate-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      ChatGPT से प्राप्त शेयर लिंक या अपनी फ़ाइल का ऑनलाइन लिंक यहाँ पेस्ट करें।
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingBusiness}
                    onClick={() => handleAddBusinessAdToCart("business_quarter")}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 disabled:bg-stone-300 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingBusiness ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        कार्ट में जोड़ा जा रहा है...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        चौथाई पेज विज्ञापन कार्ट में जोड़ें (Add to Cart) →
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHOPPING CART VIEW */}
        {screen === "cart" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <ShoppingCart className="text-[#E65100]" />
              आपकी विज्ञापन कार्ट (Your Shopping Cart)
            </h3>

            {isLoadingCart ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Cart list items */}
                <div className="lg:col-span-8 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex justify-between items-center gap-4">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          item.adType === "matrimony" ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.adType === "matrimony" ? "विवाह विज्ञापन" : "व्यवसाय विज्ञापन"}
                        </span>
                        <h4 className="text-base font-bold text-stone-800 mt-2">
                          {item.adType === "matrimony" ? item.data.name : (item.data as BusinessFormState).businessName}
                        </h4>
                        {(item.data.adNumber || item.data.ad_number) && (
                          <p className="text-xs font-mono font-bold text-[#E65100] mt-0.5">
                            विज्ञापन क्र.: {item.data.adNumber || item.data.ad_number}
                          </p>
                        )}
                        <p className="text-xs text-stone-500 mt-1">
                          प्रकाशन: {item.data.district_hi} • {item.data.sangathan_hi} • {item.data.magazine_hi} ({item.data.edition_hi})
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="text-xs text-stone-400 font-semibold">दर (Price)</p>
                          <p className="text-lg font-mono font-black text-stone-900">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCartItem(item)}
                            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                            title="संपादित करें"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition-colors cursor-pointer"
                            title="हटाएँ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleClearCart}
                      className="text-xs font-semibold text-stone-500 hover:text-red-600 bg-stone-100 hover:bg-red-50 border px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      कार्ट खाली करें (Clear Cart)
                    </button>
                    <button
                      onClick={() => setScreen("home")}
                      className="text-xs font-bold text-[#E65100] hover:underline"
                    >
                      + अन्य विज्ञापन जोड़ें
                    </button>
                  </div>
                </div>

                {/* Checkout Summary Box */}
                <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-stone-800 border-b pb-2">आर्डर सारांश (Summary)</h4>

                  <div className="space-y-2 text-sm text-stone-600 font-medium">
                    <div className="flex justify-between">
                      <span>कुल विज्ञापन (Ads):</span>
                      <span className="font-bold text-stone-800">{cart.length}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-stone-900 font-bold">
                      <span>कुल योग (Total Amount):</span>
                      <span className="text-lg font-black text-[#E65100] font-mono">₹{getCartTotal().toLocaleString("en-IN")}.00</span>
                    </div>
                  </div>

                  {/* Customer Checkout Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-500 block mb-1">मुख्य आवेदक का नाम *</label>
                      <input
                        type="text"
                        required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder="उदा. राम कुमार साहू"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-800 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-500 block mb-1">मुख्य मोबाइल नंबर *</label>
                      <input
                        type="tel"
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="10 अंकों का फ़ोन नंबर"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-800 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCheckingOut}
                      className="w-full bg-[#E65100] hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          प्रविष्टि आर्डर बन रहा है...
                        </>
                      ) : (
                        "भुगतान चरण पर जाएँ"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-8 space-y-4 max-w-lg mx-auto">
                <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
                <h4 className="text-base font-bold text-stone-600">आपकी विज्ञापन कार्ट अभी खाली है</h4>
                <p className="text-xs text-stone-400">कृपया विवाह या व्यावसायिक विज्ञापन दर्ज करके शुरू करें।</p>
                <button
                  onClick={() => setScreen("home")}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-2 rounded-lg"
                >
                  विज्ञापन दर्ज करें
                </button>
              </div>
            )}
          </div>
        )}

        {/* CHECKOUT PAYMENT GATEWAY WORKFLOW SCREEN */}
        {screen === "checkout" && orderResult && (
          <PaymentGatewayModal
            orderId={orderResult.orderId}
            totalAmount={orderResult.totalAmount}
            customerName={checkoutName || "ग्राहक"}
            customerMobile={checkoutPhone}
            onPaymentSuccess={(utr, screenshot) => handleConfirmPayment(utr, screenshot)}
            onCancel={() => setScreen("cart")}
          />
        )}

        {/* INVOICE VIEW FOR USER AFTER SUBMISSION */}
        {screen === "invoice" && activeInvoiceOrder && (
          <div className="space-y-6 print:m-0">
            <div className="flex flex-col items-center gap-3 print:hidden max-w-2xl mx-auto w-full">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-xl flex items-center gap-2 w-full">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>आपका आवेदन सबमिट हो गया है। एडमिन द्वारा UTR की जाँच होते ही विज्ञापन विवरण प्रकाशित हो जाएंगे।</span>
              </div>

              {/* Dynamic WhatsApp dispatch card */}
              <div className="bg-orange-50 border border-orange-200 text-orange-900 p-5 rounded-xl w-full space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">📱</span>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">व्हाट्सएप (WhatsApp) रसीद प्राप्त करें / एडमिन को भेजें</h4>
                    <p className="text-xs text-stone-600 mt-1">
                      यदि आपके पास व्हाट्सएप अधिसूचना प्राप्त नहीं हुई है, तो आप इस पावती को सीधे व्हाट्सएप पर सुरक्षित रख सकते हैं या एडमिन (9301056006) को प्रेषित कर सकते हैं।
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://wa.me/9301056006?text=${encodeURIComponent(
                      `*परिचायिका 2026 - डिजिटल पावती* 📝\n\n` +
                      `नमस्ते, मेरा विज्ञापन ऑर्डर सफलतापूर्वक सबमिट हो गया है।\n\n` +
                      `*ऑर्डर विवरण:*\n` +
                      `• ऑर्डर ID: ${activeInvoiceOrder.order_id}\n` +
                      `• कुल राशि: ₹${activeInvoiceOrder.total_amount}\n` +
                      `• तिथि: ${new Date(activeInvoiceOrder.payment_date || "").toLocaleDateString("hi-IN")}\n\n` +
                      `🔗 डिजिटल पावती देखें/डाउनलोड करें: ${window.location.protocol}//${window.location.host}/?order=${activeInvoiceOrder.order_id}\n\n` +
                      `कृपया भुगतान सत्यापित कर स्वीकृति प्रदान करें। धन्यवाद!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    💬 व्हाट्सएप पर रसीद भेजें / प्राप्त करें
                  </a>
                </div>
              </div>
            </div>

            <InvoicePDF
              order={activeInvoiceOrder}
              onClose={() => {
                setActiveInvoiceOrder(null);
                setScreen("home");
              }}
            />
          </div>
        )}

        {/* ADMIN LOGIN & DASHBOARD MOUNT */}
        {screen === "admin" && (
          <AdminPanel />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-200 px-6 py-8 shrink-0 print:hidden mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">मुद्रण प्रकाशन कार्यालय</span>
              <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                गांधी नगर, पहाड़ी चौक,<br />गुढ़ियारी, रायपुर (छत्तीसगढ़)
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">पूछताछ 1</span>
                <p className="text-xs text-stone-900 font-bold">7647924636</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">पूछताछ 2</span>
                <p className="text-xs text-stone-900 font-bold">9300717080</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">भुगतान सहायता</span>
                <p className="text-xs text-[#E65100] font-black underline decoration-orange-300">9301056006</p>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end w-full md:w-auto">
            <div className="h-9 px-4 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-[9px] text-orange-700 font-bold tracking-widest uppercase">SECURE PAYMENT HUB</span>
            </div>
            <p className="text-[11px] text-stone-400">© 2026 परिचायिका | Powered by Indian Press, Raipur</p>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (Android / iOS touch optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1.5 safe-bottom flex justify-around items-center print:hidden">
        <button
          onClick={() => setScreen("home")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            screen === "home" ? "text-[#E65100] font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">होम</span>
        </button>

        <button
          onClick={() => {
            setSavedAdId(null);
            setSavedAdNumber("");
            setSelectedPubId("");
            setSelectedSizeCode("");
            setMatrimonyStep(1);
            fetchNextAdNumbers();
            setScreen("matrimony_form");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            screen === "matrimony_form" ? "text-[#E65100] font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">विवाह</span>
        </button>

        <button
          onClick={() => {
            setSavedAdId(null);
            setSavedAdNumber("");
            setSelectedPubId("");
            setSelectedSizeCode("");
            setBusinessStep(1);
            fetchNextAdNumbers();
            setScreen("business_form");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            screen === "business_form" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Building className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">व्यापार</span>
        </button>

        <button
          onClick={() => setScreen("cart")}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            screen === "cart" ? "text-[#E65100] font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">कार्ट</span>
        </button>

        <button
          onClick={() => setScreen(screen === "admin" ? "home" : "admin")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            screen === "admin" ? "text-stone-900 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">एडमिन</span>
        </button>
      </nav>
    </div>
  );
}
