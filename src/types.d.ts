export interface NotionProperties {
  date: { type: string; start_date: string };
  thumbnail: { url: string }[];
  type: ("Library" | "Project" | "Post" | "Page")[];
  slug: string;
  tags: ("Ice Break" | "Develop" | "Open Source" | "Daily" | "SEO" | "Blog" | "Next.js" | "GraphQL" | "Git" | "CSS" | "Apollo" | "Docs" | "DDD" | "Architecture" | "React" | "코딩테스트[lv.2]" | "코딩테스트[lv.3]" | "Emotion" | "F12" | "Javascript" | "Toss" | "SCSS" | "Recoil" | "Typescript" | "Project" | "Jest" | "TestCode" | "Recommend" | "React-Query" | "Suspense" | "Monorepo" | "Review" | "Styled-Component" | "Browser" | "Render" | "Library" | "Promise" | "Hook" | "Model" | "PackageManager" | "Npm" | "Yarn" | "TurboRepo" | "Pnpm" | "Bundler" | "Msw" | "Zustand" | "Bun" | "HOC" | "Class" | "This" | "Reconciliation" | "Modal" | "Swiper" | "Debounce" | "Throttle" | "Protal" | "Utterances" | "SSG" | "Component" | "Three.js" | "CodingTest" | "Set" | "IntersectionObserver" | "EventBus" | "TypeSafety" | "Module" | "Pattern" | "ISR")[];
  summary: string;
  updatedAt: string;
  author: { id: string; name: string; profile_photo: string }[];
  title: string;
  status: ("Private" | "Public")[];
}