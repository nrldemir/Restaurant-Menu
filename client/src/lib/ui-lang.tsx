/**
 * Uygulama arayüz dili (tanıtım sayfası, giriş/kayıt, yönetim paneli).
 * Varsayılan İngilizce; seçim tarayıcıda saklanır. Müşteri menüsü bundan bağımsızdır
 * (restoranın kendi dillerini kullanır, bkz. i18n.ts).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type UiLang = "en" | "tr";
const KEY = "ed_lang";

const en = {
  common: {
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    saving: "Saving…",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    yesDelete: "Yes, delete",
    error: "Something went wrong",
    dragToSort: "Drag to reorder",
    soldOut: "Sold out",
    available: "Available",
    hidden: "Hidden",
    switchTo: "Türkçe",
    switchCode: "TR",
  },
  nav: {
    menu: "Menu",
    settings: "Settings",
    qr: "QR Codes",
    viewMenu: "View menu",
    viewMenuHint: "The page your guests see",
    logout: "Log out",
    adminTitle: "EasyDine · Dashboard",
  },
  auth: {
    headline: ["A menu as", "beautiful", "as your food."],
    featureQr: "QR codes for every table",
    featureLangs: "Menus in 8 languages",
    featurePrices: "Prices updated in seconds",
    quote: "No more reprinting paper menus. Update prices in two taps — live on every table instantly.",
    email: "Email",
    emailPh: "you@restaurant.com",
    password: "Password",
    showPw: "Show password",
    hidePw: "Hide password",
    loginTitle: "Welcome back",
    noAccount: "Don't have an account?",
    signUp: "Sign up for free",
    login: "Log in",
    loggingIn: "Logging in…",
    or: "or",
    tryDemo: "Try the demo account",
    registerTitle: "Create your restaurant",
    haveAccount: "Already have an account?",
    restaurantName: "Restaurant name",
    restaurantNamePh: "e.g. Ali's Kebab House",
    menuLink: "Your menu link",
    menuLinkHint: "Your QR codes point to this link. You can change it later.",
    passwordPh: "At least 8 characters",
    strength: ["Very weak", "Weak", "Fair", "Good", "Strong"],
    creating: "Creating…",
    createAccount: "Create my account",
  },
  editor: {
    title: "Menu",
    subtitle: "Edit your categories and items. Press and drag to reorder.",
    addCategory: "Add category",
    statCategories: "Categories",
    statItems: "Items",
    statAvailable: "Available",
    statSoldOut: "Sold out",
    emptyTitle: "Start building your menu",
    emptyText: 'First add a category such as "Breakfast", "Mains" or "Drinks", then add your items to it.',
    addFirstCategory: "Add your first category",
    categories: "Categories",
    categoryCount: (n: number) => `${n} ${n === 1 ? "category" : "categories"}`,
    itemCount: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
    hideFromMenu: "Hide from menu",
    showOnMenu: "Show on menu",
    items: "Items",
    categoryHidden: " · this category is hidden on the menu",
    addItem: "Add item",
    emptyCategoryTitle: "This category is empty",
    emptyCategoryText: "Add your first item: its name, price and a mouth-watering photo.",
    noDescription: "No description",
    missingTitle: (codes: string) => `Missing translations: ${codes}`,
    missingCount: (n: number) => `${n} missing`,
    markSoldOut: "Mark as sold out",
    putOnSale: "Put back on sale",
    toastShown: (name: string) => `"${name}" is now visible on the menu`,
    toastHidden: (name: string) => `"${name}" is hidden from the menu`,
    toastOnSale: (name: string) => `"${name}" is available again`,
    toastSoldOut: (name: string) => `"${name}" marked as sold out`,
    toastCategoryDeleted: "Category deleted",
    toastItemDeleted: "Item deleted",
    toastCategoryAdded: "Category added",
    toastCategoryUpdated: "Category updated",
    toastItemAdded: "Item added",
    toastItemUpdated: "Item updated",
    deleteCategoryTitle: "Delete category?",
    deleteCategoryMsg: (name: string, count: number): ReactNode =>
      count ? (
        <>
          <b>{name}</b> and its <b>{count === 1 ? "1 item" : `${count} items`}</b> will be permanently deleted.
        </>
      ) : (
        <>
          <b>{name}</b> will be permanently deleted.
        </>
      ),
    deleteItemTitle: "Delete item?",
    deleteItemMsg: (name: string): ReactNode => (
      <>
        <b>{name}</b> will be permanently removed from your menu.
      </>
    ),
  },
  forms: {
    newCategory: "New category",
    editCategory: "Edit category",
    categorySubtitle: "Categories are the sections of your menu: Breakfast, Mains, Desserts…",
    categoryNamePh: "e.g. Mains",
    categoryDescPh: "Optional: All our dishes are cooked over a wood fire.",
    categoryImage: "Category image",
    categoryImageHint: "Shown in the category strip at the top of the menu. If empty, the first item's photo is used.",
    showOnMenu: "Show on menu",
    showOnMenuHint: "When off, guests won't see this category.",
    addCategory: "Add category",
    newItem: "New item",
    editItem: "Edit item",
    itemPhoto: "Item photo",
    itemPhotoHint: "A bright square or landscape photo works best.",
    availableHint: 'When off, it shows as "Sold out" on the menu.',
    itemNamePh: "e.g. Adana Kebab",
    itemDescPh: "Ingredients, portion size, how it's served…",
    price: "Price",
    category: "Category",
    invalidPrice: "Please enter a valid price (e.g. 250 or 249.90)",
    addItem: "Add item",
  },
  translations: {
    name: "Name",
    description: "Description",
    fallbackPh: "If empty, the default language is shown",
    tabs: "Language",
    filled: "Filled",
    empty: "Empty",
  },
  image: {
    label: "Image",
    upload: "Upload image",
    uploading: "Uploading…",
    dropHint: "Drag & drop or click",
    change: "Change",
    remove: "Remove",
    hint: "JPG, PNG or WEBP · max 5 MB",
    notImage: "Please choose an image file",
  },
  settings: {
    title: "Settings",
    subtitle: "Customize your restaurant's details and how your menu looks.",
    infoTitle: "Restaurant details",
    infoDesc: "Shown at the top of your menu.",
    name: "Restaurant name",
    link: "Menu link",
    slugWarn: "If the link changes, QR codes you've already printed will stop working and you'll need to print new ones.",
    description: "Short description",
    descriptionPh: "e.g. Traditional flavors from the wood-fired oven",
    hours: "Opening hours",
    phone: "Phone",
    contactHint: "Shown in the strip at the top of the menu; tapping the phone number starts a call.",
    logoTitle: "Logo",
    logoDesc: "Shown next to the restaurant name in the menu header.",
    logoHint: "A PNG with a transparent background is recommended. Without a logo, the restaurant name is shown as text.",
    themeTitle: "Menu theme",
    themeDesc: "Choose your menu's color palette.",
    langsTitle: "Languages & currency",
    langsDesc: "The languages your menu is offered in.",
    menuLanguages: "Menu languages",
    pickOneLang: "Choose at least one language.",
    defaultLanguage: "Default language",
    defaultLanguageHint: "Content without a translation is shown in this language.",
    currency: "Currency",
    preview: "Live preview",
    previewCategories: ["Breakfast", "Grills"],
    previewSection: "Grills",
    unsaved: "You have unsaved changes",
    revert: "Undo",
    saveChanges: "Save changes",
    saved: "Settings saved",
    themeNames: {
      bordo: "Bordeaux & Gold",
      lacivert: "Navy & Gold",
      nar: "Pomegranate",
      safran: "Saffron",
      zeytin: "Olive",
      ege: "Aegean",
      murdum: "Plum",
      antrasit: "Anthracite",
    } as Record<string, string>,
  },
  qr: {
    title: "QR Codes",
    subtitle: "Prepare and print the QR cards for your tables.",
    printTables: "Print table cards",
    linkTitle: "Your menu link",
    linkDesc: "Share it on social media or WhatsApp.",
    linkLabel: "Menu link",
    copy: "Copy",
    open: "Open",
    copied: "Link copied",
    copyFailed: "Couldn't copy — select the link and copy it manually",
    localhostWarn: (): ReactNode => (
      <>
        The link currently points to <b>localhost</b>, which phones can't reach. When testing on a phone or going live,
        update <code>CLIENT_URL</code> in <code>server/.env</code>.
      </>
    ),
    generalTitle: "General QR",
    generalDesc: "For the door, window or counter.",
    generalCaption: "Digital Menu",
    print: "Print",
    tablesTitle: "Table cards",
    tablesDesc: "A QR for each table: the table number shows on the menu when scanned.",
    tableCount: "Number of tables",
    decrease: "Decrease",
    increase: "Increase",
    tablesUnit: "tables",
    downloadPng: "Download PNG",
    downloadSvg: "Download SVG",
    qrAlt: (label: string) => `${label} QR code`,
    menu: "Menu",
  },
  app: {
    notFoundTitle: "Page not found",
    notFoundText: "The page you're looking for may have moved or never existed.",
    backHome: "Back to home",
  },
  credits: {
    title: "Image credits",
    text: "The food photos in the demo menu and on this site come from Wikimedia Commons and are used under the free licenses listed below. Images have been resized.",
    home: "Home",
  },
  super: {
    badge: "Super admin",
    title: "Restaurants",
    subtitle: "Every restaurant on EasyDine at a glance.",
    statRestaurants: "Restaurants",
    statActive: "Live",
    statNew: "New this week",
    statCategories: "Categories",
    statItems: "Items",
    statOwners: "Owners",
    search: "Search by name, link or email",
    colRestaurant: "Restaurant",
    colOwner: "Owner",
    colMenu: "Menu",
    colLanguages: "Languages",
    colCreated: "Created",
    colStatus: "Status",
    live: "Live",
    suspended: "Offline",
    counts: (c: number, p: number) => `${c} ${c === 1 ? "category" : "categories"} · ${p} ${p === 1 ? "item" : "items"}`,
    noOwner: "No owner",
    openMenu: "Open menu",
    manage: "Open dashboard",
    suspend: "Take offline",
    activate: "Put online",
    remove: "Delete",
    suspendTitle: "Take this menu offline?",
    suspendMsg: (name: string): ReactNode => (
      <>
        <b>{name}</b>'s menu and QR codes will stop working until you put it back online. The owner can still log in.
      </>
    ),
    deleteTitle: "Delete restaurant?",
    deleteMsg: (name: string, owners: string): ReactNode => (
      <>
        <b>{name}</b>, its whole menu, its photos and the owner account{owners ? <> (<b>{owners}</b>)</> : null} will be
        permanently deleted. This can't be undone.
      </>
    ),
    toastSuspended: (name: string) => `"${name}" is now offline`,
    toastActivated: (name: string) => `"${name}" is live again`,
    toastDeleted: (name: string) => `"${name}" was deleted`,
    empty: "No restaurants yet",
    emptyText: "Restaurants appear here as soon as someone signs up.",
    emptySearch: "No restaurants match your search.",
    impersonatingAs: (name: string) => `You're viewing ${name}'s dashboard as super admin.`,
    backToSuper: "Back to super admin",
    suspendedNotice:
      "Your menu is currently offline: guests can't open it and QR codes won't work. Please contact EasyDine support.",
    pageTitle: "EasyDine · Super admin",
  },
};

type Dict = typeof en;

const tr: Dict = {
  common: {
    cancel: "Vazgeç",
    confirm: "Onayla",
    save: "Kaydet",
    saving: "Kaydediliyor…",
    close: "Kapat",
    edit: "Düzenle",
    delete: "Sil",
    yesDelete: "Evet, sil",
    error: "Bir hata oluştu",
    dragToSort: "Sürükleyerek sırala",
    soldOut: "Tükendi",
    available: "Satışta",
    hidden: "Gizli",
    switchTo: "English",
    switchCode: "EN",
  },
  nav: {
    menu: "Menü",
    settings: "Ayarlar",
    qr: "QR Kodlar",
    viewMenu: "Menüyü görüntüle",
    viewMenuHint: "Müşterilerinizin gördüğü sayfa",
    logout: "Çıkış yap",
    adminTitle: "EasyDine · Yönetim",
  },
  auth: {
    headline: ["Lezzetiniz kadar", "güzel", "bir menü."],
    featureQr: "Masaya özel QR kodlar",
    featureLangs: "8 dilde otomatik menü",
    featurePrices: "Fiyatlar saniyesinde güncel",
    quote: "Kâğıt menüleri yeniden bastırmaya son. Fiyat değiştiğinde iki dokunuşla güncelleyin; tüm masalarda anında yayında.",
    email: "E-posta",
    emailPh: "ornek@restoran.com",
    password: "Şifre",
    showPw: "Şifreyi göster",
    hidePw: "Şifreyi gizle",
    loginTitle: "Tekrar hoş geldiniz",
    noAccount: "Hesabınız yok mu?",
    signUp: "Ücretsiz kayıt olun",
    login: "Giriş yap",
    loggingIn: "Giriş yapılıyor…",
    or: "veya",
    tryDemo: "Demo hesapla dene",
    registerTitle: "Restoranınızı oluşturun",
    haveAccount: "Zaten hesabınız var mı?",
    restaurantName: "Restoran adı",
    restaurantNamePh: "Örn. Kebapçı Ali",
    menuLink: "Menü linkiniz",
    menuLinkHint: "QR kodlarınız bu linke yönlenir. Sonradan değiştirebilirsiniz.",
    passwordPh: "En az 8 karakter",
    strength: ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"],
    creating: "Oluşturuluyor…",
    createAccount: "Hesabımı oluştur",
  },
  editor: {
    title: "Menü",
    subtitle: "Kategorileri ve ürünleri düzenleyin. Sıralamak için tutup sürükleyin.",
    addCategory: "Kategori ekle",
    statCategories: "Kategori",
    statItems: "Ürün",
    statAvailable: "Satışta",
    statSoldOut: "Tükendi",
    emptyTitle: "Menünüzü oluşturmaya başlayın",
    emptyText: 'Önce "Kahvaltı", "Ana Yemekler" veya "İçecekler" gibi bir kategori ekleyin, ardından içine ürünlerinizi ekleyin.',
    addFirstCategory: "İlk kategoriyi ekle",
    categories: "Kategoriler",
    categoryCount: (n: number) => `${n} kategori`,
    itemCount: (n: number) => `${n} ürün`,
    hideFromMenu: "Menüden gizle",
    showOnMenu: "Menüde göster",
    items: "Ürünler",
    categoryHidden: " · bu kategori menüde gizli",
    addItem: "Ürün ekle",
    emptyCategoryTitle: "Bu kategori henüz boş",
    emptyCategoryText: "İlk ürününüzü ekleyin: adını, fiyatını ve iştah açan bir fotoğrafını girin.",
    noDescription: "Açıklama yok",
    missingTitle: (codes: string) => `Eksik çeviri: ${codes}`,
    missingCount: (n: number) => `${n} eksik`,
    markSoldOut: "Tükendi olarak işaretle",
    putOnSale: "Satışa aç",
    toastShown: (name: string) => `"${name}" menüde gösteriliyor`,
    toastHidden: (name: string) => `"${name}" menüden gizlendi`,
    toastOnSale: (name: string) => `"${name}" tekrar satışta`,
    toastSoldOut: (name: string) => `"${name}" tükendi olarak işaretlendi`,
    toastCategoryDeleted: "Kategori silindi",
    toastItemDeleted: "Ürün silindi",
    toastCategoryAdded: "Kategori eklendi",
    toastCategoryUpdated: "Kategori güncellendi",
    toastItemAdded: "Ürün eklendi",
    toastItemUpdated: "Ürün güncellendi",
    deleteCategoryTitle: "Kategori silinsin mi?",
    deleteCategoryMsg: (name: string, count: number): ReactNode =>
      count ? (
        <>
          <b>{name}</b> kategorisi ve içindeki <b>{count} ürün</b> kalıcı olarak silinecek.
        </>
      ) : (
        <>
          <b>{name}</b> kategorisi kalıcı olarak silinecek.
        </>
      ),
    deleteItemTitle: "Ürün silinsin mi?",
    deleteItemMsg: (name: string): ReactNode => (
      <>
        <b>{name}</b> menünüzden kalıcı olarak silinecek.
      </>
    ),
  },
  forms: {
    newCategory: "Yeni kategori",
    editCategory: "Kategoriyi düzenle",
    categorySubtitle: "Kategoriler menünüzdeki bölümlerdir: Kahvaltı, Ana Yemekler, Tatlılar…",
    categoryNamePh: "Örn. Ana Yemekler",
    categoryDescPh: "İsteğe bağlı: Tüm yemeklerimiz odun ateşinde pişer.",
    categoryImage: "Kategori görseli",
    categoryImageHint: "Menünün üstündeki kategori şeridinde görünür. Boş bırakılırsa ilk ürünün fotoğrafı kullanılır.",
    showOnMenu: "Menüde göster",
    showOnMenuHint: "Kapalıysa bu kategori müşterilere görünmez.",
    addCategory: "Kategori ekle",
    newItem: "Yeni ürün",
    editItem: "Ürünü düzenle",
    itemPhoto: "Ürün fotoğrafı",
    itemPhotoHint: "Kare veya yatay, aydınlık bir fotoğraf en iyi sonucu verir.",
    availableHint: 'Kapalıysa menüde "Tükendi" olarak görünür.',
    itemNamePh: "Örn. Adana Kebap",
    itemDescPh: "Malzemeler, porsiyon, servis şekli…",
    price: "Fiyat",
    category: "Kategori",
    invalidPrice: "Lütfen geçerli bir fiyat girin (örn. 250 veya 249,90)",
    addItem: "Ürünü ekle",
  },
  translations: {
    name: "İsim",
    description: "Açıklama",
    fallbackPh: "Boş bırakılırsa varsayılan dil gösterilir",
    tabs: "Dil",
    filled: "Dolu",
    empty: "Boş",
  },
  image: {
    label: "Görsel",
    upload: "Görsel yükle",
    uploading: "Yükleniyor…",
    dropHint: "Sürükleyip bırakın veya tıklayın",
    change: "Değiştir",
    remove: "Kaldır",
    hint: "JPG, PNG veya WEBP · en fazla 5 MB",
    notImage: "Lütfen bir görsel dosyası seçin",
  },
  settings: {
    title: "Ayarlar",
    subtitle: "Restoranınızın bilgilerini ve menünüzün görünümünü özelleştirin.",
    infoTitle: "Restoran bilgileri",
    infoDesc: "Menünüzün en üstünde görünür.",
    name: "Restoran adı",
    link: "Menü linki",
    slugWarn: "Link değişirse daha önce yazdırdığınız QR kodlar çalışmaz; yenilerini yazdırmanız gerekir.",
    description: "Kısa açıklama",
    descriptionPh: "Örn. Odun ateşinde geleneksel lezzetler",
    hours: "Çalışma saatleri",
    phone: "Telefon",
    contactHint: "Menünün en üstündeki şeritte görünür; telefona dokununca arama başlar.",
    logoTitle: "Logo",
    logoDesc: "Menünün başlığında restoran adının yanında görünür.",
    logoHint: "Şeffaf arka planlı PNG önerilir. Logo yoksa restoran adı yazıyla gösterilir.",
    themeTitle: "Menü teması",
    themeDesc: "Menünüzün renk paletini seçin.",
    langsTitle: "Diller ve para birimi",
    langsDesc: "Menünüzün sunulacağı diller.",
    menuLanguages: "Menü dilleri",
    pickOneLang: "En az bir dil seçin.",
    defaultLanguage: "Varsayılan dil",
    defaultLanguageHint: "Çevirisi olmayan içerik bu dilde gösterilir.",
    currency: "Para birimi",
    preview: "Canlı önizleme",
    previewCategories: ["Kahvaltı", "Izgaralar"],
    previewSection: "Izgaralar",
    unsaved: "Kaydedilmemiş değişiklikleriniz var",
    revert: "Geri al",
    saveChanges: "Değişiklikleri kaydet",
    saved: "Ayarlar kaydedildi",
    themeNames: {
      bordo: "Bordo & Altın",
      lacivert: "Lacivert & Altın",
      nar: "Nar",
      safran: "Safran",
      zeytin: "Zeytin",
      ege: "Ege",
      murdum: "Mürdüm",
      antrasit: "Antrasit",
    },
  },
  qr: {
    title: "QR Kodlar",
    subtitle: "Masalarınıza koyacağınız QR kartlarını hazırlayın ve yazdırın.",
    printTables: "Masa kartlarını yazdır",
    linkTitle: "Menü linkiniz",
    linkDesc: "Sosyal medyada veya WhatsApp'ta paylaşabilirsiniz.",
    linkLabel: "Menü linki",
    copy: "Kopyala",
    open: "Aç",
    copied: "Link kopyalandı",
    copyFailed: "Kopyalanamadı, linki elle seçip kopyalayın",
    localhostWarn: (): ReactNode => (
      <>
        Link şu an <b>localhost</b> gösteriyor; telefonlar bu adrese ulaşamaz. Telefondan test ederken veya canlıya
        alırken <code>server/.env</code> içindeki <code>CLIENT_URL</code> değerini güncelleyin.
      </>
    ),
    generalTitle: "Genel QR",
    generalDesc: "Kapı, vitrin veya kasa için.",
    generalCaption: "Dijital Menü",
    print: "Yazdır",
    tablesTitle: "Masa kartları",
    tablesDesc: "Her masaya özel QR: okutulunca menüde masa numarası görünür.",
    tableCount: "Masa sayısı",
    decrease: "Azalt",
    increase: "Artır",
    tablesUnit: "masa",
    downloadPng: "PNG indir",
    downloadSvg: "SVG indir",
    qrAlt: (label: string) => `${label} QR kodu`,
    menu: "Menü",
  },
  app: {
    notFoundTitle: "Sayfa bulunamadı",
    notFoundText: "Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.",
    backHome: "Ana sayfaya dön",
  },
  credits: {
    title: "Görsel kaynakları",
    text: "Demo menüdeki ve bu sitedeki yemek fotoğrafları Wikimedia Commons'tan alınmıştır ve aşağıdaki serbest lisanslarla kullanılmaktadır. Görseller yeniden boyutlandırılmıştır.",
    home: "Ana sayfa",
  },
  super: {
    badge: "Süper admin",
    title: "Restoranlar",
    subtitle: "EasyDine'daki tüm restoranlar tek bakışta.",
    statRestaurants: "Restoran",
    statActive: "Yayında",
    statNew: "Bu hafta yeni",
    statCategories: "Kategori",
    statItems: "Ürün",
    statOwners: "Restoran sahibi",
    search: "Ada, linke veya e-postaya göre ara",
    colRestaurant: "Restoran",
    colOwner: "Sahibi",
    colMenu: "Menü",
    colLanguages: "Diller",
    colCreated: "Kayıt",
    colStatus: "Durum",
    live: "Yayında",
    suspended: "Yayında değil",
    counts: (c: number, p: number) => `${c} kategori · ${p} ürün`,
    noOwner: "Sahibi yok",
    openMenu: "Menüyü aç",
    manage: "Paneline gir",
    suspend: "Yayından kaldır",
    activate: "Yayına al",
    remove: "Sil",
    suspendTitle: "Menü yayından kaldırılsın mı?",
    suspendMsg: (name: string): ReactNode => (
      <>
        <b>{name}</b> menüsü ve QR kodları, tekrar yayına alınana kadar çalışmaz. Restoran sahibi panele girmeye devam
        edebilir.
      </>
    ),
    deleteTitle: "Restoran silinsin mi?",
    deleteMsg: (name: string, owners: string): ReactNode => (
      <>
        <b>{name}</b>, tüm menüsü, fotoğrafları ve sahip hesabı{owners ? <> (<b>{owners}</b>)</> : null} kalıcı olarak
        silinecek. Bu işlem geri alınamaz.
      </>
    ),
    toastSuspended: (name: string) => `"${name}" yayından kaldırıldı`,
    toastActivated: (name: string) => `"${name}" tekrar yayında`,
    toastDeleted: (name: string) => `"${name}" silindi`,
    empty: "Henüz restoran yok",
    emptyText: "Biri kayıt olur olmaz restoranı burada görünür.",
    emptySearch: "Aramanızla eşleşen restoran yok.",
    impersonatingAs: (name: string) => `${name} panelini süper admin olarak görüntülüyorsunuz.`,
    backToSuper: "Süper admin'e dön",
    suspendedNotice:
      "Menünüz şu an yayında değil: müşteriler açamıyor ve QR kodlar çalışmıyor. Lütfen EasyDine destek ile iletişime geçin.",
    pageTitle: "EasyDine · Süper admin",
  },
};

const DICTS: Record<UiLang, Dict> = { en, tr };

/** Sunucunun Türkçe hata mesajlarının İngilizce karşılıkları. */
const SERVER_ERRORS_EN: Record<string, string> = {
  "Bu e-posta ile kayıtlı bir hesap zaten var": "An account with this email already exists",
  "Bu link adı başka bir restoran tarafından kullanılıyor": "This menu link is already used by another restaurant",
  "E-posta veya şifre hatalı": "Incorrect email or password",
  "Kullanıcı bulunamadı": "User not found",
  "Giriş yapmanız gerekiyor": "Please log in",
  "Oturumunuz geçersiz veya süresi dolmuş": "Your session is invalid or has expired",
  "Geçersiz veri": "Invalid data",
  "Dosya en fazla 5 MB olabilir": "Files can be at most 5 MB",
  "Geçersiz JSON": "Invalid request",
  "Sunucu hatası": "Server error",
  "Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz": "Only JPG, PNG, WEBP or GIF files are allowed",
  "Görsel dosyası gönderilmedi (alan adı: image)": "No image file was sent",
  "Restoran bulunamadı": "Restaurant not found",
  "Geçersiz masa adı": "Invalid table name",
  "Kategori bulunamadı": "Category not found",
  "Geçersiz kategori listesi": "Invalid category list",
  "Ürün bulunamadı": "Item not found",
  "Geçersiz kategori": "Invalid category",
  "Geçersiz ürün listesi": "Invalid item list",
  "Link adı en az 3 karakter olmalı": "The menu link must be at least 3 characters",
  "Link adı sadece küçük harf, rakam ve tire içerebilir": "The menu link may only contain lowercase letters, digits and hyphens",
  "Geçerli bir e-posta girin": "Please enter a valid email",
  "Geçersiz görsel adresi": "Invalid image address",
  "Şifre en az 8 karakter olmalı": "Password must be at least 8 characters",
  "Restoran adı en az 2 karakter olmalı": "Restaurant name must be at least 2 characters",
  "Şifre gerekli": "Password is required",
  "Varsayılan dil, seçili diller arasında olmalı": "The default language must be one of the selected languages",
  "En az bir dil seçin": "Choose at least one language",
  "Telefon sadece rakam, boşluk ve + ( ) - içerebilir": "Phone may only contain digits, spaces and + ( ) -",
  "Bulunamadı": "Not found",
  "Bu işlem için bir restoran hesabı gerekiyor": "This action requires a restaurant account",
  "Bu işlem için yetkiniz yok": "You don't have permission to do this",
  "Bu restoranın bir kullanıcısı yok": "This restaurant has no user account",
  "Bir hata oluştu": "Something went wrong",
};

