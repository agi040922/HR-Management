import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAIR 인사노무",
  description: "대한민국 1위 근태관리 솔루션. 복잡한 근태관리부터 급여계산까지, 시프티 하나로 모든 인사업무를 간편하게 관리하세요.",
  keywords: "근태관리, 인사관리, 급여계산, 시프티, 출퇴근관리, HR솔루션",
  openGraph: {
    title: "FAIR 인사노무",
    description: "대한민국 1위 근태관리 솔루션",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
