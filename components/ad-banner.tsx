import Link from 'next/link'
import Image from 'next/image'

// 광고 정보를 담은 배열
const ADS = [
  {
    desktop: '/ads/desktop-ad1.png',
    mobile: '/ads/mobile-ad1.png',
    link: 'https://www.luckiviki.com'
  }
  ,{
    desktop: '/ads/desktop-ad2.png',
    mobile: '/ads/mobile-ad2.png',
    link: 'https://www.luckiviki.com'
  }
  // ,{
  //   desktop: '/ads/desktop-ad3.png',
  //   mobile: '/ads/mobile-ad3.png',
  //   link: 'https://www.luckiviki.com'
  // }
]

export function AdBanner() {
  // 페이지가 렌더링될 때마다 랜덤하게 광고 선택
  const randomAd = ADS[Math.floor(Math.random() * ADS.length)]

  return (
    <div className="w-full flex justify-center items-center p-4">
      <Link 
        href={randomAd.link}
        target="_blank"
        className="relative block"
      >
        {/* Desktop Ad */}
        <div className="hidden md:block">
          <Image
            src={randomAd.desktop}
            alt="Advertisement"
            width={970}
            height={250}
            className="hover:opacity-95 transition-opacity"
          />
        </div>
        
        {/* Mobile Ad */}
        <div className="md:hidden">
          <Image
            src={randomAd.mobile}
            alt="Advertisement"
            width={320}
            height={50}
            className="hover:opacity-95 transition-opacity"
          />
        </div>
      </Link>
    </div>
  )
} 