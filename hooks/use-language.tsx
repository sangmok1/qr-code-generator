"use client"

import { useState, useEffect } from 'react'

export type Language = 'ko' | 'en'

export interface Translations {
  // Home page
  home: {
    title: string
    subtitle: string
    description: string
    loginButton: string
    privacyNotice: string
    tempQrTitle: string
    tempQrPlaceholder: string
    tempQrGenerate: string
    tempQrNote: string
    tempQrLoginRequired: string
    features: {
      fast: {
        title: string
        description: string
      }
      formats: {
        title: string
        description: string
      }
      secure: {
        title: string
        description: string
      }
    }
    preview: {
      title: string
      basic: string
      color: string
      custom: string
    }
  }
  // Dashboard page
  dashboard: {
    title: string
    homeButton: string
    logoutButton: string
    tabs: {
      generate: string
      saved: string
      art: string
    }
    generate: {
      placeholder: string
      color: string
      background: string
      size: string
      errorLevel: string
      preview: string
      reset: string
      save: string
    }
    saved: {
      total: string
      noQr: string
      noQrSubtext: string
      staticQr: string
      trackingQr: string
      tooltipText: string
      redirectUrl: string
      views: string
      delete: string
    }
    messages: {
      saveSuccess: string
      saveError: string
    }
    modal: {
      close: string
      altText: string
    }
  }
  // Login page
  login: {
    back: string
    title: string
    subtitle: string
    privacyNotice: string
    signingIn: string
    continueWithGoogle: string
    terms: string
    errorDefault: string
    errorLogin: string
    errorGeneral: string
  }
  // Contact page
  contact: {
    title: string
    titlePlaceholder: string
    contentPlaceholder: string
    emailPlaceholder: string
    submit: string
    submitting: string
    success: string
    errorRequired: string
    errorInvalidEmail: string
    errorSubmit: string
    close: string
  }
  // Common
  common: {
    loading: string
    labels: {
      color: string
      background: string
      size: string
      errorLevel: string
    }
  }
}

