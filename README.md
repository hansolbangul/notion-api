# @hansolbangul/notion-api

`@hansolbangul/notion-api`는 Notion의 데이터를 정적으로 가져오고 TypeScript 타입을 생성하기 위한 가벼운 라이브러리입니다. React, Next.js, 정적 사이트 생성기 등 다양한 프로젝트에서 유용하게 사용할 수 있습니다.

## 주요 기능

- **Notion 데이터 가져오기**: Notion API를 통해 테이블 형태의 데이터를 가져옵니다.
- **TypeScript 타입 생성**: CLI를 통해 Notion 테이블의 스키마를 읽어 TypeScript 타입을 자동 생성합니다.
- **간단한 통합**: 최소한의 설정으로 동작하며, 커스터마이징 가능합니다.

---

## 설치 방법

### npm

```bash
npm install @hansolbangul/notion-api
```

### yarn

```bash
yarn add @hansolbangul/notion-api
```

### pnpm

```bash
pnpm add @hansolbangul/notion-api
```

---

## 사용 방법

### 1. 라이브러리로 데이터 가져오기

```typescript
import NotionApiService from '@hansolbangul/notion-api';

const notionService = new NotionApiService({
  pageId: 'your-notion-page-id', // Notion 테이블의 ID를 입력하세요
});

(async () => {
  const data = await notionService.getPosts();
  console.log(data);
})();
```

### 2. CLI로 TypeScript 타입 생성하기

이후 CLI나 Script를 실행하여 타입을 생성합니다.

타입을 생성할때의 Notion의 형태는 아래와 같은 형태를 유지해야 합니다.
![image](https://github.com/user-attachments/assets/38618d9b-392c-4e97-b1be-298cd4113222)
[템플릿 저장하기](https://island-factory-d4b.notion.site/1183f2f989a680d19389e72ff025f569?v=1183f2f989a681b6af32000c7dfa2b78)

```bash
npx type-cli <PAGE_ID>
```

```script
"script": {
    "notion-type": "type-cli <PAGE_ID>"
}
```

생성된 타입은 `src/types.d.ts` 파일에 저장됩니다:

```typescript
interface NotionProperties {
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
```
---

## 주요 API

### `NotionApiService` 클래스

#### `constructor(config: NotionConfig)`

- `config.pageId` : Notion 테이블 페이지 ID를 설정합니다.

#### `getPosts<T>(viewId?: string): Promise<T>`

- Notion 페이지에서 데이터를 가져옵니다. 반환 데이터는 스키마에 따라 구조화됩니다.

---

## 기여하기

기여를 환영합니다! 버그 리포트나 기능 요청은 [이슈 페이지](https://github.com/hansolbangul/notion-api/issues)에 등록해주세요.

---

## 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다. 상세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.