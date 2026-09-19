export type Language = "en" | "mr" | "hi";

export interface Translations {
  app_title: string;
  app_subtitle: string;
  festival_tagline: string;
  festival_subtagline: string;
  search_placeholder: string;
  no_results: string;
  view_all_explore: string;
  open_map: string;
  plan_darshan: string;
  darshan_plans: string;
  darshan_plans_sub: string;
  see_all_routes: string;
  famous_mandals: string;
  famous_mandals_sub: string;
  see_all_mandals: string;
  stops_label: string;
  add_btn: string;
  added_btn: string;
  main_nav: string;
  home: string;
  explore: string;
  live_map: string;
  curated_routes: string;
  saved_mandals: string;
  tools_info: string;
  parking_closures: string;
  how_to_use: string;
  about_privacy: string;
  download_app: string;
  notifications: string;
  appearance: string;
  language_label: string;
  light_mode: string;
  dark_mode: string;
  footer_tagline: string;
  footer_subtagline: string;
  toast_added: string;
  toast_removed: string;
  toast_already_added: string;
  view_saved: string;
  day_x_of_12: string;
  festival_banner_active: string;
  festival_banner_upcoming: string;
  festival_banner_ended: string;
  notif_active: string;
  notif_enable: string;
  notif_enabled_alert: string;
  notif_not_supported: string;
  pwa_badge: string;
  pwa_installed_badge: string;
  pwa_already_installed: string;
  pwa_install_instructions: string;
  pwa_banner_title: string;
  pwa_banner_desc: string;
  pwa_banner_btn: string;
  festival_header_title: string;
  more: string;
  more_page_title: string;
  more_page_subtitle: string;
  more_curated_routes_title: string;
  more_curated_routes_desc: string;
  more_parking_title: string;
  more_parking_desc: string;
  more_washrooms_title: string;
  more_washrooms_desc: string;
  more_police_title: string;
  more_police_desc: string;
  police_stations_pending: string;
  washrooms_pending: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    app_title: "Pune Ganpati Darshan",
    app_subtitle: "Pune Ganeshotsav 2026",
    festival_tagline: "Experience Pune's Ganpati",
    festival_subtagline: "Find what's near you, check queues and plan a walkable darshan.",
    search_placeholder: "🔍 Search Ganpati, area or mandal",
    no_results: "No mandals found matching",
    view_all_explore: "View all results in Explore →",
    open_map: "Open Map",
    plan_darshan: "🙏 Plan Your Darshan",
    darshan_plans: "Darshan Plans",
    darshan_plans_sub: "Curated Walking Routes",
    see_all_routes: "See all 6 routes →",
    famous_mandals: "Famous Mandals",
    famous_mandals_sub: "Historic and Revered Ganpatis",
    see_all_mandals: "See all (30)",
    stops_label: "Stops",
    add_btn: "Add",
    added_btn: "Added",
    main_nav: "Main Navigation",
    home: "Home",
    explore: "Explore Mandals (30)",
    live_map: "Live Map & Crowd",
    curated_routes: "Curated Routes (6)",
    saved_mandals: "Saved Mandals & Plan",
    tools_info: "Tools & Information",
    parking_closures: "Parking & Road Closures",
    how_to_use: "How to Use",
    about_privacy: "About & Privacy",
    download_app: "Download App",
    notifications: "Notifications",
    appearance: "Appearance",
    language_label: "Language",
    light_mode: "Light",
    dark_mode: "Dark",
    footer_tagline: "Built for Pune Ganeshotsav Devotees",
    footer_subtagline: "100% Free · Community Real-time Guide",
    toast_added: "✓ {name} added to your Darshan. You can find it in Saved and plan your route there.",
    toast_removed: "{name} removed from your Darshan.",
    toast_already_added: "Already in your Darshan",
    view_saved: "View Saved",
    day_x_of_12: "Day {day} of 12",
    festival_banner_active: "🪔 Ganeshotsav • Day {day} of 12 · Pune Active",
    festival_banner_upcoming: "Festival begins in {days} days (Sep 14 – 25)",
    festival_banner_ended: "Pune Ganeshotsav has concluded for this year.",
    notif_active: "✓ Active",
    notif_enable: "Enable",
    notif_enabled_alert: "✓ Notifications enabled for Pune Ganpati Darshan!",
    notif_not_supported: "Notifications are not supported in this browser.",
    pwa_badge: "PWA",
    pwa_installed_badge: "Installed",
    pwa_already_installed: "Pune Ganpati Darshan is already installed on your device.",
    pwa_install_instructions: "To install: Tap your browser's share or menu button (⋮ / ⎙ / Share) and select 'Add to Home Screen'!",
    pwa_banner_title: "Install Ganpati Darshan",
    pwa_banner_desc: "Fast, offline queues & maps on your home screen.",
    pwa_banner_btn: "Add",
    festival_header_title: "Pune Ganeshotsav",
    more: "More",
    more_page_title: "More Options",
    more_page_subtitle: "Helpful tools & essentials",
    more_curated_routes_title: "Curated Routes",
    more_curated_routes_desc: "Explore planned walking routes",
    more_parking_title: "Parking",
    more_parking_desc: "Find parking & road closure information",
    more_washrooms_title: "Washrooms Near You",
    more_washrooms_desc: "Find nearby public washrooms",
    more_police_title: "Police Stations Near You",
    more_police_desc: "Find nearby police assistance posts",
    police_stations_pending: "Police stations directory is pending official Pune Police data integration.",
    washrooms_pending: "Washrooms directory is pending official PMC data integration.",
  },
  mr: {
    app_title: "पुणे गणपती दर्शन",
    app_subtitle: "पुणे गणेशोत्सव २०२६",
    festival_tagline: "पुण्याचा गणेशोत्सव अनुभवा",
    festival_subtagline: "जवळचे गणपती शोधा, रांगा तपासा आणि पायी दर्शनाचे नियोजन करा.",
    search_placeholder: "🔍 गणपती, परिसर किंवा मंडळ शोधा",
    no_results: "कोणतेही मंडळ सापडले नाही",
    view_all_explore: "सर्व निकाल एक्सप्लोर मध्ये पहा →",
    open_map: "नकाशा उघडा",
    plan_darshan: "🙏 दर्शन नियोजन करा",
    darshan_plans: "दर्शन योजना",
    darshan_plans_sub: "निवडक दर्शन मार्ग",
    see_all_routes: "सर्व ६ मार्ग पहा →",
    famous_mandals: "प्रसिद्ध मंडळे",
    famous_mandals_sub: "मानाचे व प्रसिद्ध गणपती",
    see_all_mandals: "सर्व पहा (३०)",
    stops_label: "थांबे",
    add_btn: "जोडा",
    added_btn: "जोडले",
    main_nav: "मुख्य मेनू",
    home: "मुख्यपृष्ठ",
    explore: "मंडळे एक्सप्लोर करा (३०)",
    live_map: "थेट नकाशा आणि गर्दी",
    curated_routes: "निवडक मार्ग (६)",
    saved_mandals: "जतन केलेले गणपती आणि योजना",
    tools_info: "माहिती व साधने",
    parking_closures: "पार्किंग व रस्ते बंद",
    how_to_use: "कसे वापरावे",
    about_privacy: "माहिती व गोपनीयता",
    download_app: "अॅप डाउनलोड करा",
    notifications: "सूचना",
    appearance: "थीम",
    language_label: "भाषा",
    light_mode: "लाईट",
    dark_mode: "डार्क",
    footer_tagline: "पुणे गणेशभक्तांसाठी प्रेमाने निर्मित",
    footer_subtagline: "१००% मोफत · थेट माहिती मार्गदर्शक",
    toast_added: "✓ {name} दर्शन योजनेमध्ये जोडले गेले. आपण हे जतन केलेल्या यादीत पाहू शकता.",
    toast_removed: "{name} दर्शन योजनेतून काढले गेले.",
    toast_already_added: "आधीच दर्शन योजनेमध्ये आहे",
    view_saved: "जतन केलेले पहा",
    day_x_of_12: "दिवस {day} / १२",
    festival_banner_active: "🪔 गणेशोत्सव • दिवस {day} / १२ · पुणे थेट",
    festival_banner_upcoming: "गणेशोत्सव {days} दिवसांत सुरू होत आहे (१४ - २५ सप्टें)",
    festival_banner_ended: "या वर्षाचा पुणे गणेशोत्सव संपन्न झाला आहे.",
    notif_active: "✓ सुरू",
    notif_enable: "सुरू करा",
    notif_enabled_alert: "✓ पुणे गणपती दर्शनसाठी सूचना सुरू केल्या आहेत!",
    notif_not_supported: "या ब्राउझरमध्ये सूचना समर्थित नाहीत.",
    pwa_badge: "अॅप",
    pwa_installed_badge: "स्थापित",
    pwa_already_installed: "पुणे गणपती दर्शन अॅप आधीच आपल्या डिव्हाइसवर स्थापित आहे.",
    pwa_install_instructions: "अॅप इन्स्टॉल करण्यासाठी: ब्राउझरच्या मेनूवर (⋮ / ⎙ / Share) टॅप करा आणि 'Add to Home Screen' निवडा!",
    pwa_banner_title: "गणपती दर्शन अॅप इन्स्टॉल करा",
    pwa_banner_desc: "थेट रांगा आणि नकाशे आपल्या होम स्क्रीनवर.",
    pwa_banner_btn: "जोडा",
    festival_header_title: "पुणे गणेशोत्सव",
    more: "अधिक",
    more_page_title: "अधिक सुविधा",
    more_page_subtitle: "उपयुक्त साधने व माहिती",
    more_curated_routes_title: "निवडक मार्ग",
    more_curated_routes_desc: "नियोजित पायी दर्शन मार्ग पहा",
    more_parking_title: "पार्किंग",
    more_parking_desc: "पार्किंग व वाहतूक बंद रस्ते माहिती",
    more_washrooms_title: "जवळची स्वच्छतागृहे",
    more_washrooms_desc: "जवळची सार्वजनिक स्वच्छतागृहे शोधा",
    more_police_title: "जवळची पोलीस ठाणी",
    more_police_desc: "जवळची पोलीस मदत केंद्रे व ठाणी",
    police_stations_pending: "पुणे पोलीस ठाण्यांची अधिकृत माहिती लवकरच जोडली जाईल.",
    washrooms_pending: "महापालिका स्वच्छतागृहांची अधिकृत माहिती लवकरच जोडली जाईल.",
  },
  hi: {
    app_title: "पुणे गणपति दर्शन",
    app_subtitle: "पुणे गणेशोत्सव २०२६",
    festival_tagline: "पुणे का गणेशोत्सव अनुभवें",
    festival_subtagline: "पास के गणपति खोजें, कतारें देखें और पैदल दर्शन की योजना बनाएं।",
    search_placeholder: "🔍 गणपति, इलाका या मंडल खोजें",
    no_results: "कोई मंडल नहीं मिला",
    view_all_explore: "सभी परिणाम एक्सप्लोर में देखें →",
    open_map: "नक्शा खोलें",
    plan_darshan: "🙏 दर्शन की योजना बनाएं",
    darshan_plans: "दर्शन योजनाएं",
    darshan_plans_sub: "चयनित पैदल मार्ग",
    see_all_routes: "सभी ६ मार्ग देखें →",
    famous_mandals: "प्रसिद्ध मंडल",
    famous_mandals_sub: "मानाचे और प्रसिद्ध गणपति",
    see_all_mandals: "सभी देखें (३०)",
    stops_label: "स्टॉप",
    add_btn: "जोड़ें",
    added_btn: "जोड़ा गया",
    main_nav: "मुख्य नेविगेशन",
    home: "होम",
    explore: "मंडल एक्सप्लोर करें (३०)",
    live_map: "लाइव नक्शा और भीड़",
    curated_routes: "चयनित मार्ग (६)",
    saved_mandals: "सहेजे गए गणपति और योजना",
    tools_info: "सूचना और साधन",
    parking_closures: "पार्किंग और सड़कें",
    how_to_use: "उपयोग कैसे करें",
    about_privacy: "जानकारी और गोपनीयता",
    download_app: "ऐप डाउनलोड करें",
    notifications: "सूचनाएं",
    appearance: "थीम",
    language_label: "भाषा",
    light_mode: "लाइट",
    dark_mode: "डार्क",
    footer_tagline: "पुणे के गणेशभक्तों के लिए निर्मित",
    footer_subtagline: "१००% मुफ्त · लाइव गाइड",
    toast_added: "✓ {name} दर्शन योजना में जोड़ दिया गया। आप इसे सहेजी गई सूची में देख सकते हैं।",
    toast_removed: "{name} दर्शन योजना से हटा दिया गया।",
    toast_already_added: "पहले से ही दर्शन योजना में है",
    view_saved: "सहेजी गई सूची देखें",
    day_x_of_12: "दिन {day} / १२",
    festival_banner_active: "🪔 गणेशोत्सव • दिन {day} / १२ · पुणे लाइव",
    festival_banner_upcoming: "गणेशोत्सव {days} दिनों में शुरू हो रहा है (१४ - २५ सित)",
    festival_banner_ended: "इस वर्ष का पुणे गणेशोत्सव संपन्न हुआ।",
    notif_active: "✓ सक्रिय",
    notif_enable: "सक्रिय करें",
    notif_enabled_alert: "✓ पुणे गणपति दर्शन के लिए सूचनाएं सक्रिय कर दी गई हैं!",
    notif_not_supported: "इस ब्राउज़र में सूचनाएं समर्थित नहीं हैं।",
    pwa_badge: "ऐप",
    pwa_installed_badge: "इंस्टॉल है",
    pwa_already_installed: "पुणे गणपति दर्शन ऐप आपके डिवाइस पर पहले से इंस्टॉल है।",
    pwa_install_instructions: "ऐप इंस्टॉल करने के लिए: ब्राउज़र के मेनू (⋮ / ⎙ / Share) पर टैप करें और 'Add to Home Screen' चुनें!",
    pwa_banner_title: "गणपति दर्शन ऐप इंस्टॉल करें",
    pwa_banner_desc: "लाइव कतारें और नक्शे अपनी होम स्क्रीन पर पाएं।",
    pwa_banner_btn: "जोड़ें",
    festival_header_title: "पुणे गणेशोत्सव",
    more: "अधिक",
    more_page_title: "अधिक सुविधाएं",
    more_page_subtitle: "उपयोगी साधन और जानकारी",
    more_curated_routes_title: "चयनित मार्ग",
    more_curated_routes_desc: "योजनाबद्ध पैदल दर्शन मार्ग देखें",
    more_parking_title: "पार्किंग",
    more_parking_desc: "पार्किंग और बंद सड़कों की जानकारी",
    more_washrooms_title: "पास के शौचालय",
    more_washrooms_desc: "पास के सार्वजनिक शौचालय खोजें",
    more_police_title: "पास के पुलिस स्टेशन",
    more_police_desc: "पास के पुलिस सहायता केंद्र",
    police_stations_pending: "पुणे पुलिस स्टेशनों की आधिकारिक जानकारी जल्द ही जोड़ी जाएगी।",
    washrooms_pending: "शौचालयों की आधिकारिक जानकारी जल्द ही जोड़ी जाएगी।",
  },
};
