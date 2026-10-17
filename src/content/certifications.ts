/**
 * Certifications to consider as skills are mastered.
 *
 * Every entry was checked against the provider's own pages on the date in
 * VERIFIED_ON. Prices and exam versions change: the app always tells the
 * learner to confirm on the provider's site before paying. When updating,
 * check the source links and change VERIFIED_ON.
 */

export const VERIFIED_ON = '2026-10-17';

export type CertCost = 'free' | 'paid' | 'subscription';
export type CertLevel = 'starter' | 'foundational' | 'professional';

export interface Certification {
  id: string;
  name: string;
  provider: string;
  url: string;
  cost: CertCost;
  /** As listed when checked. Always shown with "confirm on the provider's site". */
  price: string;
  level: CertLevel;
  format: string;
  /** Rough effort beyond this academy, from the provider where stated. */
  effort: string;
  /** Skills from the academy's framework that should be demonstrated first. */
  skills: string[];
  /** What it proves, and its limits, in plain words. */
  value: string;
  /** Extra preparation the academy doesn't cover (yet). */
  alsoNeeds: string[];
  /** Availability problems worth knowing before planning around it. */
  availability?: string;
  sources: string[];
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'claude-ai-fluency',
    name: 'AI Fluency: Framework & Foundations (completion badge)',
    provider: 'Anthropic, Claude Academy',
    url: 'https://academy.claude.com/courses',
    cost: 'free',
    price: 'Free with a free Claude account',
    level: 'starter',
    format: 'Self-paced course (about 4 hours) with a final quiz; 80% to pass, unlimited retakes',
    effort: 'About 4 hours',
    skills: ['ai-literacy', 'tech-communication'],
    value: 'A free, shareable badge showing you completed Anthropic\'s course on working well with AI. It certifies completion of a course, not a proctored exam, so treat it as a learning milestone rather than a professional credential.',
    alsoNeeds: [],
    sources: ['https://academy.claude.com/help/faq', 'https://academy.claude.com/courses'],
  },
  {
    id: 'fcc-responsive-web-design',
    name: 'Responsive Web Design Certification',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/freecodecamps-new-responsive-web-design-certification-is-now-live/',
    cost: 'free',
    price: 'Free',
    level: 'starter',
    format: 'Five required projects that must pass automated tests, then a 50-question exam reviewed by freeCodeCamp staff',
    effort: 'About 300 hours (freeCodeCamp\'s estimate)',
    skills: ['html', 'css-layout', 'accessibility'],
    value: 'A free, verified certification with a public link. Well known among self-taught developers. The five projects are the real value: they become portfolio pieces.',
    alsoNeeds: ['More CSS practice (Flexbox and Grid layouts)', 'Building complete multi-section pages'],
    sources: ['https://www.freecodecamp.org/news/freecodecamps-new-responsive-web-design-certification-is-now-live/', 'https://www.freecodecamp.org/news/freecodecamp-certifications/'],
  },
  {
    id: 'fcc-javascript',
    name: 'JavaScript Certification',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/freecodecamps-new-javascript-certification-is-now-live/',
    cost: 'free',
    price: 'Free',
    level: 'starter',
    format: 'Five required projects, then a 50-question exam',
    effort: 'About 300 hours (freeCodeCamp\'s estimate)',
    skills: ['js-basics', 'js-functions', 'data-structures', 'debugging', 'dom-events'],
    value: 'Covers variables, functions, loops, objects, DOM manipulation, events and asynchronous JavaScript. Free and verified; the projects prove you can build, not just answer questions.',
    alsoNeeds: ['Higher-order functions (map, filter, reduce)', 'Asynchronous JavaScript (promises, async/await)'],
    sources: ['https://www.freecodecamp.org/news/freecodecamps-new-javascript-certification-is-now-live/'],
  },
  {
    id: 'github-foundations',
    name: 'GitHub Foundations (exam GH-900)',
    provider: 'GitHub',
    url: 'https://learn.github.com/credentials',
    cost: 'paid',
    price: 'About $99 USD; varies by country',
    level: 'foundational',
    format: 'Proctored exam, 100 minutes, through Pearson VUE',
    effort: 'A few weeks of practice with Git and GitHub',
    skills: ['git'],
    value: 'Shows you understand Git and collaboration on GitHub. Useful because almost every software team uses GitHub. GitHub says this fundamentals certification does not expire.',
    alsoNeeds: ['GitHub features beyond Git: issues, pull requests, Actions, Codespaces'],
    sources: ['https://learn.github.com/credentials'],
  },
  {
    id: 'fcc-relational-databases',
    name: 'Relational Databases Certification',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/freecodecamps-new-relational-databases-certification-is-now-live/',
    cost: 'free',
    price: 'Free',
    level: 'starter',
    format: 'Labs in a Linux environment, five projects, then a 50-question exam',
    effort: 'Several weeks to months',
    skills: ['sql', 'git'],
    value: 'Covers Bash, SQL and Git through hands-on labs. A strong free complement to the finance tracker and the sales agent, which both need a database.',
    alsoNeeds: ['Command line (Bash) basics'],
    sources: ['https://www.freecodecamp.org/news/freecodecamps-new-relational-databases-certification-is-now-live/'],
  },
  {
    id: 'meta-front-end',
    name: 'Meta Front-End Developer Professional Certificate',
    provider: 'Meta, on Coursera',
    url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    cost: 'subscription',
    price: 'Coursera subscription; free trial available',
    level: 'foundational',
    format: '9-course series with graded assignments and a React capstone project',
    effort: 'Several months part-time (Coursera lists 4–7 months)',
    skills: ['html', 'css-layout', 'js-functions', 'react'],
    value: 'A structured program from Meta, the company behind React, ending in a React project. Designed for beginners. Recognized, but employers will still look at what you\'ve built.',
    alsoNeeds: ['React (Phase 4 of this academy, Website path)'],
    sources: ['https://www.coursera.org/professional-certificates/meta-front-end-developer'],
  },
  {
    id: 'aws-ai-practitioner',
    name: 'AWS Certified AI Practitioner (AIF-C01)',
    provider: 'Amazon Web Services',
    url: 'https://aws.amazon.com/certification/certified-ai-practitioner/',
    cost: 'paid',
    price: '$100 USD (other currencies vary)',
    level: 'foundational',
    format: 'Proctored exam',
    effort: 'A few weeks of study',
    skills: ['ai-literacy', 'prompt-spec', 'model-apis'],
    value: 'A widely recognized foundational AI credential covering AI, machine learning and generative AI concepts, with an AWS focus. Good for showing AI literacy to employers or clients.',
    alsoNeeds: ['AWS-specific AI services'],
    sources: ['https://aws.amazon.com/certification/certified-ai-practitioner/'],
  },
  {
    id: 'azure-ai-fundamentals',
    name: 'Microsoft Certified: Azure AI Fundamentals (exam AI-901)',
    provider: 'Microsoft',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/',
    cost: 'paid',
    price: 'Varies by country; see the exam page',
    level: 'foundational',
    format: 'Proctored exam; passing score 700',
    effort: 'A few weeks of study',
    skills: ['ai-literacy', 'model-apis', 'structured-outputs'],
    value: 'Microsoft\'s foundational AI credential. AI-901 replaced AI-900 (retired June 30, 2026) and is more hands-on: it covers building AI solutions with Microsoft Foundry.',
    alsoNeeds: ['Python basics (Microsoft lists Python as a prerequisite)', 'Provisioning Azure resources'],
    sources: ['https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/', 'https://techcommunity.microsoft.com/blog/skills-hub-blog/evolving-the-microsoft-certified-azure-ai-fundamentals-certification/4494127'],
  },
  {
    id: 'claude-certified-architect',
    name: 'Claude Certified Architect, Foundations',
    provider: 'Anthropic',
    url: 'https://claude.com/resources/articles/four-role-based-claude-certifications',
    cost: 'paid',
    price: 'Paid, proctored (price not published publicly)',
    level: 'professional',
    format: 'Proctored, identity-verified exam delivered by Pearson; credential issued through Credly',
    effort: 'Significant hands-on experience building with Claude',
    skills: ['model-apis', 'structured-outputs', 'tool-calling', 'agent-loops'],
    value: 'Anthropic\'s technical certification for designing production applications with Claude: the Claude API, Agent SDK, Claude Code and MCP. Directly relevant to your sales-agent capstone.',
    alsoNeeds: ['Claude Agent SDK and Model Context Protocol (MCP)', 'Production experience with real integrations'],
    availability: 'When checked, scheduling and vouchers were only available to Anthropic partners. Check whether it has opened to individuals before planning around it.',
    sources: ['https://claude.com/resources/articles/four-role-based-claude-certifications', 'https://academy.claude.com/help/faq'],
  },
  {
    id: 'iaap-cpacc',
    name: 'Certified Professional in Accessibility Core Competencies (CPACC)',
    provider: 'International Association of Accessibility Professionals (IAAP)',
    url: 'https://www.accessibilityassociation.org/certification-portal/s/apply-for-certification',
    cost: 'paid',
    price: '$510 non-member, $410 member, $225 in emerging economies (2025 handbook)',
    level: 'professional',
    format: 'Proctored exam on accessibility principles, disabilities, standards and law',
    effort: 'Weeks of dedicated study',
    skills: ['accessibility', 'html'],
    value: 'The best-known professional accessibility credential. Valuable if you want to specialize in accessible design or audits; more than most developers need early on.',
    alsoNeeds: ['Accessibility standards (WCAG) and laws', 'Understanding of disabilities and assistive technology'],
    sources: ['https://www.accessibilityassociation.org/sfsites/c/resource/CertHandbook2025', 'https://www.accessibilityassociation.org/sfsites/c/resource/CertHandbookV2'],
  },
  {
    id: 'comptia-security-plus',
    name: 'CompTIA Security+',
    provider: 'CompTIA',
    url: 'https://www.comptia.org/en-us/certifications/security/v7/',
    cost: 'paid',
    price: '$404 USD for V7 (January 2025 price); V8 expected around November 17, 2026',
    level: 'professional',
    format: 'Proctored exam at Pearson VUE (voucher bought from CompTIA)',
    effort: 'Months of study for most beginners',
    skills: ['security', 'auth', 'http-apis'],
    value: 'A widely required baseline security certification, especially for government and enterprise roles. Broader than software security: it also covers networks and operations.',
    alsoNeeds: ['Networking fundamentals', 'Security operations and threat concepts'],
    sources: ['https://www.comptia.org/en-us/blog/how-much-does-the-comptia-security-certification-cost/', 'https://www.comptia.org/en-us/certifications/security/v7/'],
  },
  {
    id: 'fcc-csharp',
    name: 'Foundational C# with Microsoft',
    provider: 'Microsoft and freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/free-microsoft-c-sharp-certification/',
    cost: 'free',
    price: 'Free',
    level: 'starter',
    format: 'About 35 hours of Microsoft Learn training, then an 80-question exam (70% to pass, one session)',
    effort: 'About 35 hours of training plus practice',
    skills: ['csharp'],
    value: 'A free, verified first step into C# and .NET, which are on your long-term roadmap. The academy adds C# after the web and AI foundations.',
    alsoNeeds: ['C# itself (later in the roadmap)'],
    sources: ['https://www.freecodecamp.org/news/free-microsoft-c-sharp-certification/', 'https://devblogs.microsoft.com/dotnet/announcing-foundational-csharp-certification/'],
  },
];