const translations: Record<Language, Translations> = {
  ko: {
    home: {
      title: "QR 코드를",
      subtitle: " 쉽고 빠르게",
      description: "URL을 입력하고 나만의 스타일로 QR 코드를 생성하세요. 구글 계정으로 로그인하여 QR 코드를 저장하고 관리할 수 있습니다.",
      loginButton: "구글 로그인으로 QR코드 관리하기",
      privacyNotice: "본 사이트는 구글 로그인 관련 개인정보를 저장하지 않습니다.",
      tempQrTitle: "로그인 없이 QR 코드 만들기",
      tempQrPlaceholder: "URL을 입력하세요",
      tempQrGenerate: "QR 코드 생성",
      tempQrNote: "이 QR 코드는 새로고침하면 사라집니다.",
      tempQrLoginRequired: "QR 저장/관리는 로그인 필요",
      features: {
        fast: {
          title: "빠른 생성",
          description: "URL을 입력하면 즉시 QR 코드가 생성됩니다. 색상과 크기를 자유롭게 커스터마이징하세요."
        },
        formats: {
          title: "다양한 형식",
          description: "SVG와 PNG 형식으로 QR 코드를 다운로드할 수 있습니다. 고품질 벡터 이미지를 지원합니다."
        },
        secure: {
          title: "안전한 저장",
          description: "구글 계정으로 로그인하여 QR 코드를 안전하게 저장하고 언제든지 다시 사용할 수 있습니다."
        }
      },
      preview: {
        title: "이런 QR 코드를 만들 수 있어요",
        basic: "기본 스타일",
        color: "컬러 스타일",
        custom: "커스텀 스타일"
      }
    },
    dashboard: {
      title: "내 QR 대시보드",
      homeButton: "홈으로",
      logoutButton: "로그아웃",
      tabs: {
        generate: "QR 코드 생성",
        saved: "내 QR 목록",
        art: "아트 QR 생성 (beta)"
      },
      generate: {
        placeholder: "URL을 입력하세요",
        color: "색상",
        background: "배경색",
        size: "크기",
        errorLevel: "정확도",
        preview: "QR 코드 미리보기",
        reset: "초기화",
        save: "QR 코드 저장"
      },
      saved: {
        total: "총",
        noQr: "저장된 QR 코드가 없습니다.",
        noQrSubtext: "상단에서 새 QR 코드를 생성하고 저장해보세요!",
        staticQr: "정적 QR",
        trackingQr: "추적 QR",
        tooltipText: "이 QR로 접근 시 접속 통계가 기록됩니다.",
        redirectUrl: "중계 URL",
        views: "조회수",
        delete: "삭제"
      },
      messages: {
        saveSuccess: "QR 코드가 성공적으로 저장되었습니다!",
        saveError: "QR 코드 저장에 실패했습니다."
      },
      modal: {
        close: "닫기",
        altText: "확대 QR 코드"
      }
    },
    login: {
      back: "돌아가기",
      title: "QR Code Generator",
      subtitle: "Sign in with Google to access the QR code generator",
      privacyNotice: "본 사이트는 구글 로그인 관련 개인정보를 저장하지 않습니다.",
      signingIn: "Signing in...",
      continueWithGoogle: "Continue with Google",
      terms: "By signing in, you agree to our terms of service and privacy policy.",
      errorDefault: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      errorLogin: "로그인에 실패했습니다. 다시 시도해주세요.",
      errorGeneral: "로그인 중 오류가 발생했습니다."
    },
    contact: {
      title: "Contact Us",
      titlePlaceholder: "제목",
      contentPlaceholder: "내용",
      emailPlaceholder: "회신받을 E-mail 주소",
      submit: "전송",
      submitting: "전송 중...",
      success: "성공적으로 전송되었습니다!",
      errorRequired: "모든 항목을 입력해 주세요.",
      errorInvalidEmail: "이메일 형식이 올바르지 않습니다.",
      errorSubmit: "전송에 실패했습니다. 다시 시도해 주세요.",
      close: "✕"
    },
    common: {
      loading: "Loading...",
      labels: {
        color: "색상",
        background: "배경색",
        size: "크기",
        errorLevel: "정확도"
      }
    }
  },
  en: {
    home: {
      title: "Generate QR Codes",
      subtitle: " Easily & Quickly",
      description: "Enter a URL and create QR codes with your own style. Sign in with your Google account to save and manage your QR codes.",
      loginButton: "Manage QR Codes with Google Login",
      privacyNotice: "Our site doesn't store any personal information from Google login.",
      tempQrTitle: "Create QR Code Without Login",
      tempQrPlaceholder: "Enter URL",
      tempQrGenerate: "Generate QR Code",
      tempQrNote: "This QR code will disappear when you refresh the page.",
      tempQrLoginRequired: "Login Required for QR Save/Management",
      features: {
        fast: {
          title: "Fast Generation",
          description: "QR codes are generated instantly when you enter a URL. Freely customize colors and sizes."
        },
        formats: {
          title: "Multiple Formats",
          description: "Download QR codes in SVG and PNG formats. Supports high-quality vector images."
        },
        secure: {
          title: "Secure Storage",
          description: "Sign in with your Google account to safely store QR codes and reuse them anytime."
        }
      },
      preview: {
        title: "You can create QR codes like these",
        basic: "Basic Style",
        color: "Color Style",
        custom: "Custom Style"
      }
    },
    dashboard: {
      title: "My QR Dashboard",
      homeButton: "Home",
      logoutButton: "Logout",
      tabs: {
        generate: "Generate QR Code",
        saved: "My QR List",
        art: "Art QR Generation (beta)"
      },
      generate: {
        placeholder: "Enter URL",
        color: "Color",
        background: "Background",
        size: "Size",
        errorLevel: "Error Level",
        preview: "QR Code Preview",
        reset: "Reset",
        save: "Save QR Code"
      },
      saved: {
        total: "Total",
        noQr: "No saved QR codes.",
        noQrSubtext: "Generate and save new QR codes from the tab above!",
        staticQr: "Static QR",
        trackingQr: "Tracking QR",
        tooltipText: "Access statistics are recorded when using this QR code.",
        redirectUrl: "Redirect URL",
        views: "Views",
        delete: "Delete"
      },
      messages: {
        saveSuccess: "QR code saved successfully!",
        saveError: "Failed to save QR code."
      },
      modal: {
        close: "Close",
        altText: "Enlarged QR Code"
      }
    },
    login: {
      back: "Back",
      title: "QR Code Generator",
      subtitle: "Sign in with Google to access the QR code generator",
      privacyNotice: "Our site doesn't store any personal information from Google login.",
      signingIn: "Signing in...",
      continueWithGoogle: "Continue with Google",
      terms: "By signing in, you agree to our terms of service and privacy policy.",
      errorDefault: "An error occurred during login. Please try again.",
      errorLogin: "Login failed. Please try again.",
      errorGeneral: "An error occurred during login."
    },
    contact: {
      title: "Contact Us",
      titlePlaceholder: "Title",
      contentPlaceholder: "Content",
      emailPlaceholder: "Reply Email Address",
      submit: "Send",
      submitting: "Sending...",
      success: "Successfully sent!",
      errorRequired: "Please fill in all fields.",
      errorInvalidEmail: "Invalid email format.",
      errorSubmit: "Failed to send. Please try again.",
      close: "✕"
    },
    common: {
      loading: "Loading...",
      labels: {
        color: "Color",
        background: "Background", 
        size: "Size",
        errorLevel: "Error Level"
      }
    }
  }
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 브라우저 언어 감지
    const detectLanguage = (): Language => {
      // 1. navigator.language 확인
      const browserLang = navigator.language.toLowerCase()
      
      // 2. 한국어 감지 (ko, ko-KR 등)
      if (browserLang.startsWith('ko')) {
        return 'ko'
      }
      
      // 3. Accept-Language 헤더도 확인 (서버사이드에서는 동작하지 않음)
      const acceptLanguages = navigator.languages
      for (const lang of acceptLanguages) {
        if (lang.toLowerCase().startsWith('ko')) {
          return 'ko'
        }
      }
      
      // 4. 기본은 영어
      return 'en'
    }

    const detectedLang = detectLanguage()
    setLanguage(detectedLang)
    setIsLoading(false)
  }, [])

  const t = translations[language]

  return {
    language,
    setLanguage,
    t,
    isLoading
  }
} 