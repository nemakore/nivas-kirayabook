// Nivas KirayaBook - Internationalization & Multi-language Support
// Supported: Marathi ('mr'), Hindi ('hi'), English ('en')

const I18N_STORAGE_KEY = 'nivas_app_language';

const TRANSLATIONS = {
  mr: {
    // Brand & Header
    app_name: "निवास किरायाबुक",
    app_subtitle: "स्मार्ट घरभाडे व वीज बिल हिशोब",
    guide_btn: "मार्गदर्शन",
    guide_title: "हे ॲप काय आहे आणि कसे वापरावे?",
    guide_sub: "३ सोप्या टप्प्यांत माहिती पहा",
    cloud_sync: "क्लाउड सिंक",
    billing_cycle: "बिलिंग महिना",
    install_app: "ॲप इन्स्टॉल करा",
    new_month_btn: "नवीन महिना सुरू करा",
    search_placeholder: "खोली क्र., भाडेकरू, फोन नंबर शोधा...",

    // Navigation
    nav_dashboard: "घरभाडे",
    nav_calculator: "वीज मीटर",
    nav_history: "खतावणी",
    nav_settings: "सेटिंग्ज",

    // Dashboard KPIs & Tabs
    stat_collected: "एकूण जमा भाडे",
    stat_pending: "एकूण शिल्लक बाकी",
    rooms_clear: "खोल्या निरंक (पूर्ण भरले)",
    rooms_pending: "खोल्यांची बाकी शिल्लक",
    all_clear: "सर्व भाडे जमा झाले आहे!",
    tab_all: "सर्व",
    tab_pending: "बाकी",
    tab_partial: "अर्धवट जमा",
    tab_paid: "पूर्ण जमा",
    tab_vacant: "रिकामी",
    report_btn: "अहवाल",

    // Empty state
    empty_title_zero: "अद्याप एकही खोली जोडलेली नाही",
    empty_title_search: "कोणतीही खोली सापडली नाही",
    empty_sub_zero: "तुमची पहिली खोली किंवा फ्लॅट जोडा आणि घरभाडे, वीज बिल व व्हॉट्सॲप हिशोब सुरू करा.",
    empty_sub_search: "तुमच्या शोधानुसार कोणतीही खोली मिळाली नाही.",
    btn_add_room: "+ नवीन खोली / फ्लॅट जोडा",

    // Room Card & Status
    status_vacant: "रिकामी खोली",
    status_paid: "पूर्ण जमा (निरंक)",
    status_partial: "अर्धवट जमा",
    status_due_today: "आजच देय (Due Today)!",
    status_overdue: "थकबाकी (लेट)",
    status_due_soon: "बाकी देय",
    no_tenant: "भाडेकरू नाही",
    expected_rent: "अपेक्षित भाडे",
    fully_paid: "पूर्ण जमा",
    due_date_tag: "देय तारीख:",
    breakdown_rent: "भाडे",
    breakdown_elec: "वीज",
    breakdown_maint: "देखभाल",
    breakdown_prev: "मागील बाकी",
    breakdown_paid: "जमा",
    breakdown_remaining: "शिल्लक",
    view_bill: "हिशोब ›",
    btn_wa_reminder: "व्हॉट्सॲप तगादा",
    btn_wa_receipt: "व्हॉट्सॲप पावती",
    btn_receipt: "पावती",
    btn_record_pay: "भाडे जमा",
    btn_meter_bill: "वीज बिल",
    btn_edit_room: "खोली बदला",
    btn_assign_tenant: "+ भाडेकरू जोडा",

    // Payment Modal
    modal_pay_title: "घरभाडे जमा नोंदवा (Record Payment)",
    pay_total_due: "एकूण देय रक्कम (Total Due):",
    pay_already_paid: "आधी जमा रक्कम:",
    pay_remaining_due: "एकूण शिल्लक बाकी:",
    quick_pay_full: "पूर्ण बाकी (100%)",
    quick_pay_half: "अर्धी रक्कम (50%)",
    pay_amount_label: "आता मिळालेली रक्कम (₹) *",
    pay_mode_label: "पेमेंट पद्धत",
    pay_mode_upi: "UPI (Google Pay / PhonePe / Paytm)",
    pay_mode_cash: "रोख (Cash)",
    pay_mode_bank: "बँक ट्रान्सफर (NEFT / IMPS)",
    pay_mode_cheque: "धनादेश (Cheque)",
    pay_date_label: "पेमेंट तारीख",
    pay_note_label: "नोंद / शेरा (ऐच्छिक)",
    pay_note_placeholder: "उदा: अर्धे पैसे दिले, बाकी १० तारखेला देणार",
    pay_after_balance: "या पेमेंटनंतर शिल्लक बाकी राहील:",
    pay_status_settled: "पूर्ण हिशोब चुकता (खाते निरंक)!",
    pay_status_partial_left: "शिल्लक राहील",
    btn_cancel: "रद्द करा",
    btn_confirm_pay: "नोंद करा व पावती बनवा",

    // Calculator & Quick Bill
    calc_heading: "वीज बिल कॅल्क्युलेटर",
    calc_sub: "सब-मीटर युनिट्स मोजा, घरभाडे जोडा आणि १-क्लिकमध्ये व्हॉट्सॲप स्मरणपत्र पाठवा",
    calc_step1: "१. खोली निवडा",
    calc_step2: "२. सब-मीटर रीडिंग व प्रतियुनिट दर",
    calc_step3: "३. घरभाडे, मागील बाकी व इतर आकार",
    prev_reading: "मागील रीडिंग (युनिट्स)",
    curr_reading: "चालू रीडिंग (युनिट्स) *",
    rate_per_unit: "प्रतियुनिट दर (₹)",
    units_consumed: "वापरलेले युनिट्स",
    elec_bill_amount: "वीज बिल रक्कम:",
    base_rent: "मूळ घरभाडे (₹)",
    water_maint: "पाणी / देखभाल (₹)",
    prev_dues_label: "मागील शिल्लक बाकी / थकबाकी (₹)",
    prev_dues_hint: "(मागील महिन्याची न दिलेली बाकी)",
    other_dues: "इतर आकार (₹)",
    billing_month_label: "बिलिंग महिना",
    grand_total_label: "एकूण देय रक्कम (Grand Total Due)",
    total_breakdown_hint: "भाडे + वीज + मागील बाकी + देखभाल",
    btn_save_bill: "हिशोब सेव्ह करा",
    btn_wa_send: "व्हॉट्सॲप पाठवा",

    // Rollover Modal (New Month Billing)
    rollover_title: "नवीन महिना बिलिंग सुरू करा (Monthly Rollover)",
    rollover_sub: "मागील महिन्याची न भरलेली थकबाकी आपोआप पुढील महिन्यात 'मागील बाकी' म्हणून जोडली जाईल.",
    rollover_current_label: "चालू महिना:",
    rollover_new_label: "नवीन महिना निवडा / नाव:",
    rollover_summary_title: "भाडेकरूंच्या बाकीचा आढावा:",
    rollover_hint: "टीप: चालू महिन्याचे रीडिंग नवीन महिन्याचे 'मागील रीडिंग' होईल आणि थकीत रक्कम सुरक्षितपणे पुढे जोडली जाईल.",
    btn_confirm_rollover: "होय, नवीन महिना सुरू करा",

    // Tenants View
    tenants_title: "खोल्या व भाडेकरू व्यवस्थापन",
    tenants_sub: "सर्व भाडेकरूंचे तपशील, मूळ भाडे व देय तारीख व्यवस्थापित करा",
    stat_total_units: "एकूण खोल्या",
    stat_occupied_units: "भाड्याने दिलेल्या",
    stat_vacant_units: "रिकाम्या खोल्या",
    stat_total_rent_pool: "मासिक अपेक्षित भाडे",

    // History View
    history_title: "खतावणी व पेमेंट इतिहास",
    history_sub: "सर्व जमा पावत्या आणि पेमेंट नोंदी",
    hist_col_receipt: "पावती क्र.",
    hist_col_tenant: "खोली व भाडेकरू",
    hist_col_month: "महिना",
    hist_col_amount: "जमा रक्कम",
    hist_col_mode: "पद्धत",
    hist_col_date: "तारीख",
    hist_col_action: "पावती",

    // Reports View
    reports_title: "मासिक अहवाल व ऑडिट",
    reports_sub: "मासिक उत्पन्न, वीज वापर व नफा-तोटा हिशोब",

    // Settings View
    settings_title: "मालक प्रोफाइल व ॲप सेटिंग्ज",
    settings_sub: "तुमचे नाव, मोबाईल, UPI आयडी व पसंतीची भाषा बदला",
    set_owner_name: "घरमालकाचे नाव",
    set_owner_phone: "मोबाईल नंबर (व्हॉट्सॲप)",
    set_owner_upi: "UPI आयडी (Google Pay / PhonePe / Paytm)",
    set_property_name: "इमारतीचे / घराचे नाव",
    set_default_rate: "डिफॉल्ट वीज दर (₹/युनिट)",
    set_billing_cycle: "चालू बिलिंग महिना",
    set_language_label: "ॲपची भाषा (Language)",
    btn_save_settings: "सेटिंग्ज सेव्ह करा",

    // PWA & iOS
    pwa_install_btn: "ॲप इन्स्टॉल करा",
    ios_install_title: "iPhone / iPad वर ॲप जोडा",
    ios_step1: "१. सफारी (Safari) मध्ये खालील <strong>शेअर (Share 📤)</strong> बटणावर टॅप करा.",
    ios_step2: "२. थोडे खाली स्क्रोल करा आणि <strong>'Add to Home Screen' (होम स्क्रीनवर जोडा ➕)</strong> निवडा.",
    ios_step3: "३. वरती उजव्या कोपऱ्यात <strong>'Add'</strong> दाबा. आता हे ॲप तुमच्या फोनवर थेट उघडेल!",
    btn_got_it: "समजले, धन्यवाद!",

    // WhatsApp Reminder Templates
    wa_greeting: "नमस्कार",
    wa_bill_intro: "चे घरभाडे व वीज बिल हिशोब तयार आहे:",
    wa_base_rent: "मूळ घरभाडे (Base Rent):",
    wa_electricity: "वीज बिल (Electricity):",
    wa_prev_reading: "मागील रीडिंग:",
    wa_curr_reading: "चालू रीडिंग:",
    wa_units: "वापरलेले युनिट्स:",
    wa_maintenance: "पाणी / देखभाल (Maintenance):",
    wa_prev_dues: "मागील शिल्लक बाकी (Previous Dues):",
    wa_other_charges: "इतर आकार (Other Charges):",
    wa_total_bill: "एकूण बिल रक्कम (Total Bill):",
    wa_already_paid: "आतापर्यंत जमा केलेले (Already Paid):",
    wa_balance_due: "एकूण बाकी रक्कम (TOTAL BALANCE DUE):",
    wa_due_date: "देय तारीख (Due Date):",
    wa_pay_direct: "थेट UPI द्वारे पेमेंट करा:",
    wa_screenshot_request: "कृपया पेमेंट केल्यानंतर येथे स्क्रीनशॉट पाठवा.",
    wa_thank_you: "धन्यवाद!",
    // App Guide Card in Settings
    settings_guide_title: "हे ॲप काय आहे आणि कसे वापरावे? (App Guide)",
    settings_guide_desc: "वीज बिल कॅल्क्युलेटर, १-क्लिक व्हॉट्सॲप रिमाइंडर आणि कायदेशीर घरभाडे पावतीचे संपूर्ण मार्गदर्शन पहा.",
    settings_guide_btn: "मार्गदर्शन उघडा ›",

    // Khata & Reports Subtabs
    khata_tab_receipts: "🧾 जमा पावत्या (Receipts)",
    khata_tab_report: "📊 मासिक ऑडिट व अहवाल (Reports)",
    khata_screen_sub: "पावत्या, जुना हिशोब आणि मासिक ऑडिट अहवाल",
    khata_search_ph: "पावती क्र., भाडेकरू नाव शोधा...",
    khata_total_logged: "एकूण नोंदणीकृत:",

    // Quick Meter Board & Calculator Subtexts
    qmb_title: "⚡ सर्व खोल्यांचे नवीन मीटर रीडिंग (झटपट नोंद)",
    calc_screen_sub: "मीटर रीडिंग नोंदवा, आपोआप बिल तयार करा आणि व्हॉट्सॲपवर पाठवा",
    calc_send_wa_btn: "व्हॉट्सॲपवर बिल पाठवा",
    calc_save_bill_btn: "खोलीच्या खात्यात बिल जतन करा",

    // Settings Profile & Sync
    settings_screen_sub: "मालिक प्रोफाईल, UPI आयडी (थेट पेमेंट लिंक) आणि ऑफलाइन डेटा बॅकअप",
    settings_owner_card_title: "घरमालकाची माहिती (Landlord Profile)",
    active_upi_card_title: "सक्रिय UPI पेमेंट माहिती",
    active_upi_help: "व्हॉट्सॲप रिमाइंडरमध्ये भाडेकरू थेट या UPI पत्त्यावर Google Pay, PhonePe किंवा Paytm द्वारे भाडे पाठवू शकतो.",
    active_upi_label: "सक्रिय UPI पत्ता:",
    cloud_sync_heading: "☁️ फायरबेस क्लाउड सिंक (मल्टी-डिव्हाइस)",
    cloud_sync_desc: "गुगल खात्याशी जोडून मोबाईल आणि लॅपटॉप दोन्हीवर सुरक्षित बॅकअप व थेट सिंक ठेवा.",
    google_connect_btn: "गुगल खात्याशी कनेक्ट करा",
    backup_heading: "डेटा बॅकअप व पुनर्प्राप्ती (स्थानिक बॅकअप)",
    backup_desc: "तुमचा सर्व डेटा तुमच्या फोन/ब्राउझरमध्ये १००% सुरक्षित व खाजगी राहतो.",
    btn_download_backup: "बॅकअप डाऊनलोड करा (JSON)",
    btn_restore_backup: "बॅकअप रिस्टोअर करा",
    btn_clear_data: "सर्व डेटा हटवा (नवीन सुरुवात)",
    privacy_policy_link: "गोपनीयता धोरण (Privacy Policy) ›",
    offline_private_label: "🔒 १००% खाजगी आणि ऑफलाइन",
    owner_name_label: "घरमालकाचे नाव *",
    owner_phone_label: "घरमालकाचा मोबाईल नंबर *",
    owner_upi_label: "UPI आयडी (थेट पेमेंट लिंकसाठी) *",
    owner_upi_help: "हा UPI पत्ता भाडेकरूंना व्हॉट्सॲप रिमाइंडरमध्ये थेट लिंक म्हणून पाठवला जाईल.",
    owner_property_label: "मुख्य इमारतीचे नाव",
    owner_default_rate_label: "मूळ वीज दर (₹ प्रति युनिट)",
    owner_cycle_label: "चालू बिलिंग महिना",
    owner_pan_label: "घरमालक पॅन कार्ड (HRA टॅक्स सवलतीसाठी)",

  },

  hi: {
    // Brand & Header
    app_name: "निवास किरायाबुक",
    app_subtitle: "स्मार्ट किराया व बिजली बिल बही-खाता",
    guide_btn: "गाइड",
    guide_title: "यह ऐप क्या है & कैसे काम करती है?",
    guide_sub: "3 आसान स्टेप्स में गाइड देखें",
    cloud_sync: "क्लाउड सिंक",
    billing_cycle: "बिलिंग महीना",
    install_app: "ऐप इनस्टॉल करें",
    new_month_btn: "नया महीना शुरू करें",
    search_placeholder: "कमरा नं., किरायेदार, फोन नंबर सर्च करें...",

    // Navigation
    nav_dashboard: "किराया",
    nav_calculator: "बिजली मीटर",
    nav_history: "खाता",
    nav_settings: "सेटिंग्स",

    // Dashboard KPIs & Tabs
    stat_collected: "कुल जमा किराया",
    stat_pending: "कुल बकाया राशि",
    rooms_clear: "कमरे क्लियर (जमा)",
    rooms_pending: "कमरे बकाया",
    all_clear: "सभी किराया क्लियर है!",
    tab_all: "सभी",
    tab_pending: "बकाया",
    tab_partial: "आधा / आंशिक जमा",
    tab_paid: "पूरा जमा",
    tab_vacant: "खाली",
    report_btn: "रिपोर्ट",

    // Empty state
    empty_title_zero: "अभी कोई कमरा ऐड नहीं हुआ है",
    empty_title_search: "कोई कमरा मैच नहीं हुआ",
    empty_sub_zero: "अपना पहला कमरा या फ्लैट जोड़ें और किराया, बिजली बिल व व्हाट्सएप हिसाब शुरू करें।",
    empty_sub_search: "आपकी खोज या फिल्टर के अनुसार कोई कमरा नहीं मिला।",
    btn_add_room: "+ नया कमरा / फ्लैट जोड़ें",

    // Room Card & Status
    status_vacant: "खाली कमरा",
    status_paid: "जमा (क्लियर)",
    status_partial: "आधा जमा",
    status_due_today: "आज ही देय (Due Today)!",
    status_overdue: "लेट / बकाया",
    status_due_soon: "बाकी",
    no_tenant: "किरायेदार नहीं है",
    expected_rent: "अनुमानित किराया",
    fully_paid: "पूरा चुकता",
    due_date_tag: "ड्यू डेट:",
    breakdown_rent: "किराया",
    breakdown_elec: "बिजली",
    breakdown_maint: "मेंटेनेंस",
    breakdown_prev: "पिछला बाकी",
    breakdown_paid: "जमा",
    breakdown_remaining: "बाकी",
    view_bill: "बिल ›",
    btn_wa_reminder: "व्हाट्सएप तकादा",
    btn_wa_receipt: "व्हाट्सएप रसीद",
    btn_receipt: "रसीद",
    btn_record_pay: "किराया जमा",
    btn_meter_bill: "बिजली बिल",
    btn_edit_room: "एडिट करें",
    btn_assign_tenant: "+ किरायेदार बैठाएं",

    // Payment Modal
    modal_pay_title: "किराया जमा करें (Record Payment)",
    pay_total_due: "कुल देय राशि (Total Due):",
    pay_already_paid: "पहले से जमा:",
    pay_remaining_due: "कुल शेष बाकी:",
    quick_pay_full: "पूरा बाकी (100%)",
    quick_pay_half: "आधा भुगतान (50%)",
    pay_amount_label: "प्राप्त राशि (₹) *",
    pay_mode_label: "भुगतान का माध्यम",
    pay_mode_upi: "UPI (Google Pay / PhonePe / Paytm)",
    pay_mode_cash: "नकद (Cash)",
    pay_mode_bank: "बैंक ट्रांसफर (NEFT / IMPS)",
    pay_mode_cheque: "चेक (Cheque)",
    pay_date_label: "भुगतान की तारीख",
    pay_note_label: "नोट / विवरण (वैकल्पिक)",
    pay_note_placeholder: "जैसे: आधे पैसे दिए, बाकी 10 तारीख को",
    pay_after_balance: "इस भुगतान के बाद शेष बाकी रहेगा:",
    pay_status_settled: "पूरा हिसाब चुकता (क्लियर)!",
    pay_status_partial_left: "बाकी रहेगा",
    btn_cancel: "रद्द करें",
    btn_confirm_pay: "जमा दर्ज करें व रसीद बनाएं",

    // Calculator & Quick Bill
    calc_heading: "बिजली बिल कैलकुलेटर",
    calc_sub: "सब-मीटर यूनिट्स कैलकुलेट करें, रूम रेंट जोड़ें और 1-क्लिक में व्हाट्सएप हिसाब भेजें",
    calc_step1: "1. कमरा चुनें",
    calc_step2: "2. मीटर रीडिंग & प्रति यूनिट रेट",
    calc_step3: "3. किराया, पिछला बकाया & अन्य चार्ज",
    prev_reading: "पिछली रीडिंग (यूनिट)",
    curr_reading: "चालू रीडिंग (यूनिट) *",
    rate_per_unit: "रेट / यूनिट (₹)",
    units_consumed: "यूनिट्स खपत",
    elec_bill_amount: "बिजली बिल राशि:",
    base_rent: "मूल किराया (₹)",
    water_maint: "पानी / मेंटेनेंस (₹)",
    prev_dues_label: "पिछला बकाया किराया (₹)",
    prev_dues_hint: "(पिछले महीने का बाकी न दिया हुआ किराया)",
    other_dues: "अन्य शुल्क (₹)",
    billing_month_label: "बिलिंग महीना",
    grand_total_label: "कुल बकाया राशि (Grand Total Due)",
    total_breakdown_hint: "किराया + बिजली + पिछला बकाया + मेंटेनेंस",
    btn_save_bill: "बिल सेव करें",
    btn_wa_send: "व्हाट्सएप भेजें",

    // Rollover Modal (New Month Billing)
    rollover_title: "नया महीना बिलिंग शुरू करें (Monthly Rollover)",
    rollover_sub: "पिछले महीने का बिना दिया बकाया किराया अपने आप 'पिछला बकाया' बनकर नए महीने में जुड़ जाएगा।",
    rollover_current_label: "वर्तमान महीना:",
    rollover_new_label: "नए महीने का नाम / चुनें:",
    rollover_summary_title: "किरायेदारों के बकाये का हिसाब:",
    rollover_hint: "नोट: वर्तमान रीडिंग नए महीने की पिछली रीडिंग बन जाएगी और बकाया राशि सुरक्षित रूप से आगे ट्रांसफर हो जाएगी।",
    btn_confirm_rollover: "हाँ, नया महीना शुरू करें",

    // Tenants View
    tenants_title: "कमरे व किरायेदार मैनेजमेंट",
    tenants_sub: "अपने सभी किरायेदारों का ब्यौरा, तय किराया व ड्यू तारीख मैनेज करें",
    stat_total_units: "कुल कमरे",
    stat_occupied_units: "किराये पर लगे",
    stat_vacant_units: "खाली कमरे",
    stat_total_rent_pool: "मासिक कुल किराया पूल",

    // History View
    history_title: "खाता-बही व पेमेंट रिकॉर्ड",
    history_sub: "सभी पेमेंट रसीदें और जमा इतिहास",
    hist_col_receipt: "रसीद नं.",
    hist_col_tenant: "कमरा व किरायेदार",
    hist_col_month: "महीना",
    hist_col_amount: "जमा राशि",
    hist_col_mode: "माध्यम",
    hist_col_date: "तारीख",
    hist_col_action: "रसीद",

    // Reports View
    reports_title: "मासिक रिपोर्ट व प्रॉपर्टी ऑडिट",
    reports_sub: "मासिक आमदनी, बिजली खपत और लाभ-हानि हिसाब",

    // Settings View
    settings_title: "मालिक प्रोफाइल व ऐप सेटिंग्स",
    settings_sub: "अपना नाम, मोबाइल, UPI आईडी व पसंदीदा भाषा सेट करें",
    set_owner_name: "मकान मालिक का नाम",
    set_owner_phone: "मोबाइल नंबर (व्हाट्सएप)",
    set_owner_upi: "UPI आईडी (Google Pay / PhonePe / Paytm)",
    set_property_name: "बिल्डिंग / मकान का नाम",
    set_default_rate: "डिफ़ॉल्ट बिजली रेट (₹/यूनिट)",
    set_billing_cycle: "वर्तमान बिलिंग चक्र",
    set_language_label: "ऐप की भाषा (Language)",
    btn_save_settings: "सेटिंग्स सेव करें",

    // PWA & iOS
    pwa_install_btn: "ऐप इनस्टॉल करें",
    ios_install_title: "iPhone / iPad पर ऐप लगाएं",
    ios_step1: "1. सफारी (Safari) में नीचे <strong>शेयर (Share 📤)</strong> बटन दबाएं।",
    ios_step2: "2. थोड़ा नीचे स्क्रॉल करें और <strong>'Add to Home Screen' (होम स्क्रीन पर जोड़ें ➕)</strong> चुनें।",
    ios_step3: "3. ऊपर दाएं कोने में <strong>'Add'</strong> दबाएं। ऐप आपके फोन पर तैयार है!",
    btn_got_it: "समझ गया, धन्यवाद!",

    // WhatsApp Reminder Templates
    wa_greeting: "नमस्ते",
    wa_bill_intro: "का किराया व बिजली बिल हिसाब तैयार है:",
    wa_base_rent: "मूल किराया (Base Rent):",
    wa_electricity: "बिजली बिल (Electricity):",
    wa_prev_reading: "पिछली रीडिंग:",
    wa_curr_reading: "चालू रीडिंग:",
    wa_units: "खपत यूनिट्स:",
    wa_maintenance: "पानी / मेंटेनेंस (Maintenance):",
    wa_prev_dues: "पिछला बकाया (Previous Dues):",
    wa_other_charges: "अन्य चार्ज (Other Charges):",
    wa_total_bill: "कुल बिल (Total Bill):",
    wa_already_paid: "अब तक जमा किया (Already Paid):",
    wa_balance_due: "कुल बाकी राशि (TOTAL BALANCE DUE):",
    wa_due_date: "ड्यू डेट (Due Date):",
    wa_pay_direct: "सीधे UPI से भुगतान करें:",
    wa_screenshot_request: "कृपया पेमेंट के बाद यहां स्क्रीनशॉट भेज दें।",
    wa_thank_you: "धन्यवाद!",
    // App Guide Card in Settings
    settings_guide_title: "यह ऐप क्या है और कैसे काम करती है? (App Guide)",
    settings_guide_desc: "बिजली बिल कैलकुलेटर, 1-क्लिक व्हाट्सएप रिमाइंडर और कानूनी किराया रसीद का पूरा परिचय व गाइड देखें।",
    settings_guide_btn: "गाइड खोलें ›",

    // Khata & Reports Subtabs
    khata_tab_receipts: "🧾 पेमेंट रसीदें (Receipts)",
    khata_tab_report: "📊 मासिक ऑडिट व रिपोर्ट (Reports)",
    khata_screen_sub: "रसीदें, पुराना हिसाब और मासिक ऑडिट रिपोर्ट",
    khata_search_ph: "रसीद नंबर, किरायेदार नाम खोजें...",
    khata_total_logged: "कुल दर्ज भुगतान:",

    // Quick Meter Board & Calculator Subtexts
    qmb_title: "⚡ सभी कमरों की नई मीटर रीडिंग (फास्ट एंट्री)",
    calc_screen_sub: "मीटर रीडिंग दर्ज करें, स्वचालित बिल बनाएं और व्हाट्सएप पर भेजें",
    calc_send_wa_btn: "व्हाट्सएप पर बिल भेजें",
    calc_save_bill_btn: "कमरे के रिकॉर्ड में बिल सेव करें",

    // Settings Profile & Sync
    settings_screen_sub: "मालिक की प्रोफाइल, UPI ID (डायरेक्ट पेमेंट लिंक) और ऑफलाइन डेटा बैकअप",
    settings_owner_card_title: "मकान मालिक का विवरण (Landlord Profile)",
    active_upi_card_title: "सक्रिय UPI पेमेंट जानकारी",
    active_upi_help: "व्हाट्सएप रिमाइंडर में किरायेदार डायरेक्ट इस UPI ID पर Google Pay, PhonePe या Paytm से पेमेंट भेज सकता है।",
    active_upi_label: "सक्रिय UPI पता:",
    cloud_sync_heading: "☁️ Firebase Cloud Sync (मल्टी-डिवाइस सिंक)",
    cloud_sync_desc: "Google Account से जोड़कर मोबाइल और लैपटॉप दोनों पर लाइव सिंक और सुरक्षित क्लाउड बैकअप रखें।",
    google_connect_btn: "Google Account से कनेक्ट करें",
    backup_heading: "डेटा बैकअप & रिकवरी (लोकल बैकअप)",
    backup_desc: "आपका सारा डेटा आपके डिवाइस ब्राउज़र में 100% प्राइवेट और सुरक्षित रहता है।",
    btn_download_backup: "बैकअप डाउनलोड करें (JSON)",
    btn_restore_backup: "बैकअप रीस्टोर करें",
    btn_clear_data: "सारा डेटा साफ करें (Fresh Start)",
    privacy_policy_link: "गोपनीयता नीति (Privacy Policy) ›",
    offline_private_label: "🔒 100% प्राइवेट & ऑफलाइन",
    owner_name_label: "मालिक / लैंडलॉर्ड का नाम *",
    owner_phone_label: "मालिक का मोबाइल नंबर *",
    owner_upi_label: "मालिक UPI ID (डायरेक्ट पेमेंट लिंक के लिए) *",
    owner_upi_help: "यह UPI ID किरायेदार को व्हाट्सएप रिमाइंडर में डायरेक्ट लिंक बनकर जाएगी।",
    owner_property_label: "डिफ़ॉल्ट प्रॉपर्टी / बिल्डिंग का नाम",
    owner_default_rate_label: "डिफ़ॉल्ट बिजली दर (₹ प्रति यूनिट)",
    owner_cycle_label: "वर्तमान बिलिंग चक्र",
    owner_pan_label: "मालिक पैन कार्ड (HRA टैक्स छूट के लिए)",

  },

  en: {
    // Brand & Header
    app_name: "Nivas KirayaBook",
    app_subtitle: "Smart Rent & Bijli Bill Ledger",
    guide_btn: "Guide",
    guide_title: "What is this app & How to use?",
    guide_sub: "View 3-step walkthrough",
    cloud_sync: "Cloud Sync",
    billing_cycle: "Billing Month",
    install_app: "Install App",
    new_month_btn: "Start New Month",
    search_placeholder: "Search room no, tenant, phone...",

    // Navigation
    nav_dashboard: "Rent",
    nav_calculator: "Electricity",
    nav_history: "Ledger",
    nav_settings: "Settings",

    // Dashboard KPIs & Tabs
    stat_collected: "Total Collected",
    stat_pending: "Pending Balance",
    rooms_clear: "Rooms Clear",
    rooms_pending: "Rooms Pending",
    all_clear: "All Rent Cleared!",
    tab_all: "All",
    tab_pending: "Pending",
    tab_partial: "Partial Paid",
    tab_paid: "Fully Paid",
    tab_vacant: "Vacant",
    report_btn: "Report",

    // Empty state
    empty_title_zero: "No Rooms Added Yet",
    empty_title_search: "No Matching Rooms Found",
    empty_sub_zero: "Add your first room or flat to start tracking rent, electricity meters, and WhatsApp notices.",
    empty_sub_search: "No rooms match your search query or filter.",
    btn_add_room: "+ Add New Room / Flat",

    // Room Card & Status
    status_vacant: "Vacant Room",
    status_paid: "Fully Paid",
    status_partial: "Partially Paid",
    status_due_today: "DUE TODAY!",
    status_overdue: "Late / Overdue",
    status_due_soon: "Due Soon",
    no_tenant: "No tenant assigned",
    expected_rent: "Expected Rent",
    fully_paid: "Fully Settled",
    due_date_tag: "Due Date:",
    breakdown_rent: "Rent",
    breakdown_elec: "Bijli",
    breakdown_maint: "Maint",
    breakdown_prev: "Prev Due",
    breakdown_paid: "Paid",
    breakdown_remaining: "Balance",
    view_bill: "Bill ›",
    btn_wa_reminder: "WhatsApp Notice",
    btn_wa_receipt: "WhatsApp Receipt",
    btn_receipt: "Receipt",
    btn_record_pay: "Record Pay",
    btn_meter_bill: "Meter Bill",
    btn_edit_room: "Edit Room",
    btn_assign_tenant: "+ Add Tenant",

    // Payment Modal
    modal_pay_title: "Record Payment",
    pay_total_due: "Total Due Amount:",
    pay_already_paid: "Already Paid This Month:",
    pay_remaining_due: "Remaining Balance Due:",
    quick_pay_full: "Full Balance (100%)",
    quick_pay_half: "Half (50%)",
    pay_amount_label: "Amount Received (₹) *",
    pay_mode_label: "Payment Mode",
    pay_mode_upi: "UPI (Google Pay / PhonePe / Paytm)",
    pay_mode_cash: "Cash",
    pay_mode_bank: "Bank Transfer (NEFT / IMPS)",
    pay_mode_cheque: "Cheque",
    pay_date_label: "Payment Date",
    pay_note_label: "Note / Remarks (Optional)",
    pay_note_placeholder: "e.g. Paid half today, rest on 10th",
    pay_after_balance: "Balance remaining after this payment:",
    pay_status_settled: "Fully Settled & Clear!",
    pay_status_partial_left: "remaining",
    btn_cancel: "Cancel",
    btn_confirm_pay: "Confirm & Issue Receipt",

    // Calculator & Quick Bill
    calc_heading: "Electricity Bill Calculator",
    calc_sub: "Compute sub-meter units, attach rent dues, and dispatch 1-click WhatsApp bills",
    calc_step1: "1. Select Room / Flat",
    calc_step2: "2. Meter Readings & Rate",
    calc_step3: "3. Rent, Arrears & Utilities",
    prev_reading: "Previous Reading (Units)",
    curr_reading: "Current Reading (Units) *",
    rate_per_unit: "Rate / Unit (₹)",
    units_consumed: "Units Consumed",
    elec_bill_amount: "Electricity Bill Total:",
    base_rent: "Base Rent (₹)",
    water_maint: "Water / Maintenance (₹)",
    prev_dues_label: "Previous Pending Dues / Arrears (₹)",
    prev_dues_hint: "(Unpaid balance carried forward from previous months)",
    other_dues: "Other Dues / Late Fee (₹)",
    billing_month_label: "Billing Month",
    grand_total_label: "Grand Total Due",
    total_breakdown_hint: "Rent + Electricity + Previous Dues + Maintenance",
    btn_save_bill: "Save Bill",
    btn_wa_send: "Send WhatsApp",

    // Rollover Modal (New Month Billing)
    rollover_title: "Start New Month Billing Cycle (Rollover)",
    rollover_sub: "Any unpaid dues from the previous month will automatically carry over as 'Previous Dues' into the new cycle.",
    rollover_current_label: "Current Billing Month:",
    rollover_new_label: "New Billing Month Name:",
    rollover_summary_title: "Tenants Dues Rollover Summary:",
    rollover_hint: "Note: Current readings will become the previous readings for the next cycle, and unpaid arrears will be preserved safely.",
    btn_confirm_rollover: "Confirm & Start New Month",

    // Tenants View
    tenants_title: "Rooms & Tenants Directory",
    tenants_sub: "Manage room occupancy, contact details, base rent & payment due dates",
    stat_total_units: "Total Units",
    stat_occupied_units: "Occupied Units",
    stat_vacant_units: "Vacant Units",
    stat_total_rent_pool: "Monthly Rent Pool",

    // History View
    history_title: "Payment Records & Ledger",
    history_sub: "All rent receipts generated and payment audit trail",
    hist_col_receipt: "Receipt #",
    hist_col_tenant: "Room & Tenant",
    hist_col_month: "Month",
    hist_col_amount: "Amount Paid",
    hist_col_mode: "Mode",
    hist_col_date: "Date",
    hist_col_action: "Receipt",

    // Reports View
    reports_title: "Monthly Audit & Income Report",
    reports_sub: "Track monthly collections, power consumption & profitability",

    // Settings View
    settings_title: "Owner Profile & App Preferences",
    settings_sub: "Configure your name, phone, UPI address and preferred language",
    set_owner_name: "Landlord / Owner Name",
    set_owner_phone: "WhatsApp Contact Phone",
    set_owner_upi: "Owner UPI ID (GPay / PhonePe / Paytm)",
    set_property_name: "Building / Property Name",
    set_default_rate: "Default Electricity Rate (₹/unit)",
    set_billing_cycle: "Current Billing Cycle",
    set_language_label: "App Language (भाषा)",
    btn_save_settings: "Save Settings",

    // PWA & iOS
    pwa_install_btn: "Install App",
    ios_install_title: "Install on iPhone / iPad",
    ios_step1: "1. Tap the <strong>Share button (📤)</strong> at the bottom of Safari.",
    ios_step2: "2. Scroll down and select <strong>'Add to Home Screen' (➕)</strong>.",
    ios_step3: "3. Tap <strong>'Add'</strong> in the top right corner. KirayaBook is now on your home screen!",
    btn_got_it: "Got It, Thanks!",

    // WhatsApp Reminder Templates
    wa_greeting: "Hello",
    wa_bill_intro: "Here is your rent & electricity statement for",
    wa_base_rent: "Base Rent:",
    wa_electricity: "Electricity Bill:",
    wa_prev_reading: "Previous Reading:",
    wa_curr_reading: "Current Reading:",
    wa_units: "Units Consumed:",
    wa_maintenance: "Water / Maintenance:",
    wa_prev_dues: "Previous Pending Dues:",
    wa_other_charges: "Other Charges:",
    wa_total_bill: "Total Bill Amount:",
    wa_already_paid: "Amount Already Paid:",
    wa_balance_due: "TOTAL BALANCE DUE:",
    wa_due_date: "Due Date:",
    wa_pay_direct: "Direct UPI Payment:",
    wa_screenshot_request: "Please share a screenshot once payment is completed.",
    wa_thank_you: "Thank you!",
    // App Guide Card in Settings
    settings_guide_title: "What is this app and how does it work? (App Guide)",
    settings_guide_desc: "Explore the electricity bill calculator, 1-click WhatsApp reminders, and legal rent receipts walkthrough.",
    settings_guide_btn: "Open Guide ›",

    // Khata & Reports Subtabs
    khata_tab_receipts: "🧾 Payment Receipts",
    khata_tab_report: "📊 Monthly Audit & Reports",
    khata_screen_sub: "Receipts, payment ledger, and monthly audit reports",
    khata_search_ph: "Search receipt no, tenant name...",
    khata_total_logged: "Total Logged:",

    // Quick Meter Board & Calculator Subtexts
    qmb_title: "⚡ All Rooms New Meter Reading (Fast Entry)",
    calc_screen_sub: "Enter meter readings, calculate bills automatically, and send WhatsApp notices",
    calc_send_wa_btn: "Send Bill on WhatsApp",
    calc_save_bill_btn: "Save Bill to Room Record",

    // Settings Profile & Sync
    settings_screen_sub: "Landlord profile, UPI ID (direct payment links), and offline data backup",
    settings_owner_card_title: "Landlord / House Owner Details",
    active_upi_card_title: "Active UPI Payment Info",
    active_upi_help: "Tenants can tap the direct link in WhatsApp to pay directly to this UPI address via Google Pay, PhonePe, or Paytm.",
    active_upi_label: "Active UPI Address:",
    cloud_sync_heading: "☁️ Firebase Cloud Sync (Multi-Device)",
    cloud_sync_desc: "Connect Google Account for real-time sync and safe cloud backup across mobile and laptop.",
    google_connect_btn: "Connect with Google Account",
    backup_heading: "Data Backup & Recovery (Local Backup)",
    backup_desc: "All your ledger data remains 100% private and stored on your device.",
    btn_download_backup: "Download Backup (JSON)",
    btn_restore_backup: "Restore Backup",
    btn_clear_data: "Clear All Data (Fresh Start)",
    privacy_policy_link: "Privacy Policy ›",
    offline_private_label: "🔒 100% Private & Offline-First",
    owner_name_label: "Owner / Landlord Name *",
    owner_phone_label: "Owner Phone Number *",
    owner_upi_label: "Owner UPI ID (For Direct Payments) *",
    owner_upi_help: "This UPI ID creates a 1-click payment link in tenant WhatsApp reminders.",
    owner_property_label: "Default Property Name",
    owner_default_rate_label: "Default Electricity Rate (₹ per unit)",
    owner_cycle_label: "Current Billing Cycle",
    owner_pan_label: "Owner PAN Card (For HRA Tax Exemption)"

  }
};