let currentLang: UiLang = readStoredLang();

function readStoredLang(): UiLang {
  try {
    const saved = localStorage.getItem(KEY) ?? localStorage.getItem("ed_site_lang");
    return saved === "tr" ? "tr" : "en";
  } catch {
    return "en";
  }
}

/** Sunucudan gelen (Türkçe) hata mesajını seçili arayüz diline çevirir. */
export function translateServerError(message: string): string {
  if (currentLang === "tr") return message;
  if (SERVER_ERRORS_EN[message]) return SERVER_ERRORS_EN[message];
  const defaultLang = message.match(/^Varsayılan dil \((\w+)\) için isim zorunludur$/);
  if (defaultLang) return `A name in the default language (${defaultLang[1]}) is required`;
  return message;
}

interface UiLangState {
  lang: UiLang;
  t: Dict;
  setLang(lang: UiLang): void;
  toggle(): void;
}

const UiLangContext = createContext<UiLangState | null>(null);

export function UiLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>(currentLang);

  const setLang = useCallback((next: UiLang) => {
    currentLang = next;
    setLangState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* yok say */
    }
  }, []);

  useEffect(() => {
    currentLang = lang;
  }, [lang]);

  const value = useMemo<UiLangState>(
    () => ({ lang, t: DICTS[lang], setLang, toggle: () => setLang(lang === "en" ? "tr" : "en") }),
    [lang, setLang],
  );

  return <UiLangContext.Provider value={value}>{children}</UiLangContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiLangContext);
  if (!ctx) throw new Error("useUi, UiLangProvider içinde kullanılmalı");
  return ctx;
}
