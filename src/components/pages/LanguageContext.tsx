import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// Define an enum for supported languages
export enum SupportedLang {
  Am = "am",
  En = "en",
}

// Define the translations object
const translations = {
  am: {
    // Home Page translations
    home: {
      title: "የደብዳቤ አስተዳደር ስርዓት",
      subtitle: "የክፍል ሳይንስ እና ጀኦስፓሺያል ኢንስቲትዩት (SSGI)",
      description:
        "ለSSGI የተዘጋጀ መደበኛ መዝገብን በትክክል፣ በደህናነት እና በቀና ማድረግ የሚችል መድረክ።",
      getStarted: "መጀመሪያ ጀምር",
      login: "ግባ",
      featuresHeading: "የSSGI ኮሚያንኬሽን ፍሎውን በኃይል መሞላ",
      featuresSub: "የዲጂታል ለውጥዎን ዛሬ ይጀምሩ።",
      ctaTitle: "መጀመሪያ ለመጀመር ዝግጁ ነዎት?",
      ctaSubtitle: "የነፃ ሙከራዎን ዛሬ ይጀምሩ።",
    },
    // Features translations
    features: [
      {
        name: "አንድ ቦታ ውስጥ ደብዳቤዎችን ማስተዳደር",
        description: "በቀና እና በቅን እንዲያስተዳድሩ ሁሉንም ደብዳቤዎች ያንድ ቦታ ውስጥ ያደርጉ።",
      },
      {
        name: "በእውነተኛው ጊዜ መከታተያ",
        description: "ደብዳቤዎችን በእውነተኛ ጊዜ ይከታተሉ።",
      },
      {
        name: "የተፋጠነ ደህንነት",
        description: "በኢንተርፓይዝ ደህንነት ደረጃ አስተዳደር ያድርጉ።",
      },
      {
        name: "ኃይለኛ ፍለጋ",
        description: "አንዱን ሰነድ በቅርብ ጊዜ ያግኙ።",
      },
      {
        name: "በራስ-ሰር የሚሰሩ ስራዎች",
        description: "የማጽደቅ ሂደቶችን ቀላል ያድርጉ።",
      },
      {
        name: "ትክክለኛ ትንተና",
        description: "ከስራዎ ሂደቶች ጠቃሚ ትንተና ያግኙ።",
      },
    ],
    // Services translations
    services: [
      {
        name: "የደብዳቤ ሂደት",
        description: "የመግቢያ እና የውጪ ይፋዊ ደብዳቤዎችን ውጤታማ ማስተናገድ",
      },
      {
        name: "ሰነድ ማህደረ ትውስታ",
        description: "የተቋማት ሰነዶች ደህንነታቸው የተጠበቀ ረጅም ጊዜ ማከማቻ እና ማግኛ",
      },
      {
        name: "የማጽደቅ ስራ ፍሰቶች",
        description: "ለማጽደቅ እና ፊርማ የተመቻቸ መስመር",
      },
    ],
    // Header translations
    header: {
      profile: "መገለጫ",
      settings: "ቅንብሮች",
      signOut: "ውጣ",
    },
    // Sidebar translations
    sidebar: {
      dashboard: "ዳሽቦርድ",
      newLetter: "አዲስ ደብዳቤ",
      inbox: "የገቢ መልዕክት ሳጥን",
      sent: "የወጪ መልዕክት",
      archive: "ማህደር",
      notifications: "ማሳወቂያዎች",
      users: "ተጠቃሚዎች",
      settings: "ቅንብሮች",
      adminPanel: "አድሚን ፓነል",
      letterFlow: "LetterFlow",
    },
    // Login translations
    login: {
      title: "ወደ መለያዎ ይግቡ",
      emailLabel: "የኢሜል አድራሻ",
      passwordLabel: "የይለፍ ቃል",
      emailPlaceholder: "john@example.com",
      passwordPlaceholder: "••••••••",
      loginButton: "ግባ",
      backToHome: "ወደ መነሻ ገጽ ተመለስ",
      noAccount: "መለያ የለዎትም?",
      signUp: "ይመዝገቡ",
      forgotPassword: "የይለፍ ቃል ረሱ?",
      requiredFields: "ሁለቱም መስኮች ያስፈልጋሉ",
      errorOccurred: "ስህተት ተከስቷል",
    },
    // Signup translations
    signup: {
      title: "መለያ ይፍጠሩ",
      subtitle: "እንኳን ደህና መጡ! መረጃዎን አስገብተው ይቀላቀሉን።",
      fullNameLabel: "ሙሉ ስም",
      fullNamePlaceholder: "ጆን ዶ",
      emailLabel: "የኢሜል አድራሻ",
      emailPlaceholder: "john@example.com",
      phoneNumberLabel: "ስልክ ቁጥር",
      phoneNumberPlaceholder: "+1234567890",
      passwordLabel: "የይለፍ ቃል",
      confirmPasswordLabel: "የይለፍ ቃል ያረጋግጡ",
      passwordPlaceholder: "••••••••",
      termsAgreement: "የተጠቃሚ ስምምነትን እቀበላለሁ",
      termsAndConditions: "የአጠቃቀም ውሎች እና ሁኔታዎች",
      signUpButton: "ይመዝገቡ",
      backToAdmin: "ወደ አስተዳዳሪ ገጽ ተመለስ",
      fillAllFields: "እባክዎ ሁሉንም መስኮች ይሙሉ",
      passwordsMismatch: "የይለፍ ቃላት አይዛመዱም",
      registrationSuccessful: "ምዝገባ ተሳክቷል!",
      registrationFailed: "ምዝገባ አልተሳካም",
    },
    // Department Selector translations
    departmentSelector: {
      mainCategory: "ዋና ምድብ",
      selectMainCategory: "-- ዋና ምድብ ይምረጡ --",
      subCategory: "ንዑስ ምድብ",
      selectSubCategory: "-- ንዑስ ምድብ ይምረጡ --",
      subSubCategory: "ንዑስ ንዑስ ምድብ",
      selectSubSubCategory: "-- ንዑስ ንዑስ ምድብ ይምረጡ --",
      selectedCategory: "የተመረጠ ምድብ",
      departments: [
        {
          label: "ዋና ዳይሬክተር",
          subDepartments: [
            {
              label: "የጽፈት ቤት ኃላፊ",
              subDepartments: [
                { label: "የህዝብ ግንኙነት ስራ አስፈጻሚ" },
                { label: "የህግ አገልግሎት ስራ አስፈጻሚ" },
                { label: "ኦዲት ስራ አስፈጻሚ" },
                { label: "የስነ ምግባርና ፀረ ሙስና ስራ አስፈጻሚ" },
                { label: "የሴቶችና ማህበራዊ አካቶ ትግበራ ስራ አስፈጻሚ" },
              ],
            },
            {
              label: "የስራ አመራር ዋና ስራ አስፈጻሚ",
              subDepartments: [
                { label: "ስትራቴጂክ ጉዳዎች ስራ አስፈጻሚ" },
                { label: "ኢንፎርሜሽን ኮሙኒኬሽን ቴክኖሎጂ ስራ አስፈጻሚ" },
                { label: "የግዢና ፋይናንስ ስራ አስፈጻሚ" },
                { label: "የብቃትና ሰው ሀብት አስተዳደር ስአስፈጻሚ" },
                { label: "ተቋማዊ ለውጥ ስራ አስፈጻሚ" },
              ],
            },
            {
              label: "የስፔስ ዘርፍ",
              subDepartments: [
                { label: "አስትሮኖሚና አስትሮፊዚክስ መሪ ስራ አስፈጻሚ" },
                { label: "ስፔስና ፕላኔታሪ ሳይንስ መሪ ስራ አስፈጻሚ" },
                { label: "የሪሞት ሴንሲንግ መሪ ስራ አስፈጻሚ" },
                { label: "ጂኦዴሲና ጂኦዳይናሚክ መሪ ስራ አስፈጻሚ" },
                { label: "ኤሮስፔስ ኢንጂነሪንግ መሪ ስራ አስፈጻሚ" },
                { label: "የሳተላይት ኦፕሬሽን መሪ ስራ አስፈጻሚ" },
                { label: "የድህረ ምረቃ፤ ሪጅስትራርና ምርምር አስተዳደር መሪ ስራ አስፈጻሚ" },
              ],
            },
            {
              label: "የጂኦስፓሻል ዘርፍ",
              subDepartments: [
                { label: "የአየር ላይ ቅይሳ መሪ ስራ አስፈጻሚ" },
                { label: "የፎቶግራሜትሪና ሊዳር ዳታ ፕሮሰሲንግ መሪ ስራ አስፈጻሚ" },
                { label: "የካርታ ስራ መሪ ስራ አስፈጻሚ" },
                { label: "የጂኦዴቲክ መሠረተ ልማት እና አገልግሎት መሪ ስራ አስፈጻሚ" },
                { label: "የዲጂታል ኢሜጅ ፕሮሰሲንግ መሪ ስራ አስፈጻሚ" },
                { label: "የስፓሻል ፕላኒንግ እና የውሳኔ ድጋፍ መሪ ስራ አስፈጻሚ" },
              ],
            },
            {
              label: "የስፔስና ጂኦስፓሻል አስቻይ ዘርፍ",
              subDepartments: [
                { label: "የስፔስ እና ጂኦስፓሻል መረጃ ስታንዳርዳይዜሾን መሪ ስራ አስፈጻሚ" },
                { label: "የፕላትፎርምናአፕሊኬሽን ልማት መሪ ስራ አስፈጻሚ" },
                { label: "የዳታና ሲስተም አስተዳደር መሪ ስራ አስፈጻሚ" },
                { label: "የቴከኖሎጂ ሽግግር መሪ ስራ አስፈጻሚ" },
                { label: "የስፔስ ሳይንስና ጂኦስፓሻል ቀጠናዊ ትስስር መሪ ስራ አስፈጻሚ" },
                { label: "የፖሊሲና ህግ ማዕቀፍ መሪ ስራ አስፈጻሚ" },
              ],
            },
          ],
        },
      ],
    },
    notifications: {
      title: "ማሳወቂያዎች",
      markAllAsRead: "ሁሉንም እንደተነበበ ምልክት አድርግ",
      noNotifications: "ምንም ማሳወቂያዎች የሉም",
      allCaughtUp: "ሁሉንም ጨርሰዋል። አዲስ ነገር ሲመጣ እናሳውቅዎታለን።",
      relatedTo: "የተዛመደው ለ:",
      markAsRead: "እንደተነበበ ምልክት አድርግ",
      deleteNotification: "ማሳወቂያ ሰርዝ",
      loading: "በመጫን ላይ...",
      errorFetchingNotifications: "ማሳወቂያዎችን ማምጣት ላይ ስህተት ተፈጥሯል፡",
      errorMarkingRead: "ማሳወቂያን እንደተነበበ ምልክት ማድረግ ላይ ስህተት ተፈጥሯል፡",
      errorMarkingAllRead: "ሁሉንም ማሳወቂያዎች እንደተነበበ ምልክት ማድረግ ላይ ስህተት ተፈጥሯል፡",
      errorDeletingNotification: "ማሳወቂያ መሰረዝ ላይ ስህተት ተፈጥሯል፡",
      priorityHigh: "ከፍተኛ",
      priorityMedium: "መካከለኛ",
      priorityLow: "ዝቅተኛ",
      letterRead: "ደብዳቤ ተነብቧል",
      letterReadDesc: (name: string, subject: string) =>
        `${name} የእርስዎን ደብዳቤ "${subject}" አንብበዋል`,
      regarding: "በተመለከተ",
      minutesAgo: "ከ ደቂቃዎች በፊት",
    },
    users: {
      title: "ተጠቃሚዎች",
      manageUsers: "የስርዓት ተጠቃሚዎችን እና ፍቃዶችን ያቀናብሩ",
      searchPlaceholder: "ተጠቃሚዎችን ፈልግ...",
      noUsersFound: "ምንም ተጠቃሚዎች አልተገኙም",
    },
    // Inbox translations
    inbox: {
      title: "የገቢ መልዕክት ሳጥን",
      manageLetters: "የገቢ መልዕክቶችን ያስተዳድሩ",
      searchPlaceholder: "ደብዳቤዎችን ፈልግ...",
      filterButton: "አጣራ",
      filterOptions: {
        all: "ሁሉም",
        unread: "ያልተነበቡ",
        starred: "በኮከብ ምልክት የተደረጉ",
        urgent: "አደገኛ",
        seen: "የተዩ",
      },
      loadingLetters: "ደብዳቤዎች በመጫን ላይ...",
      noLettersFound: "ምንም ደብዳቤዎች አልተገኙም",
      refreshing: "በዳግም መጫን ላይ...",
      refresh: "ዳግም ጫን",
      showing: "የሚታዩ",
      to: "እስከ",
      of: "ከ",
      letters: "ደብዳቤዎች",
      previous: "ቀዳሚ",
      next: "ቀጣይ",
      subject: "ርዕስ",
      recipient: "ተቀባይ",
      from: "ከ",
      department: "ክፍል",
      priority: "ቅድመ ተራ",
      date: "ቀን",
      backButton: "ተመለስ",
      forwardButton: "ወደፊት ላክ",
      addComment: "አስተያየት አክል",
      addCommentPlaceholder: "አስተያየትዎን ያስገቡ...",
      loadingUsers: "ተጠቃሚዎች በመጫን ላይ...",
      additionalRecipients: "ተጨማሪ ተቀባዮች",
      errorFetchingUsers: "ተጠቃሚዎችን ማምጣት ላይ ስህተት ተፈጥሯል",
      errorUpdatingStatus: "Error updating letter status",
      letterStarred: (subject: string) => `Letter "${subject}" starred`,
      letterUnstarred: (subject: string) => `Letter "${subject}" unstarred`,
      errorTogglingStar: "Error toggling star status",
      forwardedMessage: "Forwarded Message",
      messageForwarded: "Message forwarded to",
      failedToForward: "Failed to forward message",
      attachments: "Attachments",
      download: "Download",
      view: "View",
      viewButton: "View Letter",
      forwardLetter: "Forward Letter",
      printButton: "Print",
      selectEmployee: "Select Employee",
      cancel: "Cancel",
      closeButton: "Close",
      downloadButton: "Download",
      previewNotAvailable: "Preview not available",
      downloadToView: "Please download to view this file",
      errorDownloadingFile: "Error downloading file",
      errorViewingFile: "Error viewing file",
      downloadSuccess: "ፋይሉ በተሳካ ሁኔታ ወርዷል",
      loading: "በመጫን ላይ...",
      forwarding: "በመላክ ላይ...",
      contentType: "የፋይሉ አይነት",
    },
    // Sent translations
    sent: {
      title: "የወጪ መልዕክት",
      newLetterButton: "አዲስ ደብዳቤ",
      searchPlaceholder: "ደብዳቤዎችን ፈልግ...",
      allStatus: "ሁሉም ሁኔታ",
      statusSent: "የተላከ",
      statusDelivered: "የደረሰ",
      statusRead: "የተነበበ",
      subjectColumn: "ርዕስ",
      toColumn: "ወደ",
      departmentColumn: "ክፍል",
      dateColumn: "ቀን",
      statusColumn: "ሁኔታ",
      priorityColumn: "ቅድመ ተራ",
      attachmentsColumn: "አባሪዎች",
      memoViewColumn: "መለኪያ መመልከቻ",
      noAttachments: "አባሪ የለም",
      viewMemoButton: "መለኪያ ይመልከቱ",
      composeNewLetter: "አዲስ ደብዳቤ ይፃፉ",
      subjectLabel: "ርዕስ",
      subjectRequired: "ርዕሱ አስፈላጊ ነው",
      recipientLabel: "ተቀባይ",
      recipientRequired: "ተቀባዩ አስፈላጊ ነው",
      departmentLabel: "ክፍል",
      departmentRequired: "ክፍሉ አስፈላጊ ነው",
      contentLabel: "ይዘት",
      contentRequired: "ይዘቱ አስፈላጊ ነው",
      removeAttachment: "አባሪ አስወግድ",
      sendLetterButton: "ደብዳቤ ላክ",
      filePreview: "ፋይል ቅድመ እይታ",
      closeButton: "ዝጋ",
      downloadButton: "አውርድ",
      previewNotAvailable: "ቅድመ እይታ የለም",
      downloadToView: "ለማየት አውርድ",
      letterSentSuccess: "ደብዳቤ ተልኳል!",
      failedToSendLetter: "ደብዳቤ ላክ አልተሳካም",
      errorDownloadingFile: "ፋይል ማውረድ አልተሳካም",
      errorViewingFile: "ፋይል ማየት አልተሳካም",
      memoLetterView: "መለኪያ ይመልከቱ",
    },
    // Archive translations
    archive: {
      title: "ማህደር",
      manageArchivedLetters: "የተጠራቀሙ ደብዳቤዎችን ያስተዳድሩ",
      searchPlaceholder: "የተጠራቀሙ ደብዳቤዎችን ፈልግ...",
      noArchivedLetters: "ምንም የተጠራቀሙ ደብዳቤዎች የሉም",
      restoreButton: "ዳግም አስገባ",
      deleteButton: "ሰርዝ",
      filterOptions: {
        all: "ሁሉም",
        lastWeek: "የቅርብ ሳምንት",
        lastMonth: "የቅርብ ወር",
        lastYear: "የቅርብ ዓመት",
      },
    },
    // Settings translations
    settings: {
      title: "ቅንብሮች",
      profile: {
        title: "መገለጫ",
        name: "ስም",
        email: "ኢሜይል",
        phone: "ስልክ",
        department: "ክፍል",
        saveChanges: "ለውጦችን አስቀምጥ",
        saving: "በመቀመጥ ላይ...",
        errorUpdating: "መገለጫውን ማዘምን አልተሳካም",
      },
      notifications: {
        title: "ማሳወቂያዎች",
        emailNotifications: "ኢሜይል ማሳወቂያዎች",
        emailNotificationsDesc: "ኢሜይል በኩል ማሳወቂያዎችን ይቀበሉ",
        notificationSound: "የማሳወቂያ ድምፅ",
        notificationSoundDesc: "ማሳወቂያዎች ሲመጡ ድምፅ ያሰሙ",
      },
      appearance: {
        title: "መልክ",
        theme: "ገጽታ",
        light: "ብርሃን",
        dark: "ጨለማ",
        language: "ቋንቋ",
        english: "እንግሊዝኛ",
        amharic: "አማርኛ",
      },
      security: {
        title: "ደህንነት",
        changePassword: "የይለፍ ቃል ቀይር",
        currentPassword: "አሁን ያለው የይለፍ ቃል",
        newPassword: "አዲስ የይለፍ ቃል",
        confirmPassword: "የይለፍ ቃል ያረጋግጡ",
      },
    },
    // Dashboard translations
    dashboard: {
      welcome: "እንኳን ደህና መጡ!",
      welcomeTitle: "ወደ የደብዳቤ የወደፊት ዘመን በደህና መጡ!",
      welcomeDescription:
        "ይህ የእርስዎ የደብዳቤ አስተዳደር ማዕከል ነው። ሁሉንም ደብዳቤ በቀላሉ ይፍጠሩ፣ ይከታተሉ፣ ያስቀምጡ፣ እና ያስተዳድሩ። የእያንዳንዱ ግንኙነት ደህና እንደሆነ ያውቁ፣ ስራዎ ቀላልና ኃይለኛ ይሆናል። ቡድናችን ይህን ለእርስዎ ስራ እንዲቀላቀል በአንድ ግብ ሠርቷል። እንጀምር!",
      totalLetters: "ጠቅላላ ደብዳቤዎች",
      processed: "የተሰሩ",
      pending: "በመጠባበቅ ላይ",
      urgent: "አስቸኳይ",
      recentLetters: "የቅርብ ጊዜ ደብዳቤዎች",
      viewAll: "ሁሉንም ይመልከቱ",
      activityTimeline: "የእንቅስቃሴ የጊዜ መስመር",
      letterSent: (subject: string) => `ደብዳቤ "${subject}" ተልኳል!`,
      letterReceived: (subject: string) => `ደብዳቤ "${subject}" ደርሷል!`,
      letterApproved: (subject: string) => `ደብዳቤ "${subject}" ጸድቋል!`,
      recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
      activities: {
        approval: {
          title: "አዲስ ደብዳቤ ጸድቋል",
          description: "የቅርብ ጊዜውን ፖሊሲዎን ያጠናቅቁ",
          time: "ከ 2 ሰዓታት በፊት",
        },
        newPolicy: {
          title: "አዲስ ደብዳቤ ደርሷል",
          description: "አዲስ ደብዳቤዎች በመጠባበቅ ላይ ናቸው",
          time: "ከ 5 ሰዓታት በፊት",
        },
        meeting: {
          title: "ደብዳቤ ተልኳል",
          description: "ለዲፓርትመንትዎ ደብዳቤ ተልኳል",
          time: "ትናንት",
        },
        mention: {
          title: "አዲስ ተጠቃሚ ተመዝግቧል",
          description: "አዲስ ተጠቃሚ ወደ ሲስተሙ ተጨምሯል",
          time: "ከ 2 ቀናት በፊት",
        },
      },
    },
  },
  en: {
    // Home Page translations
    home: {
      title: "Letter Management System",
      subtitle: "Space Science and Geospatial Institute (SSGI)",
      description:
        "A centralized platform designed for SSGI to manage, track, and organize official correspondence with precision, security, and efficiency.",
      getStarted: "Get Started",
      login: "Log In",
      featuresHeading: "Empowering SSGI's Communication Flow",
      featuresSub: "Launch your digital transformation journey today.",
      ctaTitle: "Ready to get started?",
      ctaSubtitle: "Start your free trial today.",
    },
    // Features translations
    features: [
      {
        name: "Smart Document Management",
        description:
          "Efficiently organize and manage all your business correspondence in one place.",
      },
      {
        name: "Real-time Tracking",
        description:
          "Track the status of your letters and documents in real-time.",
      },
      {
        name: "Advanced Security",
        description:
          "Enterprise-grade security to keep your sensitive documents safe.",
      },
      {
        name: "Powerful Search",
        description:
          "Find any document instantly with our advanced search capabilities.",
      },
      {
        name: "Automated Workflows",
        description:
          "Streamline your approval processes with automated workflows.",
      },
      {
        name: "Analytics & Insights",
        description: "Gain valuable insights into your document workflows.",
      },
    ],
    // Services translations
    services: [
      {
        name: "Letter Processing",
        description:
          "Efficient handling of incoming and outgoing official correspondence.",
      },
      {
        name: "Document Archiving",
        description:
          "Secure long-term storage and retrieval of institutional documents.",
      },
      {
        name: "Approval Workflows",
        description: "Streamlined routing for authorization and signatures.",
      },
    ],
    // Header translations
    header: {
      profile: "Profile",
      settings: "Settings",
      signOut: "Sign out",
    },
    // Sidebar translations
    sidebar: {
      dashboard: "Dashboard",
      newLetter: "New Letter",
      inbox: "Inbox",
      sent: "Sent",
      archive: "Archive",
      notifications: "Notifications",
      users: "Users",
      settings: "Settings",
      adminPanel: "Admin Panel",
      letterFlow: "LetterFlow",
    },
    // Login translations
    login: {
      title: "Log In to Your Account",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      emailPlaceholder: "john@example.com",
      passwordPlaceholder: "••••••••",
      loginButton: "Log In",
      backToHome: "Back to Home",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      forgotPassword: "Forgot Password?",
      requiredFields: "Both fields are required",
      errorOccurred: "An error occurred",
    },
    // Signup translations
    signup: {
      title: "Create Your Account",
      subtitle: "Welcome! Fill in your details to join the platform.",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "John Doe",
      emailLabel: "Email Address",
      emailPlaceholder: "john@example.com",
      phoneNumberLabel: "Phone Number",
      phoneNumberPlaceholder: "+1234567890",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      passwordPlaceholder: "••••••••",
      termsAgreement: "I agree to the",
      termsAndConditions: "Terms and Conditions",
      signUpButton: "Sign Up",
      backToAdmin: "Back to Admin Page",
      fillAllFields: "Please fill in all fields.",
      passwordsMismatch: "Passwords do not match.",
      registrationSuccessful: "Registration successful!",
      registrationFailed: "Registration failed:",
    },
    // Department Selector translations
    departmentSelector: {
      mainCategory: "Main Category",
      selectMainCategory: "-- Select Main Category --",
      subCategory: "Sub-category",
      selectSubCategory: "-- Select Sub-category --",
      subSubCategory: "Sub-sub-category",
      selectSubSubCategory: "-- Select Sub-sub-category --",
      selectedCategory: "Selected Category",
      departments: [
        {
          label: "Director General",
          subDepartments: [
            {
              label: "Head of Office",
              subDepartments: [
                { label: "Public Relations Executive" },
                { label: "Legal Services Executive" },
                { label: "Audit Executive" },
                { label: "Ethics and Anti-Corruption Executive" },
                {
                  label: "Women and Social Inclusion Implementation Executive",
                },
              ],
            },
            {
              label: "Chief Executive Officer of Operations Management",
              subDepartments: [
                { label: "Strategic Affairs Executive" },
                { label: "Information Communication Technology Executive" },
                { label: "Procurement and Finance Executive" },
                { label: "Competence and Human Resource Management Executive" },
                { label: "Institutional Transformation Executive" },
              ],
            },
            {
              label: "Space Sector",
              subDepartments: [
                { label: "Astronomy and Astrophysics Lead Executive" },
                { label: "Space and Planetary Science Lead Executive" },
                { label: "Remote Sensing Lead Executive" },
                { label: "Geodesy and Geodynamics Lead Executive" },
                { label: "Aerospace Engineering Lead Executive" },
                { label: "Satellite Operation Lead Executive" },
                {
                  label:
                    "Postgraduate; Registrar and Research Administration Lead Executive",
                },
              ],
            },
            {
              label: "Geospatial Sector",
              subDepartments: [
                { label: "Aerial Survey Lead Executive" },
                {
                  label:
                    "Photogrammetry and LiDAR Data Processing Lead Executive",
                },
                { label: "Cartography Lead Executive" },
                {
                  label: "Geodetic Infrastructure and Services Lead Executive",
                },
                { label: "Digital Image Processing Lead Executive" },
                {
                  label: "Spatial Planning and Decision Support Lead Executive",
                },
              ],
            },
            {
              label: "Space and Geospatial Enabling Sector",
              subDepartments: [
                {
                  label:
                    "Space and Geospatial Information Standardization Lead Executive",
                },
                {
                  label: "Platform and Application Development Lead Executive",
                },
                { label: "Data and System Administration Lead Executive" },
                { label: "Technology Transfer Lead Executive" },
                {
                  label:
                    "Space Science and Geospatial Regional Connectivity Lead Executive",
                },
                { label: "Policy and Legal Framework Lead Executive" },
              ],
            },
          ],
        },
      ],
    },
    notifications: {
      title: "Notifications",
      markAllAsRead: "Mark all as read",
      noNotifications: "No notifications",
      allCaughtUp:
        "You're all caught up! We'll notify you when something new arrives.",
      relatedTo: "Related to:",
      markAsRead: "Mark as read",
      deleteNotification: "Delete notification",
      loading: "Loading...",
      errorFetchingNotifications: "Error fetching notifications:",
      errorMarkingRead: "Error marking notification as read:",
      errorMarkingAllRead: "Error marking all notifications as read:",
      errorDeletingNotification: "Error deleting notification:",
      priorityHigh: "high",
      priorityMedium: "medium",
      priorityLow: "low",
      letterRead: "Letter Read",
      letterReadDesc: (name: string, subject: string) =>
        `${name} has read your letter "${subject}"`,
      regarding: "regarding",
      minutesAgo: "minutes ago",
    },
    users: {
      title: "Users",
      manageUsers: "Manage system users and permissions",
      searchPlaceholder: "Search users...",
      noUsersFound: "No users found",
    },
    // Inbox translations
    inbox: {
      title: "Inbox",
      manageLetters: "Manage your incoming letters",
      searchPlaceholder: "Search letters...",
      filterButton: "Filter",
      filterOptions: {
        all: "All",
        unread: "Unread",
        starred: "Starred",
        urgent: "Urgent",
        seen: "Seen",
      },
      loadingLetters: "Loading letters...",
      noLettersFound: "No letters found",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      showing: "Showing",
      to: "to",
      of: "of",
      letters: "letters",
      previous: "Previous",
      next: "Next",
      subject: "Subject",
      recipient: "Recipient",
      from: "From",
      department: "Department",
      priority: "Priority",
      date: "Date",
      backButton: "Back",
      forwardButton: "Forward",
      addComment: "Add Comment",
      addCommentPlaceholder: "Enter your comment...",
      loadingUsers: "Loading users...",
      additionalRecipients: "Additional Recipients",
      errorFetchingUsers: "Error fetching users",
      errorUpdatingStatus: "Error updating letter status",
      letterStarred: (subject: string) => `Letter "${subject}" starred`,
      letterUnstarred: (subject: string) => `Letter "${subject}" unstarred`,
      errorTogglingStar: "Error toggling star status",
      forwardedMessage: "Forwarded Message",
      messageForwarded: "Message forwarded to",
      failedToForward: "Failed to forward message",
      attachments: "Attachments",
      download: "Download",
      view: "View",
      viewButton: "View Letter",
      forwardLetter: "Forward Letter",
      printButton: "Print",
      selectEmployee: "Select Employee",
      cancel: "Cancel",
      closeButton: "Close",
      downloadButton: "Download",
      previewNotAvailable: "Preview not available",
      downloadToView: "Please download to view this file",
      errorDownloadingFile: "Error downloading file",
      errorViewingFile: "Error viewing file",
      downloadSuccess: "File downloaded successfully",
      loading: "Loading...",
      forwarding: "Forwarding...",
      contentType: "File type",
    },
    // Sent translations
    sent: {
      title: "Sent",
      newLetterButton: "New Letter",
      searchPlaceholder: "Search letters...",
      allStatus: "All Status",
      statusSent: "Sent",
      statusDelivered: "Delivered",
      statusRead: "Read",
      subjectColumn: "Subject",
      toColumn: "To",
      departmentColumn: "Department",
      dateColumn: "Date",
      statusColumn: "Status",
      priorityColumn: "Priority",
      attachmentsColumn: "Attachments",
      memoViewColumn: "Memo View",
      noAttachments: "No attachments",
      viewMemoButton: "View Memo",
      composeNewLetter: "Compose New Letter",
      subjectLabel: "Subject",
      subjectRequired: "Subject is required",
      recipientLabel: "Recipient",
      recipientRequired: "Recipient is required",
      departmentLabel: "Department",
      departmentRequired: "Department is required",
      contentLabel: "Content",
      contentRequired: "Content is required",
      removeAttachment: "Remove Attachment",
      sendLetterButton: "Send Letter",
      filePreview: "File Preview",
      closeButton: "Close",
      downloadButton: "Download",
      previewNotAvailable: "Preview not available",
      downloadToView: "Download to view this file",
      letterSentSuccess: "Letter sent successfully!",
      failedToSendLetter: "Failed to send letter",
      errorDownloadingFile: "Error downloading file",
      errorViewingFile: "Error viewing file",
      memoLetterView: "Memo Letter View",
    },
    // Archive translations
    archive: {
      title: "Archive",
      manageArchivedLetters: "Manage your archived letters",
      searchPlaceholder: "Search archived letters...",
      noArchivedLetters: "No archived letters found",
      restoreButton: "Restore",
      deleteButton: "Delete",
      filterOptions: {
        all: "All",
        lastWeek: "Last Week",
        lastMonth: "Last Month",
        lastYear: "Last Year",
      },
    },
    // Settings translations
    settings: {
      title: "Settings",
      profile: {
        title: "Profile",
        name: "Name",
        email: "Email",
        phone: "Phone",
        department: "Department",
        saveChanges: "Save Changes",
        saving: "Saving...",
        errorUpdating: "Failed to update profile",
      },
      notifications: {
        title: "Notifications",
        emailNotifications: "Email Notifications",
        emailNotificationsDesc: "Receive notifications via email",
        notificationSound: "Notification Sound",
        notificationSoundDesc: "Play sound for notifications",
      },
      appearance: {
        title: "Appearance",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        language: "Language",
        english: "English",
        amharic: "Amharic",
      },
      security: {
        title: "Security",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
      },
    },
    // Dashboard translations
    dashboard: {
      welcome: "Welcome!",
      welcomeTitle: "Welcome to the Future of Correspondence!",
      welcomeDescription:
        "This is your command center for managing all official letters. Create, track, and archive with ease, knowing every communication is secure and streamlined. Our team built this with one goal: to make your workflow simpler and more powerful. Let's get started!",
      totalLetters: "Total Letters",
      processed: "Processed",
      pending: "Pending",
      urgent: "Urgent",
      recentLetters: "Recent Letters",
      viewAll: "View All",
      activityTimeline: "Activity Timeline",
      letterSent: (subject: string) => `Letter "${subject}" sent!`,
      letterReceived: (subject: string) => `Letter "${subject}" received!`,
      letterApproved: (subject: string) => `Letter "${subject}" approved!`,
      recentActivity: "Recent Activity",
      activities: {
        approval: {
          title: "New Letter Approved",
          description: "Finalize your latest policy document",
          time: "2 hours ago",
        },
        newPolicy: {
          title: "New Letter Received",
          description: "New letters are pending your review",
          time: "5 hours ago",
        },
        meeting: {
          title: "Letter Sent",
          description: "Letter sent to your department",
          time: "Yesterday",
        },
        mention: {
          title: "New User Registered",
          description: "A new user has been added to the system",
          time: "2 days ago",
        },
      },
    },
  },
};

// Define the types for the translation object
type TranslationKeys = typeof translations.am;

// Define the types for the language context
type LanguageContextType = {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: TranslationKeys; // Add translation function
};

// Create the context
export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<SupportedLang>(SupportedLang.Am);

  // Load language from localStorage if available
  useEffect(() => {
    const storedLang = localStorage.getItem("appLang") as SupportedLang;
    if (storedLang === SupportedLang.Am || storedLang === SupportedLang.En) {
      setLang(storedLang);
    }
  }, []);

  // Change the language and save it to localStorage
  const changeLang = (newLang: SupportedLang) => {
    localStorage.setItem("appLang", newLang);
    setLang(newLang);
  };

  // Memoize the translation object to avoid re-renders
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