let currentLanguage = 'hi'; // Default to Hindi, popular for KirayaBook

function initI18n() {
  const savedLang = localStorage.getItem(I18N_STORAGE_KEY);
  if (savedLang && (savedLang === 'mr' || savedLang === 'hi' || savedLang === 'en')) {
    currentLanguage = savedLang;
  } else {
    // Default to Hindi
    currentLanguage = 'hi';
  }
  applyTranslations();
  updateLanguageUI();
}

function getLang() {
  return currentLanguage || 'hi';
}

function t(key, fallback = '') {
  const langObj = TRANSLATIONS[currentLanguage] || TRANSLATIONS['hi'];
  if (langObj && langObj[key] !== undefined) {
    return langObj[key];
  }
  const hiObj = TRANSLATIONS['hi'];
  if (hiObj && hiObj[key] !== undefined) {
    return hiObj[key];
  }
  return fallback || key;
}

function setLanguage(lang) {
  if (lang !== 'mr' && lang !== 'hi' && lang !== 'en') return;
  currentLanguage = lang;
  localStorage.setItem(I18N_STORAGE_KEY, lang);
  if (typeof state !== 'undefined' && state.settings) {
    state.settings.language = lang;
    if (typeof saveToStorage === 'function') saveToStorage();
  }
  applyTranslations();
  updateLanguageUI();

  // Re-render app UI views
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTenantsView === 'function') renderTenantsView();
  if (typeof renderHistoryTable === 'function') renderHistoryTable();
  if (typeof renderMonthlyReportView === 'function') renderMonthlyReportView();
  if (typeof updateOwnerUI === 'function') updateOwnerUI();
  if (typeof runScreenCalc === 'function') runScreenCalc();
  if (typeof renderQuickMeterBoard === 'function') renderQuickMeterBoard();

  const langNames = { mr: 'मराठी', hi: 'हिंदी', en: 'English' };
  if (typeof showToast === 'function') {
    showToast(`भाषा बदलली: ${langNames[lang]} | Language updated!`);
  }
}

function updateLanguageUI() {
  // Update header pill label
  const codeEl = document.getElementById('current-lang-code');
  if (codeEl) {
    const labels = { mr: 'मराठी', hi: 'हिंदी', en: 'English' };
    codeEl.innerText = labels[currentLanguage] || 'हिंदी';
  }

  // Update Settings screen select
  const setLangSelect = document.getElementById('set-screen-language');
  if (setLangSelect) {
    setLangSelect.value = currentLanguage;
  }

  // Update active state in dropdown
  document.querySelectorAll('.lang-option-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
  });
}

function applyTranslations() {
  // Translate elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) {
      el.innerHTML = translated;
    }
  });

  // Translate placeholders with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    const translated = t(key);
    if (translated) {
      el.setAttribute('placeholder', translated);
    }
  });

  // Translate titles / tooltips with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translated = t(key);
    if (translated) {
      el.setAttribute('title', translated);
    }
  });
}


if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.t = t;
  window.getLang = getLang;
  window.setLanguage = setLanguage;
  window.initI18n = initI18n;
  window.applyTranslations = applyTranslations;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS, t, getLang, setLanguage, initI18n, applyTranslations };
}
